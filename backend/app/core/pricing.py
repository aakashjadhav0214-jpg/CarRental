from datetime import datetime
from typing import Tuple, Dict
import math

TAX_RATE = 0.18

def calculate_duration_hours(pickup: datetime, return_dt: datetime) -> int:
    delta = return_dt - pickup
    # Round up to the next full hour
    hours = math.ceil(delta.total_seconds() / 3600.0)
    return max(1, hours) # Minimum 1 hour rental

def calculate_pricing(duration_hours: int, daily_price: float, hourly_price: float = None, security_deposit: float = 0.0) -> Dict[str, float]:
    days = max(1, math.ceil(duration_hours / 24.0))
    base_price = days * daily_price
    tax = base_price * TAX_RATE
    total_amount = base_price + tax + security_deposit
    
    return {
        "duration_hours": duration_hours,
        "duration_days": days,
        "base_price": round(base_price, 2),
        "tax": round(tax, 2),
        "deposit": round(security_deposit, 2),
        "discount": 0.0,
        "total_amount": round(total_amount, 2)
    }

