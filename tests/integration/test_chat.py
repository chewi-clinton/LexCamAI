"""
RAG chat integration tests.
Tests the full chain: rag-service → embedding-service → Qdrant → Groq → response.
No auth required for conversations.
"""

import pytest
import requests
import time
from conftest import BASE_URL

TIMEOUT = 120  # Ollama/LLM calls can take up to 90s on constrained VPS


class TestConversations:
    BASE = f"{BASE_URL}/api/v1/chat"

    def test_create_conversation(self, session):
        resp = session.post(f"{self.BASE}/conversations", timeout=TIMEOUT)
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data

    def test_list_conversations_returns_list(self, session):
        resp = session.get(f"{self.BASE}/conversations", timeout=TIMEOUT)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_nonexistent_conversation(self, session):
        resp = session.get(f"{self.BASE}/conversations/999999", timeout=TIMEOUT)
        assert resp.status_code == 404

    def test_get_existing_conversation(self, session):
        create = session.post(f"{self.BASE}/conversations", timeout=TIMEOUT)
        conv_id = create.json()["id"]
        resp = session.get(f"{self.BASE}/conversations/{conv_id}", timeout=TIMEOUT)
        assert resp.status_code == 200
        assert resp.json()["id"] == conv_id
        assert "messages" in resp.json()


class TestChatMessages:
    BASE = f"{BASE_URL}/api/v1/chat"

    @pytest.fixture(scope="class")
    def conversation_id(self, session):
        resp = session.post(f"{self.BASE}/conversations", timeout=TIMEOUT)
        assert resp.status_code == 200
        return resp.json()["id"]

    def test_send_message_to_nonexistent_conversation(self, session):
        resp = session.post(
            f"{self.BASE}/conversations/999999/messages",
            json={"content": "Hello"},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 404

    def test_send_legal_question_gets_answer(self, session, conversation_id):
        """Full RAG pipeline: embedding → Qdrant → Groq → answer."""
        resp = session.post(
            f"{self.BASE}/conversations/{conversation_id}/messages",
            json={"content": "What are my rights as an employee in Cameroon?"},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "content" in data
        assert len(data["content"]) > 10, "Response too short — LLM may have failed"

    def test_conversation_history_grows(self, session, conversation_id):
        """After sending a message, the conversation should have at least 2 messages."""
        resp = session.get(f"{self.BASE}/conversations/{conversation_id}", timeout=TIMEOUT)
        assert resp.status_code == 200
        messages = resp.json().get("messages", [])
        assert len(messages) >= 2, "Expected at least user message + AI reply"

    def test_send_french_question(self, session):
        """Cameroonian users speak French — verify the pipeline handles it."""
        conv = session.post(f"{self.BASE}/conversations", timeout=TIMEOUT)
        conv_id = conv.json()["id"]
        resp = session.post(
            f"{self.BASE}/conversations/{conv_id}/messages",
            json={"content": "Quels sont mes droits en tant que locataire au Cameroun?"},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200
        assert len(resp.json().get("content", "")) > 10

    def test_stream_endpoint_returns_content(self, session):
        """SSE stream endpoint must return 200 and emit at least some text."""
        conv = session.post(f"{self.BASE}/conversations", timeout=TIMEOUT)
        conv_id = conv.json()["id"]
        resp = session.post(
            f"{self.BASE}/conversations/{conv_id}/messages/stream",
            json={"content": "What is the Labour Code of Cameroon?"},
            stream=True,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200
        chunks = []
        for chunk in resp.iter_content(chunk_size=None):
            if chunk:
                chunks.append(chunk)
            if len(chunks) >= 3:
                break
        assert len(chunks) > 0, "Stream returned no data"


class TestQueryEndpoint:
    """Direct /query endpoint (non-conversational RAG)."""

    URL = f"{BASE_URL}/api/v1/chat/query"

    @pytest.mark.skip(reason="/query not exposed via Kong gateway — use /chat/conversations instead")
    def test_query_returns_synthesized_answer(self, session):
        resp = session.post(
            self.URL,
            json={"query": "What does the Cameroon Civil Code say about contracts?", "top_k": 3},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "synthesized_answer" in data
        assert len(data["synthesized_answer"]) > 5
