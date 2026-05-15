from __future__ import annotations

import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import requests
from jinja2 import Environment, FileSystemLoader

import config

logger = logging.getLogger(__name__)

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "templates")
_jinja_env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))


def get_user_email(user_id: str) -> str:
    resp = requests.get(
        f"{config.USER_MANAGEMENT_URL}/internal/users/{user_id}/",
        headers={"X-Internal-Key": config.INTERNAL_SERVICE_KEY},
        timeout=10,
    )
    resp.raise_for_status()
    return resp.json()["email"]


def render_template(template_name: str, context: dict) -> str:
    return _jinja_env.get_template(template_name).render(**context)


def send_email(to_email: str, subject: str, html_body: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = config.FROM_EMAIL
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(config.SMTP_USER, config.SMTP_PASSWORD)
        smtp.send_message(msg)

    logger.info(f"Email sent to {to_email}: {subject}")


def handle_user_registered(event: dict) -> None:
    html = render_template("welcome.html", {
        "full_name": event.get("full_name", ""),
        "email": event["email"],
    })
    send_email(event["email"], "Welcome to LexCam!", html)


def handle_lawyer_verified(event: dict) -> None:
    approved = event["status"] == "verified"
    subject = "Your lawyer account has been verified — LexCam" if approved else "Update on your LexCam lawyer account"
    html = render_template("lawyer_verified.html", {
        "full_name": event["full_name"],
        "status": event["status"],
        "approved": approved,
    })
    send_email(event["email"], subject, html)


def handle_referral_created(event: dict) -> None:
    html = render_template("referral_created.html", {
        "user_name": event.get("user_name", "A citizen"),
        "domain": event.get("domain", ""),
        "referral_id": event["referral_id"],
    })
    send_email(event["lawyer_email"], "New referral request — LexCam", html)


def handle_referral_accepted(event: dict) -> None:
    html = render_template("referral_accepted.html", {
        "lawyer_name": event["lawyer_name"],
        "lawyer_phone": event.get("lawyer_phone", ""),
        "referral_id": event["referral_id"],
    })
    send_email(event["user_email"], "Your referral request was accepted — LexCam", html)


def handle_payment_confirmed(event: dict) -> None:
    user_email = get_user_email(str(event["user_id"]))
    html = render_template("payment_receipt.html", {
        "amount": event["amount"],
        "operator": event["operator"],
        "transaction_id": event["transaction_id"],
    })
    send_email(user_email, "Payment receipt — LexCam", html)


def handle_document_ready(event: dict) -> None:
    html = render_template("document_ready.html", {
        "file_url": event["file_url"],
        "document_id": event["document_id"],
    })
    send_email(event["user_email"], "Your document is ready — LexCam", html)
