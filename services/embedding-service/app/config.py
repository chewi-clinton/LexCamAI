from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    service_name: str = Field("embedding-service", alias="SERVICE_NAME")
    api_prefix: str = Field("/api/v1", alias="API_PREFIX")
    model_name: str = Field("intfloat/multilingual-e5-small", alias="MODEL_NAME")
    model_path: str | None = Field(None, alias="MODEL_PATH")
    device: str = Field("cpu", alias="DEVICE")
    max_batch_size: int = Field(64, alias="MAX_BATCH_SIZE")
    max_seq_length: int = Field(512, alias="MAX_SEQ_LENGTH")
    normalize_embeddings: bool = Field(True, alias="NORMALIZE_EMBEDDINGS")
    log_level: str = Field("INFO", alias="LOG_LEVEL")
    require_api_key: bool = Field(False, alias="REQUIRE_API_KEY")
    api_key: str | None = Field(None, alias="API_KEY")
    rate_limit_enabled: bool = Field(True, alias="RATE_LIMIT_ENABLED")
    rate_limit: str = Field("120/minute", alias="RATE_LIMIT")


settings = Settings()
