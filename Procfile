release: cd backend/stayfinder && python manage.py migrate
web: cd backend/stayfinder && gunicorn stayfinder.wsgi --bind 0.0.0.0:$PORT
