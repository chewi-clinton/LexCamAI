from __future__ import annotations

import json
import logging

import pika

import config
import services

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

QUEUE = "lawyer-ingest-worker.lawyers.scraped"
EXCHANGE = "lexcam.events"
DLX_EXCHANGE = "lexcam.dlx"


def on_message(channel, method, properties, body):
    try:
        payload = json.loads(body)
        lawyers = payload if isinstance(payload, list) else payload.get("lawyers", [])
        if not isinstance(lawyers, list):
            raise ValueError("lawyers must be a list")

        result = services.prepare_and_send(lawyers)
        logger.info(
            "Lawyer ingest: inserted=%s skipped=%s invalid=%s duplicates=%s",
            result["inserted"],
            result["skipped"],
            result["invalid"],
            result["duplicates"],
        )
        channel.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as exc:
        logger.exception(f"Failed to process lawyers.scraped: {exc}")
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
    channel.queue_bind(queue=QUEUE, exchange=EXCHANGE, routing_key="lawyers.scraped")
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE, on_message_callback=on_message)

    logger.info(f"Lawyer Ingest Worker listening on {QUEUE}")
    channel.start_consuming()


if __name__ == "__main__":
    main()
