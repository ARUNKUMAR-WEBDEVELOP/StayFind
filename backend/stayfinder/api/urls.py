from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import (
    GoogleLoginView,
    FirebaseLoginView,
    add_to_cart,
    get_cart,
    remove_from_cart,
    add_to_wishlist,
    get_wishlist,
    remove_from_wishlist,
    get_bookings,
    make_booking,
    HotelListView,
    hotel_detail,
    check_availability,
    hotel_reviews,
    create_payment_order,
    verify_payment,
    payment_failed,
    health_check,
)
from django.urls import path 

urlpatterns = [
    # Health check
    path('health/', health_check, name='health-check'),
    # Hotels
    path('hotels/', HotelListView.as_view(), name='hotels'),
    path("firebase-login/", FirebaseLoginView.as_view(), name="firebase_login"),
    path('google_login/', GoogleLoginView.as_view(), name='google_login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # path("api/wishlist/", views.get_wishlist),
    # path("api/wishlist/add/", views.add_to_wishlist),
    path('hotels/<int:pk>/',hotel_detail, name='hotel-detail'),
    path('hotels/<int:pk>/reviews/', hotel_reviews, name='hotel-reviews'),
    path('booking/check/', check_availability, name='check-availability'),
    path('wishlist/',add_to_wishlist, name='add-to-wishlist'),
    path('wishlist/view/',get_wishlist, name='get-wishlist'),
    path('wishlist/<int:hotel_id>/', remove_from_wishlist, name='remove-from-wishlist'),
    path('cart/',add_to_cart,name='add-to-cart'),
    path('cart/view/',get_cart,name='get-cart'),
    path('cart/<int:hotel_id>/', remove_from_cart, name='remove-from-cart'),
    path('booking/',make_booking,name='make-booking'),
    path('booking/view/',get_bookings,name='add-to-cart'),
    # Payment endpoints
    path('payment/create-order/', create_payment_order, name='create-payment-order'),
    path('payment/verify/', verify_payment, name='verify-payment'),
    path('payment/failed/', payment_failed, name='payment-failed'),

    # # Cart
    # path("api/cart/", views.get_cart),
    # path("api/cart/add/", views.add_to_cart),
    # # Booking
    # path("api/bookings/", views.get_bookings),
    # path("api/bookings/add/", views.make_booking),

]
