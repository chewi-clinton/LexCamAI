from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import httpx
from typing import List, Any


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


class QueryResponse(BaseModel):
    query: str
    results: List[Any]
    synthesized_answer: str


app = FastAPI(title="rag-service")

KB_URL = os.getenv("KNOWLEDGE_BASE_URL", "http://knowledge-base-service:8000")
EMBED_URL = os.getenv("EMBEDDING_SERVICE_URL", "http://embedding-service:8000")


@app.post("/api/v1/query", response_model=QueryResponse)
async def query(req: QueryRequest):
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Call KB search endpoint (KB handles embedding + vector search)
        try:
            resp = await client.post(f"{KB_URL}/api/v1/search", json={"query": req.query, "k": req.top_k})
            resp.raise_for_status()
            data = resp.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"KB search failed: {e}")

    results = data.get("results") or data.get("hits") or data
    # build simple synthesized answer by joining top contents
    texts = []
    if isinstance(results, list):
        for r in results:
            if isinstance(r, dict):
                texts.append(r.get("text") or r.get("content") or r.get("snippet") or str(r))
            else:
                texts.append(str(r))

    synthesized = "\n\n".join(texts[:3]) or "No relevant documents found."
    return {"query": req.query, "results": results, "synthesized_answer": synthesized}
