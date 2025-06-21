from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import json, os

class HotelListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        with open(os.path.join(os.path.dirname(__file__), 'data/hotels.json')) as f:
            data = json.load(f)
        return Response(data)

