from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, admin_vehicles, vehicles, bookings, admin_bookings, payments, office, reviews
from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from app.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

def auto_migrate():
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN advance_paid FLOAT DEFAULT 0.0"))
            conn.commit()
        except Exception:
            pass
        try:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN balance_due FLOAT DEFAULT 0.0"))
            conn.commit()
        except Exception:
            pass

auto_migrate()

def create_initial_admin():
    db = SessionLocal()
    admin = db.query(User).filter(User.role == "ADMIN").first()
    if not admin:
        new_admin = User(
            name="Shri Krishna Admin",
            email=settings.ADMIN_EMAIL,
            phone="7259857486",
            password_hash=get_password_hash(settings.ADMIN_PASSWORD),
            role="ADMIN"
        )
        db.add(new_admin)
        db.commit()
    db.close()

from fastapi.staticfiles import StaticFiles
import os

os.makedirs("uploads", exist_ok=True)
create_initial_admin()

app = FastAPI(
    title="Vehicle Rental API",
    description="API for Vehicle Rental Management Platform",
    version="1.0.0"
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(admin_vehicles.router, prefix="/api/admin/vehicles", tags=["admin_vehicles"])
app.include_router(vehicles.router, prefix="/api/vehicles", tags=["vehicles"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(admin_bookings.router, prefix="/api/admin/bookings", tags=["admin_bookings"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(office.router, prefix="/api/office", tags=["office"])
app.include_router(reviews.router, prefix="/api", tags=["reviews"])

@app.get("/")
def read_root():
    return {"message": "Vehicle Rental API is running"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
