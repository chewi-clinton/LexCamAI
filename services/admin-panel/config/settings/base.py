from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = config("SECRET_KEY", default="dev-secret-key")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "drf_spectacular",
    "apps.dashboard",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
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
        "NAME": config("DB_NAME", default="lexcam_admin"),
        "USER": config("DB_USER", default="lexcam"),
        "PASSWORD": config("DB_PASSWORD", default="lexcam_dev"),
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default="5432"),
    }
}

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "apps.dashboard.authentication.RemoteJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "apps.dashboard.permissions.IsAdminRole",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "LexCam Admin Panel API",
    "DESCRIPTION": "Internal admin dashboard — scraper trigger, stats, audit logs",
    "VERSION": "1.0.0",
}

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True
STATIC_URL = "/static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

USER_MANAGEMENT_URL = config("USER_MANAGEMENT_URL", default="http://localhost:8001")
LAWYER_SERVICE_URL = config("LAWYER_SERVICE_URL", default="http://localhost:8002")
DOCUMENT_SERVICE_URL = config("DOCUMENT_SERVICE_URL", default="http://localhost:8006")
PAYMENT_SERVICE_URL = config("PAYMENT_SERVICE_URL", default="http://localhost:8007")
INTERNAL_SERVICE_KEY = config("INTERNAL_SERVICE_KEY", default="dev-internal-key")

RABBITMQ_URL = config("RABBITMQ_URL", default="amqp://lexcam:lexcam_dev@localhost:5672/")
