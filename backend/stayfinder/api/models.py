from django.db import models
from django.contrib.auth.models import User

# ...existing code...
from django.db import models

class HotelOwner(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="hotel_owner_profile")
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} (Owner)"


class Hotel(models.Model):
    # external_id = models.IntegerField(unique=True)  # id from JSON
    owner = models.ForeignKey(HotelOwner, on_delete=models.SET_NULL, null=True, blank=True, related_name="hotels")
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    place = models.CharField(max_length=255)
    price = models.IntegerField()
    rating = models.FloatField(null=True, blank=True)
    image_url = models.URLField(max_length=1024, null=True, blank=True)
    details = models.TextField(null=True, blank=True)
    map_url = models.URLField(max_length=1024, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.location})"

class Availability(models.Model):
    STATUS_AVAILABLE = "available"
    STATUS_BOOKED = "booked"
    STATUS_CHOICES = [
        (STATUS_AVAILABLE, "Available"),
        (STATUS_BOOKED, "Booked"),
    ]

    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name="availability")
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)

    class Meta:
        unique_together = ("hotel", "date")

    def __str__(self):
        return f"{self.hotel} - {self.date} ({self.status})"

class Review(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name="reviews")
    user = models.CharField(max_length=255, null=True, blank=True)
    comment = models.TextField(null=True, blank=True)
    rating = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review {self.rating} by {self.user or 'anonymous'} for {self.hotel}"
# ...existing code...

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist_items')
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)

    class Meta:
        unique_together = ['user', 'hotel']

class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cart_items')
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ['user', 'hotel']

class Booking(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('card', 'Debit/Credit Card'),
        ('upi', 'UPI'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE)
    check_in = models.DateField()
    check_out = models.DateField()
    guest_count = models.IntegerField(default=1)
    guest_email = models.EmailField(max_length=255, null=True, blank=True)
    booking_token = models.CharField(max_length=50, unique=True, null=True, blank=True)
    razorpay_order_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default="pending")
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking {self.booking_token or self.id} - {self.user.username}"

    def save(self, *args, **kwargs):
        # Notify owner on booking
        super().save(*args, **kwargs)
        if self.hotel.owner:
            # You can send email/notification to owner here
            pass
