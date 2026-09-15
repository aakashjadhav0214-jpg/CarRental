import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    booking_number = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    
    pickup_datetime = Column(DateTime(timezone=True), nullable=False)
    return_datetime = Column(DateTime(timezone=True), nullable=False)
    duration = Column(Integer, nullable=False) # Duration in hours or days
    
    base_price = Column(Float, nullable=False)
    tax = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    deposit = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    
    booking_status = Column(String, default="PENDING") # PENDING, CONFIRMED, ACTIVE, COMPLETED, CANCELLED
    payment_status = Column(String, default="PENDING") # PENDING, PAID, REFUNDED
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User")
    vehicle = relationship("Vehicle", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String, ForeignKey("bookings.id"), nullable=False)
    gateway = Column(String, default="Razorpay")
    gateway_order_id = Column(String, nullable=True)
    gateway_payment_id = Column(String, nullable=True)
    
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    method = Column(String, nullable=True)
    status = Column(String, default="PENDING") # PENDING, AUTHORIZED, CAPTURED, FAILED, REFUNDED
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    booking = relationship("Booking", back_populates="payment")
