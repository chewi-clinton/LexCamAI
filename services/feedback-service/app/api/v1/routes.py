from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from ...db import get_session
from ...models import Feedback
from ...schemas import FeedbackCreate, FeedbackRead
from ...tasks import process_feedback_async
from ...events import publish_event

router = APIRouter(prefix="/v1")


@router.get("/health", status_code=200)
def health():
    return {"status": "ok"}


@router.post("/feedback", response_model=FeedbackRead, status_code=status.HTTP_201_CREATED)
def create_feedback(payload: FeedbackCreate, session: Session = Depends(get_session)):
    fb = Feedback.from_orm(payload)
    session.add(fb)
    session.commit()
    session.refresh(fb)
    # enqueue background processing
    process_feedback_async.delay(fb.id)
    return fb


@router.post("/feedback/{feedback_id}/flag", status_code=200)
def flag_feedback(feedback_id: int, session: Session = Depends(get_session)):
    fb = session.get(Feedback, feedback_id)
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    fb.flag_count += 1
    if fb.flag_count >= 3 and not fb.flagged:
        fb.flagged = True
        session.add(fb)
        session.commit()
        publish_event("feedback.flagged", {"feedback_id": fb.id, "session_id": fb.session_id})
        return {"flagged": True}
    session.add(fb)
    session.commit()
    return {"flagged": fb.flagged, "flag_count": fb.flag_count}


@router.get("/feedback", response_model=List[FeedbackRead])
def list_feedback(limit: int = 50, session: Session = Depends(get_session)):
    statement = select(Feedback).limit(limit)
    results = session.exec(statement).all()
    return results


@router.get("/feedback/{feedback_id}", response_model=FeedbackRead)
def get_feedback(feedback_id: int, session: Session = Depends(get_session)):
    fb = session.get(Feedback, feedback_id)
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return fb
