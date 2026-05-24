from __future__ import annotations

import json
import uuid as uuid_lib
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from qdrant_client.http import models as rest
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.db import SessionLocal
from app.models import LawArticle, LawDocument
from app.schemas import (
    ArticleResponse,
    IngestArticleInput,
    IngestRequest,
    IngestResponse,
    LawArticleSummary,
    LawDocumentSchema,
    PDFIngestResponse,
    RetrieveItem,
    RetrieveRequest,
    RetrieveResponse,
    SearchRequest,
    SearchResultItem,
)
from app.services.embedding import EmbeddingServiceClient
from redis.asyncio import Redis

VECTOR_SIZE = 384

router = APIRouter()


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_qdrant(request: Request):
    return request.app.state.qdrant


def get_embedding_client(request: Request) -> EmbeddingServiceClient:
    return request.app.state.embedding_client


def get_redis(request: Request) -> Redis:
    return request.app.state.redis


@router.get("/health")
async def health(request: Request, db: Session = Depends(get_db)) -> Any:
    try:
        db.execute(select(1)).scalar_one()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"database: {exc}")

    qdrant_client = get_qdrant(request)
    try:
        qdrant_client.get_collection(settings.qdrant_collection)
        qdrant_ok = "ok"
    except Exception:
        qdrant_ok = "collection not found (needs ingestion)"

    embedding_client = get_embedding_client(request)
    try:
        emb_health = await embedding_client.health()
    except Exception:
        emb_health = {"status": "unreachable"}

    redis_client = get_redis(request)
    try:
        await redis_client.ping()
        redis_ok = True
    except Exception:
        redis_ok = False

    return {
        "status": "ok",
        "database": "ok",
        "qdrant_collection": qdrant_ok,
        "embedding_service": emb_health,
        "redis": "ok" if redis_ok else "unreachable",
    }


def _build_limit(limit: int | None) -> int:
    if limit is None or limit <= 0:
        return settings.max_search_results
    return min(limit, settings.max_search_results)


@router.post("/search")
async def search(
    payload: SearchRequest,
    request: Request,
    db: Session = Depends(get_db),
    qdrant_client=Depends(get_qdrant),
    embedding_client: EmbeddingServiceClient = Depends(get_embedding_client),
) -> list[SearchResultItem]:
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="query is required")

    limit = _build_limit(payload.limit)
    vector_results: dict[UUID, dict[str, Any]] = {}
    qdrant_filter = None
    if payload.domain:
        qdrant_filter = rest.Filter(
            must=[
                rest.FieldCondition(
                    key="domain",
                    match=rest.MatchValue(value=payload.domain),
                )
            ]
        )

    VECTOR_SCORE_THRESHOLD = 0.84

    embedding = await embedding_client.embed(payload.query)
    qdrant_hits = qdrant_client.search(
        collection_name=settings.qdrant_collection,
        query_vector=embedding,
        limit=limit,
        with_payload=True,
        query_filter=qdrant_filter,
        score_threshold=VECTOR_SCORE_THRESHOLD,
    )

    for rank, hit in enumerate(qdrant_hits, start=1):
        payload_data = hit.payload or {}
        article_id = payload_data.get("article_id")
        if not article_id or article_id in vector_results:
            continue

        vector_results[article_id] = {
            "article_id": UUID(str(article_id)),
            "law_name": payload_data.get("law_name", ""),
            "article_number": payload_data.get("article_number", ""),
            "title": payload_data.get("title"),
            "domain": payload_data.get("domain", ""),
            "language": payload_data.get("language", ""),
            "text_preview": payload_data.get("text_preview", ""),
            "score": hit.score,
        }

    query_expression = func.plainto_tsquery("simple", payload.query)
    statement = (
        select(LawArticle, func.ts_rank_cd(LawArticle.search_vector, query_expression).label("rank"))
        .options(joinedload(LawArticle.document))
        .where(LawArticle.search_vector.op("@@")(query_expression))
    )
    if payload.domain:
        statement = statement.where(LawArticle.domain == payload.domain)
    if payload.language:
        statement = statement.where(LawArticle.language == payload.language)
    statement = statement.order_by(desc("rank")).limit(limit)

    keyword_rows = db.execute(statement).all()
    keyword_results: dict[UUID, dict[str, Any]] = {}
    for article, rank_score in keyword_rows:
        if article.id in keyword_results:
            continue

        keyword_results[article.id] = {
            "article_id": article.id,
            "law_name": article.document.name if article.document else "",
            "article_number": article.article_number,
            "title": article.title,
            "domain": article.domain,
            "language": article.language,
            "text_preview": article.full_text[:200],
            "score": float(rank_score) if rank_score else 0.01,
        }

    merged: dict[UUID, dict[str, Any]] = {}
    for article_id, entry in vector_results.items():
        merged[article_id] = entry.copy()

    for article_id, entry in keyword_results.items():
        if article_id in merged:
            merged[article_id]["score"] += entry["score"]
        else:
            merged[article_id] = entry.copy()

    ordered = sorted(merged.values(), key=lambda item: item["score"], reverse=True)
    return [SearchResultItem(**item) for item in ordered[:limit]]


@router.get("/articles/{article_id}")
async def get_article(
    article_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
) -> ArticleResponse:
    cache_key = f"article:{article_id}"
    cached = await redis_client.get(cache_key)
    if cached:
        return ArticleResponse.model_validate_json(cached)

    article = db.get(LawArticle, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if not article.document:
        db.refresh(article, attribute_names=["document"])

    response = ArticleResponse(
        id=article.id,
        document_id=article.document_id,
        document_code=article.document.code if article.document else None,
        document_name=article.document.name if article.document else None,
        article_number=article.article_number,
        chapter=article.chapter,
        title=article.title,
        full_text=article.full_text,
        plain_summary=article.plain_summary,
        domain=article.domain,
        language=article.language,
        qdrant_id=article.qdrant_id,
    )
    await redis_client.set(
        cache_key,
        response.model_dump_json(),
        ex=settings.plain_summary_cache_ttl_seconds,
    )
    return response


@router.get("/articles")
def list_articles(
    law_code: str | None = None,
    domain: str | None = None,
    language: str | None = None,
    db: Session = Depends(get_db),
) -> list[LawArticleSummary]:
    statement = select(LawArticle).options(joinedload(LawArticle.document))
    if law_code:
        statement = statement.join(LawArticle.document).where(LawDocument.code == law_code)
    if domain:
        statement = statement.where(LawArticle.domain == domain)
    if language:
        statement = statement.where(LawArticle.language == language)

    articles = db.scalars(statement).all()
    return [
        LawArticleSummary(
            id=article.id,
            document_id=article.document_id,
            document_code=article.document.code if article.document else None,
            document_name=article.document.name if article.document else None,
            article_number=article.article_number,
            title=article.title,
            domain=article.domain,
            language=article.language,
        )
        for article in articles
    ]


@router.get("/laws")
def list_laws(db: Session = Depends(get_db)) -> list[LawDocumentSchema]:
    documents = db.scalars(select(LawDocument)).all()
    return [LawDocumentSchema.model_validate(document) for document in documents]


@router.post("/internal/retrieve")
def internal_retrieve(
    payload: RetrieveRequest,
    request: Request,
    qdrant_client=Depends(get_qdrant),
) -> RetrieveResponse:
    limit = _build_limit(payload.top_k)
    qdrant_filter = None
    if payload.domain_filter:
        conditions = [
            rest.FieldCondition(key="domain", match=rest.MatchValue(value=value))
            for value in payload.domain_filter
        ]
        qdrant_filter = rest.Filter(min_should=rest.MinShould(conditions=conditions, min_count=1))

    hits = qdrant_client.search(
        collection_name=settings.qdrant_collection,
        query_vector=payload.query_vector,
        limit=limit,
        with_payload=True,
        query_filter=qdrant_filter,
    )

    results = []
    for hit in hits:
        payload_data = hit.payload or {}
        article_id_value = payload_data.get("article_id")
        if not article_id_value:
            continue

        results.append(
            RetrieveItem(
                article_id=UUID(str(article_id_value)),
                law_name=payload_data.get("law_name", ""),
                article_number=payload_data.get("article_number", ""),
                domain=payload_data.get("domain", ""),
                language=payload_data.get("language", ""),
                text_preview=payload_data.get("text_preview", ""),
                score=hit.score or 0.0,
            )
        )

    return RetrieveResponse(results=results)


@router.post("/ingest", response_model=IngestResponse)
async def ingest_document(
    payload: IngestRequest,
    request: Request,
    db: Session = Depends(get_db),
    qdrant_client=Depends(get_qdrant),
    embedding_client: EmbeddingServiceClient = Depends(get_embedding_client),
) -> IngestResponse:
    # Ensure Qdrant collection exists
    try:
        qdrant_client.get_collection(settings.qdrant_collection)
    except Exception:
        qdrant_client.create_collection(
            collection_name=settings.qdrant_collection,
            vectors_config=rest.VectorParams(size=VECTOR_SIZE, distance=rest.Distance.COSINE),
        )

    doc = LawDocument(
        code=payload.code,
        name=payload.name,
        jurisdiction=payload.jurisdiction,
        language=payload.language,
        version=payload.version,
    )
    db.add(doc)
    db.flush()

    articles_ingested = 0
    for art in payload.articles:
        article = LawArticle(
            document_id=doc.id,
            article_number=art.article_number,
            chapter=art.chapter,
            title=art.title,
            full_text=art.full_text,
            plain_summary=art.plain_summary,
            domain=art.domain,
            language=art.language,
        )
        db.add(article)
        db.flush()

        try:
            vector = await embedding_client.embed(art.full_text)
            point_id = str(uuid_lib.uuid4())
            qdrant_client.upsert(
                collection_name=settings.qdrant_collection,
                points=[rest.PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={
                        "article_id": str(article.id),
                        "law_name": payload.name,
                        "article_number": art.article_number,
                        "title": art.title,
                        "domain": art.domain,
                        "language": art.language,
                        "text_preview": art.full_text[:300],
                    },
                )],
            )
            article.qdrant_id = point_id
            articles_ingested += 1
        except Exception:
            pass

    db.commit()
    return IngestResponse(document_id=doc.id, articles_ingested=articles_ingested)


@router.post("/ingest/pdf", response_model=PDFIngestResponse)
async def ingest_pdf(
    request: Request,
    file: UploadFile = File(...),
    code: str = Form(...),
    name: str = Form(...),
    domain: str = Form("general"),
    language: str = Form("fr"),
    jurisdiction: str = Form("cameroon"),
    version: str | None = Form(None),
    db: Session = Depends(get_db),
    qdrant_client=Depends(get_qdrant),
    embedding_client: EmbeddingServiceClient = Depends(get_embedding_client),
) -> PDFIngestResponse:
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    from app.pdf_parser import parse_pdf

    pdf_bytes = await file.read()
    raw_articles = parse_pdf(pdf_bytes, domain=domain, language=language)

    if not raw_articles:
        raise HTTPException(status_code=422, detail="No articles detected in this PDF.")

    # Ensure Qdrant collection exists
    try:
        qdrant_client.get_collection(settings.qdrant_collection)
    except Exception:
        qdrant_client.create_collection(
            collection_name=settings.qdrant_collection,
            vectors_config=rest.VectorParams(size=VECTOR_SIZE, distance=rest.Distance.COSINE),
        )

    doc = LawDocument(
        code=code,
        name=name,
        jurisdiction=jurisdiction,
        language=language,
        version=version,
    )
    db.add(doc)
    db.flush()

    articles_ingested = 0
    for art in raw_articles:
        article = LawArticle(
            document_id=doc.id,
            article_number=art["article_number"],
            chapter=art.get("chapter"),
            title=art.get("title"),
            full_text=art["full_text"],
            plain_summary=art.get("plain_summary"),
            domain=art["domain"],
            language=art["language"],
        )
        db.add(article)
        db.flush()

        try:
            vector = await embedding_client.embed(art["full_text"])
            point_id = str(uuid_lib.uuid4())
            qdrant_client.upsert(
                collection_name=settings.qdrant_collection,
                points=[rest.PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={
                        "article_id":     str(article.id),
                        "law_name":       name,
                        "article_number": art["article_number"],
                        "title":          art.get("title"),
                        "domain":         art["domain"],
                        "language":       art["language"],
                        "text_preview":   art["full_text"][:300],
                    },
                )],
            )
            article.qdrant_id = point_id
            articles_ingested += 1
        except Exception:
            pass

    db.commit()
    return PDFIngestResponse(
        document_id=doc.id,
        articles_found=len(raw_articles),
        articles_ingested=articles_ingested,
    )
