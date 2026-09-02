# چک‌لیستِ ساخت — Build Checklist

> هر آیتم یک خط است. ترتیبِ اجرا به ترتیبِ فهرست است. «done when» می‌گوید چه چیزی اثبات می‌کند که آیتم تمام شده — شاملِ شمارهٔ سناریویی که پوشش می‌دهد.

- [x] 1 — Project skeleton: `backend/`, `frontend/`, `probe/`, `deploy/` dirs, `run.sh` updated · done when: `ls` shows all dirs, `run.sh` exists and is executable · after: 2, 3
- [x] 2 — Backend: SQLAlchemy models (`events`, `users`, `nodes`) matching architecture.md · done when: models.py defines all three tables with correct columns · after: 3
- [x] 3 — Backend: Alembic initial migration creating all tables · done when: `alembic upgrade head` creates `data/app.db` with all tables · after: 4
- [x] 4 — Backend: database engine + session setup from `DATABASE_URL` · done when: app can open and close a session without error · after: 5
- [x] 5 — Backend: seed admin user on startup from `ADMIN_USER`/`ADMIN_PASSWORD` env vars · done when: after first startup, `users` table has one row with username `admin` · after: 6
- [x] 6 — Backend: JWT auth (`auth.py`) — login endpoint, token generation, dependency for protected routes · done when: POST `/api/auth/login` with correct creds returns JWT, wrong creds returns 401 · satisfies: S1, S2 · after: 7, 8
- [x] 7 — Backend: POST `/api/events` (probe key auth) — receive event, store in DB, broadcast to WebSocket clients · done when: POST with `X-Probe-Key` header stores event and returns 201 · after: 8, 9
- [x] 8 — Backend: WebSocket `/api/ws/events` — JWT auth via query param, broadcast new events to connected clients · done when: connecting with valid token receives events in real time · satisfies: S3, S9 · after: 9, 10
- [x] 9 — Backend: GET `/api/events` — paginated, filtered, sorted by timestamp desc, only within retention window · done when: GET with `page=1&per_page=50` returns 50 events with pagination metadata · satisfies: S6, S7 · after: 10
- [x] 10 — Backend: GET `/api/events/{id}` — single event with full detail including parsed args · done when: GET returns event with all fields and args as JSON · satisfies: S5 · after: 11
- [x] 11 — Backend: GET `/api/nodes` — list all nodes with probe status · done when: GET returns node list with active/inactive status · satisfies: S8 · after: 12
- [x] 12 — Backend: POST `/api/nodes/heartbeat` (probe key auth) — upsert node, set active + last_report · done when: POST creates/updates node row with `active` status · after: 13
- [x] 13 — Backend: background tasks — event cleanup (every 10 min) + node status monitor (every 60s) · done when: after 90s without heartbeat, node status flips to `inactive`; old events are deleted · satisfies: S17 · after: 14
- [x] 14 — Backend: mock event generator (`MOCK_EVENTS=true`) — asyncio task generating random events · done when: with `MOCK_EVENTS=true`, events appear in DB and WebSocket without a real probe · satisfies: S3, S12 · after: 15
- [x] 15 — Backend: serve built React static files from `frontend/dist/` · done when: GET `/` returns the React app HTML · after: 16
- [x] 16 — Frontend: project setup — Vite + React 19 + TypeScript, Tailwind, Zustand, TanStack Query · done when: `npm run dev` shows default page · after: 17
- [x] 17 — Frontend: Login page — username/password form, calls `/api/auth/login`, stores JWT in Zustand · done when: login with `admin`/password navigates to Live Events; wrong password shows error · satisfies: S1, S2 · after: 18
- [x] 18 — Frontend: auth guard — redirect to login if no token; TopNav with logout · done when: visiting `/` without login shows Login page; logout returns to Login · satisfies: S10, S11 · after: 19
- [x] 19 — Frontend: Live Events page — WebSocket connection, event table, new events from top, max 500, connection indicator (green/red), event counter + rate · done when: with `MOCK_EVENTS=true`, events stream in real time, indicator is green · satisfies: S3, S9, S15 · after: 20
- [x] 20 — Frontend: FilterBar component — syscall dropdown, pod text, namespace text, clear button · done when: filtering by `execve` shows only blue badges; clearing restores all · satisfies: S4 · after: 21
- [x] 21 — Frontend: EventDetail side panel — opens on row click, shows all fields + parsed syscall args, closes on X or Escape · done when: clicking a row opens right panel with args; Escape closes it · satisfies: S5 · after: 22
- [x] 22 — Frontend: Historical Events page — REST paginated table, same columns, same filters, pagination controls · done when: page 1 shows 50 events, Next/Prev navigate pages · satisfies: S6, S7 · after: 23
- [x] 23 — Frontend: Nodes page — table with name, IP, status dot, last report; active/inactive counts in header · done when: page shows nodes with green/red dots and counts · satisfies: S8 · after: 24
- [x] 24 — Frontend: empty states — "No events recorded yet" on live, "No events found" on historical, "No nodes registered" on nodes · done when: with empty DB, correct messages appear · satisfies: S12, S13 · after: 25
- [x] 25 — Frontend: events without pod show "—" in Pod and Namespace columns · done when: a mock event with null pod shows "—" in table and detail panel · satisfies: S14 · after: 26
- [x] 26 — Frontend: dark theme matching UI/ prototype — colors, fonts, badges, layout · done when: visual review matches `UI/index.html` prototype · after: 27
- [x] 27 — Integration: `run.sh` builds frontend, runs migrations, starts server on port 8001 · done when: `./run.sh` produces a working app at `http://localhost:8001` · after: 28
- [x] 28 — Backend tests: pytest for auth, events CRUD, nodes, pagination, cleanup · done when: `pytest` passes all tests · after: 29
- [x] 29 — Walk scenarios 1-15 against `http://localhost:8001` with `MOCK_EVENTS=true` · done when: all 15 scenarios pass · after: 30
- [x] 30 — Probe: Go eBPF agent — ring buffer reader, three tracepoint hooks, pod info extraction, HTTP sender · done when: probe compiles and sends events to dashboard on Linux · after: 31
- [x] 31 — Probe: K8s DaemonSet manifest with --privileged, volume mounts, env vars · done when: `kubectl apply -f deploy/` runs probe on all nodes · after: 32
- [ ] 32 — Walk scenarios 16-17 against real cluster with real probe · done when: real syscall events appear in dashboard; old events are cleaned up · after: none
