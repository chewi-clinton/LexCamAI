from celery import Celery
from celery.utils.log import get_task_logger
from .config import settings
import httpx
from .db import engine
from .models import ScrapeJob
from sqlmodel import Session
from datetime import datetime
from .events import publish_event
from minio import Minio


def _minio_client():
    return Minio(
        settings.MINIO_URL.replace("http://", ""),
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=False,
    )

celery_app = Celery(
    settings.SERVICE_NAME,
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

logger = get_task_logger(__name__)


@celery_app.task(acks_late=True, bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3}, time_limit=180, soft_time_limit=170)
def run_scrape_async(self, job_id: int):
    with Session(engine) as session:
        job = session.get(ScrapeJob, job_id)
        if not job:
            return {"error": "job not found", "job_id": job_id}
        job.status = "running"
        session.add(job)
        session.commit()
        try:
            resp = httpx.get(job.url, timeout=30.0)
            content = resp.text
            # archive raw HTML to MinIO
            try:
                mc = _minio_client()
                bucket = "scraper-raw"
                if not mc.bucket_exists(bucket):
                    mc.make_bucket(bucket)
                obj_name = f"raw_{job.id}.html"
                mc.put_object(bucket, obj_name, resp.iter_bytes(), length=len(resp.content), content_type="text/html")
                job.result = f"s3://{bucket}/{obj_name}"
            except Exception:
                job.result = content[:10000]
            job.status = "finished"
            job.finished_at = datetime.utcnow()
            session.add(job)
            session.commit()
            logger.info("scrape finished", job_id=job_id)
            # publish event
            publish_event("lawyers.scraped", {"job_id": job_id})
            return {"job_id": job_id, "status": "finished"}
        except Exception as e:
            job.status = "failed"
            session.add(job)
            session.commit()
            logger.error("scrape failed", job_id=job_id, error=str(e))
            raise


def get_celery_app():
    return celery_app
