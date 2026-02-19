import json
from django.http import JsonResponse
from django.conf import settings
import os
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import Hotel, Wishlist, Cart, Booking, Review
from .serializers import WishlistSerializer, CartSerializer, BookingSerializer, HotelSerializer, ReviewSerializer
from .razorpay_utils import create_razorpay_order, verify_razorpay_payment
from .email_utils import send_booking_confirmation_email, send_payment_confirmation_to_owner, send_payment_failure_email
# from .serializers import , UserCartSerializer, UserWishlistSerializer

# Health check endpoint for Render/load balancers
@api_view(['GET', 'HEAD'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for monitoring and load balancers"""
    return Response({
        "status": "ok",
        "service": "StayFind API",
        "version": "2.0"
    }, status=200)


# def HotelListView(request):
#     file_path = os.path.join(settings.BASE_DIR, 'api', 'hotels.json')
#     with open(file_path, 'r', encoding='utf-8') as f:
#         data = json.load(f)
#     return JsonResponse(data, safe=False)

from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
import jwt
import base64
import json
import requests
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.crypto import get_random_string
# ...existing code...
class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({"error": "No token provided"}, status=400)

        # Verify the token with Google
        google_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
        res = requests.get(google_url)
        if res.status_code != 200:
            return Response({"error": "Invalid token"}, status=400)

        user_data = res.json()
        email = user_data.get("email")
        name = user_data.get("name")

        user, _ = User.objects.get_or_create(
            email=email,
            defaults={"username": email, "first_name": name, "password": get_random_string(50)}
        )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Return refresh in JSON so frontend can read it (for dev / testing).
        # For production prefer HttpOnly secure cookie instead of exposing refresh token to JS.
        response = Response({
            "access": access_token,
            "refresh": refresh_token,
            "user": {"name": name, "email": email}
        })

        # Optional: also set refresh as HttpOnly cookie (comment out if you don't want cookie)
        max_age = 60 * 60 * 24 * 7  # 7 days
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=not settings.DEBUG,
            samesite='Lax',
            max_age=max_age
        )
        return response
# ...existing code...

# phoe otp via login
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials

# Initialize Firebase Admin only once
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User

# Initialize Firebase only once
# if not firebase_admin._apps:
    # cred = credentials.Certificate("firebase-service-account.json")  # 📍 path to your downloaded service account key
    # firebase_admin.initialize_app(cred)


class FirebaseLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        id_token = request.data.get('idToken')

        if not id_token:
            return Response({"error": "No token provided"}, status=400)

        try:
            # Verify the token using Firebase Admin SDK
            decoded_token = firebase_auth.verify_id_token(id_token)
            phone_number = decoded_token.get("phone_number")

            if not phone_number:
                return Response({"error": "Invalid token: No phone number"}, status=400)

            # Create or retrieve user
            user, created = User.objects.get_or_create(username=phone_number)

            # Generate JWT token
            refresh = RefreshToken.for_user(user)

            return Response({
                "access": str(refresh.access_token),
                "user": {
                    "phone": phone_number,
                }
            })

        except Exception as e:
            return Response({"error": str(e)}, status=400)

# ---------------- Wishlist ----------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request):
    hotel_id = request.data.get('hotel_id')
    hotel = Hotel.objects.get(id=hotel_id)
    Wishlist.objects.get_or_create(user=request.user, hotel=hotel)
    return Response({"message": "Added to wishlist"})

    # if not hotel_id:
    #     return Response({"error": "Hotel ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    # # Check if hotel exists
    # if not Hotel.objects.filter(id=hotel_id).exists():
    #     return Response({"error": "Hotel not found"}, status=status.HTTP_404_NOT_FOUND)

    # hotel = Hotel.objects.get(id=hotel_id)
    # Wishlist.objects.get_or_create(user=request.user, hotel=hotel)

    # return Response({"message": "Added to wishlist"}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    wishlist_items = Wishlist.objects.filter(user=request.user).select_related('hotel')
    data = [
        {
            "id": item.hotel.id,
            "title": item.hotel.title,
            "price": item.hotel.price,
            "rating": item.hotel.rating,
            "location": item.hotel.location,
            "imageUrl": item.hotel.image_url
        }
        for item in wishlist_items
    ]
    return Response(data, status=status.HTTP_200_OK)


# ---------------- Cart ----------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    hotel_id = request.data.get('hotel_id')

    if not hotel_id:
        return Response({"error": "Hotel ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    if not Hotel.objects.filter(id=hotel_id).exists():
        return Response({"error": "Hotel not found"}, status=status.HTTP_404_NOT_FOUND)

    hotel = Hotel.objects.get(id=hotel_id)
    Cart.objects.get_or_create(user=request.user, hotel=hotel)

    return Response({"message": "Added to cart"}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart_items = Cart.objects.filter(user=request.user).select_related('hotel')
    data = [
        {
            "id": item.hotel.id,
            "title": item.hotel.title,
            "price": item.hotel.price,
            "rating": item.hotel.rating,
            "location": item.hotel.location,
            "imageUrl": item.hotel.image_url
        }
        for item in cart_items
    ]
    return Response(data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, hotel_id):
    try:
        cart_item = Cart.objects.get(user=request.user, hotel_id=hotel_id)
        cart_item.delete()
        return Response({"message": "Removed from cart"}, status=status.HTTP_200_OK)
    except Cart.DoesNotExist:
        return Response({"error": "Item not in cart"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, hotel_id):
    try:
        wishlist_item = Wishlist.objects.get(user=request.user, hotel_id=hotel_id)
        wishlist_item.delete()
        return Response({"message": "Removed from wishlist"}, status=status.HTTP_200_OK)
    except Wishlist.DoesNotExist:
        return Response({"error": "Item not in wishlist"}, status=status.HTTP_404_NOT_FOUND)


# ---------------- Booking ----------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def make_booking(request):
    hotel_id = request.data.get("hotel_id")
    check_in = request.data.get("check_in")
    check_out = request.data.get("check_out")
    guest_count = request.data.get("guest_count", 1)
    guest_email = request.data.get("guest_email")
    booking_token = request.data.get("booking_token")
    total_amount = request.data.get("total_amount")
    payment_status = request.data.get("payment_status", "completed")

    if not hotel_id:
        return Response({"error": "Hotel ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    if not check_in or not check_out:
        return Response({"error": "Check-in and check-out dates are required"}, status=status.HTTP_400_BAD_REQUEST)

    if not Hotel.objects.filter(id=hotel_id).exists():
        return Response({"error": "Hotel not found"}, status=status.HTTP_404_NOT_FOUND)

    existing = Booking.objects.filter(
        hotel_id=hotel_id,
        check_in__lt=check_out,
        check_out__gt=check_in,
    )
    if existing.exists():
        return Response({"error": "Room not available for these dates"}, status=status.HTTP_409_CONFLICT)

    hotel = Hotel.objects.get(id=hotel_id)
    booking = Booking.objects.create(
        user=request.user,
        hotel=hotel,
        check_in=check_in,
        check_out=check_out,
        guest_count=guest_count,
        guest_email=guest_email,
        booking_token=booking_token,
        total_amount=total_amount,
        payment_status=payment_status,
    )

    return Response({
        "message": "Hotel booked successfully",
        "booking_id": booking.id,
        "booking_token": booking.booking_token
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_bookings(request):
    bookings = Booking.objects.filter(user=request.user).select_related('hotel')
    data = [
        {
            "id": item.hotel.id,
            "title": item.hotel.title,
            "price": item.hotel.price,
            "rating": item.hotel.rating,
            "location": item.hotel.location,
            "imageUrl": item.hotel.image_url
        }
        for item in bookings
    ]
    return Response(data, status=status.HTTP_200_OK)


# -------- Razorpay Payment Endpoints --------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_order(request):
    """
    Create a Razorpay order for payment
    """
    hotel_id = request.data.get("hotel_id")
    total_amount = request.data.get("total_amount")
    check_in = request.data.get("check_in")
    check_out = request.data.get("check_out")
    guest_count = request.data.get("guest_count", 1)
    guest_email = request.data.get("guest_email")
    payment_method = request.data.get("payment_method", "card")  # 'card' or 'upi'
    
    if not hotel_id or not total_amount:
        return Response(
            {"error": "Hotel ID and total amount are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not Hotel.objects.filter(id=hotel_id).exists():
        return Response(
            {"error": "Hotel not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if user already has a completed booking for this hotel with overlapping dates
    existing_user_booking = Booking.objects.filter(
        user=request.user,
        hotel_id=hotel_id,
        payment_status='completed',
        check_in__lt=check_out,
        check_out__gt=check_in
    ).first()
    
    if existing_user_booking:
        return Response(
            {
                "error": "You already have a booking for this hotel during these dates",
                "booking_token": existing_user_booking.booking_token,
                "existing_booking": {
                    "check_in": existing_user_booking.check_in,
                    "check_out": existing_user_booking.check_out,
                    "booking_date": existing_user_booking.created_at
                }
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Generate a unique booking token
    booking_token = f"STF-{int(request.user.id)}-{int(total_amount)}-{get_random_string(6).upper()}"
    
    # Create Razorpay order
    order_response = create_razorpay_order(
        amount=total_amount,
        receipt=booking_token,
        notes={
            "hotel_id": hotel_id,
            "user_id": request.user.id,
            "check_in": str(check_in),
            "check_out": str(check_out),
            "guest_count": guest_count,
            "payment_method": payment_method
        }
    )
    
    if not order_response.get("success"):
        return Response(
            {"error": "Failed to create payment order", "details": order_response.get("error")},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Create initial booking record with pending status
    try:
        hotel = Hotel.objects.get(id=hotel_id)
        booking = Booking.objects.create(
            user=request.user,
            hotel=hotel,
            check_in=check_in,
            check_out=check_out,
            guest_count=guest_count,
            guest_email=guest_email,
            booking_token=booking_token,
            razorpay_order_id=order_response["order_id"],
            total_amount=total_amount,
            payment_status="pending",
            payment_method=payment_method
        )
        
        return Response({
            "success": True,
            "booking_id": booking.id,
            "booking_token": booking.booking_token,
            "razorpay_order_id": order_response["order_id"],
            "amount": order_response["amount"],
            "currency": order_response["currency"],
            "razorpay_key": os.getenv("RAZORPAY_KEY_ID"),
            "customer_name": request.user.get_full_name() or request.user.username,
            "customer_email": guest_email or request.user.email,
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {"error": "Failed to create booking", "details": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """
    Verify Razorpay payment and update booking status
    """
    razorpay_payment_id = request.data.get("razorpay_payment_id")
    razorpay_order_id = request.data.get("razorpay_order_id")
    razorpay_signature = request.data.get("razorpay_signature")
    booking_id = request.data.get("booking_id")
    
    if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature, booking_id]):
        return Response(
            {"error": "Missing required payment verification fields"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get booking
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response(
            {"error": "Booking not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Verify payment signature
    secret_key = os.getenv("RAZORPAY_KEY_SECRET")
    is_valid = verify_razorpay_payment(
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        secret_key
    )
    
    if not is_valid:
        booking.payment_status = "failed"
        booking.save()
        send_payment_failure_email(booking, booking.guest_email or booking.user.email, "Payment signature verification failed")
        return Response(
            {"error": "Payment verification failed"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update booking with payment details
    booking.payment_status = "completed"
    booking.razorpay_payment_id = razorpay_payment_id
    booking.save()
    
    # Send confirmation emails
    customer_email = booking.guest_email or booking.user.email
    send_booking_confirmation_email(booking, customer_email)
    send_payment_confirmation_to_owner(booking)
    
    return Response({
        "success": True,
        "message": "Payment verified successfully",
        "booking": BookingSerializer(booking).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def payment_failed(request):
    """
    Handle payment failure
    """
    booking_id = request.data.get("booking_id")
    reason = request.data.get("reason", "Payment was not completed")
    
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response(
            {"error": "Booking not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Update booking status
    booking.payment_status = "failed"
    booking.save()
    
    # Send failure email
    customer_email = booking.guest_email or booking.user.email
    send_payment_failure_email(booking, customer_email, reason)
    
    return Response({
        "success": True,
        "message": "Payment failure recorded"
    }, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
def hotel_reviews(request, pk):
    if not Hotel.objects.filter(id=pk).exists():
        return Response({"error": "Hotel not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        reviews = Review.objects.filter(hotel_id=pk).order_by("-created_at")
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if not request.user or not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    if not Booking.objects.filter(user=request.user, hotel_id=pk).exists():
        return Response({"error": "Only booked users can leave a review"}, status=status.HTTP_403_FORBIDDEN)

    rating = request.data.get("rating")
    comment = request.data.get("comment", "")
    try:
        rating_value = float(rating)
    except (TypeError, ValueError):
        return Response({"error": "Rating must be a number"}, status=status.HTTP_400_BAD_REQUEST)

    if rating_value < 1 or rating_value > 5:
        return Response({"error": "Rating must be between 1 and 5"}, status=status.HTTP_400_BAD_REQUEST)

    user_name = request.user.get_full_name() or request.user.username
    review = Review.objects.create(
        hotel_id=pk,
        user=user_name,
        comment=comment,
        rating=rating_value,
    )
    return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


from rest_framework import generics
from datetime import datetime   
# from .serializers import HotelSerializer
class HotelListView(generics.ListAPIView):
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer
    permission_classes = [AllowAny] 
    

@api_view(['GET'])
def hotel_detail(request, pk):
    hotel = Hotel.objects.get(id=pk)
    serializer = HotelSerializer(hotel)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_availability(request):
    """
    Check if a hotel is available for booking
    - Checks if user already has a booking for this hotel
    - Checks if hotel has availability for the requested dates
    """
    hotel_id = request.data.get('hotel_id')
    check_in = request.data.get('check_in')
    check_out = request.data.get('check_out')

    if not hotel_id or not check_in or not check_out:
        return Response(
            {'error': 'hotel_id, check_in, and check_out are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if user already has a completed booking for this hotel
    user_existing_booking = Booking.objects.filter(
        user=request.user,
        hotel_id=hotel_id,
        payment_status='completed',
        check_in__lt=check_out,
        check_out__gt=check_in
    ).first()
    
    if user_existing_booking:
        return Response({
            'available': False,
            'reason': 'duplicate',
            'message': f'You already have a booking for this hotel from {user_existing_booking.check_in} to {user_existing_booking.check_out}',
            'booking_token': user_existing_booking.booking_token
        })

    # Check if hotel is available (other users' completed bookings)
    other_bookings = Booking.objects.filter(
        hotel_id=hotel_id,
        payment_status='completed',
        check_in__lt=check_out,
        check_out__gt=check_in
    ).exclude(user=request.user)
    
    if other_bookings.exists():
        return Response({
            'available': False,
            'reason': 'occupied',
            'message': 'Room not available for these dates - already booked by another guest'
        })
    
    return Response({
        'available': True,
        'message': 'Room available for booking'
    })