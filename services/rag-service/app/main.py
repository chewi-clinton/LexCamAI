from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import os
import httpx
from typing import List, Any, Dict
from contextlib import asynccontextmanager

from .llm import generate_answer_from_documents
from .llm_adapter import generate, stream_generate
from .translator import translate_text
from .events import publish_matching_requested
from langdetect import detect
import asyncio
from .db import engine, SessionLocal
from .models import Base, RagSession


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


class ResultSource(BaseModel):
    id: str
    score: float | None = None
    snippet: str | None = None


class QueryResponse(BaseModel):
    query: str
    results: List[ResultSource]
    synthesized_answer: str
    provenance: List[Dict[str, Any]]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure DB tables exist (local dev default: sqlite)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="rag-service", lifespan=lifespan)

KB_URL = os.getenv("KNOWLEDGE_BASE_URL", "http://knowledge-base-service:8000")
EMBED_URL = os.getenv("EMBEDDING_SERVICE_URL", "http://embedding-service:8000")





@app.get("/api/v1/health")
async def health():
    return {"status": "ok", "kb": KB_URL, "llm_configured": bool(os.getenv("HF_API_KEY"))}


def _normalize_kb_response(data: Any) -> List[Dict[str, Any]]:
    if isinstance(data, list):
        results_raw = data
    else:
        results_raw = data.get("results") or data.get("hits") or data
    sources = []
    documents = []
    if isinstance(results_raw, list):
        for r in results_raw:
            if isinstance(r, dict):
                sid = str(r.get("id") or r.get("qdrant_id") or r.get("doc_id") or r.get("source_id") or "")
                score = r.get("score") if "score" in r else r.get("_score")
                snippet = r.get("snippet") or r.get("text") or r.get("content")
                language = r.get("language") or r.get("lang")
                sources.append({"id": sid, "score": score, "snippet": snippet, "language": language})
                documents.append({"id": sid, "score": score, "snippet": snippet, "language": language})
    return sources, documents


def _save_session(query: str, prompt: str | None, response: str | None, sources: List[Dict]):
    db = SessionLocal()
    try:
        sess = RagSession(query=query, prompt=prompt, response=response, sources=sources)
        db.add(sess)
        db.commit()
        db.refresh(sess)
        return sess.id
    finally:
        db.close()


@app.post("/api/v1/query", response_model=QueryResponse)
async def query(req: QueryRequest):
    # Call KB search endpoint (KB handles embedding + vector search)
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(f"{KB_URL}/api/v1/search", json={"query": req.query, "k": req.top_k})
            resp.raise_for_status()
            data = resp.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"KB search failed: {e}")

    sources, documents = _normalize_kb_response(data)

    # Detect query language and translate mismatched document snippets when possible
    query_lang = None
    try:
        query_lang = detect(req.query)
    except Exception:
        query_lang = None

    # translate documents whose language differs from query_lang
    async def _maybe_translate_documents(docs):
        tasks = []
        for d in docs:
            src = d.get("language")
            if src and query_lang and not src.startswith(query_lang):
                # translate snippet from src -> query_lang
                tasks.append(translate_text(d.get("snippet") or "", src, query_lang))
            else:
                tasks.append(None)

        results = []
        for t in tasks:
            if t is None:
                results.append(None)
            else:
                results.append(await t)
        return results

    try:
        translated = await _maybe_translate_documents(documents)
        for idx, tr in enumerate(translated):
            if tr:
                documents[idx]["snippet"] = tr
                sources[idx]["snippet"] = tr
    except Exception:
        # translation failures are non-fatal; continue with original snippets
        pass

    # Build a simple prompt (could be expanded to include provenance formatting)
    prompt_parts = [f"You are an assistant. Answer using only the provided documents.", f"Question: {req.query}", "Documents:"]
    for i, d in enumerate(documents, start=1):
        prompt_parts.append(f"[{i}] id={d.get('id')} score={d.get('score')} text={d.get('snippet')}")
    prompt = "\n\n".join(prompt_parts)

    # Generate answer via adapter
    try:
        answer = generate(prompt, documents)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM generation failed: {e}")

    # persist session
    session_id = None
    try:
        session_id = _save_session(req.query, prompt, answer, sources)
    except Exception:
        # don't fail the request if DB save fails
        pass

    # classify domain (simple keyword-based heuristic)
    def classify_domain(text: str) -> str:
        t = text.lower()
        if any(k in t for k in ["salary", "pay", "wage", "salaire", "impay"]):
            return "labor"
        if any(k in t for k in ["house", "rent", "logement", "bail", "evict"]):
            return "housing"
        if any(k in t for k in ["family", "divorce", "marriage", "famil"]):
            return "family"
        if any(k in t for k in ["crime", "police", "punish", "délit"]):
            return "criminal"
        return "general"

    domain = classify_domain(req.query)

    # publish matching.requested asynchronously (best-effort)
    try:
        asyncio.create_task(publish_matching_requested(domain, session_id, None))
    except Exception:
        pass

    provenance = sources
    return {"query": req.query, "results": sources, "synthesized_answer": answer, "provenance": provenance}


@app.post("/api/v1/query/stream")
async def query_stream(req: QueryRequest, request: Request):
    # Call KB search endpoint (KB handles embedding + vector search)
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(f"{KB_URL}/api/v1/search", json={"query": req.query, "k": req.top_k})
            resp.raise_for_status()
            data = resp.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"KB search failed: {e}")

    sources, documents = _normalize_kb_response(data)

    prompt_parts = [f"You are an assistant. Answer using only the provided documents.", f"Question: {req.query}", "Documents:"]
    for i, d in enumerate(documents, start=1):
        prompt_parts.append(f"[{i}] id={d.get('id')} score={d.get('score')} text={d.get('snippet')}")
    prompt = "\n\n".join(prompt_parts)

    async def event_generator():
        # stream_generate is an async generator; yield SSE 'data:' frames
        try:
            async for chunk in stream_generate(prompt, documents):
                if not chunk:
                    continue
                yield f"data: {chunk}\n\n"
            yield "event: done\n\n"
        finally:
            # Optionally save final aggregated response into DB.
            pass

    return StreamingResponse(event_generator(), media_type="text/event-stream")
