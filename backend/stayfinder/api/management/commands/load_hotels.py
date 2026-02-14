# ...existing code...
import csv
import json
from datetime import date, timedelta
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db.transaction import atomic

from api.models import Hotel, Availability

@atomic
def load_hotels():
    real_india_csv = Path(__file__).resolve().parents[3] / "api" / "hotels_real_india.csv"
    india_csv_path = Path(__file__).resolve().parents[3] / "api" / "hotels_india.csv"
    tamil_csv_path = Path(__file__).resolve().parents[3] / "api" / "hotels_tamil_nadu.csv"
    json_path = Path(__file__).resolve().parents[3] / "api" / "hotel.json"

    if real_india_csv.exists():
        with real_india_csv.open("r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            data = list(reader)
    elif india_csv_path.exists():
        with india_csv_path.open("r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            data = list(reader)
    elif tamil_csv_path.exists():
        with tamil_csv_path.open("r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            data = list(reader)
    else:
        with json_path.open("r", encoding="utf-8") as f:
            data = json.load(f)

    for hotel in data:
        image_url = hotel.get("image_url") or hotel.get("imageUrl")
        map_url = hotel.get("map_url") or hotel.get("mapUrl")
        h = Hotel(
            title=hotel.get("title"),
            location=hotel.get("location"),
            place=hotel.get("place"),
            price=int(hotel.get("price")) if hotel.get("price") else 0,
            rating=float(hotel.get("rating")) if hotel.get("rating") else None,
            image_url=image_url,
            details=hotel.get("details"),
            map_url=map_url,
        )
        h.save()

        available_dates = _parse_dates(hotel.get("available_dates"))
        booked_dates = _parse_dates(hotel.get("booked_dates"))

        if not available_dates and not booked_dates:
            today = date.today()
            available_dates = [(today + timedelta(days=offset)).isoformat() for offset in range(1, 8)]

        for date_value in available_dates:
            Availability.objects.create(
                hotel=h, date=date_value, status=Availability.STATUS_AVAILABLE
            )
        for date_value in booked_dates:
            Availability.objects.create(
                hotel=h, date=date_value, status=Availability.STATUS_BOOKED
            )


def _parse_dates(value):
    if not value:
        return []
    if isinstance(value, list):
        return value
    return [item.strip() for item in str(value).split("|") if item.strip()]

class Command(BaseCommand):
    help = "Load hotels from JSON file"

    def handle(self, *args, **options):
        load_hotels()
        self.stdout.write(self.style.SUCCESS("Successfully loaded hotels"))
# ...existing code...