import io
import json
import re
from datetime import datetime

import httpx
from celery import Celery
from celery.utils.log import get_task_logger
from minio import Minio
from sqlmodel import Session, select

from .config import settings
from .db import engine
from .events import publish_event
from .models import ScrapeJob

logger = get_task_logger(__name__)

celery_app = Celery(
    settings.SERVICE_NAME,
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

_minio = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_SECURE,
)

_EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
_PHONE_RE = re.compile(r"\+?\d[\d\s().-]{7,}\d")
_NAME_RE = re.compile(r"\bM(?:a[iî]tre)?\s+[A-Z][A-Za-z'\-]+(?:\s+[A-Z][A-Za-z'\-]+)*")


def _extract_city(html: str) -> str:
    known = [
            "Douala",
            "Yaounde",
            "Bafoussam",
            "Buea",
            "Bamenda",
            "Kribi",
            "Limbe",
            "Garoua",
            "Maroua",
            "Ngaoundere",
            "Ebolowa",
        ]
    lower = html.lower()
    for city in known:
        if city.lower() in lower:
                return city
    return settings.SCRAPER_DEFAULT_CITY


def _derive_name_from_email(email: str) -> str:
    local = email.split("@")[0]
    local = re.sub(r"[_\.]+", " ", local).strip()
    if not local:
        return "Unknown Lawyer"
    return " ".join(part.capitalize() for part in local.split())


def extract_lawyers(html: str) -> list[dict]:
    emails = list(dict.fromkeys(_EMAIL_RE.findall(html)))
    phones = list(dict.fromkeys(_PHONE_RE.findall(html)))
    names = list(dict.fromkeys(_NAME_RE.findall(html)))

    city = _extract_city(html)
    results: list[dict] = []

    for idx, email in enumerate(emails):
        name = names[idx] if idx < len(names) else _derive_name_from_email(email)
        results.append({
            "full_name": name,
            "email": email,
            "city": city,
            "region": None,
            "type": "scraped",
        })

    for idx, phone in enumerate(phones):
        if any(r.get("phone") == phone for r in results):
            continue
        if len(results) >= settings.SCRAPER_MAX_LAWYERS_PER_RUN:
            break
        name = names[idx] if idx < len(names) else f"Contact {phone}"
        results.append({
            "full_name": name,
            "phone": phone,
            "city": city,
            "region": None,
            "type": "scraped",
        })

    return results[: settings.SCRAPER_MAX_LAWYERS_PER_RUN]


@celery_app.task(bind=True)
def run_scrape_async(self, job_id: int):
    """Fetch a scrape job URL, archive HTML to MinIO, extract contacts, and publish lawyers."""
    with Session(engine) as session:
        job = session.get(ScrapeJob, job_id)
        if not job:
            logger.error("ScrapeJob %s not found", job_id)
            return
        job.status = "running"
        session.add(job)
        session.commit()

    try:
        with httpx.Client(timeout=settings.SCRAPER_REQUEST_TIMEOUT_SECONDS) as client:
            resp = client.get(job.url)
            resp.raise_for_status()
            html = resp.text

        # Archive HTML to MinIO
        object_name = f"scrape_{job_id}_{int(datetime.utcnow().timestamp())}.html"
        payload = html.encode("utf-8")
        _minio.put_object(
            settings.MINIO_SCRAPER_BUCKET,
            object_name,
            data=io.BytesIO(payload),
            length=len(payload),
            content_type="text/html",
        )

        lawyers = extract_lawyers(html)
        publish_event("lawyers.scraped", {"lawyers": lawyers})

        result_payload = {
            "bucket": settings.MINIO_SCRAPER_BUCKET,
            "object": object_name,
            "lawyers_count": len(lawyers),
        }
        with Session(engine) as session:
            job = session.get(ScrapeJob, job_id)
            if job:
                job.status = "completed"
                job.result = json.dumps(result_payload)
                job.finished_at = datetime.utcnow()
                session.add(job)
                session.commit()

        logger.info("Scrape job %s completed with %s lawyers", job_id, len(lawyers))
    except Exception as exc:
        logger.exception("Scrape job %s failed: %s", job_id, exc)
        with Session(engine) as session:
            job = session.get(ScrapeJob, job_id)
            if job:
                job.status = "failed"
                job.result = json.dumps({"error": str(exc)})
                job.finished_at = datetime.utcnow()
                session.add(job)
                session.commit()


def get_celery_app():
    return celery_app
