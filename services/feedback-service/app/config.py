from pydantic import BaseSettings, AnyUrl


class Settings(BaseSettings):
    SERVICE_NAME: str = "feedback-service"
    DATABASE_URL: AnyUrl = "postgresql://postgres:postgres@db:5432/feedback_db"
    REDIS_URL: str = "redis://redis:6379/0"
    CELERY_BROKER_URL: str = "redis://redis:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/2"
    MIGRATE_AUTO: bool = True
    SECRET_KEY: str = "please-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    USER_MGMT_URL: str = "http://user-management:8000"
    RABBITMQ_URL: str = "amqp://lexcam:lexcam_dev@rabbitmq:5672/%2F"  # NOSONAR

    class Config:
        env_file = ".env"


settings = Settings()
