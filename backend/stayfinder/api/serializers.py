from rest_framework import serializers
from .models import Hotel, Wishlist, Cart, Booking, Review


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "user", "comment", "rating", "created_at"]

class HotelSerializer(serializers.ModelSerializer):
    # map model snake_case -> frontend camelCase
    imageUrl = serializers.CharField(source="image_url", allow_null=True, read_only=True)
    mapUrl = serializers.CharField(source="map_url", allow_null=True, read_only=True)
    details = serializers.JSONField(required=False, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Hotel
        fields = (
            "id",
            "title",
            "location",
            "place",
            "price",
            "rating",
            "imageUrl",
            "details",
            "mapUrl",
            "created_at",
            "updated_at",
            "reviews",
        )

class WishlistSerializer(serializers.ModelSerializer):
    hotel = HotelSerializer()

    class Meta:
        model = Wishlist
        fields = ['id', 'hotel']

class CartSerializer(serializers.ModelSerializer):
    hotel = HotelSerializer()

    class Meta:
        model = Cart
        fields = ['id', 'hotel', 'quantity']

class BookingSerializer(serializers.ModelSerializer):
    hotel = HotelSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'hotel', 'check_in', 'check_out', 'guest_count', 'guest_email', 'booking_token', 'total_amount', 'payment_status', 'payment_method', 'razorpay_order_id', 'razorpay_payment_id', 'created_at', 'updated_at']
