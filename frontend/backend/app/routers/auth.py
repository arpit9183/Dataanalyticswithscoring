import os

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.security import (
    COOKIE_NAME,
    TOKEN_DAYS,
    create_token,
    hash_password,
    verify_password,
)
from app.db import get_db
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


class SignUp(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class SignIn(BaseModel):
    email: EmailStr
    password: str = Field(max_length=128)


def _public(user: User) -> dict:
    return {"id": user.id, "email": user.email, "credits": user.credits}


def _set_login_cookie(response: Response, user: User) -> None:
    response.set_cookie(
        COOKIE_NAME,
        create_token(user.id),
        max_age=TOKEN_DAYS * 24 * 3600,
        httponly=True,  # JavaScript on the page can't read it
        samesite="lax",
        secure=os.getenv("APP_ENV") == "production",  # HTTPS only when live
        path="/",
    )


@router.post("/signup", status_code=201)
def signup(body: SignUp, response: Response, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    user = User(email=email, password_hash=hash_password(body.password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError:  # two sign-ups with the same email at the same moment
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    db.refresh(user)
    _set_login_cookie(response, user)
    return _public(user)


@router.post("/login")
def login(body: SignIn, response: Response, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == body.email.strip().lower()))
    ok = verify_password(body.password, user.password_hash if user else None)
    if not user or not ok:
        # Same message for both cases, so nobody can use this to find out who has an account.
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    _set_login_cookie(response, user)
    return _public(user)


@router.post("/logout", status_code=204)
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/")


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return _public(user)
