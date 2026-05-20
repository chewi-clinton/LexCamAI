import logging
from datetime import datetime, timezone

import requests as http_client
from celery import Celery
from celery.utils.log import get_task_logger
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .config import settings
from .extractor import extract

logger = get_task_logger(__name__)

celery_app = Celery(
    settings.SERVICE_NAME,
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

_engine = None
_Session = None


def _get_session():
    global _engine, _Session
    if _Session is None:
        _engine = create_engine(str(settings.DATABASE_URL), pool_pre_ping=True)
        _Session = sessionmaker(bind=_engine)
    return _Session()


def _update_job(job_id: int, **fields):
    from sqlmodel import Session as SMSession
    from .models import ScrapeJob
    with SMSession(_get_session().bind) as session:
        job = session.get(ScrapeJob, job_id)
        if not job:
            return
        for k, v in fields.items():
            setattr(job, k, v)
        session.add(job)
        session.commit()


def _update_job_model(model_class, job_id: int, **fields):
    from sqlmodel import Session as SMSession
    with SMSession(_get_session().bind) as session:
        job = session.get(model_class, job_id)
        if not job:
            return
        for k, v in fields.items():
            setattr(job, k, v)
        session.add(job)
        session.commit()


def _post_to_lawyer_service(lawyers: list[dict]) -> dict:
    url = f"{settings.LAWYER_SERVICE_URL}/internal/lawyers/ingest"
    resp = http_client.post(
        url,
        json={"lawyers": lawyers},
        headers={"X-Internal-Key": settings.INTERNAL_SERVICE_KEY},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


@celery_app.task(bind=True, max_retries=0, name="app.tasks.run_scrape")
def run_scrape(self, job_id: int):
    logger.info("Starting scrape job %s", job_id)

    _update_job(job_id, status="running")

    try:
        from .models import ScrapeJob
        with _get_session() as session:
            job = session.get(ScrapeJob, job_id)
            if not job:
                logger.error("Job %s not found", job_id)
                return
            url = job.url

        # Fetch the target URL
        resp = http_client.get(
            url,
            timeout=30,
            headers={
                "User-Agent": "LexCamBot/1.0 (+https://lexcam.cm/bot)",
                "Accept": "text/html,application/xhtml+xml,application/json,*/*",
            },
            allow_redirects=True,
        )
        resp.raise_for_status()

        content_type = resp.headers.get("content-type", "text/html")
        lawyers = extract(resp.text, content_type, url)
        logger.info("Job %s: extracted %d lawyer profiles", job_id, len(lawyers))

        if lawyers:
            result = _post_to_lawyer_service(lawyers)
            inserted = result.get("inserted", 0)
            skipped  = result.get("skipped", 0)
            summary  = f"Extracted {len(lawyers)}, inserted {inserted}, skipped {skipped}"
        else:
            summary = "No lawyer profiles found on page"

        _update_job(
            job_id,
            status="done",
            result=summary,
            finished_at=datetime.now(timezone.utc),
        )
        logger.info("Job %s done: %s", job_id, summary)

    except http_client.exceptions.ConnectionError as exc:
        msg = f"Connection error: {exc}"
        logger.warning("Job %s failed: %s", job_id, msg)
        _update_job(job_id, status="failed", result=msg, finished_at=datetime.now(timezone.utc))

    except http_client.exceptions.HTTPError as exc:
        msg = f"HTTP {exc.response.status_code}: {exc.response.reason}"
        logger.warning("Job %s failed: %s", job_id, msg)
        _update_job(job_id, status="failed", result=msg, finished_at=datetime.now(timezone.utc))

    except Exception as exc:
        msg = f"Error: {exc}"
        logger.exception("Job %s unexpected error", job_id)
        _update_job(job_id, status="failed", result=msg, finished_at=datetime.now(timezone.utc))


# Keep old name as alias so existing enqueued tasks still resolve
run_scrape_async = run_scrape


@celery_app.task(bind=True, max_retries=0, name="app.tasks.run_law_scrape")
def run_law_scrape(self, job_id: int):
    from .models import LawScrapeJob
    from .law_extractor import extract as extract_law

    logger.info("Starting law scrape job %s", job_id)
    _update_job_model(LawScrapeJob, job_id, status="running")

    try:
        with _get_session() as session:
            job = session.get(LawScrapeJob, job_id)
            if not job:
                logger.error("LawScrapeJob %s not found", job_id)
                return
            url, code, name, domain, language = job.url, job.code, job.name, job.domain, job.language

        resp = http_client.get(
            url,
            timeout=30,
            headers={
                "User-Agent": "LexCamBot/1.0 (+https://lexcam.cm/bot)",
                "Accept": "text/html,application/xhtml+xml,*/*",
            },
            allow_redirects=True,
        )
        resp.raise_for_status()

        articles = extract_law(resp.text, source_url=url, domain=domain,
                               language=language, law_name=name)
        logger.info("Law job %s: extracted %d articles from %s", job_id, len(articles), url)

        if not articles:
            _update_job_model(LawScrapeJob, job_id,
                              status="done",
                              result="No articles detected on page",
                              finished_at=datetime.now(timezone.utc))
            return

        kb_resp = http_client.post(
            f"{settings.KB_SERVICE_URL}/api/v1/ingest",
            json={
                "code": code,
                "name": name,
                "jurisdiction": "cameroon",
                "language": language,
                "articles": articles,
            },
            timeout=60,
        )
        kb_resp.raise_for_status()
        data = kb_resp.json()
        ingested = data.get("articles_ingested", 0)
        summary = f"Extracted {len(articles)}, ingested {ingested} into KB"
        _update_job_model(LawScrapeJob, job_id,
                          status="done",
                          result=summary,
                          articles_ingested=ingested,
                          finished_at=datetime.now(timezone.utc))
        logger.info("Law job %s done: %s", job_id, summary)

    except http_client.exceptions.ConnectionError as exc:
        msg = f"Connection error: {exc}"
        logger.warning("Law job %s failed: %s", job_id, msg)
        _update_job_model(LawScrapeJob, job_id, status="failed", result=msg,
                          finished_at=datetime.now(timezone.utc))

    except http_client.exceptions.HTTPError as exc:
        msg = f"HTTP {exc.response.status_code}: {exc.response.reason}"
        logger.warning("Law job %s failed: %s", job_id, msg)
        _update_job_model(LawScrapeJob, job_id, status="failed", result=msg,
                          finished_at=datetime.now(timezone.utc))

    except Exception as exc:
        msg = f"Error: {exc}"
        logger.exception("Law job %s unexpected error", job_id)
        _update_job_model(LawScrapeJob, job_id, status="failed", result=msg,
                          finished_at=datetime.now(timezone.utc))


def get_celery_app():
    return celery_app
