from __future__ import annotations

import json
import logging

import pika

import config
import services

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

EXCHANGE = "lexcam.events"
DLX_EXCHANGE = "lexcam.dlx"
MAX_RETRIES = 3

QUEUE_BINDINGS = {
    "notification-worker.user.registered": "user.registered",
    "notification-worker.lawyer.verified": "lawyer.verified",
    "notification-worker.referral.created": "referral.created",
    "notification-worker.referral.accepted": "referral.accepted",
    "notification-worker.payment.confirmed": "payment.confirmed",
    "notification-worker.document.ready": "document.ready",
}

HANDLERS = {
    "user.registered": services.handle_user_registered,
    "lawyer.verified": services.handle_lawyer_verified,
    "referral.created": services.handle_referral_created,
    "referral.accepted": services.handle_referral_accepted,
    "payment.confirmed": services.handle_payment_confirmed,
    "document.ready": services.handle_document_ready,
}


def on_message(channel, method, properties, body):
    routing_key = method.routing_key
    retry_count = (properties.headers or {}).get("x-retry-count", 0)

    try:
        event = json.loads(body)
        handler = HANDLERS.get(routing_key)
        if handler:
            handler(event)
        channel.basic_ack(delivery_tag=method.delivery_tag)
        logger.info(f"Handled {routing_key}")
    except Exception as exc:
        logger.exception(f"Failed to handle {routing_key}: {exc}")
        if retry_count < MAX_RETRIES:
            channel.basic_publish(
                exchange=EXCHANGE,
                routing_key=routing_key,
                body=body,
                properties=pika.BasicProperties(
                    delivery_mode=2,
                    headers={"x-retry-count": retry_count + 1},
                ),
            )
            channel.basic_ack(delivery_tag=method.delivery_tag)
        else:
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def main():
    params = pika.URLParameters(config.RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
    channel.exchange_declare(exchange=DLX_EXCHANGE, exchange_type="topic", durable=True)
    channel.queue_declare(queue="lexcam.dead-letters", durable=True)
    channel.queue_bind(queue="lexcam.dead-letters", exchange=DLX_EXCHANGE, routing_key="#")
    channel.basic_qos(prefetch_count=1)

    for queue_name, routing_key in QUEUE_BINDINGS.items():
        channel.queue_declare(
            queue=queue_name,
            durable=True,
            arguments={"x-dead-letter-exchange": DLX_EXCHANGE},
        )
        channel.queue_bind(queue=queue_name, exchange=EXCHANGE, routing_key=routing_key)
        channel.basic_consume(queue=queue_name, on_message_callback=on_message)

    logger.info("Notification Worker listening on 6 event types")
    channel.start_consuming()


if __name__ == "__main__":
    main()
