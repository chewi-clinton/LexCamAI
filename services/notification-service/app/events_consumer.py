import json
import pika
import os
from .config import settings
from .db import Session, engine
from .models import Notification


def _get_connection():
    params = pika.URLParameters(settings.RABBITMQ_URL)
    return pika.BlockingConnection(params)


def on_message(ch, method, properties, body):
    payload = json.loads(body)
    routing_key = method.routing_key
    # For simplicity, create a notification record with payload and enqueue delivery
    with Session(engine) as session:
        # map event to notification content
        if routing_key == "feedback.flagged":
            message = f"Feedback flagged: {payload.get('feedback_id')}"
            user = payload.get('session_id') or 'admin@example.com'
        elif routing_key == "lawyers.scraped":
            message = f"New lawyers scraped batch"
            user = 'admin@example.com'
        else:
            message = f"Event {routing_key}"
            user = 'admin@example.com'
        notif = Notification(user_id=user, message=message)
        session.add(notif)
        session.commit()
        session.refresh(notif)
    # Acknowledge message after successful DB write. Delivery of the
    # notification (SMTP, push, etc.) is handled by dedicated worker(s)
    # implemented by the team. Do NOT perform delivery here.
    try:
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception:
        # If ack fails, attempt to nack without requeue so DLX can capture it
        try:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        except Exception:
            pass


def start_consumer():
    conn = _get_connection()
    ch = conn.channel()
    # Declare main exchange and a DLX exchange for failed messages.
    ch.exchange_declare(exchange="events", exchange_type="topic", durable=True)
    ch.exchange_declare(exchange="lexcam.dlx", exchange_type="fanout", durable=True)
    # Declare queue with dead-letter exchange so failed messages route to DLX.
    args = {"x-dead-letter-exchange": "lexcam.dlx"}
    q = ch.queue_declare(queue="notification_events", durable=True, arguments=args)
    ch.queue_bind(queue="notification_events", exchange="events", routing_key="feedback.flagged")
    ch.queue_bind(queue="notification_events", exchange="events", routing_key="lawyers.scraped")
    # Use explicit acknowledgements to ensure messages are not lost
    ch.basic_consume(queue="notification_events", on_message_callback=on_message, auto_ack=False)
    print("[notification-consumer] Waiting for events...")
    ch.start_consuming()


if __name__ == '__main__':
    start_consumer()
