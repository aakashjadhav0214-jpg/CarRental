from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import or_
from .. import deps
from ...models.user import User
from ...schemas.user import UserCreate, UserResponse, Token
from ...core.security import get_password_hash, verify_password, create_access_token
from ...config import settings

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(deps.get_db)):
    # Check if user email exists
    user_by_email = db.query(User).filter(User.email == user_in.email.strip()).first()
    if user_by_email:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists."
        )
        
    # Check if user phone exists
    if user_in.phone:
        clean_phone = user_in.phone.strip()
        user_by_phone = db.query(User).filter(User.phone == clean_phone).first()
        if user_by_phone:
            raise HTTPException(
                status_code=400,
                detail="This phone number is already registered to another account."
            )
    
    # Create new user, force role to USER (no admin registration via API)
    new_user = User(
        name=user_in.name,
        email=user_in.email.strip(),
        phone=user_in.phone.strip() if user_in.phone else None,
        password_hash=get_password_hash(user_in.password),
        role="USER"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

from fastapi import Request

@router.post("/login", response_model=Token)
async def login(
    request: Request,
    db: Session = Depends(deps.get_db)
):
    email = None
    password = None

    content_type = request.headers.get("content-type", "")
    if "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
        try:
            form = await request.form()
            email = form.get("username") or form.get("email") or form.get("phone")
            password = form.get("password")
        except Exception:
            pass
    
    if not email or not password:
        try:
            body = await request.json()
            email = body.get("email") or body.get("username") or body.get("phone")
            password = body.get("password")
        except Exception:
            pass

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email/Phone and password are required"
        )

    clean_input = email.strip()
    raw_phone = clean_input.replace("+91", "").replace(" ", "").strip()

    try:
        user = db.query(User).filter(
            or_(
                User.email == clean_input,
                User.phone == clean_input,
                User.phone == raw_phone
            )
        ).first()
    except Exception as e:
        print("DB error on login lookup:", e)
        user = None

    # Auto-heal admin user if logging in as configured admin email
    if not user and clean_input.lower() == settings.ADMIN_EMAIL.lower():
        try:
            user = User(
                name="Shri Krishna Admin",
                email=settings.ADMIN_EMAIL,
                phone="7259857486",
                password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                role="ADMIN"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception as err:
            print("Auto-heal admin error:", err)

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email, phone number, or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(deps.get_current_user)):
    return current_user

import uuid
from ...schemas.user import ForgotPasswordRequest, ResetPasswordRequest

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(deps.get_db)):
    clean_input = req.email.strip()
    raw_phone = clean_input.replace("+91", "").replace(" ", "").strip()

    user = db.query(User).filter(
        or_(
            User.email == clean_input,
            User.phone == clean_input,
            User.phone == raw_phone
        )
    ).first()

    if not user and clean_input.lower() == settings.ADMIN_EMAIL.lower():
        user = db.query(User).filter(User.role == "ADMIN").first()

    if not user:
        raise HTTPException(
            status_code=404, 
            detail="No registered user account found with this email or phone number."
        )
    
    token = str(uuid.uuid4())
    user.reset_token = token
    db.commit()
    
    return {
        "message": "Password reset token generated successfully.",
        "demo_token": token
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(deps.get_db)):
    user = db.query(User).filter(User.reset_token == req.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user.password_hash = get_password_hash(req.new_password)
    user.reset_token = None
    db.commit()
    
    return {"message": "Password successfully reset"}
