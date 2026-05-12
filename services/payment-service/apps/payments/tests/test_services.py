import hashlib
import hmac
import uuid
import pytest
import responses as resp_mock
from unittest.mock import patch, MagicMock
from apps.payments.models import Transaction
from apps.payments.services import (
    _get_campay_token,
    handle_webhook,
    initiate_payment,
    validate_webhook_signature,
)

CAMPAY_TOKEN_URL = "https://demo.campay.net/api/token/"
CAMPAY_COLLECT_URL = "https://demo.campay.net/api/collect/"
WEBHOOK_SECRET = "test-webhook-secret"


def make_sig(payload_bytes, secret=WEBHOOK_SECRET):
    return hmac.new(secret.encode(), payload_bytes, hashlib.sha256).hexdigest()


@pytest.mark.django_db
class TestGetCampayToken:
    @resp_mock.activate
    def test_returns_token(self):
        resp_mock.add(resp_mock.POST, CAMPAY_TOKEN_URL, json={"token": "tok-abc123"}, status=200)
        token = _get_campay_token()
        assert token == "tok-abc123"

    @resp_mock.activate
    def test_raises_on_non_200(self):
        import requests
        resp_mock.add(resp_mock.POST, CAMPAY_TOKEN_URL, json={"error": "bad creds"}, status=401)
        with pytest.raises(requests.HTTPError):
            _get_campay_token()


@pytest.mark.django_db
class TestInitiatePayment:
    @resp_mock.activate
    def test_creates_transaction_and_returns_urls(self, db):
        resp_mock.add(resp_mock.POST, CAMPAY_TOKEN_URL, json={"token": "tok-abc"}, status=200)
        resp_mock.add(
            resp_mock.POST, CAMPAY_COLLECT_URL,
            json={"payment_url": "https://pay.campay.net/xxx", "reference": "camp-ref-1"},
            status=200,
        )
        user_id = uuid.uuid4()
        document_id = uuid.uuid4()
        result = initiate_payment(
            user_id=user_id,
            document_id=document_id,
            amount=5000,
            phone_number="677123456",
            operator="mtn",
        )
        assert result["payment_url"] == "https://pay.campay.net/xxx"
        assert result["campay_reference"] == "camp-ref-1"
        assert "internal_reference" in result

        tx = Transaction.objects.get(campay_reference="camp-ref-1")
        assert tx.user_id == user_id
        assert tx.amount == 5000
        assert tx.status == Transaction.STATUS_PENDING

    @resp_mock.activate
    def test_raises_on_campay_error(self, db):
        import requests
        resp_mock.add(resp_mock.POST, CAMPAY_TOKEN_URL, json={"token": "tok-abc"}, status=200)
        resp_mock.add(resp_mock.POST, CAMPAY_COLLECT_URL, json={"error": "bad request"}, status=400)
        with pytest.raises(requests.HTTPError):
            initiate_payment(
                user_id=uuid.uuid4(),
                document_id=uuid.uuid4(),
                amount=5000,
                phone_number="677",
                operator="mtn",
            )


class TestValidateWebhookSignature:
    def test_valid_signature(self):
        payload = b'{"reference": "abc123", "status": "SUCCESSFUL"}'
        sig = make_sig(payload)
        assert validate_webhook_signature(payload, sig) is True

    def test_invalid_signature(self):
        payload = b'{"reference": "abc123", "status": "SUCCESSFUL"}'
        assert validate_webhook_signature(payload, "wrongsig") is False

    def test_empty_signature(self):
        assert validate_webhook_signature(b'{}', "") is False

    def test_tampered_payload(self):
        original = b'{"reference": "abc", "status": "SUCCESSFUL"}'
        sig = make_sig(original)
        tampered = b'{"reference": "abc", "status": "FAILED"}'
        assert validate_webhook_signature(tampered, sig) is False


@pytest.mark.django_db
class TestHandleWebhook:
    @pytest.fixture
    def pending_tx(self, db):
        return Transaction.objects.create(
            user_id=uuid.uuid4(),
            document_id=uuid.uuid4(),
            amount=5000,
            phone_number="677123456",
            operator="mtn",
            internal_reference=str(uuid.uuid4()),
            campay_reference="camp-ref-handle-001",
        )

    def test_successful_marks_confirmed(self, pending_tx):
        result = handle_webhook(
            "camp-ref-handle-001", "SUCCESSFUL",
            {"reference": "camp-ref-handle-001", "status": "SUCCESSFUL"},
        )
        assert result.status == Transaction.STATUS_CONFIRMED
        pending_tx.refresh_from_db()
        assert pending_tx.status == Transaction.STATUS_CONFIRMED

    def test_failed_marks_failed(self, pending_tx):
        result = handle_webhook(
            "camp-ref-handle-001", "FAILED",
            {"reference": "camp-ref-handle-001", "status": "FAILED"},
        )
        assert result.status == Transaction.STATUS_FAILED

    def test_stores_webhook_payload(self, pending_tx):
        payload = {"reference": "camp-ref-handle-001", "status": "SUCCESSFUL", "amount": "5000"}
        handle_webhook("camp-ref-handle-001", "SUCCESSFUL", payload)
        pending_tx.refresh_from_db()
        assert pending_tx.webhook_payload == payload

    def test_unknown_reference_returns_none(self, db):
        result = handle_webhook("nonexistent-ref", "SUCCESSFUL", {})
        assert result is None

    def test_expired_marks_expired(self, pending_tx):
        result = handle_webhook(
            "camp-ref-handle-001", "EXPIRED",
            {"reference": "camp-ref-handle-001", "status": "EXPIRED"},
        )
        assert result.status == Transaction.STATUS_EXPIRED
        pending_tx.refresh_from_db()
        assert pending_tx.status == Transaction.STATUS_EXPIRED

    def test_unknown_status_does_not_change_status(self, pending_tx):
        result = handle_webhook(
            "camp-ref-handle-001", "PENDING",
            {"reference": "camp-ref-handle-001", "status": "PENDING"},
        )
        assert result.status == Transaction.STATUS_PENDING


@pytest.mark.django_db
class TestExpirePendingPaymentsCommand:
    def test_expires_old_pending(self, db):
        from django.utils import timezone
        from datetime import timedelta
        from django.core.management import call_command

        tx = Transaction.objects.create(
            user_id=uuid.uuid4(),
            document_id=uuid.uuid4(),
            amount=5000,
            phone_number="677",
            operator="mtn",
            internal_reference=str(uuid.uuid4()),
            status=Transaction.STATUS_PENDING,
        )
        # Backdate created_at to simulate an old transaction
        Transaction.objects.filter(pk=tx.pk).update(
            created_at=timezone.now() - timedelta(minutes=20)
        )
        call_command("expire_pending_payments")
        tx.refresh_from_db()
        assert tx.status == Transaction.STATUS_EXPIRED

    def test_does_not_expire_recent_pending(self, db):
        from django.core.management import call_command

        tx = Transaction.objects.create(
            user_id=uuid.uuid4(),
            document_id=uuid.uuid4(),
            amount=5000,
            phone_number="677",
            operator="mtn",
            internal_reference=str(uuid.uuid4()),
            status=Transaction.STATUS_PENDING,
        )
        call_command("expire_pending_payments")
        tx.refresh_from_db()
        assert tx.status == Transaction.STATUS_PENDING

    def test_does_not_expire_confirmed(self, db):
        from django.utils import timezone
        from datetime import timedelta
        from django.core.management import call_command

        tx = Transaction.objects.create(
            user_id=uuid.uuid4(),
            document_id=uuid.uuid4(),
            amount=5000,
            phone_number="677",
            operator="mtn",
            internal_reference=str(uuid.uuid4()),
            status=Transaction.STATUS_CONFIRMED,
        )
        Transaction.objects.filter(pk=tx.pk).update(
            created_at=timezone.now() - timedelta(minutes=20)
        )
        call_command("expire_pending_payments")
        tx.refresh_from_db()
        assert tx.status == Transaction.STATUS_CONFIRMED
