"""Activity log payload for GET /api/activity."""

from pydantic import BaseModel, Field


class ActivityEvent(BaseModel):
    id: str | None = None
    event_type: str
    description: str
    collector_id: str | None = None
    occurred_at: str | None = None
    source: str | None = None


class ActivityResponse(BaseModel):
    count: int
    items: list[ActivityEvent] = Field(default_factory=list)
