import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    booking_id = Column(String, ForeignKey("bookings.id"), nullable=True)
    rating = Column(Integer, nullable=False) # 1-5
    comment = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    vehicle = relationship("Vehicle")
    booking = relationship("Booking")
