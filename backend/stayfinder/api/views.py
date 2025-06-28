import json
from django.http import JsonResponse
from django.conf import settings
import os

def hotel_list(request):
    file_path = os.path.join(settings.BASE_DIR, 'api', 'hotels.json')
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return JsonResponse(data, safe=False)
