from pydantic_settings import BaseSettings
import json


class Settings(BaseSettings):
    APP_NAME: str = "SalesCoach AI API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # Groq (compatible con OpenAI API)
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.groq.com/openai/v1"
    OPENAI_MODEL: str = "llama-3.3-70b-versatile"
    WHISPER_MODEL: str = "whisper-large-v3"

    # Database
    DATABASE_URL: str = ""

    # CORS - accepts JSON array string or comma-separated string
    CORS_ORIGINS: str = "*"

    @property
    def cors_origins_list(self) -> list[str]:
        raw = self.CORS_ORIGINS.strip()
        if not raw or raw == "*":
            return ["*"]
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list) and len(parsed) > 0:
                return parsed
        except (json.JSONDecodeError, TypeError):
            pass
        return [o.strip() for o in raw.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = True


_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
