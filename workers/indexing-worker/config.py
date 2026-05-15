import os

RABBITMQ_URL = os.environ["RABBITMQ_URL"]
KB_SERVICE_URL = os.environ["KB_SERVICE_URL"]
EMBEDDING_SERVICE_URL = os.environ["EMBEDDING_SERVICE_URL"]
INTERNAL_SERVICE_KEY = os.environ["INTERNAL_SERVICE_KEY"]
QDRANT_URL = os.environ.get("QDRANT_URL", "http://qdrant-svc:6333")
QDRANT_COLLECTION = os.environ.get("QDRANT_COLLECTION", "lexcam_laws")
CHUNK_SIZE = int(os.environ.get("CHUNK_SIZE", "500"))
CHUNK_OVERLAP = int(os.environ.get("CHUNK_OVERLAP", "50"))
