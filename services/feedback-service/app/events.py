import json
import pika
from .config import settings


def _get_connection():
    params = pika.URLParameters(settings.RABBITMQ_URL)
    return pika.BlockingConnection(params)


def publish_event(routing_key: str, payload: dict):
    conn = _get_connection()
    ch = conn.channel()
    ch.exchange_declare(exchange="events", exchange_type="topic", durable=True)
    ch.basic_publish(exchange="events", routing_key=routing_key, body=json.dumps(payload))
    conn.close()
