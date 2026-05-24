from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from ...db import get_session
from ...models import Feedback
from ...schemas import FeedbackCreate, FeedbackRead, FeedbackReviewAction
from ...tasks import process_feedback_async
from ...events import publish_event

router = APIRouter(prefix="/api/v1")


@router.get("/health", status_code=200)
def health():
    return {"status": "ok"}


@router.post("/feedback", response_model=FeedbackRead, status_code=status.HTTP_201_CREATED)
def create_feedback(payload: FeedbackCreate, session: Session = Depends(get_session)):
    fb = Feedback(
        user_id=payload.user_id,
        text=payload.text or "",
        rating=payload.rating,
        session_id=payload.session_id,
        message_index=payload.message_index,
        flag_reason=payload.flag_reason,
        flagged=payload.flagged,
        flag_count=3 if payload.flagged else 0,
    )
    session.add(fb)
    session.commit()
    session.refresh(fb)
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


@router.get("/feedback/admin/feedback", response_model=List[FeedbackRead])
def admin_list_flagged(
    review_status: str = "",
    limit: int = 100,
    session: Session = Depends(get_session),
):
    stmt = select(Feedback).where(Feedback.flagged == True)
    if review_status:
        stmt = stmt.where(Feedback.review_status == review_status)
    stmt = stmt.order_by(Feedback.id.desc()).limit(limit)
    return session.exec(stmt).all()


@router.get("/feedback/admin/feedback/stats")
def admin_feedback_stats(session: Session = Depends(get_session)):
    from sqlmodel import func
    total = session.exec(select(func.count()).where(Feedback.flagged == True)).one()
    pending = session.exec(select(func.count()).where(Feedback.flagged == True, Feedback.review_status == "pending")).one()
    dismissed = session.exec(select(func.count()).where(Feedback.review_status == "dismissed")).one()
    escalated = session.exec(select(func.count()).where(Feedback.review_status == "escalated")).one()
    return {"total_flagged": total, "pending": pending, "dismissed": dismissed, "escalated": escalated}


@router.patch("/feedback/admin/feedback/{feedback_id}/review", response_model=FeedbackRead)
def admin_review_feedback(
    feedback_id: int,
    payload: FeedbackReviewAction,
    session: Session = Depends(get_session),
):
    fb = session.get(Feedback, feedback_id)
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    action = payload.action.lower()
    if action not in ("dismiss", "escalate", "block"):
        raise HTTPException(status_code=400, detail="action must be dismiss, escalate, or block")
    fb.review_status = {"dismiss": "dismissed", "escalate": "escalated", "block": "blocked"}[action]
    session.add(fb)
    session.commit()
    session.refresh(fb)
    return fb


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
