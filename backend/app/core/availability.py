from datetime import datetime
from sqlalchemy.orm import Session
from ..models.booking import Booking

def check_vehicle_availability(db: Session, vehicle_id: str, pickup: datetime, return_dt: datetime) -> bool:
    """
    Check if a vehicle is available for the given timeframe.
    Returns True if available, False if there's an overlapping booking.
    """
    if pickup >= return_dt:
        return False
        
    # Find any booking that overlaps with the requested time
    # Overlap condition: existing_pickup < new_return AND existing_return > new_pickup
    overlapping_booking = db.query(Booking).filter(
        Booking.vehicle_id == vehicle_id,
        Booking.booking_status.in_(["CONFIRMED", "ACTIVE"]),
        Booking.pickup_datetime < return_dt,
        Booking.return_datetime > pickup
    ).first()

    
    return overlapping_booking is None
