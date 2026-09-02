import os
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

# Resolve database path relative to project root (parent of backend/)
_project_root = Path(__file__).resolve().parent.parent.parent
_db_url = settings.database_url
if _db_url.startswith("sqlite") and ":///" in _db_url:
    _prefix, _path = _db_url.split(":///", 1)
    if not os.path.isabs(_path):
        _path = str(_project_root / _path)
    _db_url = f"{_prefix}:///{_path}"

engine = create_async_engine(_db_url, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    async with async_session() as session:
        yield session
