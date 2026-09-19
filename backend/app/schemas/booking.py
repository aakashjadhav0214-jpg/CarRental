from pydantic import BaseModel, Field, field_serializer
from typing import Optional, List, Any
from datetime import datetime, timezone

class AvailabilityCheck(BaseModel):
    vehicle_id: Optional[str] = None
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
    gateway_payment_id: Optional[str] = None
    amount: float
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @field_serializer('created_at', 'updated_at', mode='plain')
    def serialize_dt(self, dt: Optional[datetime], _info) -> Optional[str]:
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()

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
    advance_paid: Optional[float] = 0.0
    balance_due: Optional[float] = 0.0
    booking_status: str
    payment_status: str
    created_at: datetime
    payment: Optional[PaymentResponse] = None
    user: Optional[BookingUser] = None
    vehicle: Optional[BookingVehicle] = None

    @field_serializer('pickup_datetime', 'return_datetime', 'created_at', mode='plain')
    def serialize_dt(self, dt: datetime, _info) -> str:
        if dt is None:
            return ""
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()

    class Config:
        from_attributes = True

class BookingStatusUpdate(BaseModel):
    booking_status: str # CONFIRMED, ACTIVE, COMPLETED, CANCELLED

class BookingExtendRequest(BaseModel):
    new_return_datetime: datetime

class WhatsAppLinkResponse(BaseModel):
    whatsapp_url: str
    message_text: str

