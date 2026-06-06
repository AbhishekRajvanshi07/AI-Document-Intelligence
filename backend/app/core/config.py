from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # App
    APP_NAME: str = "AI Document Intelligence Platform"
    VERSION: str = "2.4.1"
    DEBUG: bool = False

    # Neon PostgreSQL
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost:5432/docintel"

    # Upstash Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Cloudflare R2
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY: str = ""
    R2_SECRET_KEY: str = ""
    R2_BUCKET: str = "docintel-uploads"
    R2_PUBLIC_URL: str = ""

    # Auth
    SECRET_KEY: str = "changeme-in-production-use-32-chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS — stored as JSON string in env vars
    ALLOWED_ORIGINS: str = '["http://localhost:5173","http://localhost:3000"]'

    # Tesseract
    TESSERACT_CMD: str = "tesseract"
    TESSERACT_LANG: str = "eng"

    @property
    def allowed_origins_list(self) -> List[str]:
        try:
            return json.loads(self.ALLOWED_ORIGINS)
        except Exception:
            return [self.ALLOWED_ORIGINS]

    @property
    def r2_endpoint(self) -> str:
        return f"https://{self.R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

    class Config:
        env_file = ".env"


settings = Settings()
