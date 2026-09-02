import asyncio
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Header, Query, Request, WebSocket, WebSocketDisconnect, status
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select, delete, func, update

from app.auth import create_token, verify_password, hash_password, decode_token, verify_probe_key
from app.config import settings
from app.database import async_session, engine
from app.models import Base, Event, User, Node
from app.schemas import (
    LoginRequest, TokenResponse, EventCreate, EventResponse,
    PaginatedEvents, NodeResponse, HeartbeatRequest,
)

security = HTTPBearer(auto_error=False)

app = FastAPI(title="KubeShield")

# --- WebSocket connection manager ---
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, message: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

manager = ConnectionManager()


# --- startup: seed admin ---
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # seed admin user
    async with async_session() as db:
        result = await db.execute(select(User).where(User.username == settings.admin_user))
        if not result.scalar_one_or_none():
            user = User(
                username=settings.admin_user,
                password_hash=hash_password(settings.admin_password),
                role="admin",
            )
            db.add(user)
            await db.commit()

    # start background tasks
    asyncio.create_task(cleanup_task())
    asyncio.create_task(node_monitor_task())
    if settings.mock_events:
        asyncio.create_task(mock_generator_task())


# --- auth dependency ---
async def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(security),
) -> User:
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    username = decode_token(creds.credentials)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    async with async_session() as db:
        result = await db.execute(select(User).where(User.username == username))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user


# --- routes ---
@app.post("/api/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    async with async_session() as db:
        result = await db.execute(select(User).where(User.username == req.username))
        user = result.scalar_one_or_none()
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid username or password")
        token = create_token(user.username)
        return TokenResponse(access_token=token)


@app.post("/api/events", status_code=201)
async def create_event(
    event: EventCreate,
    x_probe_key: str | None = Header(None, alias="X-Probe-Key"),
):
    if not x_probe_key or not await verify_probe_key(x_probe_key):
        raise HTTPException(status_code=403, detail="Invalid probe key")
    async with async_session() as db:
        ev = Event(
            syscall_type=event.syscall_type,
            timestamp=event.timestamp,
            pid=event.pid,
            process_name=event.process_name,
            pod_name=event.pod_name,
            node_name=event.node_name,
            namespace=event.namespace,
            container_id=event.container_id,
            args=event.args,
        )
        db.add(ev)
        await db.commit()
        await db.refresh(ev)
        # upsert node
        result = await db.execute(select(Node).where(Node.node_name == event.node_name))
        node = result.scalar_one_or_none()
        now = datetime.now(timezone.utc)
        if node:
            node.probe_status = "active"
            node.last_report = now
            if event.node_name:
                pass
        else:
            node = Node(
                node_name=event.node_name,
                ip_address="unknown",
                probe_status="active",
                last_report=now,
            )
            db.add(node)
        await db.commit()
        # broadcast
        await manager.broadcast({
            "id": ev.id,
            "syscall_type": ev.syscall_type,
            "timestamp": ev.timestamp.isoformat(),
            "pid": ev.pid,
            "process_name": ev.process_name,
            "pod_name": ev.pod_name,
            "node_name": ev.node_name,
            "namespace": ev.namespace,
            "container_id": ev.container_id,
            "args": ev.args,
        })
    return {"id": ev.id}


@app.get("/api/events", response_model=PaginatedEvents)
async def list_events(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    syscall_type: str | None = Query(None),
    pod: str | None = Query(None),
    namespace: str | None = Query(None),
    _user: User = Depends(get_current_user),
):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=settings.event_retention_hours)
    query = select(Event).where(Event.timestamp >= cutoff)
    count_query = select(func.count(Event.id)).where(Event.timestamp >= cutoff)
    if syscall_type:
        query = query.where(Event.syscall_type == syscall_type)
        count_query = count_query.where(Event.syscall_type == syscall_type)
    if pod:
        query = query.where(Event.pod_name.ilike(f"%{pod}%"))
        count_query = count_query.where(Event.pod_name.ilike(f"%{pod}%"))
    if namespace:
        query = query.where(Event.namespace.ilike(f"%{namespace}%"))
        count_query = count_query.where(Event.namespace.ilike(f"%{namespace}%"))
    total = (await async_session().execute(count_query)).scalar()
    query = query.order_by(Event.timestamp.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await async_session().execute(query)
    events = result.scalars().all()
    pages = (total + per_page - 1) // per_page if total else 0
    return PaginatedEvents(
        events=[EventResponse.model_validate(e) for e in events],
        total=total, page=page, per_page=per_page, pages=pages,
    )


@app.get("/api/events/{event_id}", response_model=EventResponse)
async def get_event(event_id: int, _user: User = Depends(get_current_user)):
    async with async_session() as db:
        result = await db.execute(select(Event).where(Event.id == event_id))
        ev = result.scalar_one_or_none()
        if not ev:
            raise HTTPException(status_code=404, detail="Event not found")
        return EventResponse.model_validate(ev)


@app.get("/api/nodes")
async def list_nodes(_user: User = Depends(get_current_user)):
    async with async_session() as db:
        result = await db.execute(select(Node).order_by(Node.node_name))
        nodes = result.scalars().all()
        return [NodeResponse.model_validate(n) for n in nodes]


@app.post("/api/nodes/heartbeat")
async def node_heartbeat(
    req: HeartbeatRequest,
    x_probe_key: str | None = Header(None, alias="X-Probe-Key"),
):
    if not x_probe_key or not await verify_probe_key(x_probe_key):
        raise HTTPException(status_code=403, detail="Invalid probe key")
    async with async_session() as db:
        result = await db.execute(select(Node).where(Node.node_name == req.node_name))
        node = result.scalar_one_or_none()
        now = datetime.now(timezone.utc)
        if node:
            node.ip_address = req.ip_address
            node.probe_status = "active"
            node.last_report = now
        else:
            node = Node(
                node_name=req.node_name,
                ip_address=req.ip_address,
                probe_status="active",
                last_report=now,
            )
            db.add(node)
        await db.commit()
    return {"status": "ok"}


# --- WebSocket ---
@app.websocket("/api/ws/events")
async def ws_events(ws: WebSocket, token: str = Query(...)):
    username = decode_token(token)
    if not username:
        await ws.close(code=4001)
        return
    await manager.connect(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(ws)


# --- background tasks ---
async def cleanup_task():
    while True:
        await asyncio.sleep(600)
        cutoff = datetime.now(timezone.utc) - timedelta(hours=settings.event_retention_hours)
        async with async_session() as db:
            await db.execute(delete(Event).where(Event.timestamp < cutoff))
            await db.commit()


async def node_monitor_task():
    while True:
        await asyncio.sleep(60)
        cutoff = datetime.now(timezone.utc) - timedelta(seconds=90)
        async with async_session() as db:
            await db.execute(update(Node).where(Node.last_report < cutoff).values(probe_status="inactive"))
            await db.commit()


async def mock_generator_task():
    import random
    syscalls = ["execve", "openat", "connect"]
    pod_names = ["nginx-7f4b8-abc12", "redis-master-0", "api-server-6d8f-x9k2", None, "kube-proxy-abc34", "coredns-5644-def78"]
    namespaces = ["default", "kube-system", "production", None]
    node_names = ["node-01", "node-02", "node-03"]
    processes = ["nginx", "redis-server", "kube-apiserver", "curl", "cat", "python3", "etcd", "containerd"]
    while True:
        await asyncio.sleep(random.uniform(0.5, 2.0))
        sc = random.choice(syscalls)
        pod = random.choice(pod_names)
        ns = random.choice(namespaces) if pod else None
        node = random.choice(node_names)
        proc = random.choice(processes)
        pid = random.randint(100, 65000)
        if sc == "execve":
            args = json.dumps({"filename": f"/usr/bin/{proc}", "argv": [proc, "--flag"]})
        elif sc == "openat":
            args = json.dumps({"path": f"/etc/{proc}.conf", "flags": "O_RDONLY"})
        else:
            args = json.dumps({"dest_addr": f"10.0.{random.randint(1,255)}.{random.randint(1,255)}", "dest_port": random.choice([80, 443, 6379, 8080, 53])})
        ev = EventCreate(
            syscall_type=sc,
            timestamp=datetime.now(timezone.utc),
            pid=pid,
            process_name=proc,
            pod_name=pod,
            node_name=node,
            namespace=ns,
            container_id=f"container-{random.randint(1000,9999)}" if pod else None,
            args=args,
        )
        # insert directly
        async with async_session() as db:
            event = Event(
                syscall_type=ev.syscall_type,
                timestamp=ev.timestamp,
                pid=ev.pid,
                process_name=ev.process_name,
                pod_name=ev.pod_name,
                node_name=ev.node_name,
                namespace=ev.namespace,
                container_id=ev.container_id,
                args=ev.args,
            )
            db.add(event)
            # upsert node
            result = await db.execute(select(Node).where(Node.node_name == node))
            existing_node = result.scalar_one_or_none()
            now = datetime.now(timezone.utc)
            if existing_node:
                existing_node.probe_status = "active"
                existing_node.last_report = now
            else:
                db.add(Node(node_name=node, ip_address=f"10.0.0.{random.randint(1,99)}", probe_status="active", last_report=now))
            await db.commit()
            await db.refresh(event)
            await manager.broadcast({
                "id": event.id,
                "syscall_type": event.syscall_type,
                "timestamp": event.timestamp.isoformat(),
                "pid": event.pid,
                "process_name": event.process_name,
                "pod_name": event.pod_name,
                "node_name": event.node_name,
                "namespace": event.namespace,
                "container_id": event.container_id,
                "args": event.args,
            })


# --- serve frontend static files ---
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.is_dir():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
