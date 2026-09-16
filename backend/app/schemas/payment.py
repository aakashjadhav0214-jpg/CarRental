from pydantic import BaseModel
from typing import Optional

class PaymentOrderResponse(BaseModel):
    order_id: str
    amount: float
    currency: str
    key_id: Optional[str] = None

class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class UPIPaymentSubmitRequest(BaseModel):
    booking_id: str
    utr_number: str
    amount_paid: Optional[float] = None

