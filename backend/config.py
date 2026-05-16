from pathlib import Path
import os

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"
ASSETS_DIR = BASE_DIR / "assets"
TAROT_ASSETS_DIR = ASSETS_DIR / "tarot"
UPLOADS_DIR = BASE_DIR / "uploads"
COFFEE_UPLOADS_DIR = UPLOADS_DIR / "coffee"
DEFAULT_BACKEND_PUBLIC_URL = "http://localhost:5050"
DEFAULT_COFFEE_UPLOAD_RETENTION_HOURS = 72


def load_environment():
    if ENV_FILE.exists():
        load_dotenv(ENV_FILE, override=False)
    else:
        load_dotenv(override=False)


def _trim_trailing_slash(value):
    return value.rstrip("/") if value else value


def get_allowed_origins():
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
    return [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]


def get_backend_public_url():
    public_url = os.getenv("BACKEND_PUBLIC_URL") or os.getenv("API_PUBLIC_BASE_URL")
    return _trim_trailing_slash(public_url) or DEFAULT_BACKEND_PUBLIC_URL


load_environment()
