from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from ...db import get_session
from ...models_user import User
from ...auth import verify_password, get_password_hash, create_access_token
from datetime import timedelta
from ...config import settings

router = APIRouter(prefix="/v1/auth")


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(username: str, password: str, session: Session = Depends(get_session)):
    existing = session.exec(User.select().where(User.username == username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    user = User(username=username, hashed_password=get_password_hash(password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"id": user.id, "username": user.username}


@router.post("/token")
def login_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(User.select().where(User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}
