from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./contractiq.db"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    AI_BASE_URL: str = "http://localhost:11434/v1"
    AI_API_KEY: str = ""
    AI_MODEL: str = "gpt-4o-mini"

    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 10

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
