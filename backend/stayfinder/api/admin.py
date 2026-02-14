from django.contrib import admin

# Register your models here.
# ...existing code...
from .models import Hotel, Availability, Review

@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ("title", "location", "place", "price", "rating")
    search_fields = ("title", "location", "place", "external_id")

@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display = ("hotel", "date", "status")
    list_filter = ("status",)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("hotel", "user", "rating", "created_at")
    search_fields = ("user", "comment")
# ...existing code...