# Payment System Integration Guide

## Quick Start

This guide will help you set up the new Razorpay payment system with UPI and Card support.

### Installation Steps

#### 1. Install Dependencies

```bash
cd backend/stayfinder
pip install razorpay==2.8.1
pip install -r requirements.txt
```

#### 2. Configure Environment Variables

Update `.env` file with your Razorpay credentials:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

#### 3. Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

#### 4. Install Frontend Dependencies (if using npm)

```bash
cd ../../Stayfront
npm install
```

---

## System Architecture

### Payment Flow Diagram

```
┌─────────────┐
│   User      │
│  Selects    │
│  Payment    │
│   Method    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│   PaymentGateway.jsx        │
│  (Frontend Component)        │
└──────┬──────────────────────┘
       │
       ├─ POST /api/payment/create-order/
       │
       ▼
┌─────────────────────────────┐
│  Backend API                │
│  1. Validate Request        │
│  2. Create Razorpay Order   │
│  3. Create Booking Record   │
│  4. Return Order Details    │
└──────┬──────────────────────┘
       │
       ├─ Response: {
       │    razorpay_order_id,
       │    razorpay_key,
       │    amount,
       │    currency
       │  }
       │
       ▼
┌──────────────────────────┐
│  Razorpay Modal          │
│  Payment Processing      │
└──────┬───────────────────┘
       │
       ├─ User Completes Payment
       │
       ▼
┌──────────────────────────────┐
│ Frontend                      │
│ GET razorpay_payment_id       │
│ GET razorpay_signature        │
└──────┬───────────────────────┘
       │
       ├─ POST /api/payment/verify/
       │
       ▼
┌──────────────────────────────┐
│  Backend Verification        │
│  1. Verify Signature         │
│  2. Update Booking Status    │
│  3. Send Confirmation Emails │
│  4. Return Success           │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Confirmation Page           │
│  (BookingTicket)             │
│  Show Booking & Payment Info │
└──────────────────────────────┘
```

---

## API Endpoints

### 1. Create Payment Order

**Endpoint:** `POST /api/payment/create-order/`

**Authorization:** Bearer Token Required

**Request Body:**

```json
{
  "hotel_id": 1,
  "total_amount": 5000,
  "check_in": "2024-02-20",
  "check_out": "2024-02-22",
  "guest_count": 2,
  "guest_email": "guest@example.com",
  "payment_method": "card"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "booking_id": 123,
  "booking_token": "STF-456-5000-ABC123",
  "razorpay_order_id": "order_xyz123",
  "amount": 500000,
  "currency": "INR",
  "razorpay_key": "rzp_test_xxxxx",
  "customer_name": "John Doe",
  "customer_email": "john@example.com"
}
```

---

### 2. Verify Payment

**Endpoint:** `POST /api/payment/verify/`

**Authorization:** Bearer Token Required

**Request Body:**

```json
{
  "razorpay_payment_id": "pay_abc123",
  "razorpay_order_id": "order_xyz123",
  "razorpay_signature": "signature_here",
  "booking_id": 123
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "booking": {
    "id": 123,
    "hotel": {...},
    "check_in": "2024-02-20",
    "check_out": "2024-02-22",
    "guest_count": 2,
    "total_amount": "5000.00",
    "payment_status": "completed",
    "payment_method": "card"
  }
}
```

---

### 3. Record Payment Failure

**Endpoint:** `POST /api/payment/failed/`

**Authorization:** Bearer Token Required

**Request Body:**

```json
{
  "booking_id": 123,
  "reason": "Payment declined by bank"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment failure recorded"
}
```

---

## Database Schema

### Booking Model Changes

```python
class Booking(models.Model):
    # Existing fields
    user = ForeignKey(User)
    hotel = ForeignKey(Hotel)
    check_in = DateField()
    check_out = DateField()
    guest_count = IntegerField()
    guest_email = EmailField()
    booking_token = CharField(unique=True)
    total_amount = DecimalField()
    created_at = DateTimeField(auto_now_add=True)

    # NEW FIELDS
    payment_status = CharField(
        choices=[
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
            ('cancelled', 'Cancelled'),
        ],
        default='pending'
    )
    payment_method = CharField(
        choices=[
            ('card', 'Debit/Credit Card'),
            ('upi', 'UPI'),
        ]
    )
    razorpay_order_id = CharField(unique=True, null=True)
    razorpay_payment_id = CharField(null=True)
    updated_at = DateTimeField(auto_now=True)
```

---

## Email Notifications

### Customer Receives:

1. **Booking Confirmation** - After successful payment
2. **Payment Failure Alert** - If payment fails
3. **Cancellation Notice** - If booking is cancelled

### Hotel Owner Receives:

1. **New Booking Alert** - When customer completes payment
   - Includes guest details and contact information
   - Payment confirmation
   - Check-in/check-out dates

---

## Security Notes

### ✅ Implemented Security Features

- Razorpay signature verification (HMAC-SHA256)
- No sensitive payment data stored locally
- Secure HTTPS communication
- PCI DSS compliant
- Encrypted email transmission
- Input validation on all endpoints

### 🔒 Best Practices

1. **Never log sensitive data:**
   - Don't log card numbers
   - Don't log UPI IDs
   - Don't log payment IDs in production

2. **Environment Variables:**
   - Keep secrets in `.env` file
   - Never commit `.env` to GitHub
   - Use different keys for dev/staging/production

3. **HTTPS Only:**
   - Always use HTTPS in production
   - Set `SECURE_SSL_REDIRECT = True`
   - Set `SESSION_COOKIE_SECURE = True`

---

## Testing

### Test Razorpay Account Setup

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to Settings → API Keys
3. Copy Test Mode keys
4. Add to `.env`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
```

### Test Payment Methods

#### Card Payment

- **Card Number:** 4111 1111 1111 1111
- **Expiry:** 12/25
- **CVV:** 123
- **Result:** Success (authorized)

#### UPI Payment

- **UPI ID:** testmerchant@razorpay
- **Result:** Success (authorized)

### Local Testing Checklist

- [ ] Django server starts without errors
- [ ] Database migrations applied
- [ ] Can create payment order
- [ ] Razorpay modal opens
- [ ] Can complete test payment
- [ ] Payment verification succeeds
- [ ] Booking created with correct status
- [ ] Confirmation emails sent (check console/email backend)
- [ ] Redirect to booking confirmation page

---

## Troubleshooting

### Django Startup Error: "NameError: name 'os' is not defined"

**Solution:** Make sure `import os` is at the top of `settings.py`

### razorpay Module Not Found

**Solution:** Install razorpay package

```bash
pip install razorpay==2.8.1
```

### Emails Not Sending (Development)

**Default Configuration:** Emails print to console
**To Use Gmail:**

1. Enable 2FA in Gmail
2. Get App Password from account settings
3. Add to `.env`:

```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

### Payment Signature Verification Failed

**Causes:**

- Wrong `RAZORPAY_KEY_SECRET` in `.env`
- Timestamp mismatch
- Order/Payment ID mismatch

**Solution:**

- Verify keys from Razorpay dashboard
- Check server time synchronization
- Review payment request/response data

### Razorpay Modal Not Opening

**Causes:**

- Missing Razorpay script tag in PaymentGateway
- Wrong `razorpay_key` in response
- JavaScript errors in console

**Solution:**

- Check browser console for errors
- Verify script is loaded: `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`
- Verify API response includes `razorpay_key`

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests pass
- [ ] No console errors
- [ ] Database migrations applied
- [ ] Email configuration tested
- [ ] Razorpay keys verified

### Render Deployment

- [ ] Add Razorpay keys to Render environment variables
- [ ] Add email credentials to environment variables
- [ ] Set `DEBUG = False` in production settings
- [ ] Update `ALLOWED_HOSTS` with deployment domain
- [ ] Run `python manage.py collectstatic` in build command
- [ ] Run migrations in release command

### Post-Deployment

- [ ] Test payment flow in production
- [ ] Check email delivery
- [ ] Monitor error logs
- [ ] Verify booking records in database
- [ ] Test payment failure handling

---

## Common Issues & Solutions

| Issue                      | Symptom             | Solution                                           |
| -------------------------- | ------------------- | -------------------------------------------------- |
| Missing razorpay           | ModuleNotFoundError | `pip install razorpay==2.8.1`                      |
| Wrong import               | NameError: os       | Add `import os` in settings.py                     |
| API Key Error              | 401/403 response    | Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` |
| Email not sending          | Silent failure      | Check `EMAIL_BACKEND` and SMTP credentials         |
| Razorpay modal not showing | No payment form     | Check browser console, verify script loaded        |
| Payment not verified       | Signature mismatch  | Verify secret key, check timestamps                |
| CORS error                 | Frontend blocked    | Ensure `CORS_ALLOW_ALL_ORIGINS = True`             |

---

## Files Modified/Created

### Backend Files

- ✅ `api/models.py` - Updated Booking model
- ✅ `api/serializers.py` - Updated BookingSerializer
- ✅ `api/views.py` - Added payment endpoints
- ✅ `api/urls.py` - Added payment routes
- ✅ `api/razorpay_utils.py` - NEW: Razorpay utilities
- ✅ `api/email_utils.py` - NEW: Email notifications
- ✅ `api/migrations/0005_*.py` - NEW: Database migration
- ✅ `api/templates/*.html` - NEW: Email templates
- ✅ `requirements.txt` - Added razorpay dependency
- ✅ `stayfinder/settings.py` - Email & Razorpay config

### Frontend Files

- ✅ `src/component/auth/PaymentGateway.jsx` - Updated with UPI + Card

---

## Support & Resources

### Razorpay Documentation

- [Razorpay Integration Guide](https://razorpay.com/docs/)
- [Test Cards & UPI IDs](https://razorpay.com/docs/payments/test-mode/)
- [Signature Verification](https://razorpay.com/docs/payments/payloads/payment-authorized/)

### Django Documentation

- [Django Email Backend](https://docs.djangoproject.com/en/5.1/topics/email/)
- [Django Signals](https://docs.djangoproject.com/en/5.1/topics/signals/)

### Email Setup

- [Gmail App Passwords](https://myaccount.google.com/apppasswords)
- [SMTP Configuration](https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol)

---

## Version History

| Version | Date       | Changes                                                |
| ------- | ---------- | ------------------------------------------------------ |
| 2.0     | 2026-02-18 | Razorpay integration, UPI support, Email notifications |
| 1.0     | 2026-02-15 | Initial payment system                                 |

---

**Last Updated:** February 18, 2026
**Status:** Production Ready
**Maintained By:** StayFind Development Team
