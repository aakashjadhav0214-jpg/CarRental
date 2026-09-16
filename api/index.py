import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, admin_vehicles, vehicles, bookings, admin_bookings, payments, office, reviews
from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.vehicle import Vehicle, VehicleImage
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
    try:
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
    finally:
        db.close()

def auto_seed_vehicles():
    db = SessionLocal()
    try:
        if db.query(Vehicle).count() == 0:
            vehicles_data = [
                {
                    "category": "Cars",
                    "brand": "Maruti Suzuki",
                    "model": "Swift VXI",
                    "registration_number": "KA13M9988",
                    "year": 2023,
                    "fuel_type": "Petrol",
                    "transmission": "Manual",
                    "engine_capacity": "1197cc",
                    "seats": 5,
                    "description": "Popular compact hatchback, perfect for city rides & quick family getaways.",
                    "features": "AC, Music System, Power Steering, Dual Airbags",
                    "daily_price": 1200,
                    "security_deposit": 2000,
                    "image": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80"
                },
                {
                    "category": "Cars",
                    "brand": "Mahindra",
                    "model": "Thar 4x4",
                    "registration_number": "KA13TH7007",
                    "year": 2023,
                    "fuel_type": "Diesel",
                    "transmission": "Manual",
                    "engine_capacity": "2184cc",
                    "seats": 4,
                    "description": "Iconic 4x4 SUV built for adventure trips to Sakleshpur & Western Ghats.",
                    "features": "4WD, Convertible Top, Touchscreen, All-Terrain Tyres",
                    "daily_price": 3500,
                    "security_deposit": 5000,
                    "image": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80"
                },
                {
                    "category": "Cars",
                    "brand": "Toyota",
                    "model": "Innova Crysta",
                    "registration_number": "KA13IN5544",
                    "year": 2022,
                    "fuel_type": "Diesel",
                    "transmission": "Manual",
                    "engine_capacity": "2393cc",
                    "seats": 7,
                    "description": "Luxury 7-seater MPV ideal for family travel and outstation tours.",
                    "features": "Dual AC, Captain Seats, Touchscreen, Rear Camera",
                    "daily_price": 3200,
                    "security_deposit": 5000,
                    "image": "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80"
                },
                {
                    "category": "Bikes",
                    "brand": "Royal Enfield",
                    "model": "Classic 350",
                    "registration_number": "KA13RE3500",
                    "year": 2023,
                    "fuel_type": "Petrol",
                    "transmission": "Manual",
                    "engine_capacity": "349cc",
                    "seats": 2,
                    "description": "Timeless cruiser motorcycle with unmatched comfort and thumping ride quality.",
                    "features": "Dual Channel ABS, Disc Brakes, Electric Start",
                    "daily_price": 900,
                    "security_deposit": 1500,
                    "image": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80"
                },
                {
                    "category": "Bikes",
                    "brand": "Bajaj",
                    "model": "Pulsar N160",
                    "registration_number": "KA13PU1600",
                    "year": 2023,
                    "fuel_type": "Petrol",
                    "transmission": "Manual",
                    "engine_capacity": "164cc",
                    "seats": 2,
                    "description": "Sporty commuter bike with dual-channel ABS and great mileage.",
                    "features": "LED Projector Headlamp, Digital Meter",
                    "daily_price": 700,
                    "security_deposit": 1000,
                    "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop"
                },
                {
                    "category": "Mopeds/Scooters",
                    "brand": "Honda",
                    "model": "Activa 6G",
                    "registration_number": "KA13AC6000",
                    "year": 2023,
                    "fuel_type": "Petrol",
                    "transmission": "Automatic",
                    "engine_capacity": "109cc",
                    "seats": 2,
                    "description": "India's most trusted automatic scooter for effortless city rides.",
                    "features": "Telescopic Suspension, Combi Brake System",
                    "daily_price": 450,
                    "security_deposit": 1000,
                    "image": "https://images.unsplash.com/photo-1605816988069-b11383b50717?q=80&w=1000&auto=format&fit=crop"
                }
            ]
            for v_item in vehicles_data:
                img_url = v_item.pop("image")
                veh = Vehicle(**v_item, status="AVAILABLE")
                db.add(veh)
                db.flush()
                db.add(VehicleImage(vehicle_id=veh.id, image_url=img_url, is_primary=True))
            db.commit()
    finally:
        db.close()

create_initial_admin()
auto_seed_vehicles()

app = FastAPI(
    title="Vehicle Rental API",
    description="API for Vehicle Rental Management Platform",
    version="1.0.0"
)

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

@app.get("/api")
def read_api_root():
    return {"message": "Vehicle Rental API is running"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
