from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Vehicle Rental API"
    DATABASE_URL: str = os.getenv("DATABASE_URL") or ("sqlite:////tmp/rental.db" if os.getenv("VERCEL") else "sqlite:///./rental.db")
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your_super_secret_jwt_key_here_please_change_in_production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "")

    # Initial Admin credentials
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@skr.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "ShriKrishna@2026!")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

if settings.DATABASE_URL and settings.DATABASE_URL.startswith("postgres://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgres://", "postgresql://", 1)
