from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.security import (
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from backend.models.user import User
from backend.schemas.user import (
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: UserCreate, db: Session = Depends(get_db)):
    if not body.email or not body.email.strip():
        raise HTTPException(status_code=422, detail="Email is required")
    if not body.password or len(body.password) < 6:
        raise HTTPException(
            status_code=422, detail="Password must be at least 6 characters"
        )
    if not body.full_name or not body.full_name.strip():
        raise HTTPException(status_code=422, detail="Full name is required")

    existing = db.query(User).filter(User.email == body.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=409, detail="An account with this email already exists"
        )

    user = User(
        email=body.email.lower().strip(),
        hashed_password=get_password_hash(body.password),
        full_name=body.full_name.strip(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower().strip()).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=401, detail="Invalid email or password"
        )

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
