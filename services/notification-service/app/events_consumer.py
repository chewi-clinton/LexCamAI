import json
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import httpx
import pika
from .config import settings
from .db import Session, engine
from .models import Notification


def _get_user_email(user_id: str) -> str | None:
    try:
        url = f"{settings.USER_MGMT_URL}/internal/users/{user_id}/"
        resp = httpx.get(url, headers={"X-Internal-Key": "dev-internal-key"}, timeout=5)
        if resp.is_success:
            return resp.json().get("email")
    except Exception as exc:
        print(f"[notification-consumer] Could not fetch email for {user_id}: {exc}")
    return None


def _get_connection():
    params = pika.URLParameters(settings.RABBITMQ_URL)
    return pika.BlockingConnection(params)


def _send_email(to_email: str, subject: str, html_body: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_USER
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    context = ssl.create_default_context()
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls(context=context)
        server.login(settings.SMTP_USER, settings.SMTP_PASS)
        server.sendmail(settings.SMTP_USER, to_email, msg.as_string())


def on_message(ch, method, properties, body):
    payload = json.loads(body)
    routing_key = method.routing_key
    user_email = ""

    with Session(engine) as session:
        if routing_key == "feedback.flagged":
            message = f"Feedback flagged: {payload.get('feedback_id')}"
            user = payload.get('session_id') or 'admin@example.com'
        elif routing_key == "lawyers.scraped":
            message = "New lawyers scraped batch"
            user = 'admin@example.com'
        elif routing_key == "document.ready":
            user_email = payload.get("user_email", "")
            doc_title = payload.get("document_title", "Your document")
            file_url = payload.get("file_url", "")
            message = f"Document ready: {doc_title}"
            user = user_email
        elif routing_key == "payment.confirmed":
            user_email = _get_user_email(payload.get("user_id", "")) or ""
            amount = payload.get("amount", "")
            operator = payload.get("operator", "")
            message = f"Payment confirmed: {amount} XAF via {operator}"
            user = user_email
        elif routing_key == "payment.failed":
            user_email = _get_user_email(payload.get("user_id", "")) or ""
            amount = payload.get("amount", "")
            operator = payload.get("operator", "")
            message = f"Payment failed: {amount} XAF via {operator}"
            user = user_email
        else:
            message = f"Event {routing_key}"
            user = 'admin@example.com'

        notif = Notification(user_id=user, message=message)
        session.add(notif)
        session.commit()

    if not (user_email and settings.SMTP_USER):
        pass
    elif routing_key == "document.ready":
        try:
            html = f"""
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
              <h2 style="color:#1a3c5e;margin-bottom:8px">Your document is ready</h2>
              <p style="color:#555;margin-bottom:24px">
                <strong>{doc_title}</strong> has been generated and is available for download.
              </p>
              <a href="{file_url}"
                 style="display:inline-block;background:#1a3c5e;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">
                Download PDF
              </a>
              <p style="color:#888;font-size:12px;margin-top:32px">LexCam AI · Legal Aid Platform for Cameroon</p>
            </div>
            """
            _send_email(user_email, f"Your document is ready: {doc_title}", html)
            print(f"[notification-consumer] Email sent to {user_email} for {doc_title}")
        except Exception as exc:
            print(f"[notification-consumer] Failed to send email to {user_email}: {exc}")
    elif routing_key == "payment.confirmed":
        try:
            html = f"""
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
              <h2 style="color:#2e7d32;margin-bottom:8px">Payment confirmed</h2>
              <p style="color:#555;margin-bottom:8px">
                Your payment of <strong>{amount} XAF</strong> via <strong>{operator}</strong> was successful.
              </p>
              <p style="color:#555;margin-bottom:24px">
                Your document is now being generated. You will receive another email once it is ready.
              </p>
              <a href="http://localhost:3000/documents/my"
                 style="display:inline-block;background:#1a3c5e;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">
                View My Documents
              </a>
              <p style="color:#888;font-size:12px;margin-top:32px">LexCam AI · Legal Aid Platform for Cameroon</p>
            </div>
            """
            _send_email(user_email, "Payment confirmed — document generation started", html)
            print(f"[notification-consumer] Payment confirmed email sent to {user_email}")
        except Exception as exc:
            print(f"[notification-consumer] Failed to send payment confirmed email to {user_email}: {exc}")
    elif routing_key == "payment.failed":
        try:
            html = f"""
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
              <h2 style="color:#c62828;margin-bottom:8px">Payment failed</h2>
              <p style="color:#555;margin-bottom:24px">
                Your payment of <strong>{amount} XAF</strong> via <strong>{operator}</strong> could not be processed.
                Please try again from your documents page.
              </p>
              <a href="http://localhost:3000/documents/my"
                 style="display:inline-block;background:#1a3c5e;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">
                Try Again
              </a>
              <p style="color:#888;font-size:12px;margin-top:32px">LexCam AI · Legal Aid Platform for Cameroon</p>
            </div>
            """
            _send_email(user_email, "Payment failed — please try again", html)
            print(f"[notification-consumer] Payment failed email sent to {user_email}")
        except Exception as exc:
            print(f"[notification-consumer] Failed to send payment failed email to {user_email}: {exc}")

    try:
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception:
        try:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        except Exception:
            pass


def start_consumer():
    conn = _get_connection()
    ch = conn.channel()
    ch.exchange_declare(exchange="lexcam.events", exchange_type="topic", durable=True)
    ch.exchange_declare(exchange="lexcam.dlx", exchange_type="fanout", durable=True)
    args = {"x-dead-letter-exchange": "lexcam.dlx"}
    ch.queue_declare(queue="notification_events", durable=True, arguments=args)
    ch.queue_bind(queue="notification_events", exchange="lexcam.events", routing_key="feedback.flagged")
    ch.queue_bind(queue="notification_events", exchange="lexcam.events", routing_key="lawyers.scraped")
    ch.queue_bind(queue="notification_events", exchange="lexcam.events", routing_key="document.ready")
    ch.queue_bind(queue="notification_events", exchange="lexcam.events", routing_key="payment.confirmed")
    ch.queue_bind(queue="notification_events", exchange="lexcam.events", routing_key="payment.failed")
    ch.basic_consume(queue="notification_events", on_message_callback=on_message, auto_ack=False)
    print("[notification-consumer] Waiting for events...")
    ch.start_consuming()


if __name__ == '__main__':
    start_consumer()
