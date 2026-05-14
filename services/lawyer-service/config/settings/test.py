from .base import *

DEBUG = True
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "lexcam_lawyers",
        "USER": "lexcam",
        "PASSWORD": "lexcam_dev",
        "HOST": "localhost",
        "PORT": "5435",
    }
}
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}
USER_MANAGEMENT_URL = "http://localhost:8001"
