"""Shared checks that routes can ask for with Depends(...)."""
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.security import COOKIE_NAME, read_token
from app.db import get_db
from app.models.user import User


def get_optional_user(request: Request, db: Session = Depends(get_db)) -> User | None:
    token = request.cookies.get(COOKIE_NAME)
    user_id = read_token(token) if token else None
    return db.get(User, user_id) if user_id else None


def get_current_user(user: User | None = Depends(get_optional_user)) -> User:
    if user is None:
        raise HTTPException(status_code=401, detail="Please sign in.")
    return user
