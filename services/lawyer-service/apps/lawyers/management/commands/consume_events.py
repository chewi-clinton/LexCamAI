import json
import logging
import pika
from django.conf import settings
from django.core.cache import cache
from django.core.management.base import BaseCommand

from apps.lawyers.models import Lawyer

logger = logging.getLogger(__name__)

EXCHANGE = "lexcam.events"
QUEUE = "lawyer-service.matching"
RECOMMEND_CACHE_TTL = 300


class Command(BaseCommand):
    help = "Consume matching.requested events and pre-load recommendation cache"

    def handle(self, *args, **options):
        params = pika.URLParameters(settings.RABBITMQ_URL)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()

        channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
        channel.queue_declare(queue=QUEUE, durable=True)
        channel.queue_bind(queue=QUEUE, exchange=EXCHANGE, routing_key="matching.requested")
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=QUEUE, on_message_callback=self._handle)

        self.stdout.write("Listening for matching.requested events...")
        channel.start_consuming()

    def _handle(self, ch, method, properties, body):
        try:
            data = json.loads(body)
            domain = data.get("domain", "").strip()
            city = data.get("city", "").strip()

            if not domain or not city:
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return

            lawyers = list(
                Lawyer.objects.filter(
                    is_listed=True,
                    is_accepting_cases=True,
                    verification_status=Lawyer.STATUS_VERIFIED,
                    city__iexact=city,
                    specializations__name__iexact=domain,
                ).distinct().values("id", "full_name", "email", "phone", "city")
            )

            cache.set(f"recommend:{domain}:{city}", lawyers, timeout=RECOMMEND_CACHE_TTL)
            logger.info("Cached %d lawyers for %s/%s", len(lawyers), domain, city)
            ch.basic_ack(delivery_tag=method.delivery_tag)

        except Exception as exc:
            logger.error("Error handling matching.requested: %s", exc)
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
