import json
import logging

import pika
from django.conf import settings

logger = logging.getLogger(__name__)

EXCHANGE_NAME = "lexcam.events"
EXCHANGE_TYPE = "topic"


def _get_connection():
    params = pika.URLParameters(settings.RABBITMQ_URL)
    params.socket_timeout = 5
    return pika.BlockingConnection(params)


def _publish(routing_key: str, payload: dict) -> None:
    """Publish a message to the lexcam.events exchange."""
    try:
        connection = _get_connection()
        channel = connection.channel()
        channel.exchange_declare(
            exchange=EXCHANGE_NAME,
            exchange_type=EXCHANGE_TYPE,
            durable=True,
        )
        channel.basic_publish(
            exchange=EXCHANGE_NAME,
            routing_key=routing_key,
            body=json.dumps(payload),
            properties=pika.BasicProperties(
                content_type="application/json",
                delivery_mode=2,  # persistent
            ),
        )
        connection.close()
        logger.info("Published event %s: %s", routing_key, payload)
    except Exception as exc:
        # Log but don't crash the request — event publishing is best-effort
        logger.error("Failed to publish event %s: %s", routing_key, exc)


def publish_user_registered(user_id: str, email: str, full_name: str, preferred_language: str) -> None:
    _publish(
        routing_key="user.registered",
        payload={
            "user_id": user_id,
            "email": email,
            "full_name": full_name,
            "preferred_language": preferred_language,
        },
    )


def publish_user_deleted(user_id: str) -> None:
    _publish(
        routing_key="user.deleted",
        payload={"user_id": user_id},
    )
