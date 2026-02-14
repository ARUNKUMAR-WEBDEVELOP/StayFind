from django.core.management.base import BaseCommand
from api.models import Hotel, Availability, Review, Booking


class Command(BaseCommand):
    help = "Clear all hotel data from database"

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm deletion of all hotel data',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    'This will delete ALL hotels, bookings, reviews, and availability data.\n'
                    'Run with --confirm to proceed: python manage.py clear_hotels --confirm'
                )
            )
            return

        # Delete in order to respect foreign key constraints
        Review.objects.all().delete()
        Booking.objects.all().delete()
        Availability.objects.all().delete()
        Hotel.objects.all().delete()

        self.stdout.write(self.style.SUCCESS('Successfully cleared all hotel data'))
