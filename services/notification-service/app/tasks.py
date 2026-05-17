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
def send_notification_async(self, notification_id: int):
    """Placeholder Celery task for notification delivery.

    The concrete delivery implementation (SMTP, push, retry policy,
    delivery logging) is intentionally left to the team per docs. This
    placeholder raises `NotImplementedError` to avoid accidental sends
    during development.
    """
    logger.warning("send_notification_async called for %s -- placeholder", notification_id)
    raise NotImplementedError("Notification delivery is implemented by the team")


def get_celery_app():
    return celery_app
