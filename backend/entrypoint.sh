#!/bin/sh
set -e

cd /app/backend

# Set absolute DATABASE_URL if not already set
if [ -z "$DATABASE_URL" ]; then
    export DATABASE_URL="sqlite+aiosqlite:////app/data/app.db"
fi

# Run migrations
alembic upgrade head

# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port 8001
