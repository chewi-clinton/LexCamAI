from .base import *

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "lexcam_admin_test",
        "USER": "lexcam",
        "PASSWORD": "lexcam_dev",
        "HOST": "localhost",
        "PORT": "5435",
    }
}

USER_MANAGEMENT_URL = "http://user-management-test"
LAWYER_SERVICE_URL = "http://lawyer-service-test"
DOCUMENT_SERVICE_URL = "http://document-service-test"
PAYMENT_SERVICE_URL = "http://payment-service-test"
