"""
Self-heal API — real Bright Data CLI only (no staged failure, no timer success).

Statuses:
  failed   — live scrape run inspected and looks broken/empty
  healthy  — live scrape run looks valid (do not claim breakage)
  healing  — real `brightdata scraper heal` subprocess in flight / awaiting_approval
  repaired — Bright Data heal envelope status == "done" only
  error    — CLI/auth/timeout/parse failure
"""

from typing import Any, Literal, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from services.self_heal import (
    detect_failure_via_real_run,
    get_collector_id,
    get_job,
    get_target_url,
    preflight,
    start_heal_background,
    write_last_heal_artifact,
)

router = APIRouter(prefix="/api", tags=["self-heal"])

DemoStatus = Literal["failed", "healthy", "healing", "repaired", "error"]


class SelfHealResponse(BaseModel):
    status: DemoStatus
    job_id: str
    collector_id: str
    target_url: str
    bright_data_status: Optional[str] = None
    message: str
    command: list[str] = Field(default_factory=list)
    view_url: Optional[str] = None
    next_step: Optional[str] = None
    preview_result: Optional[Any] = None
    error: Optional[str] = None
    preflight_ok: bool = True
    detection_is_real_scrape: bool = False
    heal_is_real_cli: bool = False
    repaired_from_bright_data_done: bool = False


class PreflightResponse(BaseModel):
    ok: bool
    cli_path: Optional[str] = None
    has_api_key_in_env: bool = False
    collector_id: str
    target_url: str
    issues: list[str] = Field(default_factory=list)


def _to_response(job) -> SelfHealResponse:
    return SelfHealResponse(
        status=job.status,
        job_id=job.job_id,
        collector_id=job.collector_id,
        target_url=get_target_url(),
        bright_data_status=job.bright_data_status,
        message=job.message,
        command=job.command,
        view_url=job.view_url,
        next_step=job.next_step,
        preview_result=job.preview_result,
        error=job.error,
        preflight_ok=job.preflight_ok,
        detection_is_real_scrape=job.detection_is_real_scrape,
        heal_is_real_cli=job.heal_is_real_cli,
        repaired_from_bright_data_done=job.repaired_from_bright_data_done,
    )


@router.get("/self-heal/preflight", response_model=PreflightResponse)
def self_heal_preflight() -> PreflightResponse:
    """Report whether the Bright Data CLI and collector env are ready."""
    return PreflightResponse(**preflight())


@router.post("/self-heal/detect", response_model=SelfHealResponse)
@router.post("/self-heal/mark-failed", response_model=SelfHealResponse)
def self_heal_detect() -> SelfHealResponse:
    """
    REAL failure detection: runs `brightdata scraper run` on the price collector
    and inspects JSON. Returns failed | healthy | error.

    `/mark-failed` is kept as an alias for older demo scripts — it no longer
    stages a fake failure flag.
    """
    job = detect_failure_via_real_run()
    return _to_response(job)


@router.post("/trigger-self-heal", response_model=SelfHealResponse)
def trigger_self_heal(
    auto_approve: bool = Query(
        True,
        description=(
            "Pass --auto-approve to Bright Data CLI so heal commits without a "
            "separate approve step. Set false to stop at awaiting_approval."
        ),
    ),
) -> SelfHealResponse:
    """Start REAL `brightdata scraper heal` for PRICE_COLLECTOR_ID."""
    try:
        job = start_heal_background(auto_approve=auto_approve)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    write_last_heal_artifact(job)
    return _to_response(job)


@router.get("/self-heal/status", response_model=SelfHealResponse)
def self_heal_status(
    job_id: str | None = Query(None, description="Job id from detect or trigger"),
) -> SelfHealResponse:
    """
    Return the latest in-memory job updated by the real CLI subprocess.

    Does not invent progress with a timer. While heal runs, status stays
    healing until the CLI exits and we parse Bright Data's envelope.
    """
    job = get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=404,
            detail=(
                "No self-heal job yet. Run POST /api/self-heal/detect "
                f"(collector {get_collector_id()}) or POST /api/trigger-self-heal."
            ),
        )
    return _to_response(job)
