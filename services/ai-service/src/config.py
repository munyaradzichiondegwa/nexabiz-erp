from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    clickhouse_url: str = "http://localhost:8123"
    clickhouse_db: str = "nexabiz_analytics"
    clickhouse_user: str = "nexabiz"
    clickhouse_password: str = "nexabiz"
    accounting_db_url: str = "postgresql://nexabiz:nexabiz@localhost:5432/nexabiz_accounting"
    redis_url: str = "redis://localhost:6379"
    openai_api_key: str = ""
    jwt_secret: str = "dev-secret-CHANGE-ME"
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()
