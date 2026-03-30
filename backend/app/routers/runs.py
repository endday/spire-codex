"""Run submission and community stats API endpoints."""
from fastapi import APIRouter, HTTPException, Request
from ..services.runs_db import submit_run, get_stats

router = APIRouter(prefix="/api/runs", tags=["Runs"])


@router.post("", tags=["Runs"])
async def submit_run_endpoint(request: Request):
    """Submit a run for community stats. Paste the .run file JSON content."""
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    result = submit_run(data)
    if result.get("error"):
        if result.get("duplicate"):
            raise HTTPException(status_code=409, detail=result["error"])
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/stats", tags=["Runs"])
def get_community_stats(request: Request):
    """Get aggregated community run stats."""
    return get_stats()
