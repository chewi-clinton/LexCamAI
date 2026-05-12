from .base import *

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "lexcam_payments_test",
        "USER": "lexcam",
        "PASSWORD": "lexcam_dev",
        "HOST": "localhost",
        "PORT": "5432",
    }
}

USER_MANAGEMENT_URL = "http://user-management-test"
CAMPAY_URL = "https://demo.campay.net/api/"
CAMPAY_USERNAME = "test_user"
CAMPAY_PASSWORD = "test_pass"
CAMPAY_WEBHOOK_SECRET = "test-webhook-secret"
CAMPAY_REDIRECT_URL = "https://lexcam.cm/payment/callback"
