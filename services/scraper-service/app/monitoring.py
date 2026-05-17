import logging
from prometheus_client import Counter, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Request, Response
import structlog

REQUEST_COUNT = Counter("http_requests_total", "Total HTTP requests", ["method", "endpoint", "http_status"])


def init_logging():
    structlog.configure(processors=[structlog.processors.JSONRenderer()])
    logging.basicConfig(level=logging.INFO)


async def prometheus_endpoint():
    data = generate_latest()
    return Response(content=data, media_type=CONTENT_TYPE_LATEST)


async def prometheus_middleware(request: Request, call_next):
    response = await call_next(request)
    try:
        REQUEST_COUNT.labels(request.method, request.url.path, str(response.status_code)).inc()
    except Exception:
        pass
    return response
