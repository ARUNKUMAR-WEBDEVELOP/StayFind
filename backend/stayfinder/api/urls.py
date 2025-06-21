from django.urls import path
from .views import HotelListView

urlpatterns = [
    path('hotels/', HotelListView.as_view(), name='hotels'),
]
