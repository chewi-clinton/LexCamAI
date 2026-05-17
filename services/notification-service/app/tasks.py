from celery import Celery
from celery.utils.log import get_task_logger
from .config import settings
import httpx
import jinja2
import aiosmtplib
import asyncio
from .models_delivery import DeliveryLog
from .db import engine
from sqlmodel import Session
from datetime import datetime

logger = get_task_logger(__name__)

celery_app = Celery(
    settings.SERVICE_NAME,
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)



from celery import Celery
from celery.utils.log import get_task_logger
from .config import settings
import httpx

logger = get_task_logger(__name__)

celery_app = Celery(
    settings.SERVICE_NAME,
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)



@celery_app.task(acks_late=True, bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3}, time_limit=120, soft_time_limit=110)
def send_notification_async(self, notification_id: int):
    # Minimal SMTP send using Jinja2 templates and aiosmtplib inside event loop
    # Fetch notification from DB
    from .models import Notification
    with Session(engine) as session:
        notif = session.get(Notification, notification_id)
        if not notif:
            return {"error": "notification not found"}
        # render template (simple)
        template = jinja2.Template("<html><body><p>{{ message }}</p></body></html>")
        html = template.render(message=notif.message)
        # prepare delivery log
        dlog = DeliveryLog(notification_id=notification_id, to_address=notif.user_id or "unknown", subject="Notification", status="pending")
        session.add(dlog)
        session.commit()
        session.refresh(dlog)

    async def _send():
        try:
            await aiosmtplib.send(html, hostname=settings.SMTP_HOST, port=int(settings.SMTP_PORT), username=settings.SMTP_USER, password=settings.SMTP_PASS, start_tls=True)
            with Session(engine) as session:
                d = session.get(DeliveryLog, dlog.id)
                d.status = "sent"
                from celery import Celery
                from celery.utils.log import get_task_logger
                from .config import settings

                logger = get_task_logger(__name__)

                celery_app = Celery(
                    settings.SERVICE_NAME,
                    broker=settings.CELERY_BROKER_URL,
                    backend=settings.CELERY_RESULT_BACKEND,
                )


                @celery_app.task(bind=True)
                def placeholder_send_notification(self, notification_id: int):
                    """Placeholder task: delivery implementation is out-of-scope for assistant.

                    The actual delivery (SMTP, push, etc.) should be implemented by the
                    team in a dedicated worker. This placeholder ensures Celery app
                    configuration exists without performing network delivery here.
                    """
                    logger.warning("placeholder_send_notification called for %s", notification_id)
                    raise NotImplementedError("Notification delivery is implemented by a separate worker")


                def get_celery_app():
                    return celery_app
