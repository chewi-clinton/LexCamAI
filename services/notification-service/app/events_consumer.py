import json
import pika
import os
from .config import settings
from .db import Session, engine
from .models import Notification
from .tasks import send_notification_async


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
        send_notification_async.delay(notif.id)


def start_consumer():
    conn = _get_connection()
    ch = conn.channel()
    ch.exchange_declare(exchange="events", exchange_type="topic", durable=True)
    q = ch.queue_declare(queue="notification_events", durable=True)
    ch.queue_bind(queue="notification_events", exchange="events", routing_key="feedback.flagged")
    ch.queue_bind(queue="notification_events", exchange="events", routing_key="lawyers.scraped")
    ch.basic_consume(queue="notification_events", on_message_callback=on_message, auto_ack=True)
    print("[notification-consumer] Waiting for events...")
    ch.start_consuming()


if __name__ == '__main__':
    start_consumer()
