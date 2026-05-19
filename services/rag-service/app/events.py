import os
import json
from typing import Optional
import asyncio

import aio_pika

RABBITMQ_URL = os.getenv("RABBITMQ_URL")
EXCHANGE_NAME = os.getenv("RAG_EVENTS_EXCHANGE", "lexcam.events")


async def publish_matching_requested(domain: str, session_id: Optional[int], city: Optional[str] = None) -> None:
    if not RABBITMQ_URL:
        return

    payload = {
        "domain": domain,
        "session_id": session_id,
        "city": city,
    }
    try:
        connection = await aio_pika.connect_robust(RABBITMQ_URL)
        async with connection:
            channel = await connection.channel()
            exchange = await channel.declare_exchange(
                EXCHANGE_NAME,
                aio_pika.ExchangeType.TOPIC,
                durable=True,
            )
            body = json.dumps(payload).encode()
            await exchange.publish(
                aio_pika.Message(body), routing_key="matching.requested"
            )
    except Exception:
        # don't raise — event publishing should not block RAG responses
        return
