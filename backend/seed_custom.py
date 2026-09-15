import os
import sys
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.vehicle import Vehicle, VehicleImage

Base.metadata.create_all(bind=engine)

def seed_vehicles():
    db: Session = SessionLocal()
    
    vehicles_data = [
        {
            "category": "Bikes",
            "brand": "KTM",
            "model": "Duke 390",
            "registration_number": "KA01AB1234",
            "year": 2023,
            "fuel_type": "Petrol",
            "transmission": "Manual",
            "engine_capacity": "373cc",
            "seats": 2,
            "description": "The KTM 390 Duke is a pure example of what draws so many to the thrill of street motorcycling.",
            "features": "ABS, Digital Console, Disc Brakes",
            "daily_price": 1500,
            "security_deposit": 3000,
            "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop"
        },
        {
            "category": "Bikes",
            "brand": "Bajaj",
            "model": "Pulsar N160",
            "registration_number": "KA02CD5678",
            "year": 2023,
            "fuel_type": "Petrol",
            "transmission": "Manual",
            "engine_capacity": "164cc",
            "seats": 2,
            "description": "The Bajaj Pulsar N160 is a great daily commuter with sporty looks and refined engine.",
            "features": "Dual Channel ABS, LED Headlamps",
            "daily_price": 800,
            "security_deposit": 1500,
            "image": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000&auto=format&fit=crop"
        },
        {
            "category": "Mopeds/Scooters",
            "brand": "TVS",
            "model": "Jupiter",
            "registration_number": "KA03EF9012",
            "year": 2022,
            "fuel_type": "Petrol",
            "transmission": "Automatic",
            "engine_capacity": "110cc",
            "seats": 2,
            "description": "TVS Jupiter is a comfortable and highly fuel-efficient scooter perfect for city rides.",
            "features": "USB Charging, Large Underseat Storage",
            "daily_price": 500,
            "security_deposit": 1000,
            "image": "https://images.unsplash.com/photo-1605816988069-b11383b50717?q=80&w=1000&auto=format&fit=crop"
        },
        {
            "category": "Mopeds/Scooters",
            "brand": "Suzuki",
            "model": "Access",
            "registration_number": "KA04GH3456",
            "year": 2023,
            "fuel_type": "Petrol",
            "transmission": "Automatic",
            "engine_capacity": "125cc",
            "seats": 2,
            "description": "Suzuki Access 125 blends power and mileage seamlessly for everyday commuting.",
            "features": "Retro styling, Bluetooth Connectivity",
            "daily_price": 550,
            "security_deposit": 1000,
            "image": "https://images.unsplash.com/photo-1626042795893-a9d06e2edc41?q=80&w=1000&auto=format&fit=crop"
        },
        {
            "category": "Mopeds/Scooters",
            "brand": "Honda",
            "model": "Dio",
            "registration_number": "KA05IJ7890",
            "year": 2023,
            "fuel_type": "Petrol",
            "transmission": "Automatic",
            "engine_capacity": "110cc",
            "seats": 2,
            "description": "Honda Dio stands out with its sporty design and peppy engine performance.",
            "features": "LED Headlamp, Fully Digital Meter",
            "daily_price": 500,
            "security_deposit": 1000,
            "image": "https://images.unsplash.com/photo-1595180026261-26732386a34c?q=80&w=1000&auto=format&fit=crop"
        },
        {
            "category": "Cars",
            "brand": "Hyundai",
            "model": "Verna",
            "registration_number": "KA06KL1234",
            "year": 2023,
            "fuel_type": "Petrol",
            "transmission": "Automatic",
            "engine_capacity": "1500cc",
            "seats": 5,
            "description": "Hyundai Verna is a premium sedan with futuristic looks, packed with comfort and safety features.",
            "features": "Sunroof, Ventilated Seats, ADAS",
            "daily_price": 2500,
            "security_deposit": 5000,
            "image": "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1000&auto=format&fit=crop"
        },
        {
            "category": "Cars",
            "brand": "Mahindra",
            "model": "XUV500",
            "registration_number": "KA07MN5678",
            "year": 2021,
            "fuel_type": "Diesel",
            "transmission": "Manual",
            "engine_capacity": "2200cc",
            "seats": 7,
            "description": "The Mahindra XUV500 is a powerful, spacious SUV designed for long family trips and tough terrains.",
            "features": "7-Seater, AWD, Touchscreen Infotainment",
            "daily_price": 3000,
            "security_deposit": 5000,
            "image": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000&auto=format&fit=crop"
        },
        {
            "category": "Cars",
            "brand": "Mahindra",
            "model": "Xylo",
            "registration_number": "KA08OP9012",
            "year": 2018,
            "fuel_type": "Diesel",
            "transmission": "Manual",
            "engine_capacity": "2500cc",
            "seats": 7,
            "description": "Mahindra Xylo is known for its extreme cabin space and comfortable ride quality.",
            "features": "Captain Seats, Rear AC Vents",
            "daily_price": 2000,
            "security_deposit": 4000,
            "image": "https://images.unsplash.com/photo-1517153295259-74eb0b416cee?q=80&w=1000&auto=format&fit=crop"
        }
    ]

    print("Seeding new vehicles...")
    for v_data in vehicles_data:
        # Check if exists
        existing = db.query(Vehicle).filter_by(registration_number=v_data["registration_number"]).first()
        if not existing:
            vehicle = Vehicle(
                category=v_data["category"],
                brand=v_data["brand"],
                model=v_data["model"],
                registration_number=v_data["registration_number"],
                year=v_data["year"],
                fuel_type=v_data["fuel_type"],
                transmission=v_data["transmission"],
                engine_capacity=v_data["engine_capacity"],
                seats=v_data["seats"],
                description=v_data["description"],
                features=v_data["features"],
                daily_price=v_data["daily_price"],
                security_deposit=v_data["security_deposit"],
                status="AVAILABLE"
            )
            db.add(vehicle)
            db.flush()
            
            image = VehicleImage(
                vehicle_id=vehicle.id,
                image_url=v_data["image"],
                is_primary=True
            )
            db.add(image)
            print(f"Added {v_data['brand']} {v_data['model']}")
        else:
            print(f"Skipped {v_data['brand']} {v_data['model']} (already exists)")
            
    db.commit()
    print("Seed complete.")

if __name__ == "__main__":
    seed_vehicles()
