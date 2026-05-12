import hashlib
import hmac
import json
import uuid
import pytest
import responses as resp_mock
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
from apps.payments.models import Transaction

USER_MGMT_URL = "http://user-management-test/internal/auth/validate"
CAMPAY_TOKEN_URL = "https://demo.campay.net/api/token/"
CAMPAY_COLLECT_URL = "https://demo.campay.net/api/collect/"
WEBHOOK_SECRET = "test-webhook-secret"


def make_sig(payload_bytes, secret=WEBHOOK_SECRET):
    return hmac.new(secret.encode(), payload_bytes, hashlib.sha256).hexdigest()


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def user_id():
    return str(uuid.uuid4())


@pytest.fixture
def other_user_id():
    return str(uuid.uuid4())


@pytest.fixture
def pending_tx(db, user_id):
    return Transaction.objects.create(
        user_id=user_id,
        document_id=uuid.uuid4(),
        amount=5000,
        phone_number="677123456",
        operator=Transaction.OPERATOR_MTN,
        internal_reference=str(uuid.uuid4()),
        campay_reference="camp-ref-views-001",
    )


@pytest.mark.django_db
class TestInitiatePaymentView:
    @resp_mock.activate
    def test_success(self, client, user_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": user_id, "role": "user"}, status=200)
        resp_mock.add(resp_mock.POST, CAMPAY_TOKEN_URL, json={"token": "tok-abc"}, status=200)
        resp_mock.add(
            resp_mock.POST, CAMPAY_COLLECT_URL,
            json={"payment_url": "https://pay.campay.net/yyy", "reference": "camp-ref-new-1"},
            status=200,
        )
        resp = client.post(
            "/api/v1/payments/initiate",
            data={
                "document_id": str(uuid.uuid4()),
                "amount": 5000,
                "phone_number": "677123456",
                "operator": "mtn",
            },
            HTTP_AUTHORIZATION="Bearer valid-token",
            format="json",
        )
        assert resp.status_code == 201
        assert resp.data["payment_url"] == "https://pay.campay.net/yyy"
        assert "internal_reference" in resp.data
        assert Transaction.objects.filter(campay_reference="camp-ref-new-1").exists()

    @resp_mock.activate
    def test_missing_fields_returns_400(self, client, user_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": user_id, "role": "user"}, status=200)
        resp = client.post(
            "/api/v1/payments/initiate",
            data={"amount": 5000},
            HTTP_AUTHORIZATION="Bearer valid-token",
            format="json",
        )
        assert resp.status_code == 400

    @resp_mock.activate
    def test_invalid_operator_returns_400(self, client, user_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": user_id, "role": "user"}, status=200)
        resp = client.post(
            "/api/v1/payments/initiate",
            data={
                "document_id": str(uuid.uuid4()),
                "amount": 5000,
                "phone_number": "677",
                "operator": "visa",
            },
            HTTP_AUTHORIZATION="Bearer valid-token",
            format="json",
        )
        assert resp.status_code == 400

    @resp_mock.activate
    def test_zero_amount_returns_400(self, client, user_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": user_id, "role": "user"}, status=200)
        resp = client.post(
            "/api/v1/payments/initiate",
            data={
                "document_id": str(uuid.uuid4()),
                "amount": 0,
                "phone_number": "677",
                "operator": "mtn",
            },
            HTTP_AUTHORIZATION="Bearer valid-token",
            format="json",
        )
        assert resp.status_code == 400

    @resp_mock.activate
    def test_campay_error_returns_502(self, client, user_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": user_id, "role": "user"}, status=200)
        resp_mock.add(resp_mock.POST, CAMPAY_TOKEN_URL, json={"token": "tok"}, status=200)
        resp_mock.add(resp_mock.POST, CAMPAY_COLLECT_URL, json={"error": "bad request"}, status=400)
        resp = client.post(
            "/api/v1/payments/initiate",
            data={
                "document_id": str(uuid.uuid4()),
                "amount": 5000,
                "phone_number": "677",
                "operator": "mtn",
            },
            HTTP_AUTHORIZATION="Bearer valid-token",
            format="json",
        )
        assert resp.status_code == 502

    def test_unauthenticated_returns_403(self, client):
        resp = client.post(
            "/api/v1/payments/initiate",
            data={"document_id": str(uuid.uuid4()), "amount": 5000, "phone_number": "677", "operator": "mtn"},
            format="json",
        )
        assert resp.status_code in (401, 403)


@pytest.mark.django_db
class TestWebhookView:
    @patch("apps.payments.events.pika.BlockingConnection")
    def test_successful_webhook_marks_confirmed(self, mock_pika, client, pending_tx):
        mock_pika.return_value = MagicMock()
        payload = {"reference": "camp-ref-views-001", "status": "SUCCESSFUL"}
        body = json.dumps(payload).encode()
        sig = make_sig(body)
        resp = client.post(
            "/api/v1/payments/webhook",
            data=body,
            content_type="application/json",
            HTTP_X_CAMPAY_SIGNATURE=sig,
        )
        assert resp.status_code == 200
        assert resp.data["status"] == "ok"
        pending_tx.refresh_from_db()
        assert pending_tx.status == Transaction.STATUS_CONFIRMED

    def test_failed_webhook_marks_failed(self, client, pending_tx):
        payload = {"reference": "camp-ref-views-001", "status": "FAILED"}
        body = json.dumps(payload).encode()
        sig = make_sig(body)
        resp = client.post(
            "/api/v1/payments/webhook",
            data=body,
            content_type="application/json",
            HTTP_X_CAMPAY_SIGNATURE=sig,
        )
        assert resp.status_code == 200
        pending_tx.refresh_from_db()
        assert pending_tx.status == Transaction.STATUS_FAILED

    def test_invalid_signature_returns_400(self, client, pending_tx):
        payload = {"reference": "camp-ref-views-001", "status": "SUCCESSFUL"}
        body = json.dumps(payload).encode()
        resp = client.post(
            "/api/v1/payments/webhook",
            data=body,
            content_type="application/json",
            HTTP_X_CAMPAY_SIGNATURE="bad-sig",
        )
        assert resp.status_code == 400

    def test_missing_reference_returns_400(self, client):
        payload = {"status": "SUCCESSFUL"}
        body = json.dumps(payload).encode()
        sig = make_sig(body)
        resp = client.post(
            "/api/v1/payments/webhook",
            data=body,
            content_type="application/json",
            HTTP_X_CAMPAY_SIGNATURE=sig,
        )
        assert resp.status_code == 400

    def test_unknown_campay_reference_returns_404(self, client, db):
        payload = {"reference": "nonexistent-camp-ref", "status": "SUCCESSFUL"}
        body = json.dumps(payload).encode()
        sig = make_sig(body)
        resp = client.post(
            "/api/v1/payments/webhook",
            data=body,
            content_type="application/json",
            HTTP_X_CAMPAY_SIGNATURE=sig,
        )
        assert resp.status_code == 404

    @patch("apps.payments.events.pika.BlockingConnection")
    def test_confirmed_publishes_event(self, mock_pika, client, pending_tx):
        mock_conn = MagicMock()
        mock_channel = MagicMock()
        mock_pika.return_value = mock_conn
        mock_conn.channel.return_value = mock_channel

        payload = {"reference": "camp-ref-views-001", "status": "SUCCESSFUL"}
        body = json.dumps(payload).encode()
        sig = make_sig(body)
        client.post(
            "/api/v1/payments/webhook",
            data=body,
            content_type="application/json",
            HTTP_X_CAMPAY_SIGNATURE=sig,
        )
        assert mock_channel.basic_publish.called


@pytest.mark.django_db
class TestTransactionDetailView:
    @resp_mock.activate
    def test_returns_own_transaction(self, client, user_id, pending_tx):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": user_id, "role": "user"}, status=200)
        resp = client.get(
            f"/api/v1/payments/{pending_tx.internal_reference}",
            HTTP_AUTHORIZATION="Bearer valid-token",
        )
        assert resp.status_code == 200
        assert str(resp.data["internal_reference"]) == pending_tx.internal_reference

    @resp_mock.activate
    def test_other_users_transaction_returns_404(self, client, other_user_id, pending_tx):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": other_user_id, "role": "user"}, status=200)
        resp = client.get(
            f"/api/v1/payments/{pending_tx.internal_reference}",
            HTTP_AUTHORIZATION="Bearer valid-token",
        )
        assert resp.status_code == 404

    @resp_mock.activate
    def test_nonexistent_reference_returns_404(self, client, user_id):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": user_id, "role": "user"}, status=200)
        resp = client.get(
            "/api/v1/payments/does-not-exist",
            HTTP_AUTHORIZATION="Bearer valid-token",
        )
        assert resp.status_code == 404

    def test_unauthenticated_returns_403(self, client, pending_tx):
        resp = client.get(f"/api/v1/payments/{pending_tx.internal_reference}")
        assert resp.status_code in (401, 403)


@pytest.mark.django_db
class TestTransactionHistoryView:
    @resp_mock.activate
    def test_returns_own_transactions(self, client, user_id, pending_tx):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": user_id, "role": "user"}, status=200)
        resp = client.get("/api/v1/payments/history", HTTP_AUTHORIZATION="Bearer valid-token")
        assert resp.status_code == 200
        assert len(resp.data) == 1
        assert str(resp.data[0]["internal_reference"]) == pending_tx.internal_reference

    @resp_mock.activate
    def test_does_not_return_other_users(self, client, other_user_id, pending_tx):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": other_user_id, "role": "user"}, status=200)
        resp = client.get("/api/v1/payments/history", HTTP_AUTHORIZATION="Bearer valid-token")
        assert resp.status_code == 200
        assert len(resp.data) == 0

    @resp_mock.activate
    def test_empty_history(self, client, user_id, db):
        resp_mock.add(resp_mock.POST, USER_MGMT_URL, json={"user_id": user_id, "role": "user"}, status=200)
        resp = client.get("/api/v1/payments/history", HTTP_AUTHORIZATION="Bearer valid-token")
        assert resp.status_code == 200
        assert resp.data == []

    def test_unauthenticated_returns_403(self, client):
        resp = client.get("/api/v1/payments/history")
        assert resp.status_code in (401, 403)
