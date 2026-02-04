from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "Online Shop API"
    ENV: str = "local"
    # Example: mysql+pymysql://user:password@localhost:3306/onlineshop
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5500", "http://localhost:8000", "http://127.0.0.1:5500"]

    class Config:
        env_file = ".env"

settings = Settings()