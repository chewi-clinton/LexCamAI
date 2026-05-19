import hashlib
import hmac
import logging
import uuid

import requests
from django.conf import settings

from .models import Transaction

logger = logging.getLogger(__name__)


def _get_campay_token():
    resp = requests.post(
        f"{settings.CAMPAY_URL}token/",
        json={"username": settings.CAMPAY_USERNAME, "password": settings.CAMPAY_PASSWORD},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()["token"]


def get_campay_payment_status(campay_reference):
    """Query Campay for the current status of a payment. Returns status string e.g. SUCCESSFUL/FAILED/EXPIRED/PENDING."""
    token = _get_campay_token()
    resp = requests.get(
        f"{settings.CAMPAY_URL}transaction/{campay_reference}/",
        headers={"Authorization": f"Token {token}"},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()["status"]


def initiate_payment(user_id, document_id, amount, phone_number, operator):
    internal_reference = str(uuid.uuid4())
    transaction = Transaction.objects.create(
        user_id=user_id,
        document_id=document_id,
        amount=amount,
        phone_number=phone_number,
        operator=operator,
        internal_reference=internal_reference,
        status=Transaction.STATUS_PENDING,
    )

    token = _get_campay_token()
    # Campay demo environment caps transactions at 25 XAF
    campay_amount = min(amount, 25) if "demo" in settings.CAMPAY_URL else amount
    resp = requests.post(
        f"{settings.CAMPAY_URL}collect/",
        headers={"Authorization": f"Token {token}"},
        json={
            "amount": str(campay_amount),
            "from": phone_number,
            "description": f"LexCam Document {document_id}",
            "external_reference": internal_reference,
            "redirect_url": settings.CAMPAY_REDIRECT_URL,
        },
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()

    transaction.campay_reference = data["reference"]
    transaction.save(update_fields=["campay_reference"])

    return {
        "id": internal_reference,
        "internal_reference": internal_reference,
        "campay_reference": data["reference"],
        "ussd_code": data.get("ussd_code"),
        "operator": data.get("operator"),
    }


def validate_webhook_signature(payload_bytes, signature):
    expected = hmac.new(
        settings.CAMPAY_WEBHOOK_SECRET.encode(),
        payload_bytes,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def handle_webhook(campay_reference, campay_status, raw_payload):
    try:
        transaction = Transaction.objects.get(campay_reference=campay_reference)
    except Transaction.DoesNotExist:
        return None

    if campay_status == "SUCCESSFUL":
        transaction.status = Transaction.STATUS_CONFIRMED
    elif campay_status == "FAILED":
        transaction.status = Transaction.STATUS_FAILED
    elif campay_status == "EXPIRED":
        transaction.status = Transaction.STATUS_EXPIRED

    transaction.webhook_payload = raw_payload
    transaction.save(update_fields=["status", "webhook_payload", "updated_at"])

    return transaction
