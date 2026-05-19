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
def placeholder_process_feedback(self, feedback_id: int):
    """Placeholder: feedback processing implementation is out-of-scope for the assistant."""
    logger.warning("placeholder_process_feedback called for %s", feedback_id)
    raise NotImplementedError("Feedback processing implemented by the team")


process_feedback_async = placeholder_process_feedback


def get_celery_app():
    return celery_app
