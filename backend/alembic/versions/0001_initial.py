"""initial migration

Revision ID: 0001
Revises:
Create Date: 2025-01-01
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "events",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("syscall_type", sa.String(16), nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.Column("pid", sa.Integer(), nullable=False),
        sa.Column("process_name", sa.String(256), nullable=False),
        sa.Column("pod_name", sa.String(256), nullable=True),
        sa.Column("node_name", sa.String(256), nullable=False),
        sa.Column("namespace", sa.String(256), nullable=True),
        sa.Column("container_id", sa.String(64), nullable=True),
        sa.Column("args", sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_events_timestamp", "events", ["timestamp"])
    op.create_index("ix_events_node_name", "events", ["node_name"])

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("username", sa.String(64), nullable=False),
        sa.Column("password_hash", sa.String(256), nullable=False),
        sa.Column("role", sa.String(16), nullable=False, server_default="admin"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )

    op.create_table(
        "nodes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("node_name", sa.String(256), nullable=False),
        sa.Column("ip_address", sa.String(45), nullable=False),
        sa.Column("probe_status", sa.String(16), nullable=False, server_default="inactive"),
        sa.Column("last_report", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("node_name"),
    )


def downgrade() -> None:
    op.drop_table("nodes")
    op.drop_table("users")
    op.drop_index("ix_events_node_name", table_name="events")
    op.drop_index("ix_events_timestamp", table_name="events")
    op.drop_table("events")
