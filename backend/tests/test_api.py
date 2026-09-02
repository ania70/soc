import pytest

# All fixtures come from conftest.py


@pytest.mark.asyncio
async def test_login_success(client):
    r = await client.post("/api/auth/login", json={"username": "admin", "password": "testpass123"})
    assert r.status_code == 200
    assert "access_token" in r.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    r = await client.post("/api/auth/login", json={"username": "admin", "password": "wrong"})
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_events_requires_auth(client):
    r = await client.get("/api/events")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_create_event_with_probe_key(client):
    r = await client.post(
        "/api/events",
        json={
            "syscall_type": "execve",
            "timestamp": "2025-01-01T12:00:00Z",
            "pid": 1234,
            "process_name": "nginx",
            "pod_name": "nginx-abc",
            "node_name": "node-01",
            "namespace": "default",
            "container_id": "container-123",
            "args": '{"filename": "/usr/bin/nginx"}',
        },
        headers={"X-Probe-Key": "test-probe-key"},
    )
    assert r.status_code == 201
    assert "id" in r.json()


@pytest.mark.asyncio
async def test_create_event_wrong_probe_key(client):
    r = await client.post(
        "/api/events",
        json={
            "syscall_type": "execve",
            "timestamp": "2025-01-01T12:00:00Z",
            "pid": 1234,
            "process_name": "nginx",
            "node_name": "node-01",
            "args": "{}",
        },
        headers={"X-Probe-Key": "wrong"},
    )
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_list_events_pagination(client):
    token = (await client.post("/api/auth/login", json={"username": "admin", "password": "testpass123"})).json()["access_token"]
    # create 55 events
    from datetime import datetime, timezone, timedelta
    base = datetime.now(timezone.utc) - timedelta(minutes=10)
    for i in range(55):
        await client.post(
            "/api/events",
            json={
                "syscall_type": "execve",
                "timestamp": (base + timedelta(seconds=i)).isoformat(),
                "pid": i,
                "process_name": "test",
                "node_name": "node-01",
                "args": "{}",
            },
            headers={"X-Probe-Key": "test-probe-key"},
        )
    r = await client.get("/api/events?page=1&per_page=50", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    data = r.json()
    assert data["total"] == 55
    assert data["page"] == 1
    assert data["per_page"] == 50
    assert len(data["events"]) == 50
    assert data["pages"] == 2


@pytest.mark.asyncio
async def test_event_filtering(client):
    token = (await client.post("/api/auth/login", json={"username": "admin", "password": "testpass123"})).json()["access_token"]
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).isoformat()
    for sc in ["execve", "openat", "connect", "execve"]:
        await client.post(
            "/api/events",
            json={
                "syscall_type": sc,
                "timestamp": now,
                "pid": 1,
                "process_name": "test",
                "pod_name": "nginx-pod",
                "node_name": "node-01",
                "namespace": "default",
                "args": "{}",
            },
            headers={"X-Probe-Key": "test-probe-key"},
        )
    r = await client.get("/api/events?syscall_type=execve", headers={"Authorization": f"Bearer {token}"})
    data = r.json()
    assert data["total"] == 2
    assert all(e["syscall_type"] == "execve" for e in data["events"])


@pytest.mark.asyncio
async def test_event_detail(client):
    token = (await client.post("/api/auth/login", json={"username": "admin", "password": "testpass123"})).json()["access_token"]
    r = await client.post(
        "/api/events",
        json={
            "syscall_type": "connect",
            "timestamp": "2025-01-01T12:00:00Z",
            "pid": 999,
            "process_name": "curl",
            "pod_name": None,
            "node_name": "node-01",
            "namespace": None,
            "container_id": None,
            "args": '{"dest_addr": "10.0.0.1", "dest_port": 80}',
        },
        headers={"X-Probe-Key": "test-probe-key"},
    )
    event_id = r.json()["id"]
    r2 = await client.get(f"/api/events/{event_id}", headers={"Authorization": f"Bearer {token}"})
    assert r2.status_code == 200
    data = r2.json()
    assert data["syscall_type"] == "connect"
    assert data["pod_name"] is None
    assert "dest_addr" in data["args"]


@pytest.mark.asyncio
async def test_node_heartbeat(client):
    r = await client.post(
        "/api/nodes/heartbeat",
        json={"node_name": "node-01", "ip_address": "10.0.0.1"},
        headers={"X-Probe-Key": "test-probe-key"},
    )
    assert r.status_code == 200
    token = (await client.post("/api/auth/login", json={"username": "admin", "password": "testpass123"})).json()["access_token"]
    r2 = await client.get("/api/nodes", headers={"Authorization": f"Bearer {token}"})
    assert r2.status_code == 200
    nodes = r2.json()
    assert len(nodes) == 1
    assert nodes[0]["node_name"] == "node-01"
    assert nodes[0]["probe_status"] == "active"


@pytest.mark.asyncio
async def test_event_without_pod(client):
    token = (await client.post("/api/auth/login", json={"username": "admin", "password": "testpass123"})).json()["access_token"]
    r = await client.post(
        "/api/events",
        json={
            "syscall_type": "execve",
            "timestamp": "2025-01-01T12:00:00Z",
            "pid": 1,
            "process_name": "kernel",
            "pod_name": None,
            "node_name": "node-01",
            "namespace": None,
            "container_id": None,
            "args": "{}",
        },
        headers={"X-Probe-Key": "test-probe-key"},
    )
    event_id = r.json()["id"]
    r2 = await client.get(f"/api/events/{event_id}", headers={"Authorization": f"Bearer {token}"})
    data = r2.json()
    assert data["pod_name"] is None
    assert data["namespace"] is None
