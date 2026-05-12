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
    resp = requests.post(
        f"{settings.CAMPAY_URL}collect/",
        headers={"Authorization": f"Token {token}"},
        json={
            "amount": str(amount),
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
        "internal_reference": internal_reference,
        "campay_reference": data["reference"],
        "payment_url": data["payment_url"],
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

    transaction.webhook_payload = raw_payload
    transaction.save(update_fields=["status", "webhook_payload", "updated_at"])

    return transaction
