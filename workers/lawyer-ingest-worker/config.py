from __future__ import annotations

import os


RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
LAWYER_SERVICE_URL = os.getenv("LAWYER_SERVICE_URL", "http://lawyer-service:8000")
INTERNAL_SERVICE_KEY = os.getenv("INTERNAL_SERVICE_KEY", "internal-key")
EXCHANGE = os.getenv("EXCHANGE", "lexcam.events")
DLX_EXCHANGE = os.getenv("DLX_EXCHANGE", "lexcam.dlx")
QUEUE = os.getenv("QUEUE", "lawyer-ingest-worker.lawyers.scraped")
ROUTING_KEY = os.getenv("ROUTING_KEY", "lawyers.scraped")
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "20"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
