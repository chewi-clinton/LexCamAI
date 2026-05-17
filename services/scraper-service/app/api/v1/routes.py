from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from ...db import get_session
from ...models import ScrapeJob
from ...schemas import ScrapeCreate, ScrapeRead
from ...tasks import run_scrape_async

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
