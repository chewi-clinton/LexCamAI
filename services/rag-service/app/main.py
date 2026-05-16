from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import httpx
from typing import List, Any, Dict

from .llm import generate_answer_from_documents


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


app = FastAPI(title="rag-service")

KB_URL = os.getenv("KNOWLEDGE_BASE_URL", "http://knowledge-base-service:8000")
EMBED_URL = os.getenv("EMBEDDING_SERVICE_URL", "http://embedding-service:8000")


@app.get("/api/v1/health")
async def health():
    return {"status": "ok", "kb": KB_URL, "llm_configured": bool(os.getenv("HF_API_KEY"))}


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

    # normalize results to list of sources
    if isinstance(data, list):
        results_raw = data
    else:
        results_raw = data.get("results") or data.get("hits") or data
    sources: List[ResultSource] = []
    documents = []
    if isinstance(results_raw, list):
        for r in results_raw:
            if isinstance(r, dict):
                sid = str(r.get("id") or r.get("qdrant_id") or r.get("doc_id") or r.get("source_id") or "")
                score = r.get("score") if "score" in r else r.get("_score")
                snippet = r.get("snippet") or r.get("text") or r.get("content")
                sources.append(ResultSource(id=sid, score=score, snippet=snippet))
                documents.append({"id": sid, "score": score, "snippet": snippet})

    # Generate answer via LLM adapter
    try:
        answer = generate_answer_from_documents(req.query, documents)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM generation failed: {e}")

    provenance = [{"id": s.id, "score": s.score, "snippet": s.snippet} for s in sources]
    return {"query": req.query, "results": [s.dict() for s in sources], "synthesized_answer": answer, "provenance": provenance}
