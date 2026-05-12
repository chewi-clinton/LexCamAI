import json
import logging
import pika
from django.conf import settings

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
    except Exception as exc:
        logger.error("Failed to publish %s: %s", routing_key, exc)


def publish_payment_confirmed(transaction):
    _publish("payment.confirmed", {
        "transaction_id": str(transaction.id),
        "user_id": str(transaction.user_id),
        "document_id": str(transaction.document_id),
        "amount": transaction.amount,
        "operator": transaction.operator,
    })
