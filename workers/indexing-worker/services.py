from __future__ import annotations

import logging
import uuid

import requests
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

import config

logger = logging.getLogger(__name__)

_qdrant = QdrantClient(url=config.QDRANT_URL)
_INTERNAL_HEADERS = {"X-Internal-Key": config.INTERNAL_SERVICE_KEY}


def chunk_text(text: str, chunk_size: int = None, overlap: int = None) -> list[str]:
    """Split text into word-based chunks with overlap."""
    chunk_size = chunk_size or config.CHUNK_SIZE
    overlap = overlap or config.CHUNK_OVERLAP

    words = text.split()
    if len(words) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunks.append(" ".join(words[start:end]))
        if end == len(words):
            break
        start = end - overlap
    return chunks


def get_article(article_id: str) -> dict:
    resp = requests.get(
        f"{config.KB_SERVICE_URL}/api/v1/articles/{article_id}",
        headers=_INTERNAL_HEADERS,
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()


def get_embeddings(texts: list[str]) -> list[list[float]]:
    resp = requests.post(
        f"{config.EMBEDDING_SERVICE_URL}/api/v1/embed",
        json={"texts": texts},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["embeddings"]


def ensure_collection_exists(dimension: int = 384) -> None:
    collections = [c.name for c in _qdrant.get_collections().collections]
    if config.QDRANT_COLLECTION not in collections:
        _qdrant.create_collection(
            collection_name=config.QDRANT_COLLECTION,
            vectors_config=VectorParams(size=dimension, distance=Distance.COSINE),
        )
        logger.info(f"Created Qdrant collection: {config.QDRANT_COLLECTION}")


def upsert_article_chunks(article: dict) -> int:
    """Chunk, embed, and upsert one article. Returns the number of chunks indexed."""
    full_text = article["full_text"]
    chunks = chunk_text(full_text)

    if not chunks:
        return 0

    embeddings = get_embeddings(chunks)

    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=embedding,
            payload={
                "article_id": article["id"],
                "law_name": article.get("law_name", ""),
                "article_number": article.get("article_number", ""),
                "domain": article.get("domain", ""),
                "language": article.get("language", "fr"),
                "text_preview": chunk[:200],
            },
        )
        for chunk, embedding in zip(chunks, embeddings)
    ]

    _qdrant.upsert(collection_name=config.QDRANT_COLLECTION, points=points)
    logger.info(f"Indexed {len(points)} chunks for article {article['id']}")
    return len(points)


def index_articles(article_ids: list[str]) -> int:
    ensure_collection_exists()
    total = 0
    for article_id in article_ids:
        try:
            article = get_article(article_id)
            total += upsert_article_chunks(article)
        except Exception as exc:
            logger.error(f"Failed to index article {article_id}: {exc}")
    return total
