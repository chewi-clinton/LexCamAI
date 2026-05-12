from .base import *

DEBUG = True
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "lexcam_payments",
        "USER": "lexcam",
        "PASSWORD": "lexcam_dev",
        "HOST": "localhost",
        "PORT": "5432",
    }
}
USER_MANAGEMENT_URL = "http://localhost:8001"
