import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    category = Column(String, nullable=False, index=True) # Bikes, Mopeds/Scooters, Cars
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    registration_number = Column(String, unique=True, nullable=False)
    year = Column(Integer, nullable=False)
    fuel_type = Column(String, nullable=False)
    transmission = Column(String, nullable=False)
    engine_capacity = Column(String, nullable=True)
    seats = Column(Integer, nullable=False)
    description = Column(String, nullable=True)
    features = Column(String, nullable=True) # Stored as JSON string or comma-separated
    
    hourly_price = Column(Float, nullable=True)
    daily_price = Column(Float, nullable=False)
    security_deposit = Column(Float, nullable=False)
    km_limit = Column(Integer, default=300)
    extra_km_charge = Column(Float, default=10.0)
    status = Column(String, default="AVAILABLE") # AVAILABLE, BOOKED, RENTED, MAINTENANCE, INACTIVE
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    images = relationship("VehicleImage", back_populates="vehicle", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="vehicle")


class VehicleImage(Base):
    __tablename__ = "vehicle_images"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    image_url = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)
    
    vehicle = relationship("Vehicle", back_populates="images")
