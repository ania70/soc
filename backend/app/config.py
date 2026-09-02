import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_port: int = 8001
    secret_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./data/app.db"
    admin_user: str = "admin"
    admin_password: str = ""
    event_retention_hours: int = 24
    mock_events: bool = False
    probe_api_key: str = ""

    model_config = {"env_file": "../.env", "extra": "ignore"}


settings = Settings()
