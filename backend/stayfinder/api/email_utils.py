from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from datetime import datetime
import os


def send_booking_confirmation_email(booking, customer_email):
    """
    Send booking confirmation email to customer
    """
    try:
        subject = f"Booking Confirmed - {booking.booking_token}"
        
        context = {
            'customer_name': booking.user.first_name or booking.user.username,
            'hotel_name': booking.hotel.title,
            'hotel_location': booking.hotel.location,
            'check_in': booking.check_in,
            'check_out': booking.check_out,
            'guest_count': booking.guest_count,
            'total_amount': booking.total_amount,
            'payment_method': booking.get_payment_method_display() if booking.payment_method else 'Card',
            'booking_token': booking.booking_token,
            'order_date': booking.created_at.strftime('%d %b %Y'),
        }
        
        html_message = render_to_string('booking_confirmation_email.html', context)
        
        send_mail(
            subject,
            f"Your booking {booking.booking_token} is confirmed",
            settings.DEFAULT_FROM_EMAIL,
            [customer_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return {"success": True, "message": "Email sent to customer"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def send_payment_confirmation_to_owner(booking):
    """
    Send payment confirmation and booking details to hotel owner
    """
    try:
        if not booking.hotel.owner or not booking.hotel.owner.user.email:
            return {"success": False, "error": "Owner email not found"}
        
        owner_email = booking.hotel.owner.user.email
        subject = f"New Booking - {booking.hotel.title} ({booking.booking_token})"
        
        context = {
            'owner_name': booking.hotel.owner.user.first_name or booking.hotel.owner.user.username,
            'hotel_name': booking.hotel.title,
            'customer_name': booking.user.first_name or booking.user.username,
            'customer_email': booking.guest_email or booking.user.email,
            'check_in': booking.check_in,
            'check_out': booking.check_out,
            'guest_count': booking.guest_count,
            'total_amount': booking.total_amount,
            'payment_method': booking.get_payment_method_display() if booking.payment_method else 'Card',
            'booking_token': booking.booking_token,
            'payment_status': booking.get_payment_status_display(),
            'order_date': booking.created_at.strftime('%d %b %Y'),
        }
        
        html_message = render_to_string('owner_payment_confirmation_email.html', context)
        
        send_mail(
            subject,
            f"New booking received for {booking.hotel.title}",
            settings.DEFAULT_FROM_EMAIL,
            [owner_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return {"success": True, "message": "Email sent to hotel owner"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def send_payment_failure_email(booking, customer_email, reason="Payment declined"):
    """
    Send payment failure notification email
    """
    try:
        subject = f"Payment Failed - {booking.booking_token}"
        
        context = {
            'customer_name': booking.user.first_name or booking.user.username,
            'hotel_name': booking.hotel.title,
            'total_amount': booking.total_amount,
            'reason': reason,
            'booking_token': booking.booking_token,
        }
        
        html_message = render_to_string('payment_failure_email.html', context)
        
        send_mail(
            subject,
            f"Payment failed for booking {booking.booking_token}",
            settings.DEFAULT_FROM_EMAIL,
            [customer_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return {"success": True, "message": "Failure email sent to customer"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def send_booking_cancelled_email(booking, customer_email, reason=""):
    """
    Send booking cancellation email
    """
    try:
        subject = f"Booking Cancelled - {booking.booking_token}"
        
        context = {
            'customer_name': booking.user.first_name or booking.user.username,
            'hotel_name': booking.hotel.title,
            'total_amount': booking.total_amount,
            'reason': reason or "Booking was cancelled by the user",
            'booking_token': booking.booking_token,
        }
        
        html_message = render_to_string('booking_cancelled_email.html', context)
        
        send_mail(
            subject,
            f"Booking {booking.booking_token} has been cancelled",
            settings.DEFAULT_FROM_EMAIL,
            [customer_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        return {"success": True, "message": "Cancellation email sent to customer"}
    except Exception as e:
        return {"success": False, "error": str(e)}
