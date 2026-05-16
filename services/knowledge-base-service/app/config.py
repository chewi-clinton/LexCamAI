from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    service_name: str = Field("knowledge-base-service", alias="SERVICE_NAME")
    api_prefix: str = Field("/api/v1", alias="API_PREFIX")
    database_url: str = Field(
        "postgresql+psycopg://lexcam:lexcam_dev@postgres:5432/lexcam_knowledge",
        alias="DATABASE_URL",
    )
    qdrant_url: str = Field("http://qdrant:6333", alias="QDRANT_URL")
    qdrant_api_key: str | None = Field(None, alias="QDRANT_API_KEY")
    qdrant_collection: str = Field("lexcam_laws", alias="QDRANT_COLLECTION")
    embedding_service_url: str = Field(
        "http://embedding-service:8000", alias="EMBEDDING_SERVICE_URL"
    )
    redis_url: str = Field("redis://redis:6379/0", alias="REDIS_URL")
    log_level: str = Field("INFO", alias="LOG_LEVEL")
    plain_summary_cache_ttl_seconds: int = Field(
        7 * 24 * 60 * 60, alias="PLAIN_SUMMARY_CACHE_TTL_SECONDS"
    )
    max_search_results: int = Field(10, alias="MAX_SEARCH_RESULTS")


settings = Settings()
