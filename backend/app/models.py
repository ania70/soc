from datetime import datetime, timezone

from sqlalchemy import BigInteger, Integer, String, Text, DateTime, Index
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    syscall_type: Mapped[str] = mapped_column(String(16), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    pid: Mapped[int] = mapped_column(Integer, nullable=False)
    process_name: Mapped[str] = mapped_column(String(256), nullable=False)
    pod_name: Mapped[str | None] = mapped_column(String(256), nullable=True)
    node_name: Mapped[str] = mapped_column(String(256), nullable=False, index=True)
    namespace: Mapped[str | None] = mapped_column(String(256), nullable=True)
    container_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    args: Mapped[str] = mapped_column(Text, nullable=False)

    __table_args__ = (
        Index("ix_events_timestamp", "timestamp"),
        Index("ix_events_node_name", "node_name"),
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(256), nullable=False)
    role: Mapped[str] = mapped_column(String(16), nullable=False, default="admin")


class Node(Base):
    __tablename__ = "nodes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    node_name: Mapped[str] = mapped_column(String(256), unique=True, nullable=False)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)
    probe_status: Mapped[str] = mapped_column(String(16), nullable=False, default="inactive")
    last_report: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
