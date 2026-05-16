"""Seed the Knowledge Base with a sample document and article.

Usage:
  python scripts/seed_kb.py

Requires environment variables (defaults provided for local dev with docker-compose):
- DATABASE_URL
- QDRANT_URL
- EMBEDDING_SERVICE_URL
"""
import os
import uuid
import json

import httpx
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest
import psycopg

DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgresql+psycopg://lexcam:lexcam_dev@localhost:5432/lexcam_knowledge"
)
PSYCOPG_DATABASE_URL = DATABASE_URL.replace("postgresql+psycopg://", "postgresql://", 1)
QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6333")
QDRANT_COLLECTION = os.environ.get("QDRANT_COLLECTION", "lexcam_laws")
EMBEDDING_SERVICE_URL = os.environ.get("EMBEDDING_SERVICE_URL", "http://localhost:8001/api/v1")

SAMPLE_DOC = {
    "code": "LABOR",
    "name": "Cameroon Labour Code",
    "jurisdiction": "cameroon",
    "language": "fr",
}

SAMPLE_ARTICLE = {
    "article_number": "Art. 34",
    "chapter": None,
    "title": "Protection des travailleurs",
    "full_text": "Tout employeur est tenu d'assurer la protection de la santé et de la sécurité des travailleurs.",
    "plain_summary": "Employers must ensure worker health and safety.",
    "domain": "labor",
    "language": "fr",
}


def embed_text(text: str) -> list[float]:
    url = f"{EMBEDDING_SERVICE_URL}/embed"
    with httpx.Client(timeout=30.0) as client:
        r = client.post(url, json={"texts": [text]})
        r.raise_for_status()
        payload = r.json()
        embeddings = payload.get("embeddings")
        if not embeddings:
            raise RuntimeError("No embeddings returned")
        return embeddings[0]


def upsert_qdrant(client: QdrantClient, point_id: str, vector: list[float], payload: dict):
    client.upsert(
        collection_name=QDRANT_COLLECTION,
        points=[rest.PointStruct(id=point_id, vector=vector, payload=payload)],
    )


def main():
    print("Connecting to DB...", PSYCOPG_DATABASE_URL)
    with psycopg.connect(PSYCOPG_DATABASE_URL, autocommit=True) as conn:
        with conn.cursor() as cur:
            # Insert document
            cur.execute(
                "INSERT INTO law_documents (code, name, jurisdiction, language) VALUES (%s,%s,%s,%s) RETURNING id",
                (SAMPLE_DOC["code"], SAMPLE_DOC["name"], SAMPLE_DOC["jurisdiction"], SAMPLE_DOC["language"]),
            )
            doc_id = cur.fetchone()[0]
            print("Inserted document id", doc_id)

            # Insert article
            cur.execute(
                "INSERT INTO law_articles (document_id, article_number, chapter, title, full_text, plain_summary, domain, language) VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                (
                    doc_id,
                    SAMPLE_ARTICLE["article_number"],
                    SAMPLE_ARTICLE["chapter"],
                    SAMPLE_ARTICLE["title"],
                    SAMPLE_ARTICLE["full_text"],
                    SAMPLE_ARTICLE["plain_summary"],
                    SAMPLE_ARTICLE["domain"],
                    SAMPLE_ARTICLE["language"],
                ),
            )
            article_id = cur.fetchone()[0]
            print("Inserted article id", article_id)

    # Get embedding and upsert to Qdrant
    print("Requesting embedding...")
    vector = embed_text(SAMPLE_ARTICLE["full_text"])  # list of floats

    q = QdrantClient(url=QDRANT_URL)
    point_id = str(uuid.uuid4())
    payload = {
        "article_id": str(article_id),
        "law_name": SAMPLE_DOC["name"],
        "article_number": SAMPLE_ARTICLE["article_number"],
        "domain": SAMPLE_ARTICLE["domain"],
        "language": SAMPLE_ARTICLE["language"],
        "text_preview": SAMPLE_ARTICLE["full_text"][:200],
    }
    print("Upserting to Qdrant, point id", point_id)
    upsert_qdrant(q, point_id, vector, payload)

    # Update article qdrant_id in DB
    with psycopg.connect(PSYCOPG_DATABASE_URL, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE law_articles SET qdrant_id = %s WHERE id = %s",
                (point_id, article_id),
            )
            print("Updated article qdrant_id")

    print("Seed complete")


if __name__ == "__main__":
    main()
