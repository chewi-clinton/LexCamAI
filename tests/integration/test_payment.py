"""
Payment service integration tests.
These tests verify the API contract only — no real Campay calls are made.
Actual payment initiation is not tested (would require a real phone + Mobile Money account).
"""

import pytest
import requests
from conftest import BASE_URL

TIMEOUT = 15


class TestPaymentEndpoints:
    URL = f"{BASE_URL}/api/v1/payments"

    def test_initiate_payment_requires_auth(self, session):
        """Payment initiation without JWT must be rejected."""
        payload = {
            "document_id": "00000000-0000-0000-0000-000000000000",
            "phone_number": "677000000",
            "payment_method": "mtn",
        }
        resp = session.post(f"{self.URL}/initiate", json=payload, timeout=TIMEOUT)
        assert resp.status_code in (401, 403)

    def test_get_payment_status_nonexistent(self, session, auth_headers):
        """Status check for a reference that doesn't exist should return 404."""
        resp = session.get(
            f"{self.URL}/nonexistent-reference-xyz/status",
            headers=auth_headers,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 404

    def test_payment_status_requires_auth(self, session):
        resp = session.get(f"{self.URL}/some-ref/status", timeout=TIMEOUT)
        assert resp.status_code in (401, 403)

    def test_webhook_rejects_invalid_signature(self, session):
        """Webhook without a valid Campay HMAC signature must be rejected."""
        payload = {
            "reference": "fake-ref",
            "status": "SUCCESSFUL",
            "amount": "5000",
            "currency": "XAF",
        }
        resp = session.post(
            f"{self.URL}/webhook",
            json=payload,
            headers={"X-Campay-Signature": "invalid-sig"},
            timeout=TIMEOUT,
        )
        # 400 (bad signature) or 403 (forbidden) — anything but 200
        assert resp.status_code != 200, "Webhook accepted a request with an invalid signature"
