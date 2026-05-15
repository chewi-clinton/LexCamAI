from __future__ import annotations

import json
import logging

import pika

import config
import services

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

QUEUE = "doc-worker.payment.confirmed"
EXCHANGE = "lexcam.events"
DLX_EXCHANGE = "lexcam.dlx"


def _publish_document_ready(
    channel, document_id: str, user_id: str, file_url: str, user_email: str
) -> None:
    channel.basic_publish(
        exchange=EXCHANGE,
        routing_key="document.ready",
        body=json.dumps({
            "document_id": document_id,
            "user_id": user_id,
            "user_email": user_email,
            "file_url": file_url,
        }),
        properties=pika.BasicProperties(delivery_mode=2),
    )


def on_message(channel, method, properties, body):
    try:
        event = json.loads(body)
        document_id = str(event["document_id"])
        user_id = str(event["user_id"])

        logger.info(f"Processing document {document_id} for user {user_id}")
        file_url, user_email = services.process_payment_confirmed(user_id, document_id)
        _publish_document_ready(channel, document_id, user_id, file_url, user_email)
        channel.basic_ack(delivery_tag=method.delivery_tag)
        logger.info(f"Document {document_id} ready at {file_url}")
    except Exception as exc:
        logger.exception(f"Failed to process payment.confirmed: {exc}")
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def main():
    params = pika.URLParameters(config.RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
    channel.exchange_declare(exchange=DLX_EXCHANGE, exchange_type="topic", durable=True)
    channel.queue_declare(
        queue=QUEUE,
        durable=True,
        arguments={"x-dead-letter-exchange": DLX_EXCHANGE},
    )
    channel.queue_bind(queue=QUEUE, exchange=EXCHANGE, routing_key="payment.confirmed")
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE, on_message_callback=on_message)

    logger.info(f"Doc Worker listening on {QUEUE}")
    channel.start_consuming()


if __name__ == "__main__":
    main()
