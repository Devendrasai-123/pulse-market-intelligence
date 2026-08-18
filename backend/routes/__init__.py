from routes.insight import router as insight_router
from routes.news import router as news_router
from routes.prices import router as prices_router

__all__ = ["prices_router", "news_router", "insight_router"]
