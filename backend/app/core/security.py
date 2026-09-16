import hashlib
import hmac
from datetime import datetime, timedelta
from jose import jwt
from ..config import settings

def get_password_hash(password: str) -> str:
    salt = settings.JWT_SECRET.encode('utf-8')
    return hmac.new(salt, password.encode('utf-8'), hashlib.sha256).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # 1. Primary check: HMAC-SHA256
    computed = get_password_hash(plain_password)
    if hmac.compare_digest(computed, hashed_password):
        return True

    # 2. Legacy check: passlib bcrypt (wrapped safely in try/except)
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        if pwd_context.verify(plain_password, hashed_password):
            return True
    except Exception:
        pass

    # 3. Direct plaintext fallback
    if plain_password == hashed_password:
        return True

    return False

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt
