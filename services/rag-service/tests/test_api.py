import respx
from httpx import Response as HttpxResponse
from unittest.mock import patch
from fastapi.testclient import TestClient

from app.main import app, classify_domain


def test_health():
    with TestClient(app) as client:
        r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_create_conversation():
    with TestClient(app) as client:
        r = client.post("/api/v1/chat/conversations")
    assert r.status_code == 200
    data = r.json()
    assert "id" in data


def test_list_conversations_no_user():
    with TestClient(app) as client:
        r = client.get("/api/v1/chat/conversations")
    assert r.status_code == 200
    assert r.json() == []


def test_get_conversation_not_found():
    with TestClient(app) as client:
        r = client.get("/api/v1/chat/conversations/99999")
    assert r.status_code == 404


def test_list_conversations_with_user():
    with TestClient(app) as client:
        r = client.get("/api/v1/chat/conversations", headers={"X-User-Id": "user-test-1"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_send_chat_message_not_found():
    with TestClient(app) as client:
        r = client.post("/api/v1/chat/conversations/99999/messages", json={"content": "Hello"})
    assert r.status_code == 404


def test_stream_chat_message_not_found():
    with TestClient(app) as client:
        r = client.post("/api/v1/chat/conversations/99999/messages/stream", json={"content": "Hello"})
    assert r.status_code == 404


@respx.mock
def test_query_success():
    respx.post("http://knowledge-base-service:8000/api/v1/search").mock(
        return_value=HttpxResponse(200, json={"results": []}))
    with patch("app.main.generate", return_value="Test answer"), \
         patch("app.main.publish_matching_requested"):
        with TestClient(app) as client:
            r = client.post("/api/v1/query", json={"query": "What is law?", "top_k": 3})
    assert r.status_code == 200
    assert r.json()["synthesized_answer"] == "Test answer"


@respx.mock
def test_query_kb_error():
    respx.post("http://knowledge-base-service:8000/api/v1/search").mock(
        return_value=HttpxResponse(500))
    with TestClient(app) as client:
        r = client.post("/api/v1/query", json={"query": "test", "top_k": 3})
    assert r.status_code == 502


@respx.mock
def test_send_chat_message_success():
    respx.post("http://knowledge-base-service:8000/api/v1/search").mock(
        return_value=HttpxResponse(200, json={"results": []}))

    async def _fake_stream(*_, **__):
        yield "Legal answer"

    with patch("app.main.stream_generate", new=_fake_stream):
        with TestClient(app) as client:
            conv_r = client.post("/api/v1/chat/conversations")
            conv_id = conv_r.json()["id"]
            r = client.post(
                f"/api/v1/chat/conversations/{conv_id}/messages",
                json={"content": "What are my rights?"},
            )
    assert r.status_code == 200
    assert r.json()["content"] == "Legal answer"


@respx.mock
def test_send_chat_message_with_documents():
    """Covers the if-documents prompt-building branch in send_chat_message."""
    respx.post("http://knowledge-base-service:8000/api/v1/search").mock(
        return_value=HttpxResponse(200, json={"results": [{
            "id": "doc-1", "score": 0.95, "snippet": "Employees are entitled to paid leave.",
            "language": "en", "article_number": "Art. 34", "law_name": "Cameroon Labour Code"
        }]}))

    async def _fake_stream(*_, **__):
        yield "Employees are entitled to paid leave under Art. 34."

    with patch("app.main.stream_generate", new=_fake_stream):
        with TestClient(app) as client:
            conv_r = client.post("/api/v1/chat/conversations")
            conv_id = conv_r.json()["id"]
            r = client.post(
                f"/api/v1/chat/conversations/{conv_id}/messages",
                json={"content": "What are my leave rights?"},
            )
    assert r.status_code == 200
    assert "entitled" in r.json()["content"]


@respx.mock
def test_stream_chat_message_endpoint_success():
    respx.post("http://knowledge-base-service:8000/api/v1/search").mock(
        return_value=HttpxResponse(200, json={"results": []}))

    async def _fake_stream(*_, **__):
        yield "Streaming legal answer"

    with patch("app.main.stream_generate", new=_fake_stream):
        with TestClient(app) as client:
            conv_r = client.post("/api/v1/chat/conversations")
            conv_id = conv_r.json()["id"]
            r = client.post(
                f"/api/v1/chat/conversations/{conv_id}/messages/stream",
                json={"content": "What are my rights?"},
            )
    assert r.status_code == 200
    assert "Streaming legal answer" in r.text


@respx.mock
def test_stream_chat_message_endpoint_kb_fails():
    respx.post("http://knowledge-base-service:8000/api/v1/search").mock(
        return_value=HttpxResponse(500))

    async def _fake_stream(*_, **__):
        yield "Fallback streaming answer"

    with patch("app.main.stream_generate", new=_fake_stream):
        with TestClient(app) as client:
            conv_r = client.post("/api/v1/chat/conversations")
            conv_id = conv_r.json()["id"]
            r = client.post(
                f"/api/v1/chat/conversations/{conv_id}/messages/stream",
                json={"content": "test"},
            )
    assert r.status_code == 200
    assert "Fallback streaming answer" in r.text


@respx.mock
def test_stream_chat_message_endpoint_with_sources():
    respx.post("http://knowledge-base-service:8000/api/v1/search").mock(
        return_value=HttpxResponse(200, json={"results": [{
            "id": "doc-1", "score": 0.95, "snippet": "Workers are entitled to leave.",
            "language": "en", "article_number": "Art. 34", "law_name": "Cameroon Labour Code"
        }]}))

    async def _fake_stream(*_, **__):
        yield "Workers are entitled to leave under Art. 34."

    with patch("app.main.stream_generate", new=_fake_stream):
        with TestClient(app) as client:
            conv_r = client.post("/api/v1/chat/conversations")
            conv_id = conv_r.json()["id"]
            r = client.post(
                f"/api/v1/chat/conversations/{conv_id}/messages/stream",
                json={"content": "What are my leave rights?"},
            )
    assert r.status_code == 200
    assert "entitled" in r.text


def test_classify_domain_branches():
    assert classify_domain("my salary is unpaid") == "labor"
    assert classify_domain("rent house eviction") == "housing"
    assert classify_domain("family divorce") == "family"
    assert classify_domain("crime police") == "criminal"
    assert classify_domain("other question") == "general"


def test_get_conversation_found():
    with TestClient(app) as client:
        conv_r = client.post("/api/v1/chat/conversations")
        conv_id = conv_r.json()["id"]
        r = client.get(f"/api/v1/chat/conversations/{conv_id}")
    assert r.status_code == 200
    assert r.json()["id"] == conv_id
    assert "messages" in r.json()


@respx.mock
def test_query_stream_kb_error():
    respx.post("http://knowledge-base-service:8000/api/v1/search").mock(
        return_value=HttpxResponse(500))
    with TestClient(app) as client:
        r = client.post("/api/v1/query/stream", json={"query": "test", "top_k": 3})
    assert r.status_code == 502


@respx.mock
def test_query_stream_success():
    respx.post("http://knowledge-base-service:8000/api/v1/search").mock(
        return_value=HttpxResponse(200, json={"results": []}))

    async def _fake_stream(*_, **__):
        yield "Hello"
        yield " world"

    with patch("app.main.stream_generate", new=_fake_stream):
        with TestClient(app) as client:
            r = client.post("/api/v1/query/stream", json={"query": "What is law?", "top_k": 3})
    assert r.status_code == 200


@respx.mock
def test_send_chat_message_kb_fails():
    respx.post("http://knowledge-base-service:8000/api/v1/search").mock(
        return_value=HttpxResponse(500))

    async def _fake_stream(*_, **__):
        yield "Fallback answer"

    with patch("app.main.stream_generate", new=_fake_stream):
        with TestClient(app) as client:
            conv_r = client.post("/api/v1/chat/conversations")
            conv_id = conv_r.json()["id"]
            r = client.post(
                f"/api/v1/chat/conversations/{conv_id}/messages",
                json={"content": "test"},
            )
    assert r.status_code == 200
    assert r.json()["content"] == "Fallback answer"


@respx.mock
def test_send_chat_message_generate_fails():
    respx.post("http://knowledge-base-service:8000/api/v1/search").mock(
        return_value=HttpxResponse(200, json={"results": []}))

    async def _failing_stream(*_, **__):
        raise Exception("LLM down")
        yield  # make it an async generator

    with patch("app.main.stream_generate", new=_failing_stream):
        with TestClient(app) as client:
            conv_r = client.post("/api/v1/chat/conversations")
            conv_id = conv_r.json()["id"]
            r = client.post(
                f"/api/v1/chat/conversations/{conv_id}/messages",
                json={"content": "test"},
            )
    assert r.status_code == 200
    assert "couldn't generate" in r.json()["content"]
