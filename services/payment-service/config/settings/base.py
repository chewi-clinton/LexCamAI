from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = config("SECRET_KEY", default="dev-secret-key")

INSTALLED_APPS = [
    "django_prometheus",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "drf_spectacular",
    "apps.payments",
]

MIDDLEWARE = [
    "django_prometheus.middleware.PrometheusBeforeMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "django_prometheus.middleware.PrometheusAfterMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME", default="lexcam_payments"),
        "USER": config("DB_USER", default="lexcam"),
        "PASSWORD": config("DB_PASSWORD", default="lexcam_dev"),
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default="5432"),
    }
}

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "apps.payments.authentication.RemoteJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "LexCam Payment Service API",
    "DESCRIPTION": "Mobile Money payments via Campay",
    "VERSION": "1.0.0",
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
STATIC_URL = "/static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

USER_MANAGEMENT_URL = config("USER_MANAGEMENT_URL", default="http://localhost:8001")
INTERNAL_SERVICE_KEY = config("INTERNAL_SERVICE_KEY", default="dev-internal-key")

CAMPAY_URL = config("CAMPAY_URL", default="https://demo.campay.net/api/")
CAMPAY_USERNAME = config("CAMPAY_USERNAME", default="")
CAMPAY_PASSWORD = config("CAMPAY_PASSWORD", default="")
CAMPAY_WEBHOOK_SECRET = config("CAMPAY_WEBHOOK_SECRET", default="dev-webhook-secret")
CAMPAY_REDIRECT_URL = config("CAMPAY_REDIRECT_URL", default="https://lexcam.cm/payment/callback")

RABBITMQ_URL = config("RABBITMQ_URL", default="amqp://lexcam:lexcam_dev@localhost:5672/")
