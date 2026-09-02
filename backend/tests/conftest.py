import os
import asyncio
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.models import Base, User, Event, Node
from app.auth import hash_password
from sqlalchemy import select

# Use in-memory SQLite for tests
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"
test_engine = create_async_engine(TEST_DB_URL, echo=False)
test_session = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture
async def client():
    # Import here so env vars are read fresh
    from app.database import engine as _engine
    from app.main import app, manager
    import app.database as dbmod
    import app.main as mainmod

    # Patch the engine and session in both modules
    dbmod.engine = test_engine
    dbmod.async_session = test_session
    mainmod.engine = test_engine
    mainmod.async_session = test_session

    # Create tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # Seed admin user
    async with test_session() as db:
        result = await db.execute(select(User).where(User.username == "admin"))
        if not result.scalar_one_or_none():
            db.add(User(username="admin", password_hash=hash_password("testpass123"), role="admin"))
            await db.commit()

    from httpx import AsyncClient, ASGITransport
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

    # Cleanup
    manager.active.clear()
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


# Use the real probe key from .env for tests
@pytest.fixture(autouse=True)
def _setup_probe_key(monkeypatch):
    from app.config import settings
    monkeypatch.setattr(settings, "probe_api_key", "test-probe-key")
    monkeypatch.setattr(settings, "secret_key", "test-secret")
    monkeypatch.setattr(settings, "admin_user", "admin")
    monkeypatch.setattr(settings, "admin_password", "testpass123")
    monkeypatch.setattr(settings, "mock_events", False)
    monkeypatch.setattr(settings, "event_retention_hours", 24)
