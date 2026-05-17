import os
import pytest
import respx
from httpx import Response
import sys
from pathlib import Path

# Ensure the service package directory is on sys.path so `import app` works
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
import importlib.util

# Load the `llm.py` module directly to avoid package import issues
this_file = Path(__file__).resolve()
llm_path = None
for parent in this_file.parents:
    candidate = parent / 'app'
    if candidate.exists():
        llm_path = candidate / 'llm.py'
        break
if llm_path is None:
    raise FileNotFoundError('Could not locate app/llm.py from test location')
spec = importlib.util.spec_from_file_location('app.llm', str(llm_path))
app_dir = str((llm_path.parent).resolve())
import types
if 'app' not in sys.modules:
    app_pkg = types.ModuleType('app')
    app_pkg.__path__ = [app_dir]
    sys.modules['app'] = app_pkg
llm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(llm)
generate_answer_from_documents = llm.generate_answer_from_documents


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
