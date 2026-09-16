import razorpay
from ..config import settings

# Initialize Razorpay Client
# It will only work if keys are provided in .env, else we fallback gracefully for the MVP UI testing
try:
    razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
except Exception:
    razorpay_client = None

def create_razorpay_order(amount: float, currency: str = "INR", receipt: str = None) -> dict:
    if not razorpay_client or not settings.RAZORPAY_KEY_ID:
        # Mock response for local dev without keys
        return {"id": "order_mock123", "amount": int(amount * 100), "currency": currency}
        
    data = {
        "amount": int(amount * 100), # Razorpay expects amount in paise
        "currency": currency,
        "receipt": receipt
    }
    
    try:
        return razorpay_client.order.create(data=data)
    except Exception as e:
        print(f"Razorpay Error: {e}. Falling back to mock order.")
        return {"id": "order_mock_fallback", "amount": int(amount * 100), "currency": currency}

def verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    if not razorpay_client:
        return True # Mock success for local dev without keys

    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        })
        return True
    except razorpay.errors.SignatureVerificationError:
        return False
