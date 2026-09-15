from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from ...models.review import Review
from ...models.booking import Booking
from ...models.vehicle import Vehicle
from ...models.user import User
from ...schemas.review import ReviewCreate, ReviewOut
from ..deps import get_db, get_current_user, get_current_admin_user

router = APIRouter(prefix="/reviews", tags=["Reviews & Feedback"])

@router.post("", response_model=ReviewOut)
def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check booking exists and belongs to user
    booking = db.query(Booking).filter(
        Booking.id == review_in.booking_id,
        Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found or does not belong to you."
        )
    
    # Check if review already exists for this booking
    existing = db.query(Review).filter(Review.booking_id == review_in.booking_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted feedback for this ride."
        )
    
    db_review = Review(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        vehicle_id=review_in.vehicle_id,
        booking_id=review_in.booking_id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    vehicle = db.query(Vehicle).filter(Vehicle.id == db_review.vehicle_id).first()
    
    return ReviewOut(
        id=db_review.id,
        user_id=db_review.user_id,
        vehicle_id=db_review.vehicle_id,
        booking_id=db_review.booking_id,
        rating=db_review.rating,
        comment=db_review.comment,
        user_name=current_user.name or "Verified Customer",
        vehicle_name=f"{vehicle.make} {vehicle.model}" if vehicle else "Vehicle",
        created_at=db_review.created_at
    )

@router.get("/my-reviews", response_model=List[ReviewOut])
def get_my_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reviews = db.query(Review).filter(Review.user_id == current_user.id).all()
    results = []
    for r in reviews:
        vehicle = db.query(Vehicle).filter(Vehicle.id == r.vehicle_id).first()
        results.append(ReviewOut(
            id=r.id,
            user_id=r.user_id,
            vehicle_id=r.vehicle_id,
            booking_id=r.booking_id,
            rating=r.rating,
            comment=r.comment,
            user_name=current_user.name or "Verified Customer",
            vehicle_name=f"{vehicle.make} {vehicle.model}" if vehicle else "Vehicle",
            created_at=r.created_at
        ))
    return results

@router.get("/public", response_model=List[ReviewOut])
def get_public_reviews(
    db: Session = Depends(get_db)
):
    reviews = db.query(Review).order_by(Review.created_at.desc()).limit(12).all()
    results = []
    for r in reviews:
        u = db.query(User).filter(User.id == r.user_id).first()
        v = db.query(Vehicle).filter(Vehicle.id == r.vehicle_id).first()
        results.append(ReviewOut(
            id=r.id,
            user_id=r.user_id,
            vehicle_id=r.vehicle_id,
            booking_id=r.booking_id,
            rating=r.rating,
            comment=r.comment,
            user_name=u.name if u else "Satisfied Rider",
            vehicle_name=f"{v.make} {v.model}" if v else "Rental Ride",
            created_at=r.created_at
        ))
    return results

@router.get("/admin/all", response_model=List[ReviewOut])
def get_all_reviews_admin(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    reviews = db.query(Review).order_by(Review.created_at.desc()).all()
    results = []
    for r in reviews:
        u = db.query(User).filter(User.id == r.user_id).first()
        v = db.query(Vehicle).filter(Vehicle.id == r.vehicle_id).first()
        results.append(ReviewOut(
            id=r.id,
            user_id=r.user_id,
            vehicle_id=r.vehicle_id,
            booking_id=r.booking_id,
            rating=r.rating,
            comment=r.comment,
            user_name=u.name if u else "Customer",
            vehicle_name=f"{v.make} {v.model}" if v else "Vehicle",
            created_at=r.created_at
        ))
    return results
