import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.routes import auth, admin_vehicles, vehicles, bookings, admin_bookings, payments, office, reviews
from app.database import engine, Base, SessionLocal
from app.models import User, Vehicle, VehicleImage, Booking, Payment, Office, Review
from app.core.security import get_password_hash
from app.config import settings

_db_initialized = False

def auto_migrate():
    from sqlalchemy import text
    with engine.connect() as conn:
        for stmt in [
            "ALTER TABLE users ADD COLUMN reset_token VARCHAR",
            "ALTER TABLE bookings ADD COLUMN advance_paid FLOAT DEFAULT 0.0",
            "ALTER TABLE bookings ADD COLUMN balance_due FLOAT DEFAULT 0.0",
            "ALTER TABLE vehicles ADD COLUMN extra_km_charge FLOAT DEFAULT 10.0",
            "ALTER TABLE vehicles ADD COLUMN km_limit INT DEFAULT 300",
        ]:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception:
                pass

def create_initial_admin():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not admin:
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
        else:
            admin.email = settings.ADMIN_EMAIL
            admin.password_hash = get_password_hash(settings.ADMIN_PASSWORD)
            admin.role = "ADMIN"
            db.commit()
    except Exception as e:
        print("Admin seed error:", e)
    finally:
        db.close()

def auto_seed_vehicles():
    db = SessionLocal()
    try:
        vehicles_data = [
                {
                    "id": "1f44ffe6-67b3-4701-b350-a4ba9380bfd7",
                    "category": "Cars",
                    "brand": "Tata",
                    "model": "Tiago",
                    "registration_number": "KA13MA1005",
                    "year": 2023,
                    "fuel_type": "Petrol",
                    "transmission": "Manual",
                    "engine_capacity": "1200cc",
                    "seats": 5,
                    "description": "4-star GNCAP safety rated compact hatchback with Harman premium audio and sturdy build quality.",
                    "features": "Harman 8-Speaker Audio, Dual Airbags, ABS with EBD, Corner Stability Control",
                    "daily_price": 2500,
                    "security_deposit": 3000,
                    "image": "/uploads/tiago.jpg"
                },
                {
                    "id": "c941e0c3-5840-4f74-b75b-794031477c8d",
                    "category": "Cars",
                    "brand": "Maruti Suzuki",
                    "model": "S-Presso",
                    "registration_number": "KA13MA1006",
                    "year": 2022,
                    "fuel_type": "Petrol",
                    "transmission": "Manual",
                    "engine_capacity": "1000cc",
                    "seats": 4,
                    "description": "Mini-SUV styling with high seating position and ground clearance to tackle city potholes easily.",
                    "features": "High Ground Clearance, Digital Speedometer, Front Power Windows",
                    "daily_price": 2500,
                    "security_deposit": 3000,
                    "image": "/uploads/s-presso.jpg"
                },
                {
                    "id": "97ff02f9-7429-471f-8ca9-b2f9a749033d",
                    "category": "Cars",
                    "brand": "Maruti Suzuki",
                    "model": "Dzire Sedan",
                    "registration_number": "KA13MA1007",
                    "year": 2023,
                    "fuel_type": "Petrol",
                    "transmission": "Manual",
                    "engine_capacity": "1200cc",
                    "seats": 5,
                    "description": "Comfortable 5-seater sedan with class-leading boot space for luggage and long highway journeys.",
                    "features": "Spacious Trunk, Rear AC Vents, Push Button Start, Automatic Climate Control",
                    "daily_price": 2500,
                    "security_deposit": 3000,
                    "image": "/uploads/desire.avif"
                },
                {
                    "id": "v-swift-custom",
                    "category": "Cars",
                    "brand": "Maruti Suzuki",
                    "model": "Swift VXI",
                    "registration_number": "KA13MA1003",
                    "year": 2023,
                    "fuel_type": "Petrol",
                    "transmission": "Manual",
                    "engine_capacity": "1200cc",
                    "seats": 5,
                    "description": "Popular sporty hatchback with high fuel efficiency, sleek design, and smooth handling.",
                    "features": "AC, Music System, Power Steering, Dual Airbags",
                    "daily_price": 2500,
                    "security_deposit": 3000,
                    "image": "/uploads/swift.png"
                },
                {
                    "id": "v-i10-custom",
                    "category": "Cars",
                    "brand": "Hyundai",
                    "model": "Grand i10 Nios",
                    "registration_number": "KA13MA1001",
                    "year": 2023,
                    "fuel_type": "Petrol",
                    "transmission": "Manual",
                    "engine_capacity": "1200cc",
                    "seats": 5,
                    "description": "Stylish city hatchback with refined Kappa engine and smooth driveability.",
                    "features": "Touchscreen Infotainment, Rear AC Vents, Keyless Entry",
                    "daily_price": 2500,
                    "security_deposit": 3000,
                    "image": "/uploads/i10.png"
                },
                {
                    "id": "v-i20-custom",
                    "category": "Cars",
                    "brand": "Hyundai",
                    "model": "i20 Premium",
                    "registration_number": "KA13MA1002",
                    "year": 2023,
                    "fuel_type": "Petrol",
                    "transmission": "Manual",
                    "engine_capacity": "1200cc",
                    "seats": 5,
                    "description": "Premium hatchback with Bose sound system, sunroof, and modern cabin styling.",
                    "features": "Bose Audio, Sunroof, Digital Cluster, Wireless Charger",
                    "daily_price": 2500,
                    "security_deposit": 3000,
                    "image": "/uploads/i20.avif"
                },
                {
                    "id": "a708e670-d8a4-4b29-acf0-cdda3a7c8ddf",
                    "category": "Cars",
                    "brand": "Renault",
                    "model": "Scala Diesel",
                    "registration_number": "KA13MA1008",
                    "year": 2020,
                    "fuel_type": "Diesel",
                    "transmission": "Manual",
                    "engine_capacity": "1500cc",
                    "seats": 5,
                    "description": "Executive diesel sedan offering legendary rear legroom, plush seating, and high fuel economy.",
                    "features": "Plush Leatherette Seats, Automatic Climate Control, Alloy Wheels, Massive Trunk",
                    "daily_price": 2500,
                    "security_deposit": 3000,
                    "image": "/uploads/scala.jpg"
                },
                {
                    "id": "754b5f1b-067f-4b10-9d10-d50a6978ab5f",
                    "category": "Cars",
                    "brand": "Maruti Suzuki",
                    "model": "Ertiga 7-Seater Petrol",
                    "registration_number": "KA13MA1009",
                    "year": 2023,
                    "fuel_type": "Petrol",
                    "transmission": "Manual",
                    "engine_capacity": "1500cc",
                    "seats": 7,
                    "description": "Versatile 7-seater MPV ideal for family vacations, estate visits, and group trips around Hassan.",
                    "features": "7 Seats, Rear AC Vents for all rows, Touchscreen Infotainment, Steering Controls",
                    "daily_price": 3500,
                    "security_deposit": 4000,
                    "image": "/uploads/ertiga petrol.jpg"
                },
                {
                    "id": "da82b4d0-a39b-4f9a-a0a5-0666a711b97b",
                    "category": "Cars",
                    "brand": "Maruti Suzuki",
                    "model": "Ertiga 7-Seater CNG",
                    "registration_number": "KA13MA1010",
                    "year": 2024,
                    "fuel_type": "CNG",
                    "transmission": "Manual",
                    "engine_capacity": "1500cc",
                    "seats": 7,
                    "description": "Economical 7-seater MPV equipped with factory CNG kit for lowest per-kilometer travel cost.",
                    "features": "Factory CNG Kit, 7 Seater, Roof Mounted AC, Isofix Child Seat Mounts",
                    "daily_price": 4000,
                    "security_deposit": 4000,
                    "image": "/uploads/ertiga cng.avif"
                },
                {
                    "id": "5b5277c0-7746-4bc9-8223-290a7ba764c5",
                    "category": "Cars",
                    "brand": "Renault",
                    "model": "Triber 7-Seater",
                    "registration_number": "KA13MA1011",
                    "year": 2023,
                    "fuel_type": "Petrol",
                    "transmission": "Manual",
                    "engine_capacity": "1000cc",
                    "seats": 7,
                    "description": "Smart modular 7-seater MPV with removable 3rd row seats for flexible luggage space.",
                    "features": "Modular Seating, Independent AC Vents, Projector Headlamps, LED DRLs",
                    "daily_price": 3500,
                    "security_deposit": 4000,
                    "image": "/uploads/triber.avif"
                },
                {
                    "id": "42b2dacf-3ebe-48b1-8bae-29ad6180e594",
                    "category": "Cars",
                    "brand": "Toyota",
                    "model": "Innova Crysta",
                    "registration_number": "KA13MA1012",
                    "year": 2022,
                    "fuel_type": "Diesel",
                    "transmission": "Manual",
                    "engine_capacity": "2400cc",
                    "seats": 7,
                    "description": "The gold standard of luxury 7-seater touring with supreme comfort, power, and road presence.",
                    "features": "Captain Seats, Dual Zone Climate Control, Powerful Diesel Engine, 7 Airbags",
                    "daily_price": 5000,
                    "security_deposit": 5000,
                    "image": "/uploads/innova.jpg"
                },
                {
                    "id": "f1ae34c6-48ee-419a-a08b-4af6d1670a61",
                    "category": "Cars",
                    "brand": "Mahindra",
                    "model": "XUV500 SUV",
                    "registration_number": "KA13MA1013",
                    "year": 2021,
                    "fuel_type": "Diesel",
                    "transmission": "Manual",
                    "engine_capacity": "2200cc",
                    "seats": 7,
                    "description": "Powerful 7-seater mHawk diesel SUV built for Western Ghats hill climbs and rough terrains.",
                    "features": "All-Wheel Drive, Leather Seats, Electric Sunroof, Touchscreen Navigation",
                    "daily_price": 4500,
                    "security_deposit": 5000,
                    "image": "/uploads/xuv.jpg"
                },
                {
                    "id": "c71e84a2-11a5-48b2-b132-09411985f401",
                    "category": "Cars",
                    "brand": "Toyota",
                    "model": "Glanza",
                    "registration_number": "KA13MA1004",
                    "year": 2023,
                    "fuel_type": "Petrol",
                    "transmission": "Manual",
                    "engine_capacity": "1200cc",
                    "seats": 5,
                    "description": "Premium hatchback with Toyota reliability, smooth engine, and stylish features.",
                    "features": "Smartplay Cast Infotainment, Automatic Climate Control, Dual Airbags",
                    "daily_price": 2500,
                    "security_deposit": 3000,
                    "image": "/uploads/glanza.jpg"
                },
                {
                    "id": "99fdb68b-dacb-4c68-9075-a65a3a0e40d8",
                    "category": "Bikes",
                    "brand": "Bajaj",
                    "model": "Pulsar NS200",
                    "registration_number": "KA13MB2001",
                    "year": 2023,
                    "fuel_type": "Petrol",
                    "transmission": "Manual",
                    "engine_capacity": "200cc",
                    "seats": 2,
                    "description": "Raw liquid-cooled 200cc performance, perimeter frame, and aggressive naked street styling.",
                    "features": "Liquid Cooled Engine, Dual Channel ABS, Perimeter Frame, Gear Position Indicator",
                    "daily_price": 1500,
                    "security_deposit": 1500,
                    "image": "/uploads/ns.webp"
                },
                {
                    "id": "55d3e516-2f77-4d17-8395-83e6f1c357a7",
                    "category": "Bikes",
                    "brand": "Hero",
                    "model": "XPulse 200 4V",
                    "registration_number": "KA13MB2002",
                    "year": 2024,
                    "fuel_type": "Petrol",
                    "transmission": "Manual",
                    "engine_capacity": "200cc",
                    "seats": 2,
                    "description": "Dual-purpose adventure motorcycle perfect for Sakleshpur off-road trails and smooth highways.",
                    "features": "Long Travel Suspension, Spoke Wheels, Bluetooth Navigation, Rally Ergonomics",
                    "daily_price": 1500,
                    "security_deposit": 1500,
                    "image": "/uploads/xpulse.jpg"
                },
                {
                    "id": "fc6618e5-37b7-4211-b763-6f860018c564",
                    "category": "Mopeds/Scooters",
                    "brand": "Honda",
                    "model": "Activa 6G",
                    "registration_number": "KA13MC3001",
                    "year": 2023,
                    "fuel_type": "Petrol",
                    "transmission": "Automatic",
                    "engine_capacity": "110cc",
                    "seats": 2,
                    "description": "India's most reliable automatic scooter for effortless city rides and daily errands.",
                    "features": "eSP Engine Tech, Telescopic Suspension, External Fuel Fill, Engine Start/Stop",
                    "daily_price": 800,
                    "security_deposit": 1000,
                    "image": "/uploads/activa.webp"
                },
                {
                    "id": "e15a0bd6-0ce7-419b-b55d-ad12840c26ce",
                    "category": "Mopeds/Scooters",
                    "brand": "TVS",
                    "model": "Jupiter 125",
                    "registration_number": "KA13MC3002",
                    "year": 2023,
                    "fuel_type": "Petrol",
                    "transmission": "Automatic",
                    "engine_capacity": "125cc",
                    "seats": 2,
                    "description": "Front fuel filling, widest seat in category, and massive 33L underseat helmet storage.",
                    "features": "Front Fuel Fill, 33L Storage, Semi-Digital Speedometer, USB Mobile Charger",
                    "daily_price": 800,
                    "security_deposit": 1000,
                    "image": "/uploads/jupiter.jpg"
                },
                {
                    "id": "09766dca-ff93-4a67-a9a2-3e88df0c56e9",
                    "category": "Mopeds/Scooters",
                    "brand": "Suzuki",
                    "model": "Access 125",
                    "registration_number": "KA13MC3003",
                    "year": 2024,
                    "fuel_type": "Petrol",
                    "transmission": "Automatic",
                    "engine_capacity": "125cc",
                    "seats": 2,
                    "description": "Retro classic design powered by a refined 125cc Eco Performance engine.",
                    "features": "Retro Chrome Mirrors, Bluetooth Digital Cluster, LED Headlamp, Front Pocket",
                    "daily_price": 800,
                    "security_deposit": 1000,
                    "image": "/uploads/access.jpg"
                },
                {
                    "id": "062da4c6-9234-44db-aced-cde64e1c1308",
                    "category": "Mopeds/Scooters",
                    "brand": "Honda",
                    "model": "Dio Sports",
                    "registration_number": "KA13MC3004",
                    "year": 2023,
                    "fuel_type": "Petrol",
                    "transmission": "Automatic",
                    "engine_capacity": "110cc",
                    "seats": 2,
                    "description": "Sporty moto-scooter with sharp body graphics, LED position lamp, and nimble handling.",
                    "features": "Sporty Body Graphics, LED Headlamp, Digital Meter, Combi Brake System",
                    "daily_price": 800,
                    "security_deposit": 1000,
                    "image": "/uploads/dio.jpg"
                },
                {
                    "id": "9974237d-9930-40e2-a3be-60277fce4e49",
                    "category": "Mopeds/Scooters",
                    "brand": "Suzuki",
                    "model": "Burgman Street",
                    "registration_number": "KA13MC3005",
                    "year": 2023,
                    "fuel_type": "Petrol",
                    "transmission": "Automatic",
                    "engine_capacity": "125cc",
                    "seats": 2,
                    "description": "Maxi-scooter comfort with flexible footrest positioning, wide windshield, and premium posture.",
                    "features": "Maxi Scooter Footboards, Windscreen, Glovebox with USB, Shutter Key Lock",
                    "daily_price": 800,
                    "security_deposit": 1000,
                    "image": "/uploads/burgman.jpg"
                }
        ]
        for v_item in vehicles_data:
            v_dict = dict(v_item)
            v_id = v_dict["id"]
            existing = db.query(Vehicle).filter(Vehicle.id == v_id).first()
            if not existing:
                img_url = v_dict.pop("image", "/logo.png")
                veh = Vehicle(**v_dict, status="AVAILABLE")
                db.add(veh)
                db.flush()
                db.add(VehicleImage(vehicle_id=veh.id, image_url=img_url, is_primary=True))
            elif not existing.images:
                img_url = v_dict.get("image", "/logo.png")
                db.add(VehicleImage(vehicle_id=existing.id, image_url=img_url, is_primary=True))
        db.commit()
    except Exception as e:
        print("Vehicle seed error:", e)
    finally:
        db.close()

def init_db_once():
    global _db_initialized
    if _db_initialized:
        return
    try:
        Base.metadata.create_all(bind=engine)
        auto_migrate()
        create_initial_admin()
        auto_seed_vehicles()
    except Exception as e:
        print("DB init error:", e)
    finally:
        _db_initialized = True

app = FastAPI(
    title="Vehicle Rental API",
    description="API for Vehicle Rental Management Platform",
    version="1.0.0"
)

@app.on_event("startup")
def on_startup():
    init_db_once()

@app.middleware("http")
async def ensure_db_initialized(request: Request, call_next):
    if not _db_initialized:
        init_db_once()
    response = await call_next(request)
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global exception on {request.method} {request.url}: {exc}")
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__, "path": str(request.url)}
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])

app.include_router(admin_vehicles.router, prefix="/api/admin/vehicles", tags=["admin_vehicles"])
app.include_router(admin_vehicles.router, prefix="/admin/vehicles", tags=["admin_vehicles"])

app.include_router(vehicles.router, prefix="/api/vehicles", tags=["vehicles"])
app.include_router(vehicles.router, prefix="/vehicles", tags=["vehicles"])

app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(bookings.router, prefix="/bookings", tags=["bookings"])

app.include_router(admin_bookings.router, prefix="/api/admin/bookings", tags=["admin_bookings"])
app.include_router(admin_bookings.router, prefix="/admin/bookings", tags=["admin_bookings"])

app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])

app.include_router(office.router, prefix="/api/office", tags=["office"])
app.include_router(office.router, prefix="/office", tags=["office"])

app.include_router(reviews.router, prefix="/api", tags=["reviews"])
app.include_router(reviews.router, prefix="", tags=["reviews"])

@app.get("/")
def read_root():
    return {"message": "Vehicle Rental API is running"}

@app.get("/api")
def read_api_root():
    return {"message": "Vehicle Rental API is running"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/health")
def health_check_short():
    return {"status": "ok"}
