"""HTTP routers. main.py imports each module directly; this list is for discovery."""

from routes.activity import router as activity_router
from routes.insight import router as insight_router
from routes.news import router as news_router
from routes.prices import router as prices_router
from routes.self_heal import router as self_heal_router

__all__ = [
    "activity_router",
    "insight_router",
    "news_router",
    "prices_router",
    "self_heal_router",
]
