import uuid
import math
import random
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import deps
from ...models.booking import Booking, Payment
from ...models.vehicle import Vehicle
from ...models.user import User
from ...schemas.booking import BookingCreate, BookingResponse, AvailabilityCheck, AvailabilityResponse
from ...core.availability import check_vehicle_availability
from ...core.pricing import calculate_duration_hours, calculate_pricing

router = APIRouter()

@router.post("/availability", response_model=AvailabilityResponse)
def check_availability(check: AvailabilityCheck, vehicle_id: str, db: Session = Depends(deps.get_db)):
    pickup_dt = check.pickup_datetime
    return_dt = check.return_datetime
    
    if pickup_dt.tzinfo is None:
        pickup_dt = pickup_dt.replace(tzinfo=timezone.utc)
    if return_dt.tzinfo is None:
        return_dt = return_dt.replace(tzinfo=timezone.utc)
        
    now = datetime.now(timezone.utc)
    
    if pickup_dt >= return_dt:
        return AvailabilityResponse(available=False, reason="Drop-off date/time must be after pickup date/time.")

    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle or vehicle.status != "AVAILABLE":
        return AvailabilityResponse(available=False, reason="Vehicle is currently unavailable.")
        
    is_available = check_vehicle_availability(db, vehicle_id, pickup_dt, return_dt)
    if not is_available:
        alternatives = []
        similar_vehicles = db.query(Vehicle).filter(
            Vehicle.id != vehicle_id,
            Vehicle.category == vehicle.category,
            Vehicle.status == "AVAILABLE"
        ).all()
        for sv in similar_vehicles:
            if check_vehicle_availability(db, sv.id, pickup_dt, return_dt):
                images = [{"image_url": i.image_url, "is_primary": i.is_primary} for i in sv.images]
                alternatives.append({
                    "id": sv.id,
                    "brand": sv.brand,
                    "model": sv.model,
                    "daily_price": sv.daily_price,
                    "images": images
                })
                if len(alternatives) >= 3:
                    break
        return AvailabilityResponse(available=False, reason="Vehicle is already booked for this period", alternatives=alternatives)
        
    duration = calculate_duration_hours(pickup_dt, return_dt)
    duration_days = max(1, math.ceil(duration / 24))
    base_price = duration_days * vehicle.daily_price
    gst_amount = base_price * 0.18
    total_price = base_price + gst_amount + vehicle.security_deposit
    
    pricing = {
        "duration_hours": duration,
        "duration_days": duration_days,
        "base_price": base_price,
        "gst_amount": gst_amount,
        "security_deposit": vehicle.security_deposit,
        "total_price": total_price
    }
    
    return AvailabilityResponse(
        available=True,
        calculated_duration_hours=duration,
        estimated_base_price=base_price,
        pricing=pricing
    )

@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: BookingCreate, 
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    pickup_dt = booking_in.pickup_datetime
    return_dt = booking_in.return_datetime
    
    if pickup_dt.tzinfo is None:
        pickup_dt = pickup_dt.replace(tzinfo=timezone.utc)
    if return_dt.tzinfo is None:
        return_dt = return_dt.replace(tzinfo=timezone.utc)
        
    now = datetime.now(timezone.utc)
    # 15 minute grace period for pickup in past
    if pickup_dt < (now - timedelta(minutes=15)):
        raise HTTPException(status_code=400, detail="Pickup time cannot be in the past")
        
    vehicle = db.query(Vehicle).filter(Vehicle.id == booking_in.vehicle_id).first()
    if not vehicle or vehicle.status != "AVAILABLE":
        raise HTTPException(status_code=404, detail="Vehicle not available")
        
    if not check_vehicle_availability(db, vehicle.id, pickup_dt, return_dt):
        raise HTTPException(status_code=400, detail="Vehicle is already booked for this time period")
        
    # Calculate pricing
    duration = calculate_duration_hours(pickup_dt, return_dt)
    pricing = calculate_pricing(duration, vehicle.daily_price, vehicle.hourly_price, vehicle.security_deposit)
    
    # Generate unique 8-digit numeric booking number
    while True:
        numeric_code = str(random.randint(10000000, 99999999))
        if not db.query(Booking).filter(Booking.booking_number == numeric_code).first():
            booking_number = numeric_code
            break
    
    db_booking = Booking(
        booking_number=booking_number,
        user_id=current_user.id,
        vehicle_id=vehicle.id,
        pickup_datetime=pickup_dt,
        return_datetime=return_dt,
        duration=duration,
        base_price=pricing["base_price"],
        tax=pricing["tax"],
        deposit=pricing["deposit"],
        discount=pricing["discount"],
        total_amount=pricing["total_amount"],
        booking_status="PENDING",
        payment_status="PENDING"
    )
    
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    
    # Create empty payment record for Razorpay integration
    db_payment = Payment(
        booking_id=db_booking.id,
        amount=pricing["total_amount"]
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_booking)
    
    return db_booking


@router.get("/my", response_model=List[BookingResponse])
def get_my_bookings(db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    return db.query(Booking).filter(Booking.user_id == current_user.id).order_by(Booking.created_at.desc()).all()

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: str, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.user_id == current_user.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.patch("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(booking_id: str, db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.user_id == current_user.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if booking.booking_status not in ["PENDING", "CONFIRMED"]:
        raise HTTPException(status_code=400, detail="Cannot cancel an active or completed booking")
        
    booking.booking_status = "CANCELLED"
    db.commit()
    db.refresh(booking)
    return booking

from ...schemas.booking import BookingExtendRequest, WhatsAppLinkResponse
import urllib.parse

@router.post("/{booking_id}/extend", response_model=BookingResponse)
def extend_booking(
    booking_id: str,
    extend_in: BookingExtendRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if current_user.role != "ADMIN" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to extend this booking")

    new_return_dt = extend_in.new_return_datetime
    if new_return_dt.tzinfo is None:
        new_return_dt = new_return_dt.replace(tzinfo=timezone.utc)

    current_return_dt = booking.return_datetime
    if current_return_dt.tzinfo is None:
        current_return_dt = current_return_dt.replace(tzinfo=timezone.utc)

    if new_return_dt <= current_return_dt:
        raise HTTPException(status_code=400, detail="New return date must be after the current return date")

    # Check vehicle availability for the extension period
    is_available = check_vehicle_availability(db, booking.vehicle_id, current_return_dt, new_return_dt, exclude_booking_id=booking.id)
    if not is_available:
        raise HTTPException(status_code=400, detail="Vehicle is already booked by another customer for the requested extension period")

    vehicle = db.query(Vehicle).filter(Vehicle.id == booking.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    pickup_dt = booking.pickup_datetime
    if pickup_dt.tzinfo is None:
        pickup_dt = pickup_dt.replace(tzinfo=timezone.utc)

    # Recalculate duration & pricing
    duration = calculate_duration_hours(pickup_dt, new_return_dt)
    duration_days = max(1, math.ceil(duration / 24))
    base_price = duration_days * vehicle.daily_price
    gst_amount = base_price * 0.18
    total_amount = base_price + gst_amount + vehicle.security_deposit

    booking.return_datetime = new_return_dt
    booking.duration = duration
    booking.base_price = base_price
    booking.tax = gst_amount
    booking.total_amount = total_amount
    booking.deposit = vehicle.security_deposit

    if booking.payment:
        booking.payment.amount = total_amount

    db.commit()
    db.refresh(booking)
    return booking


@router.get("/{booking_id}/whatsapp-link", response_model=WhatsAppLinkResponse)
def get_whatsapp_link(
    booking_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    vehicle = db.query(Vehicle).filter(Vehicle.id == booking.vehicle_id).first()
    vehicle_name = f"{vehicle.brand} {vehicle.model}" if vehicle else "Self-Drive Vehicle"

    pickup_str = booking.pickup_datetime.strftime("%d %b %Y at %I:%M %p")
    return_str = booking.return_datetime.strftime("%d %b %Y at %I:%M %p")

    msg = (
        f"🚩 *SHRI KRISHNA CAR & BIKE RENTALS - HASSAN* 🚩\n"
        f"*Booking Receipt / Confirmation*\n"
        f"----------------------------------------\n"
        f"*Booking Number:* #{booking.booking_number}\n"
        f"*Vehicle:* {vehicle_name}\n"
        f"*Pickup:* {pickup_str}\n"
        f"*Drop-off:* {return_str}\n"
        f"*Total Amount:* ₹{booking.total_amount:.2f}\n"
        f"*Status:* {booking.booking_status}\n\n"
        f"📍 *Pickup Location:* 232J+JQC, Near Canara Bank (Guddenahalli), B.M. Road, Hassan, Karnataka - 573201\n"
        f"🗺️ *Google Maps Pin:* https://www.google.com/maps/place/13%C2%B000'05.6%22N+76%C2%B004'54.8%22E/@13.0015667,76.0818759,17z\n\n"
        f"📞 *24/7 Helpline:* +91 72598 57486 | +91 95133 48666\n"
        f"Thank you for booking with Shri Krishna Rentals! Drive safe."
    )

    encoded_msg = urllib.parse.quote(msg)
    whatsapp_url = f"https://wa.me/917259857486?text={encoded_msg}"

    return WhatsAppLinkResponse(whatsapp_url=whatsapp_url, message_text=msg)

