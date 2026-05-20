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
        html = _fetch(url)
        lawyers = extract(html, "text/html", url)
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


_FETCH_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "max-age=0",
}


def _fetch(url: str, referer: str = "https://www.google.fr/") -> str:
    headers = {**_FETCH_HEADERS, "Referer": referer}
    resp = http_client.get(url, timeout=30, headers=headers, allow_redirects=True)
    resp.raise_for_status()
    return resp.text


def _fetch_bytes(url: str, referer: str = "https://www.google.fr/") -> bytes:
    headers = {**_FETCH_HEADERS, "Referer": referer}
    resp = http_client.get(url, timeout=60, headers=headers, allow_redirects=True)
    resp.raise_for_status()
    return resp.content


def _ingest_pdf_to_kb(pdf_bytes: bytes, code: str, name: str,
                       domain: str, language: str) -> dict:
    resp = http_client.post(
        f"{settings.KB_SERVICE_URL}/api/v1/ingest/pdf",
        files={"file": ("law.pdf", pdf_bytes, "application/pdf")},
        data={
            "code": code,
            "name": name,
            "domain": domain or "general",
            "language": language or "fr",
            "jurisdiction": "cameroon",
        },
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


@celery_app.task(bind=True, max_retries=0, name="app.tasks.run_law_scrape")
def run_law_scrape(self, job_id: int):
    from .models import LawScrapeJob
    from .law_extractor import extract as extract_law, find_law_links

    logger.info("Starting law scrape job %s", job_id)
    _update_job_model(LawScrapeJob, job_id, status="running")

    try:
        with _get_session() as session:
            job = session.get(LawScrapeJob, job_id)
            if not job:
                logger.error("LawScrapeJob %s not found", job_id)
                return
            url, code, name, domain, language = job.url, job.code, job.name, job.domain, job.language

        # ── Direct PDF URL ────────────────────────────────────────────────────
        if url.lower().endswith(".pdf"):
            logger.info("Law job %s: direct PDF URL detected, ingesting via KB", job_id)
            pdf_bytes = _fetch_bytes(url)
            data = _ingest_pdf_to_kb(pdf_bytes, code, name, domain, language)
            ingested = data.get("articles_ingested", 0)
            summary = f"PDF ingested directly — {ingested} articles indexed"
            _update_job_model(LawScrapeJob, job_id,
                              status="done",
                              result=summary,
                              articles_ingested=ingested,
                              finished_at=datetime.now(timezone.utc))
            logger.info("Law job %s done: %s", job_id, summary)
            return

        # ── HTML scraping path ────────────────────────────────────────────────
        html = _fetch(url, referer="https://www.google.fr/")
        articles = extract_law(html, source_url=url, domain=domain,
                               language=language, law_name=name)
        pages_scraped = 1
        logger.info("Law job %s: extracted %d articles from %s", job_id, len(articles), url)

        # If this looks like a listing page (no articles), follow HTML law links
        if not articles:
            law_links = find_law_links(html, base_url=url)
            logger.info("Law job %s: listing page, following %d HTML law links", job_id, len(law_links))
            for link in law_links[:10]:
                try:
                    sub_html = _fetch(link, referer=url)
                    sub_articles = extract_law(sub_html, source_url=link, domain=domain,
                                               language=language, law_name=name)
                    if sub_articles:
                        logger.info("Law job %s: got %d articles from %s", job_id, len(sub_articles), link)
                        articles.extend(sub_articles)
                        pages_scraped += 1
                    if len(articles) >= 1000:
                        break
                except Exception as sub_exc:
                    logger.warning("Law job %s: failed to fetch sub-page %s — %s", job_id, link, sub_exc)

        # ── HTML found articles → ingest as articles ──────────────────────────
        if articles:
            logger.info("Law job %s: total %d articles across %d page(s), sending to KB",
                        job_id, len(articles), pages_scraped)
            kb_resp = http_client.post(
                f"{settings.KB_SERVICE_URL}/api/v1/ingest",
                json={
                    "code": code,
                    "name": name,
                    "jurisdiction": "cameroon",
                    "language": language,
                    "articles": articles,
                },
                timeout=120,
            )
            kb_resp.raise_for_status()
            data = kb_resp.json()
            ingested = data.get("articles_ingested", 0)
            summary = f"Scraped {pages_scraped} page(s), extracted {len(articles)} articles, ingested {ingested} into KB"
            _update_job_model(LawScrapeJob, job_id,
                              status="done",
                              result=summary,
                              articles_ingested=ingested,
                              finished_at=datetime.now(timezone.utc))
            logger.info("Law job %s done: %s", job_id, summary)
            return

        # ── No HTML articles → fall back to PDF links on the same page ────────
        from .law_extractor import find_pdf_links
        pdf_links = find_pdf_links(html, base_url=url)
        logger.info("Law job %s: 0 HTML articles, found %d PDF link(s) as fallback",
                    job_id, len(pdf_links))

        ingested_total = 0
        pdfs_tried = 0
        for pdf_url in pdf_links[:3]:
            try:
                pdf_bytes = _fetch_bytes(pdf_url, referer=url)
                data = _ingest_pdf_to_kb(pdf_bytes, code, name, domain, language)
                n = data.get("articles_ingested", 0)
                ingested_total += n
                pdfs_tried += 1
                logger.info("Law job %s: PDF %s → %d articles", job_id, pdf_url, n)
            except Exception as pdf_exc:
                logger.warning("Law job %s: PDF ingest failed for %s — %s", job_id, pdf_url, pdf_exc)

        if ingested_total > 0:
            summary = f"PDF fallback: ingested {pdfs_tried} PDF(s), {ingested_total} articles indexed"
            _update_job_model(LawScrapeJob, job_id,
                              status="done",
                              result=summary,
                              articles_ingested=ingested_total,
                              finished_at=datetime.now(timezone.utc))
            logger.info("Law job %s done: %s", job_id, summary)
            return

        result_msg = "No articles found (no HTML text or accessible PDFs on this page)"
        _update_job_model(LawScrapeJob, job_id,
                          status="done",
                          result=result_msg,
                          finished_at=datetime.now(timezone.utc))
        logger.info("Law job %s: %s", job_id, result_msg)

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
