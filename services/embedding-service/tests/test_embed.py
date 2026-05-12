import os

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.mark.skipif(
    os.getenv("LEXCAM_TEST_NO_MODEL") == "1",
    reason="Model download disabled for tests",
)
def test_embed_returns_vectors():
    client = TestClient(app)
    headers = {}
    if os.getenv("REQUIRE_API_KEY", "false").lower() == "true":
        api_key = os.getenv("API_KEY", "")
        if api_key:
            headers["X-API-Key"] = api_key
    response = client.post(
        "/api/v1/embed",
        json={"texts": ["hello world"], "input_type": "query"},
        headers=headers,
    )
    assert response.status_code == 200
    payload = response.json()
    assert "embeddings" in payload
    assert len(payload["embeddings"]) == 1
    assert len(payload["embeddings"][0]) > 0
