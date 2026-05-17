from celery import Celery
from celery.utils.log import get_task_logger
from .config import settings

celery_app = Celery(
    settings.SERVICE_NAME,
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

logger = get_task_logger(__name__)


@celery_app.task(acks_late=True, bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3}, time_limit=60, soft_time_limit=50)
def process_feedback_async(self, feedback_id: int):
    try:
        logger.info("processing feedback", feedback_id=feedback_id)
        return {"processed": True, "feedback_id": feedback_id}
    except Exception as e:
        logger.error("feedback processing failed", error=str(e))
        raise


def get_celery_app():
    return celery_app
