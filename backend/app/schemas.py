from datetime import datetime
from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class EventCreate(BaseModel):
    syscall_type: str
    timestamp: datetime
    pid: int
    process_name: str
    pod_name: str | None = None
    node_name: str
    namespace: str | None = None
    container_id: str | None = None
    args: str


class EventResponse(BaseModel):
    id: int
    syscall_type: str
    timestamp: datetime
    pid: int
    process_name: str
    pod_name: str | None
    node_name: str
    namespace: str | None
    container_id: str | None
    args: str

    model_config = {"from_attributes": True}


class PaginatedEvents(BaseModel):
    events: list[EventResponse]
    total: int
    page: int
    per_page: int
    pages: int


class NodeResponse(BaseModel):
    id: int
    node_name: str
    ip_address: str
    probe_status: str
    last_report: datetime

    model_config = {"from_attributes": True}


class HeartbeatRequest(BaseModel):
    node_name: str
    ip_address: str
