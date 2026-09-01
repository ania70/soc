# Tech stack

Pin the **major** version only; take the latest minor/patch inside it. Do not chase "latest everything", and do not pin exact patch numbers.

| Layer | Choice | Pinned major |
|---|---|---|
| Backend language | Python | **3.12** |
| Backend framework | FastAPI (Uvicorn, Pydantic v2) | **0.11x** |
| Frontend language | Node.js | **22 LTS** |
| Frontend framework | React | **19** |
| Frontend build | Vite | **7** |
| Frontend state | Zustand | **5** |
| Data fetching | TanStack Query | **v5** |
| Database | SQLite, through SQLAlchemy + Alembic | — |
| Cache / queue | **none** | — |
| File storage | a folder on disk | — |

**Python 3.12 and Node 22 are the baseline toolchain.** They do not depend on anything the plan decides, so they should already be installed on the user's computer before day two. `/setup-dev` verifies them and installs whatever else this particular product turns out to need.

## One process, one port, one address

- **The backend serves the built frontend.** `npm run build` produces static files; FastAPI serves them. One process, one port, one URL — therefore **no CORS, no API base URL setting, and no "works locally but not live"**. The frontend calls the API with relative paths (`/api/...`) and never knows the hostname.
- **The port is local and it is `APP_PORT` in `.env`, defaulting to `8000`.** Nothing is assigned in advance. If `8000` is taken on this machine, take the next free port and write it into `.env` — that is the only place it is decided.
- **Run it with `./run.sh`** — it builds the frontend, applies migrations and starts the app on `APP_PORT`, detached, with its log in `run.log`. Running it again restarts cleanly. That script is the only way the app is started or restarted locally; do not invent another.
- **On Windows**, run it through Git Bash (`bash run.sh`). If that fails for any reason, do the three steps by hand — build the frontend, run the migrations, start Uvicorn — and say so plainly rather than silently doing something different.

## Database — SQLite, and that is deliberate

- **One file inside the project** (`data/app.db`), reached through SQLAlchemy with `DATABASE_URL` from the environment. Nothing to install, no service to start, no credentials, no connection string to get wrong — and a backup is a file copy.
- All schema changes go through **Alembic migrations**, from the very first one. That is what makes the next point true.
- **Post-MVP note — record it in `architecture.md`, do not build it:** when the product has real users, the move to PostgreSQL is one change to `DATABASE_URL` plus running the same migrations, because every query goes through SQLAlchemy. Never use a feature of one engine that breaks the other. Redis and a real job queue belong to that same later moment, not to this one.

## No cache, no queue

- **No Redis, no Celery, no RabbitMQ.** Caching, at this scale, is a plain database table or a value held in memory. Scheduled and background work is an `asyncio` task inside the app that polls a `jobs` table with a `run_at` column and marks rows done. That is enough, and it is one fewer thing that can be down.

## Development is not containerised. Deployment is.

These are two different machines and they get two different answers.

- **On the user's own computer: no containers.** Do not write a Dockerfile for local work, do not ask them to install Docker Desktop, and do not mention any of it. Python and Node are installed natively and `./run.sh` is the whole story. Asking a non-technical user on a Windows laptop to install a virtualisation stack is how a day gets lost.
- **On the server, at `/deploy`: the default path is one container image plus Caddy in front.** The app is packaged into a single image built from the project, `docker compose` runs it, and Caddy terminates TLS and proxies to it. This is chosen for one reason above all others: **every deployed server then looks identical**, so a problem on one is a problem you have already seen. Automatic HTTPS from one line of configuration is the bonus.
  - The compose file and the Dockerfile are written at `/deploy`, not before, and they live at the root of the project.
  - Before installing anything, check that ports **80** and **443** are free on the server. A provider image with its own panel on port 80 will otherwise fail in a way that is very hard to read.
  - The SQLite file and the uploads folder are mounted from the host, so a redeploy never destroys data.
  - If the user chose the non-default deploy path, none of this applies — `docs/deploy.md` is the authority and it replaces this section entirely.

## Files

Uploaded files go to a folder on disk (`UPLOADS_DIR`), behind one small storage interface so a bucket can replace it later with a setting rather than a rewrite. Object storage, if it is ever needed, is arranged at `/deploy` — it is a deployment concern, not a development one.

## Shape of the code

```
backend/          FastAPI app, SQLAlchemy models, Alembic migrations, tests
frontend/         React + Vite source
data/             the SQLite file (git-ignored)
uploads/          uploaded files (git-ignored)
run.sh            build, migrate, start on APP_PORT
```

Keep this layout — `run.sh` depends on it. Add a directory only when the product genuinely needs one. `/deploy` adds a `Dockerfile` and a `compose.yaml` at the root; nothing else moves.
