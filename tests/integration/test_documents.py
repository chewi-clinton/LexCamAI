"""
Document service integration tests.
Templates are public; document creation and listing require auth.
"""

import pytest
import requests
from conftest import BASE_URL

TIMEOUT = 15

KNOWN_SLUGS = [
    "mise-en-demeure-salaire",
    "mise-en-demeure-logement",
    "lettre-reclamation",
    "denonciation-de-conge",
    "declaration-de-faits",
]


class TestTemplates:
    """Document templates — no auth needed to browse."""

    URL = f"{BASE_URL}/api/v1/documents"

    def test_list_documents_requires_auth(self, session):
        """User document list is protected."""
        resp = session.get(self.URL, timeout=TIMEOUT)
        assert resp.status_code in (401, 403)

    def test_list_documents_authenticated(self, session, auth_headers):
        resp = session.get(self.URL, headers=auth_headers, timeout=TIMEOUT)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


class TestDocumentGeneration:
    """Creating a document request requires auth; status starts at awaiting_payment."""

    @pytest.mark.parametrize("slug", KNOWN_SLUGS)
    def test_generate_requires_auth(self, session, slug):
        resp = session.post(
            f"{BASE_URL}/api/v1/documents/generate/{slug}",
            json={"form_data": {}},
            timeout=TIMEOUT,
        )
        assert resp.status_code in (401, 403)

    def test_generate_document_authenticated(self, session, auth_headers):
        """
        Create a real document request (awaiting_payment).
        We use the wage demand template with minimal valid fields.
        """
        payload = {
            "yourFullName": "Test User Integration",
            "employerName": "ACME Corp",
            "amountOwed": "500000",
            "lastDayWorked": "2026-01-01",
            "contractType": "CDI",
            "additionalContext": "Integration test document — please ignore",
        }
        resp = session.post(
            f"{BASE_URL}/api/v1/documents/generate/mise-en-demeure-salaire",
            json=payload,
            headers=auth_headers,
            timeout=TIMEOUT,
        )
        assert resp.status_code in (200, 201)
        data = resp.json()
        assert "id" in data
        assert data.get("status") in ("awaiting_payment", "pending", None)

    def test_generate_unknown_slug_returns_404(self, session, auth_headers):
        resp = session.post(
            f"{BASE_URL}/api/v1/documents/generate/not-a-real-template",
            json={},
            headers=auth_headers,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 404
