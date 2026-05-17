import json
import pika
from .config import settings


def _get_connection():
    params = pika.URLParameters(settings.RABBITMQ_URL)
    return pika.BlockingConnection(params)


def publish_event(routing_key: str, payload: dict):
    conn = _get_connection()
    ch = conn.channel()
    ch.exchange_declare(exchange="lexcam.events", exchange_type="topic", durable=True)
    # Publish persistent messages so events survive broker restarts.
    props = pika.BasicProperties(delivery_mode=2)
    ch.basic_publish(exchange="lexcam.events", routing_key=routing_key, body=json.dumps(payload), properties=props)
    conn.close()
