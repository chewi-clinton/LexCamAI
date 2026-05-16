import os
import pytest
import respx
from httpx import Response

from rag_service.app.llm import generate_answer_from_documents


@respx.mock
def test_generate_answer_success(monkeypatch):
    # Mock HF API
    model = "google/flan-t5-small"
    url = f"https://api-inference.huggingface.co/models/{model}"
    respx.post(url).mock(return_value=Response(200, json=[{"generated_text": "This is an answer. [sources: 1,2]"}]))

    monkeypatch.setenv("HF_API_KEY", "test-token")
    docs = [{"id": "1", "snippet": "doc one"}, {"id": "2", "snippet": "doc two"}]
    out = generate_answer_from_documents("What is this?", docs)
    assert "This is an answer" in out
