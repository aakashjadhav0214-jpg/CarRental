from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class VehicleImageBase(BaseModel):
    image_url: str
    is_primary: bool = False

class VehicleImageCreate(VehicleImageBase):
    pass

class VehicleImageResponse(VehicleImageBase):
    id: str
    vehicle_id: str

    class Config:
        from_attributes = True

class VehicleBase(BaseModel):
    category: str = Field(..., description="Bikes, Mopeds/Scooters, Cars")
    brand: str
    model: str
    registration_number: str
    year: int
    fuel_type: str
    transmission: str
    engine_capacity: Optional[str] = None
    seats: int
    description: Optional[str] = None
    features: Optional[str] = None
    daily_price: float
    security_deposit: float
    km_limit: Optional[int] = 300
    extra_km_charge: Optional[float] = 10.0
    status: str = "AVAILABLE"

class VehicleCreate(VehicleBase):
    images: Optional[List[VehicleImageCreate]] = []

class VehicleUpdate(BaseModel):
    category: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    registration_number: Optional[str] = None
    year: Optional[int] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    engine_capacity: Optional[str] = None
    seats: Optional[int] = None
    description: Optional[str] = None
    features: Optional[str] = None
    hourly_price: Optional[float] = None
    daily_price: Optional[float] = None
    security_deposit: Optional[float] = None
    status: Optional[str] = None
    images: Optional[List[VehicleImageCreate]] = None

class VehicleResponse(VehicleBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime]
    images: List[VehicleImageResponse] = []

    class Config:
        from_attributes = True
