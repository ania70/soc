import sys
import os
from logging.config import fileConfig

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.models import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Override sqlalchemy.url with app's DATABASE_URL (sync version)
try:
    import os
    from pathlib import Path
    from app.config import settings
    _db_url = settings.database_url
    # Convert async driver to sync for alembic
    _db_url = _db_url.replace("sqlite+aiosqlite", "sqlite")
    # Resolve relative paths same as database.py
    if _db_url.startswith("sqlite") and ":///" in _db_url:
        _prefix, _path = _db_url.split(":///", 1)
        if not os.path.isabs(_path):
            _project_root = Path(__file__).resolve().parent.parent.parent
            _path = str(_project_root / _path)
        _db_url = f"{_prefix}:///{_path}"
    config.set_main_option("sqlalchemy.url", _db_url)
except Exception:
    pass

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True, dialect_opts={"paramstyle": "named"})
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(config.get_section(config.config_ini_section, {}), prefix="sqlalchemy.", poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
