from __future__ import annotations

import json
import logging

import pika

import config
import services

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

QUEUE = "indexing-worker.corpus.updated"
EXCHANGE = "lexcam.events"
DLX_EXCHANGE = "lexcam.dlx"


def on_message(channel, method, properties, body):
    try:
        event = json.loads(body)
        article_ids = event.get("article_ids", [])
        action = event.get("action", "upsert")

        logger.info(f"Indexing {len(article_ids)} articles (action={action})")
        total = services.index_articles(article_ids)
        channel.basic_ack(delivery_tag=method.delivery_tag)
        logger.info(f"Indexed {total} chunks total")
    except Exception as exc:
        logger.exception(f"Failed to process corpus.updated: {exc}")
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
    channel.queue_bind(queue=QUEUE, exchange=EXCHANGE, routing_key="corpus.updated")
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE, on_message_callback=on_message)

    logger.info(f"Indexing Worker listening on {QUEUE}")
    channel.start_consuming()


if __name__ == "__main__":
    main()
