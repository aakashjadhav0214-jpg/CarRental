import hashlib
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from ..config import settings

# Monkeypatch passlib-bcrypt incompatibility for Python 3.12+ / bcrypt 4.x
try:
    import bcrypt
    if not hasattr(bcrypt, "__about__"):
        class About:
            __version__ = getattr(bcrypt, "__version__", "4.0.0")
        bcrypt.__about__ = About()
except Exception:
    pass

from passlib.context import CryptContext

try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
except Exception:
    pwd_context = None

def get_password_hash(password: str) -> str:
    if not password:
        password = ""
    try:
        if pwd_context:
            return pwd_context.hash(password)
    except Exception:
        pass
    
    # Direct bcrypt fallback
    try:
        import bcrypt
        pwd_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(pwd_bytes, salt)
        return hashed.decode('utf-8')
    except Exception:
        # SHA256 fallback
        return "$sha256$" + hashlib.sha256((password + settings.JWT_SECRET).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
        
    if hashed_password.startswith("$sha256$"):
        expected = "$sha256$" + hashlib.sha256((plain_password + settings.JWT_SECRET).encode('utf-8')).hexdigest()
        return expected == hashed_password

    try:
        if pwd_context:
            return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        pass

    try:
        import bcrypt
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt
