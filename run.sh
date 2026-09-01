#!/usr/bin/env bash
# Build the frontend, apply the migrations, and (re)start the app locally.
# This is the ONLY way the app is started or restarted on the user's computer.
# Running it again restarts cleanly. The port comes from .env (APP_PORT) and defaults to 8000.
# On Windows, run this through Git Bash:  bash run.sh
set -euo pipefail
cd "$(dirname "$0")"

if [ -f .env ]; then
  set -a; . ./.env; set +a
fi
PORT="${APP_PORT:-8000}"

# python3 on Linux/macOS, python on most Windows installs
PY="python3"; command -v "$PY" >/dev/null 2>&1 || PY="python"

# --- stop the previous instance -------------------------------------------------
if [ -f .run.pid ]; then
  OLD="$(cat .run.pid)"
  if kill -0 "$OLD" 2>/dev/null; then
    kill "$OLD" 2>/dev/null || true
    for _ in $(seq 1 20); do kill -0 "$OLD" 2>/dev/null || break; sleep 0.25; done
    kill -9 "$OLD" 2>/dev/null || true
  fi
  rm -f .run.pid
fi

# --- frontend: build to static, served by the backend ---------------------------
if [ -d frontend ]; then
  ( cd frontend && { [ -d node_modules ] || npm install; } && npm run build )
fi

# --- backend: dependencies, migrations, start -----------------------------------
cd backend
[ -d .venv ] || "$PY" -m venv .venv
VENV_BIN=".venv/bin"; [ -d "$VENV_BIN" ] || VENV_BIN=".venv/Scripts"
if [ -f requirements.txt ]; then "$VENV_BIN/pip" install -q -r requirements.txt; fi
if [ -d alembic ]; then "$VENV_BIN/alembic" upgrade head; fi

nohup "$VENV_BIN/uvicorn" app.main:app --host 127.0.0.1 --port "$PORT" >> ../run.log 2>&1 &
echo $! > ../.run.pid
cd ..

# --- wait until it actually answers ---------------------------------------------
for _ in $(seq 1 40); do
  sleep 0.5
  if curl -fsS "http://127.0.0.1:$PORT/" >/dev/null 2>&1; then
    echo "up — http://localhost:$PORT"
    exit 0
  fi
done

echo "run.sh: the app did not answer on port $PORT. Last lines of run.log:" >&2
tail -n 30 run.log >&2
exit 1
