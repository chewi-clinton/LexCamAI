import json
import logging
import pika
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

EXCHANGE = "lexcam.events"


def _publish(routing_key, payload):
    try:
        params = pika.URLParameters(settings.RABBITMQ_URL)
        conn = pika.BlockingConnection(params)
        channel = conn.channel()
        channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
        channel.basic_publish(
            exchange=EXCHANGE,
            routing_key=routing_key,
            body=json.dumps(payload),
            properties=pika.BasicProperties(delivery_mode=2),
        )
        conn.close()
        logger.info("Published %s: %s", routing_key, payload)
        return True
    except Exception as exc:
        logger.error("Failed to publish %s: %s", routing_key, exc)
        return False


def publish_scrape_requested(requested_by):
    return _publish("scrape.requested", {
        "requested_by": str(requested_by),
        "timestamp": timezone.now().isoformat(),
    })
