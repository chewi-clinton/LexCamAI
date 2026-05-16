import respx
from httpx import Response
import pytest
import os

from fastapi.testclient import TestClient

from rag_service.app.main import app


@respx.mock
def test_query_endpoint(monkeypatch):
    # Mock KB search endpoint
    kb_url = "http://knowledge-base-service:8000/api/v1/search"
    respx.post(kb_url).mock(return_value=Response(200, json={"results": [{"id": "d1", "snippet": "s1", "score": 0.9}]}))

    # Mock HF inference
    hf_url = "https://api-inference.huggingface.co/models/google/flan-t5-small"
    respx.post(hf_url).mock(return_value=Response(200, json=[{"generated_text": "Answer from HF. [sources: d1]"}]))

    monkeypatch.setenv("HF_API_KEY", "test-token")

    client = TestClient(app)
    resp = client.post("/api/v1/query", json={"query": "test", "top_k": 1})
    assert resp.status_code == 200
    body = resp.json()
    assert "synthesized_answer" in body
    assert body["synthesized_answer"].startswith("Answer from HF")
