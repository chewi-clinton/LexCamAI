from pydantic import BaseSettings, AnyUrl


class Settings(BaseSettings):
    SERVICE_NAME: str = "scraper-service"
    DATABASE_URL: AnyUrl = "postgresql://postgres:postgres@db:5432/scraper_db"
    REDIS_URL: str = "redis://redis:6379/0"
    CELERY_BROKER_URL: str = "redis://redis:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/2"
    MIGRATE_AUTO: bool = True
    SECRET_KEY: str = "please-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    RABBITMQ_URL: str = "amqp://lexcam:lexcam_dev@rabbitmq:5672/%2F"
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = "lexcam"
    MINIO_SECRET_KEY: str = "lexcam_dev_minio"
    MINIO_SCRAPER_BUCKET: str = "lexcam-scraper-html"
    MINIO_SECURE: bool = False
    SCRAPER_DEFAULT_CITY: str = "Douala"
    SCRAPER_REQUEST_TIMEOUT_SECONDS: int = 30
    SCRAPER_MAX_LAWYERS_PER_RUN: int = 200

    class Config:
        env_file = ".env"


settings = Settings()
