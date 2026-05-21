from fastapi.testclient import TestClient

from app.main import app


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
