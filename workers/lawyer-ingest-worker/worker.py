from __future__ import annotations

import json
import logging

import pika

import config
import services

logging.basicConfig(level=config.LOG_LEVEL, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def on_message(channel, method, properties, body):
    try:
        event = json.loads(body)
        lawyers = event.get("lawyers") or []
        if not isinstance(lawyers, list) or not lawyers:
            logger.info("Received empty or invalid lawyers.scraped payload")
            channel.basic_ack(delivery_tag=method.delivery_tag)
            return

        # Process in batches to avoid overloading the lawyer service
        total_inserted = 0
        total_skipped = 0
        batch_size = config.BATCH_SIZE
        for i in range(0, len(lawyers), batch_size):
            batch = lawyers[i : i + batch_size]
            try:
                resp = services.prepare_and_send(batch)
                inserted = int(resp.get("inserted", 0))
                skipped = int(resp.get("skipped", 0) if resp.get("skipped") is not None else 0)
                total_inserted += inserted
                total_skipped += skipped
            except Exception as exc:
                logger.exception("Failed to send batch to Lawyer Service: %s", exc)
                channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
                return

        logger.info("Processed lawyers.scraped: inserted=%d skipped=%d", total_inserted, total_skipped)
        channel.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as exc:
        logger.exception("Unhandled error processing lawyers.scraped: %s", exc)
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def main():
    params = pika.URLParameters(config.RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.exchange_declare(exchange=config.EXCHANGE, exchange_type="topic", durable=True)
    channel.exchange_declare(exchange=config.DLX_EXCHANGE, exchange_type="topic", durable=True)
    channel.queue_declare(
        queue=config.QUEUE,
        durable=True,
        arguments={"x-dead-letter-exchange": config.DLX_EXCHANGE},
    )
    channel.queue_bind(queue=config.QUEUE, exchange=config.EXCHANGE, routing_key=config.ROUTING_KEY)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=config.QUEUE, on_message_callback=on_message)

    logger.info("Lawyer Ingest Worker listening on %s", config.QUEUE)
    channel.start_consuming()


if __name__ == "__main__":
    main()
