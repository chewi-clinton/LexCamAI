from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from ...db import get_session
from ...models import Notification
from ...schemas import NotificationCreate, NotificationRead
from ...tasks import send_notification_async

router = APIRouter(prefix="/api/v1")


@router.get("/health", status_code=200)
def health():
    return {"status": "ok"}


@router.post("/notify", response_model=NotificationRead, status_code=status.HTTP_201_CREATED)
def create_notification(payload: NotificationCreate, session: Session = Depends(get_session)):
    n = Notification.from_orm(payload)
    session.add(n)
    session.commit()
    session.refresh(n)
    send_notification_async.delay(n.id)
    return n


@router.get("/notifications", response_model=List[NotificationRead])
def list_notifications(limit: int = 50, session: Session = Depends(get_session)):
    statement = select(Notification).limit(limit)
    results = session.exec(statement).all()
    return results
