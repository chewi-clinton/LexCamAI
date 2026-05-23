from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from .monitoring import prometheus_middleware, prometheus_endpoint
from pydantic import BaseModel
import os
import json
import httpx
from typing import List, Any, Dict
from contextlib import asynccontextmanager

from .llm_adapter import generate, stream_generate
from .translator import translate_text
from .events import publish_matching_requested
from langdetect import detect
import asyncio
from .db import engine, SessionLocal
from .models import Base, RagSession, Conversation, Message


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
    Base.metadata.create_all(bind=engine)
    # Add user_id column to existing deployments that predate it
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE conversations ADD COLUMN user_id VARCHAR(64)"))
            conn.commit()
        except Exception:
            pass  # column already exists
    yield


app = FastAPI(title="rag-service", lifespan=lifespan)
app.middleware("http")(prometheus_middleware)
app.add_api_route("/metrics", prometheus_endpoint, methods=["GET"])

KB_URL = os.getenv("KNOWLEDGE_BASE_URL", "http://knowledge-base-service:8000")
EMBED_URL = os.getenv("EMBEDDING_SERVICE_URL", "http://embedding-service:8000")

SYSTEM_IDENTITY = (
    "You are LexCam AI, an artificial intelligence legal assistant created by the LexCam team to help "
    "people in Cameroon understand their legal rights and navigate Cameroonian law. "
    "You are NOT a human and NOT a lawyer. "
    "Only identify yourself as LexCam AI when the user directly asks about your name or identity — do NOT introduce yourself at the start of every response. "
    "When citing legal sources, always reference the specific law and article number, for example: "
    "'According to Art. 34 of the Cameroon Labour Code...' or 'Under Art. 69 of Law No. 92/007...'. "
    "Never say 'the documents provided' or 'the provided documents' — cite the law by name instead. "
    "Provide clear, helpful, and accurate general legal information about Cameroonian law. "
    "Always remind users that your responses are for informational purposes only and do not constitute formal legal advice."
)





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
                sid = str(r.get("article_id") or r.get("id") or r.get("qdrant_id") or r.get("doc_id") or "")
                score = r.get("score") if "score" in r else r.get("_score")
                snippet = r.get("snippet") or r.get("text") or r.get("content") or r.get("text_preview")
                language = r.get("language") or r.get("lang")
                article_number = r.get("article_number", "")
                law_name = r.get("law_name", "")
                title = r.get("title", "")
                src = {"id": sid, "score": score, "snippet": snippet, "language": language,
                       "article_number": article_number, "law_name": law_name, "title": title}
                sources.append(src)
                documents.append({"id": sid, "score": score, "snippet": snippet, "language": language,
                                   "article_number": article_number, "law_name": law_name})
    return sources, documents


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

    # Generate answer via adapter (llm.py builds the prompt internally from query + documents)
    try:
        answer = generate(req.query, documents)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM generation failed: {e}")

    # persist session
    session_id = None
    try:
        session_id = _save_session(req.query, None, answer, sources)
    except Exception:
        # don't fail the request if DB save fails
        pass

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

    if documents:
        prompt_parts = [
            "Answer the user's question using the legal articles below. When citing them, use the law name and article number shown — do NOT say 'document [N]'.",
            f"Question: {req.query}",
            "Legal Articles:",
        ]
        for d in documents:
            law_ref = f"{d.get('article_number', '')} of {d.get('law_name', 'Cameroonian Law')}".strip(" of")
            prompt_parts.append(f"• {law_ref}: {d.get('snippet', '')}")
    else:
        prompt_parts = [
            "Answer the user's question based on your knowledge of Cameroonian law and general legal principles.",
            f"Question: {req.query}",
        ]
    prompt = "\n\n".join(prompt_parts)

    async def event_generator():
        try:
            async for chunk in stream_generate(prompt, documents, system_prompt=SYSTEM_IDENTITY):
                if not chunk:
                    continue
                yield f"data: {json.dumps({'content': chunk})}\n\n"
            yield "event: done\n\n"
        finally:
            pass

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# ── Chat / Conversation endpoints ──────────────────────────────────────────

class ChatMessageRequest(BaseModel):
    content: str


def _conv_dict(conv: Conversation, include_messages: bool = False) -> Dict:
    d = {
        "id": conv.id,
        "title": conv.title or "New conversation",
        "domain": conv.domain,
        "message_count": conv.message_count or 0,
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
        "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
    }
    if include_messages:
        d["messages"] = [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "sources": m.sources,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in conv.messages
        ]
    return d


@app.post("/api/v1/chat/conversations")
def create_conversation(request: Request):
    user_id = request.headers.get("X-User-Id") or None
    db = SessionLocal()
    try:
        conv = Conversation(title=None, domain=None, message_count=0, user_id=user_id)
        db.add(conv)
        db.commit()
        db.refresh(conv)
        return _conv_dict(conv)
    finally:
        db.close()


@app.get("/api/v1/chat/conversations")
def list_conversations(request: Request):
    user_id = request.headers.get("X-User-Id") or None
    db = SessionLocal()
    try:
        q = db.query(Conversation)
        if user_id:
            q = q.filter(Conversation.user_id == user_id)
        else:
            return []  # not logged in — no history shown
        convs = q.order_by(Conversation.updated_at.desc()).limit(50).all()
        return [_conv_dict(c) for c in convs]
    finally:
        db.close()


@app.get("/api/v1/chat/conversations/{conv_id}")
def get_conversation(conv_id: int):
    db = SessionLocal()
    try:
        conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return _conv_dict(conv, include_messages=True)
    finally:
        db.close()


@app.post("/api/v1/chat/conversations/{conv_id}/messages")
async def send_chat_message(conv_id: int, req: ChatMessageRequest):
    from datetime import datetime, timezone

    db = SessionLocal()
    try:
        conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        user_msg = Message(conversation_id=conv_id, role="user", content=req.content)
        db.add(user_msg)
        db.commit()
    finally:
        db.close()

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(f"{KB_URL}/api/v1/search", json={"query": req.content, "k": 3})
            resp.raise_for_status()
            data = resp.json()
        except httpx.HTTPError:
            data = []

    sources, documents = _normalize_kb_response(data)

    try:
        answer = generate(req.content, documents)
    except Exception:
        answer = "I'm sorry, I couldn't generate an answer at this time."

    domain = classify_domain(req.content)

    db = SessionLocal()
    try:
        conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if conv:
            conv.message_count = (conv.message_count or 0) + 2
            if not conv.title:
                conv.title = req.content[:60]
            conv.domain = domain
            conv.updated_at = datetime.now(timezone.utc)
        assistant_msg = Message(
            conversation_id=conv_id,
            role="assistant",
            content=answer,
            sources=sources,
        )
        db.add(assistant_msg)
        db.commit()
        db.refresh(assistant_msg)
        return {
            "id": assistant_msg.id,
            "role": "assistant",
            "content": answer,
            "sources": sources,
            "created_at": assistant_msg.created_at.isoformat() if assistant_msg.created_at else None,
        }
    finally:
        db.close()


@app.post("/api/v1/chat/conversations/{conv_id}/messages/stream")
async def stream_chat_message(conv_id: int, req: ChatMessageRequest, request: Request):
    from datetime import datetime, timezone

    db = SessionLocal()
    try:
        conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        user_msg = Message(conversation_id=conv_id, role="user", content=req.content)
        db.add(user_msg)
        db.commit()
    finally:
        db.close()

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(f"{KB_URL}/api/v1/search", json={"query": req.content, "k": 3})
            resp.raise_for_status()
            data = resp.json()
        except httpx.HTTPError:
            data = []

    sources, documents = _normalize_kb_response(data)
    if documents:
        prompt_parts = [
            "Answer the user's question using the legal articles below. When citing them, use the law name and article number shown — do NOT say 'document [N]'.",
            f"Question: {req.content}",
            "Legal Articles:",
        ]
        for d in documents:
            law_ref = f"{d.get('article_number', '')} of {d.get('law_name', 'Cameroonian Law')}".strip(" of")
            prompt_parts.append(f"• {law_ref}: {d.get('snippet', '')}")
    else:
        prompt_parts = [
            "Answer the user's question based on your knowledge of Cameroonian law and general legal principles.",
            f"Question: {req.content}",
        ]
    prompt = "\n\n".join(prompt_parts)

    collected: List[str] = []

    async def event_generator():
        display_sources = [
            {"id": s["id"], "article_number": s["article_number"],
             "law_name": s["law_name"], "title": s["title"]}
            for s in sources[:3] if s.get("id")
        ]
        if display_sources:
            yield f"data: {json.dumps({'sources': display_sources})}\n\n"
        try:
            async for chunk in stream_generate(prompt, documents, system_prompt=SYSTEM_IDENTITY):
                if not chunk:
                    continue
                collected.append(chunk)
                yield f"data: {json.dumps({'content': chunk})}\n\n"
        finally:
            full_answer = "".join(collected)
            domain = classify_domain(req.content)
            _db = SessionLocal()
            try:
                _conv = _db.query(Conversation).filter(Conversation.id == conv_id).first()
                if _conv:
                    _conv.message_count = (_conv.message_count or 0) + 2
                    if not _conv.title:
                        _conv.title = req.content[:60]
                    _conv.domain = domain
                    _conv.updated_at = datetime.now(timezone.utc)
                _db.add(Message(
                    conversation_id=conv_id,
                    role="assistant",
                    content=full_answer or "(no response)",
                    sources=sources,
                ))
                _db.commit()
            finally:
                _db.close()
            yield "event: done\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
