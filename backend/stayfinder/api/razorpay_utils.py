import razorpay
import os
from django.conf import settings

# Initialize Razorpay client
client = razorpay.Client(
    auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET"))
)

def create_razorpay_order(amount, currency="INR", receipt="", notes=None):
    """
    Create a Razorpay order
    
    Args:
        amount: Amount in paise (multiply rupees by 100)
        currency: Currency code (default: INR)
        receipt: Receipt ID for tracking
        notes: Additional notes/metadata
    
    Returns:
        Order details or error
    """
    try:
        order_data = {
            "amount": int(amount * 100),  # Convert to paise
            "currency": currency,
            "receipt": receipt,
            "notes": notes or {}
        }
        
        order = client.order.create(data=order_data)
        return {
            "success": True,
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"]
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def verify_razorpay_payment(razorpay_payment_id, razorpay_order_id, razorpay_signature, secret):
    """
    Verify Razorpay payment signature
    
    Args:
        razorpay_payment_id: Payment ID from Razorpay
        razorpay_order_id: Order ID from Razorpay
        razorpay_signature: Signature from Razorpay
        secret: Secret key for verification
    
    Returns:
        True if signature is valid, False otherwise
    """
    import hmac
    import hashlib
    
    try:
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        signature = hmac.new(
            secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return signature == razorpay_signature
    except Exception as e:
        return False


def fetch_payment_details(payment_id):
    """
    Fetch payment details from Razorpay
    
    Args:
        payment_id: Razorpay payment ID
    
    Returns:
        Payment details
    """
    try:
        payment = client.payment.fetch(payment_id)
        return {
            "success": True,
            "payment": payment
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def fetch_order_details(order_id):
    """
    Fetch order details from Razorpay
    
    Args:
        order_id: Razorpay order ID
    
    Returns:
        Order details
    """
    try:
        order = client.order.fetch(order_id)
        return {
            "success": True,
            "order": order
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
