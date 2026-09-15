from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import deps
from ...models.booking import Booking
from ...schemas.booking import BookingResponse, BookingStatusUpdate

router = APIRouter()

@router.get("/", response_model=List[BookingResponse])
def get_all_bookings(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    db: Session = Depends(deps.get_db),
    current_admin = Depends(deps.get_current_admin_user)
):
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.booking_status == status)
        
    return query.order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()

@router.patch("/{booking_id}/status", response_model=BookingResponse)
def update_booking_status(
    booking_id: str,
    status_update: BookingStatusUpdate,
    db: Session = Depends(deps.get_db),
    current_admin = Depends(deps.get_current_admin_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # Valid status transitions could be enforced here
    valid_statuses = ["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"]
    if status_update.booking_status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid booking status")
        
    booking.booking_status = status_update.booking_status
    db.commit()
    db.refresh(booking)
    return booking
