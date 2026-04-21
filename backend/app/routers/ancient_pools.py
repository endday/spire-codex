"""Ancient relic pool API endpoints."""

import json

from fastapi import APIRouter, HTTPException, Request

from ..services.data_service import DATA_DIR, _resolve_base, _get_version

router = APIRouter(prefix="/api/ancient-pools", tags=["Ancient Pools"])


def _load_pools() -> list[dict]:
    """Load ancient_pools.json.

    Tries the version-resolved base first (so beta versions can ship their own
    file), then falls back to DATA_DIR so an unversioned file at the data root
    works for both stable and beta layouts.
    """
    candidates = [
        _resolve_base(_get_version()) / "ancient_pools.json",
        DATA_DIR / "ancient_pools.json",
    ]
    for path in candidates:
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
    return []


@router.get("", tags=["Ancient Pools"])
def list_ancient_pools(request: Request):
    """Return all ancient relic pools."""
    return _load_pools()


@router.get("/{ancient_id}", tags=["Ancient Pools"])
def get_ancient_pool(ancient_id: str, request: Request):
    """Return relic pools for a specific ancient."""
    pools = _load_pools()
    for pool in pools:
        if pool["id"] == ancient_id.upper():
            return pool
    raise HTTPException(status_code=404, detail=f"Ancient '{ancient_id}' not found")
