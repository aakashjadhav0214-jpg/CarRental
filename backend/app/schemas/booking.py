from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class AvailabilityCheck(BaseModel):
    pickup_datetime: datetime
    return_datetime: datetime

class AvailabilityResponse(BaseModel):
    available: bool
    reason: Optional[str] = None
    calculated_duration_hours: Optional[int] = None
    estimated_base_price: Optional[float] = None
    pricing: Optional[dict] = None
    alternatives: Optional[List[Any]] = None

class BookingCreate(BaseModel):
    vehicle_id: str
    pickup_datetime: datetime
    return_datetime: datetime

class PaymentResponse(BaseModel):
    id: str
    gateway_order_id: Optional[str] = None
    amount: float
    status: str

    class Config:
        from_attributes = True

class BookingUser(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    
    class Config:
        from_attributes = True

class BookingVehicle(BaseModel):
    id: str
    brand: str
    model: str
    
    class Config:
        from_attributes = True

class BookingResponse(BaseModel):
    id: str
    booking_number: str
    vehicle_id: str
    user_id: str
    pickup_datetime: datetime
    return_datetime: datetime
    duration: int
    base_price: float
    tax: float
    deposit: float
    discount: float
    total_amount: float
    booking_status: str
    payment_status: str
    created_at: datetime
    payment: Optional[PaymentResponse] = None
    user: Optional[BookingUser] = None
    vehicle: Optional[BookingVehicle] = None

    class Config:
        from_attributes = True

class BookingStatusUpdate(BaseModel):
    booking_status: str # CONFIRMED, ACTIVE, COMPLETED, CANCELLED

class BookingExtendRequest(BaseModel):
    new_return_datetime: datetime

class WhatsAppLinkResponse(BaseModel):
    whatsapp_url: str
    message_text: str

