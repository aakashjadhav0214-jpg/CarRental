from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ReviewCreate(BaseModel):
    booking_id: str
    vehicle_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    id: str
    user_id: str
    vehicle_id: str
    booking_id: Optional[str] = None
    rating: int
    comment: Optional[str] = None
    user_name: Optional[str] = "Customer"
    vehicle_name: Optional[str] = "Vehicle"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
