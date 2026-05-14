import json
import logging
import pika
from django.core.management.base import BaseCommand
from django.conf import settings

from apps.dashboard.models import FlaggedFeedback

logger = logging.getLogger(__name__)

EXCHANGE = "lexcam.events"
QUEUE = "admin-panel.feedback"


class Command(BaseCommand):
    help = "Consume feedback.flagged events and store in the review queue"

    def handle(self, *args, **options):
        params = pika.URLParameters(settings.RABBITMQ_URL)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()

        channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
        channel.queue_declare(queue=QUEUE, durable=True)
        channel.queue_bind(queue=QUEUE, exchange=EXCHANGE, routing_key="feedback.flagged")
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=QUEUE, on_message_callback=self._handle)

        self.stdout.write("Listening for feedback.flagged events...")
        channel.start_consuming()

    def _handle(self, channel, method, properties, body):
        try:
            data = json.loads(body)
            feedback_id = data["feedback_id"]
            session_id = data["session_id"]
            message_index = data.get("message_index", 0)

            FlaggedFeedback.objects.get_or_create(
                feedback_id=feedback_id,
                defaults={"session_id": session_id, "message_index": message_index},
            )
            channel.basic_ack(delivery_tag=method.delivery_tag)
            logger.info("Stored flagged feedback %s", feedback_id)
        except Exception as exc:
            logger.error("Failed to process feedback.flagged: %s", exc)
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
