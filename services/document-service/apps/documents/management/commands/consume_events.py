from __future__ import annotations

import json
import logging
import time

import pika
import requests
from django.conf import settings
from django.core.management.base import BaseCommand

from apps.documents.generator import generate_and_upload
from apps.documents.models import UserDocument

logger = logging.getLogger(__name__)

EXCHANGE = "lexcam.events"


def _get_user_email(user_id: str) -> str | None:
    try:
        url = f"{settings.USER_MANAGEMENT_URL}/internal/users/{user_id}/"
        resp = requests.get(url, headers={"X-Internal-Key": settings.INTERNAL_SERVICE_KEY}, timeout=5)
        if resp.ok:
            return resp.json().get("email")
    except Exception as exc:
        logger.warning("Could not fetch user email for %s: %s", user_id, exc)
    return None


def _publish_document_ready(user_email: str, doc: UserDocument, file_url: str) -> None:
    try:
        params = pika.URLParameters(settings.RABBITMQ_URL)
        conn = pika.BlockingConnection(params)
        channel = conn.channel()
        channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
        channel.basic_publish(
            exchange=EXCHANGE,
            routing_key="document.ready",
            body=json.dumps({
                "document_id": str(doc.id),
                "user_id": str(doc.user_id),
                "user_email": user_email,
                "document_title": doc.template.name_en,
                "file_url": file_url,
            }),
            properties=pika.BasicProperties(delivery_mode=2),
        )
        conn.close()
        logger.info("Published document.ready for %s to %s", doc.id, user_email)
    except Exception as exc:
        logger.warning("Failed to publish document.ready: %s", exc)

QUEUE = "document-service.payment-confirmed"
ROUTING_KEY = "payment.confirmed"


class Command(BaseCommand):
    help = "Consume payment.confirmed events from RabbitMQ and generate documents"

    def handle(self, *args, **options):
        while True:
            try:
                self.stdout.write("Connecting to RabbitMQ…")
                params = pika.URLParameters(settings.RABBITMQ_URL)
                conn = pika.BlockingConnection(params)
                channel = conn.channel()

                channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
                channel.queue_declare(queue=QUEUE, durable=True)
                channel.queue_bind(queue=QUEUE, exchange=EXCHANGE, routing_key=ROUTING_KEY)
                channel.basic_qos(prefetch_count=1)
                channel.basic_consume(queue=QUEUE, on_message_callback=self._on_message)

                self.stdout.write(self.style.SUCCESS("Listening for payment.confirmed events…"))
                channel.start_consuming()

            except Exception as exc:
                logger.error("RabbitMQ connection lost: %s — retrying in 5s", exc)
                time.sleep(5)

    def _on_message(self, channel, method, properties, body):
        try:
            payload = json.loads(body)
            document_id = payload.get("document_id")
            if not document_id:
                logger.warning("payment.confirmed event missing document_id: %s", payload)
                channel.basic_ack(delivery_tag=method.delivery_tag)
                return

            try:
                doc = UserDocument.objects.select_related("template").get(id=document_id)
            except UserDocument.DoesNotExist:
                logger.error("UserDocument %s not found", document_id)
                channel.basic_ack(delivery_tag=method.delivery_tag)
                return

            if doc.status == UserDocument.STATUS_READY:
                logger.info("Document %s already ready, skipping", document_id)
                channel.basic_ack(delivery_tag=method.delivery_tag)
                return

            logger.info("Generating document %s (template: %s)", doc.id, doc.template.slug)
            doc.status = UserDocument.STATUS_GENERATING
            doc.save(update_fields=["status", "updated_at"])

            file_url = generate_and_upload(doc)

            doc.status = UserDocument.STATUS_READY
            doc.file_url = file_url
            doc.save(update_fields=["status", "file_url", "updated_at"])

            logger.info("Document %s ready: %s", doc.id, file_url)
            channel.basic_ack(delivery_tag=method.delivery_tag)

            user_email = _get_user_email(str(doc.user_id))
            if user_email:
                _publish_document_ready(user_email, doc, file_url)

        except Exception as exc:
            logger.error("Failed to process payment.confirmed: %s", exc, exc_info=True)
            try:
                doc.status = UserDocument.STATUS_FAILED
                doc.save(update_fields=["status", "updated_at"])
            except Exception:
                pass
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
