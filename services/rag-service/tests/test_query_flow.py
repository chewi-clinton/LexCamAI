import respx
from httpx import Response
import pytest
import os

from fastapi.testclient import TestClient

import sys
from pathlib import Path

# Ensure the service package directory is on sys.path so `import app` works
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
import importlib.util

# Load the `main.py` module directly to avoid package import issues
this_file = Path(__file__).resolve()
main_path = None
for parent in this_file.parents:
    candidate = parent / 'app'
    if candidate.exists():
        main_path = candidate / 'main.py'
        break
if main_path is None:
    raise FileNotFoundError('Could not locate app/main.py from test location')
app_dir = str((main_path.parent).resolve())
import types
if 'app' not in sys.modules:
    app_pkg = types.ModuleType('app')
    app_pkg.__path__ = [app_dir]
    sys.modules['app'] = app_pkg
spec = importlib.util.spec_from_file_location('app.main', str(main_path))
main_mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(main_mod)
app = main_mod.app


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
