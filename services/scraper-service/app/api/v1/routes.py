import logging
from datetime import datetime, timezone

import requests as http_client
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from ...db import get_session
from ...models import ScrapeJob, LawScrapeJob
from ...schemas import ScrapeCreate, ScrapeRead, LawScrapeCreate, LawScrapeRead
from ...tasks import run_scrape_async, run_law_scrape, _fetch_bytes, _ingest_pdf_to_kb

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/v1")


@router.get("/health", status_code=200)
def health():
    return {"status": "ok"}


@router.post("/scrape", response_model=ScrapeRead, status_code=status.HTTP_201_CREATED)
def create_job(payload: ScrapeCreate, session: Session = Depends(get_session)):
    job = ScrapeJob(url=str(payload.url))
    session.add(job)
    session.commit()
    session.refresh(job)
    run_scrape_async.delay(job.id)
    return job


@router.get("/scrape/{job_id}", response_model=ScrapeRead)
def get_job(job_id: int, session: Session = Depends(get_session)):
    job = session.get(ScrapeJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/scrape", response_model=List[ScrapeRead])
def list_jobs(limit: int = 50, session: Session = Depends(get_session)):
    statement = select(ScrapeJob).limit(limit)
    return session.exec(statement).all()


@router.post("/scrape-laws", response_model=LawScrapeRead, status_code=status.HTTP_201_CREATED)
def create_law_job(payload: LawScrapeCreate, session: Session = Depends(get_session)):
    url = str(payload.url)
    job = LawScrapeJob(
        url=url,
        code=payload.code,
        name=payload.name,
        domain=payload.domain,
        language=payload.language,
    )
    session.add(job)
    session.commit()
    session.refresh(job)

    # Direct PDF URLs: ingest synchronously from the API process (stable network)
    # so we never depend on the Celery worker having internet access.
    if url.lower().endswith(".pdf"):
        job.status = "running"
        session.add(job)
        session.commit()
        try:
            pdf_bytes = _fetch_bytes(url)
            data = _ingest_pdf_to_kb(pdf_bytes, payload.code, payload.name,
                                     payload.domain, payload.language)
            ingested = data.get("articles_ingested", 0)
            job.status = "done"
            job.result = f"PDF ingested — {ingested} articles indexed"
            job.articles_ingested = ingested
        except Exception as exc:
            logger.exception("Sync PDF ingest failed for job %s", job.id)
            job.status = "failed"
            job.result = f"Error: {exc}"
        job.finished_at = datetime.now(timezone.utc)
        session.add(job)
        session.commit()
        session.refresh(job)
        return job

    # HTML scrape: delegate to Celery worker as usual
    run_law_scrape.delay(job.id)
    return job


@router.get("/scrape-laws/{job_id}", response_model=LawScrapeRead)
def get_law_job(job_id: int, session: Session = Depends(get_session)):
    job = session.get(LawScrapeJob, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Law scrape job not found")
    return job


@router.get("/scrape-laws", response_model=List[LawScrapeRead])
def list_law_jobs(limit: int = 50, session: Session = Depends(get_session)):
    statement = select(LawScrapeJob).order_by(LawScrapeJob.id.desc()).limit(limit)
    return session.exec(statement).all()
