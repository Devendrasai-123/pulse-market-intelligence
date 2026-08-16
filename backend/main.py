"""Pulse API entrypoint.

Run from this directory:

    uvicorn main:app --reload
"""

from fastapi import FastAPI

app = FastAPI(title="Pulse", version="0.1.0")


@app.get("/health")
def health_check() -> dict[str, str]:
    """Liveness probe used by local setup checks and later by Render."""
    return {"status": "ok"}
