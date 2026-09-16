from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Vehicle Rental API"
    DATABASE_URL: str = "sqlite:////tmp/rental.db" if os.getenv("VERCEL") else "sqlite:///./rental.db"
    
    JWT_SECRET: str = "your_super_secret_jwt_key_here_please_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # Initial Admin credentials
    ADMIN_EMAIL: str = "admin@skr.com"
    ADMIN_PASSWORD: str = "ShriKrishna@2026!"

    class Config:
        env_file = ".env"

settings = Settings()
