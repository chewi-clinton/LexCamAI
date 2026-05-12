import json
import logging
import pika
from django.conf import settings

logger = logging.getLogger(__name__)

EXCHANGE = "lexcam.events"


def _get_channel():
    """Open a fresh connection and channel for each publish call."""
    params = pika.URLParameters(settings.RABBITMQ_URL)
    conn = pika.BlockingConnection(params)
    channel = conn.channel()
    channel.exchange_declare(exchange=EXCHANGE, exchange_type="topic", durable=True)
    return conn, channel


def _publish(routing_key, payload):
    """Publish a JSON message to lexcam.events. Logs and swallows on failure."""
    try:
        conn, channel = _get_channel()
        channel.basic_publish(
            exchange=EXCHANGE,
            routing_key=routing_key,
            body=json.dumps(payload),
            properties=pika.BasicProperties(delivery_mode=2),  # persistent
        )
        conn.close()
        logger.info("Published %s: %s", routing_key, payload)
    except Exception as exc:
        logger.error("Failed to publish %s: %s", routing_key, exc)


def publish_lawyer_verified(lawyer):
    """
    Fired when admin changes verification_status to verified, rejected, or suspended.
    Consumed by Notification Worker to email the lawyer with the result.
    """
    _publish("lawyer.verified", {
        "lawyer_id": str(lawyer.id),
        "full_name": lawyer.full_name,
        "email": lawyer.email,
        "status": lawyer.verification_status,
    })


def publish_referral_created(referral):
    """
    Fired when a citizen submits a referral request.
    Consumed by Notification Worker to alert the lawyer.
    """
    _publish("referral.created", {
        "referral_id": str(referral.id),
        "lawyer_id": str(referral.lawyer_id),
        "lawyer_email": referral.lawyer.email,
        "user_name": referral.user_name,
        "domain": referral.domain,
    })


def publish_referral_accepted(referral):
    """
    Fired when a lawyer accepts a referral.
    Payload includes lawyer contact details — Notification Worker emails the citizen.
    contact_revealed must be True before this fires.
    """
    _publish("referral.accepted", {
        "referral_id": str(referral.id),
        "user_id": str(referral.user_id),
        "user_email": referral.user_email,
        "lawyer_name": referral.lawyer.full_name,
        "lawyer_phone": referral.lawyer.phone,
        "lawyer_email": referral.lawyer.email,
    })


def publish_referral_resolved(referral):
    """Fired when either party marks the referral resolved. Goes to audit log."""
    _publish("referral.resolved", {
        "referral_id": str(referral.id),
    })
