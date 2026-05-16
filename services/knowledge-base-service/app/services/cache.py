from redis.asyncio import Redis

from app.config import settings


def create_redis_client() -> Redis:
    return Redis.from_url(settings.redis_url, decode_responses=True)
