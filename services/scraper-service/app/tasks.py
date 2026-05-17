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
def placeholder_run_scrape(self, job_id: int):
    """Placeholder scrape task: detailed scraping, MinIO archival and
    downstream event publishing are out-of-scope for the assistant and
    should be implemented by the team.
    """
    logger.warning("placeholder_run_scrape called for job %s", job_id)
    raise NotImplementedError("Scrape implementation is provided by the team")


def get_celery_app():
    return celery_app
