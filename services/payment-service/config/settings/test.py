from .base import *

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

USER_MANAGEMENT_URL = "http://user-management-test"
CAMPAY_URL = "https://demo.campay.net/api/"
CAMPAY_USERNAME = "test_user"
CAMPAY_PASSWORD = "test_pass"
CAMPAY_WEBHOOK_SECRET = "test-webhook-secret"
CAMPAY_REDIRECT_URL = "https://lexcam.cm/payment/callback"
