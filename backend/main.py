"""Pulse API entrypoint.

Local:
    uvicorn main:app --reload

Render / production (see Procfile):
    uvicorn main:app --host 0.0.0.0 --port $PORT
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.activity import router as activity_router
from routes.insight import router as insight_router
from routes.news import router as news_router
from routes.prices import router as prices_router
from routes.self_heal import router as self_heal_router

app = FastAPI(title="Pulse", version="0.4.0")

# FRONTEND_ORIGIN="https://a.vercel.app,http://localhost:5173" or "*" / unset = allow all
_raw_origins = os.getenv("FRONTEND_ORIGIN", "").strip()
if _raw_origins and _raw_origins != "*":
    allow_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
else:
    allow_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prices_router)
app.include_router(news_router)
app.include_router(insight_router)
app.include_router(self_heal_router)
app.include_router(activity_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    """Liveness probe used by local setup checks and later by Render."""
    return {"status": "ok"}
