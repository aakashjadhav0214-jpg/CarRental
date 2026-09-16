import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from sqlalchemy.orm import Session
from .. import deps
from ...models.booking import Booking, Payment
from ...models.user import User
from ...schemas.payment import PaymentOrderResponse, PaymentVerifyRequest, UPIPaymentSubmitRequest
from ...core.payment import create_razorpay_order, verify_razorpay_signature
from ...config import settings

router = APIRouter()

@router.get("/qr-scanner-url")
def get_qr_scanner_url():
    for ext in [".png", ".jpg", ".jpeg", ".webp"]:
        path = os.path.join("uploads", f"gpay_scanner{ext}")
        if os.path.exists(path):
            return {"url": f"/uploads/gpay_scanner{ext}"}
    return {"url": None}

@router.post("/upload-qr-scanner")
def upload_qr_scanner(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
):

    ext = os.path.splitext(file.filename)[1].lower() or ".png"
    # Remove previous scanner files if different extension
    for old_ext in [".png", ".jpg", ".jpeg", ".webp"]:
        old_path = os.path.join("uploads", f"gpay_scanner{old_ext}")
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except Exception:
                pass
                
    target_filename = f"gpay_scanner{ext}"
    target_path = os.path.join("uploads", target_filename)
    
    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"status": "success", "url": f"/uploads/{target_filename}"}


from pydantic import BaseModel

class UPIVerifyAction(BaseModel):
    action: str # "APPROVE" or "REJECT"

@router.post("/submit-upi")
def submit_upi_payment(
    req: UPIPaymentSubmitRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == req.booking_id, Booking.user_id == current_user.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    utr = req.utr_number.strip()
    if not utr or len(utr) < 6:
        raise HTTPException(status_code=400, detail="Please enter a valid 12-digit UTR / Reference Number.")

    # 1. Prevent duplicate UTR reuse across bookings
    existing_payment = db.query(Payment).filter(
        Payment.gateway_payment_id == utr,
        Payment.booking_id != booking.id
    ).first()
    if existing_payment:
        raise HTTPException(
            status_code=400, 
            detail="This UTR / Reference Number has already been submitted for another booking."
        )

    paid_val = booking.total_amount
    if req.amount_paid and req.amount_paid > 0:
        paid_val = min(req.amount_paid, booking.total_amount)
        
    booking.advance_paid = round(paid_val, 2)
    booking.balance_due = round(max(0.0, booking.total_amount - paid_val), 2)

    payment = booking.payment
    if not payment:
        payment = Payment(booking_id=booking.id, amount=paid_val)
        db.add(payment)
    else:
        payment.amount = paid_val
        
    payment.gateway = "UPI_QR"
    payment.method = "UPI"
    payment.gateway_payment_id = utr
    payment.status = "SUBMITTED"
    
    booking.booking_status = "CONFIRMED"
    booking.payment_status = "PENDING_VERIFICATION"
    
    db.commit()
    return {"status": "success", "message": "UPI payment reference submitted successfully."}


@router.post("/verify-upi/{booking_id}")
def verify_upi_payment(
    booking_id: str,
    body: UPIVerifyAction,
    db: Session = Depends(deps.get_db),
    current_admin: User = Depends(deps.get_current_admin_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    payment = booking.payment
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
        
    if body.action == "APPROVE":
        payment.status = "CAPTURED"
        if booking.balance_due > 0:
            booking.payment_status = "ADVANCE_PAID"
        else:
            booking.payment_status = "PAID"
        booking.booking_status = "CONFIRMED"
    elif body.action == "REJECT":
        payment.status = "FAILED"
        booking.payment_status = "REJECTED"
        booking.booking_status = "CANCELLED"
    else:
        raise HTTPException(status_code=400, detail="Invalid verification action")
        
    db.commit()
    return {"status": "success", "message": f"Payment {body.action.lower()}d successfully"}


@router.post("/settle-balance/{booking_id}")
def settle_balance_payment(
    booking_id: str,
    db: Session = Depends(deps.get_db),
    current_admin: User = Depends(deps.get_current_admin_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking.advance_paid = booking.total_amount
    booking.balance_due = 0.0
    booking.payment_status = "PAID"
    
    if booking.payment:
        booking.payment.amount = booking.total_amount
        booking.payment.status = "CAPTURED"
        
    db.commit()
    return {"status": "success", "message": "Remaining balance settled successfully."}


@router.post("/create-order/{booking_id}", response_model=PaymentOrderResponse)
def create_order(
    booking_id: str, 
    db: Session = Depends(deps.get_db), 
    current_user: User = Depends(deps.get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id, Booking.user_id == current_user.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if booking.booking_status == "CANCELLED":
        raise HTTPException(status_code=400, detail="Cannot pay for a cancelled booking")
        
    payment = booking.payment
    if not payment:
        raise HTTPException(status_code=500, detail="Payment record missing")
        
    if payment.status != "PENDING":
        raise HTTPException(status_code=400, detail="Payment is already completed or refunded")

    order = create_razorpay_order(amount=payment.amount, receipt=booking.booking_number)
    
    # Save gateway order ID
    payment.gateway_order_id = order["id"]
    db.commit()
    
    return PaymentOrderResponse(
        order_id=order["id"],
        amount=payment.amount,
        currency="INR",
        key_id=settings.RAZORPAY_KEY_ID
    )

@router.post("/verify")
def verify_payment(
    verify_req: PaymentVerifyRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    is_valid = verify_razorpay_signature(
        verify_req.razorpay_order_id, 
        verify_req.razorpay_payment_id, 
        verify_req.razorpay_signature
    )
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
        
    payment = db.query(Payment).filter(Payment.gateway_order_id == verify_req.razorpay_order_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
        
    # Update payment status
    payment.gateway_payment_id = verify_req.razorpay_payment_id
    payment.status = "CAPTURED"
    
    # Auto-confirm booking
    booking = payment.booking
    booking.booking_status = "CONFIRMED"
    booking.payment_status = "PAID"
    
    db.commit()
    return {"status": "success", "message": "Payment verified and booking confirmed"}

@router.post("/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(deps.get_db)):
    # In a real scenario, you'd verify the webhook signature here using razorpay.utility.verify_webhook_signature
    payload = await request.json()
    
    event = payload.get("event")
    if event == "payment.captured":
        payment_entity = payload["payload"]["payment"]["entity"]
        order_id = payment_entity.get("order_id")
        
        if order_id:
            payment = db.query(Payment).filter(Payment.gateway_order_id == order_id).first()
            if payment and payment.status != "CAPTURED":
                payment.gateway_payment_id = payment_entity.get("id")
                payment.status = "CAPTURED"
                payment.booking.booking_status = "CONFIRMED"
                payment.booking.payment_status = "PAID"
                db.commit()
                
    return {"status": "ok"}
