# Architecture

> Living document. Written at `/plan`, before any application code. The user does not read it; it is the **reference** you re-read and update on every fix, feature and new version. Follows `docs/constitution/02-tech-stack.md`.

## Overview

The product has **two components**:

1. **Web dashboard** (FastAPI + React) — runs on the user's own computer, port 8001. One process, one port. FastAPI serves the built React static files. Events are stored in SQLite.

2. **eBPF probe** (Go + cilium/ebpf) — runs on Kubernetes cluster nodes as a DaemonSet with `--privileged`. Reads syscall events from the kernel and sends them to the dashboard via REST.

These two are **independent**. The dashboard works with mock data without the probe (for development on macOS). The probe buffers events in memory until the dashboard is reachable.

```
┌─────────────────────────────────────────────────┐
│  Kubernetes cluster (Linux)                     │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│  │  Node 1   │  │  Node 2   │  │  Node 3   │   │
│  │ eBPF probe│  │ eBPF probe│  │ eBPF probe│   │
│  │ (Go)      │  │ (Go)      │  │ (Go)      │   │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘   │
│        └──────────────┴──────────────┘          │
│                       │ POST /api/events        │
│                       │ POST /api/nodes/heartbeat │
└───────────────────────┼─────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────┐
│  Your computer (macOS)│                         │
│  ┌────────────────────▼──────────────────────┐  │
│  │  FastAPI (port 8001)                      │  │
│  │  ├── REST API (login, events, nodes)      │  │
│  │  ├── WebSocket (live event stream)        │  │
│  │  ├── Static files (built React)           │  │
│  │  └── SQLite (data/app.db)                 │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │  React Frontend (Vite build)              │  │
│  │  ├── Login                                │  │
│  │  ├── Live Events (WebSocket)              │  │
│  │  ├── Historical Events (REST + paginate)  │  │
│  │  ├── Nodes (REST)                         │  │
│  │  └── Event Detail (side panel)            │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## File layout

```
backend/              FastAPI app, SQLAlchemy models, Alembic, tests
  main.py             app entry, routes, WebSocket
  models.py           SQLAlchemy models
  schemas.py          Pydantic schemas
  auth.py             JWT auth
  database.py         engine, session
  cleanup.py          background task for event retention
  mock.py             mock event generator (for local dev on macOS)
  alembic/            migrations
  tests/              pytest tests
frontend/             React + Vite
  src/
    App.tsx           routing, auth guard
    pages/
      Login.tsx
      LiveEvents.tsx
      HistoricalEvents.tsx
      Nodes.tsx
    components/
      EventDetail.tsx  side panel
      EventTable.tsx   shared table
      FilterBar.tsx    shared filter bar
      TopNav.tsx
    hooks/
      useWebSocket.ts  live event stream
    store/
      authStore.ts     Zustand auth state
    api/
      events.ts        TanStack Query hooks
      nodes.ts
probe/                Go eBPF agent
  main.go             entry, reads ring buffer, sends to backend
  ebpf/               C eBPF programs
    execve.bpf.c
    openat.bpf.c
    connect.bpf.c
  go.mod
deploy/               K8s manifests
  daemonset.yaml      DaemonSet with --privileged
  rbac.yaml           service account
data/                 SQLite file (git-ignored)
run.sh                build frontend, migrate, start on APP_PORT
```

## Frontend (React + Vite — built to static files and served by the backend; one process, one port)

- React 19 + Vite 7, built to `frontend/dist/` and served by FastAPI as static files
- Zustand 5 for auth state (token held in memory, not localStorage)
- TanStack Query v5 for data fetching (historical events, nodes)
- WebSocket hook for live event streaming
- Relative API paths (`/api/...`) — no CORS, no base URL
- Pages: Login, Live Events, Historical Events, Nodes
- Components: EventTable (shared), FilterBar (shared), EventDetail (side panel), TopNav
- Dark theme matching `UI/` prototype: bg `#0f0f1e`, surface `#1a1a2e`, syscall colors: execve blue, openat green, connect orange
- Monospace font (JetBrains Mono) for PID and container ID

## Backend / API (FastAPI)

### REST endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/login` | none | Returns JWT token |
| GET | `/api/events` | JWT | Paginated historical events (query: page, per_page, syscall_type, pod, namespace) |
| GET | `/api/events/{id}` | JWT | Single event detail |
| POST | `/api/events` | probe key | Receive event from eBPF probe |
| GET | `/api/nodes` | JWT | List all nodes with probe status |
| POST | `/api/nodes/heartbeat` | probe key | Node heartbeat from probe |

### WebSocket

| Path | Auth | Purpose |
|------|------|---------|
| `/api/ws/events` | JWT via `?token=...` | Live event stream — server broadcasts new events to all connected clients |

### Probe authentication

The eBPF probe authenticates with a shared key (`PROBE_API_KEY` in `.env`) sent in the `X-Probe-Key` header. This is not a user JWT — it is a simple shared secret between the probe and the dashboard. In 0.1, this key is generated by the assistant and stored in `secrets/secrets.local.md`.

### Mock event generator

When `MOCK_EVENTS=true` in `.env`, an asyncio task generates random events every 1-2 seconds and inserts them into the database + broadcasts via WebSocket. This allows full dashboard testing on macOS without a real eBPF probe. The mock generator produces realistic data: random syscalls, pod names, namespaces, PIDs, and syscall-specific args.

## Data model (SQLAlchemy + Alembic over one SQLite file, migrations from the first commit)

### Table: events

| Column | Type | Key | Notes |
|--------|------|-----|-------|
| id | BigInteger | PK, autoincrement | |
| syscall_type | String(16) | NOT NULL | `execve`, `openat`, `connect` |
| timestamp | DateTime | NOT NULL, indexed | Event time with milliseconds |
| pid | Integer | NOT NULL | Process ID |
| process_name | String(256) | NOT NULL | |
| pod_name | String(256) | NULL | Null if process is outside a pod |
| node_name | String(256) | NOT NULL, indexed | |
| namespace | String(256) | NULL | |
| container_id | String(64) | NULL | |
| args | Text | NOT NULL | JSON string of syscall arguments |

### Table: users

| Column | Type | Key | Notes |
|--------|------|-----|-------|
| id | Integer | PK, autoincrement | |
| username | String(64) | UNIQUE, NOT NULL | |
| password_hash | String(256) | NOT NULL | bcrypt |
| role | String(16) | NOT NULL, default `admin` | |

### Table: nodes

| Column | Type | Key | Notes |
|--------|------|-----|-------|
| id | Integer | PK, autoincrement | |
| node_name | String(256) | UNIQUE, NOT NULL | |
| ip_address | String(45) | NOT NULL | |
| probe_status | String(16) | NOT NULL, default `inactive` | `active` / `inactive` |
| last_report | DateTime | NOT NULL | |

### Relations

- `events.node_name` ↔ `nodes.node_name` (logical, not a physical FK — node may be registered before or after events arrive)
- `users` is independent — no data relation to events

## Background work (no cache, no queue)

Two asyncio background tasks, started on app startup:

1. **Event cleanup** — runs every 10 minutes, deletes events older than `EVENT_RETENTION_HOURS` (default 24). Nodes are never deleted.

2. **Node status monitor** — runs every 60 seconds, marks nodes with `last_report` older than 90 seconds as `inactive`.

Post-MVP note: when the product has real users, PostgreSQL and a real queue (Redis/Kafka) behind these same interfaces is the right move. Not now.

## File storage (a folder on disk behind one small interface)

No file storage in 0.1. The product records syscall metadata only — no file contents, no command output, no packet payloads. The `UPLOADS_DIR` from `.env.example` is not used.

## Dependencies / integrations

No external SaaS dependencies. See `docs/living/dependencies.md` for the full record. The only integration is the eBPF probe → dashboard REST channel, which uses a shared API key.

## How it runs locally

`./run.sh` on APP_PORT (8001) from `.env`, reachable at `http://localhost:8001`. No containers on the user's computer. The script builds the frontend, applies migrations, and starts Uvicorn. With `MOCK_EVENTS=true`, the dashboard generates synthetic events for testing.

## How it is deployed

Filled in at `/deploy`. The eBPF probe is deployed as a K8s DaemonSet separately. The dashboard deployment path (container + Caddy or custom) is decided at `/deploy`.

## eBPF probe

- Language: Go + `github.com/cilium/ebpf`
- eBPF programs written in C, compiled with `bpf2go` to generate Go bindings
- Three tracepoint hooks: `sys_enter_execve`, `sys_enter_openat`, `sys_enter_connect`
- Events sent via ring buffer to userspace
- Pod info extracted from `/proc/<pid>/cgroup` and container runtime
- Runs as DaemonSet with `--privileged`, volume mounts on `/sys/kernel` and `/proc`
- Dashboard URL from `DASHBOARD_URL` environment variable in the DaemonSet
- Probe API key from `PROBE_API_KEY` environment variable

## macOS development

eBPF only works on Linux. Therefore:

- **Dashboard** runs on macOS with `./run.sh` — with mock data (`MOCK_EVENTS=true`) or empty
- **Probe** runs on a Linux K8s cluster (kind/minikube or real cluster)
- Full integration testing (scenarios 16-17) only works on a real cluster with a real probe

## Post-MVP

- **PostgreSQL:** change `DATABASE_URL` — all queries go through SQLAlchemy, so migration is one line. Never use a SQLite-specific feature that breaks PostgreSQL.
- **Redis + job queue:** when event volume grows, ring buffer moves to Kafka or Redis Stream. In 0.1, asyncio tasks are sufficient.
- **Full syscall coverage:** add more hooks in the probe — architecture allows it.
- **Anomaly detection:** a separate component that reads events and builds behavior patterns — in 0.2.

## چه چیزی باید نصب باشد

**Baseline (on your computer — macOS):**
- Python 3.12
- Node.js 22 LTS

**For the dashboard:**
- Nothing extra — Python and Node are enough

**For the eBPF probe (on Linux — cluster or VM):**
- Go 1.22+
- clang/llvm (for compiling eBPF C)
- libbpf-dev
- kernel headers (`linux-headers-$(uname -r)`)
- make

**For local K8s cluster (testing):**
- kubectl
- kind or minikube

> `/setup-dev` installs only the baseline and macOS tools. Linux tools (Go, clang, libbpf) are installed on the cluster, not on your computer.
