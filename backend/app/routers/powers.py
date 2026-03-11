"""Power/buff/debuff API endpoints."""
from fastapi import APIRouter, HTTPException, Query, Request
from ..models.schemas import Power
from ..services.data_service import load_powers

router = APIRouter(prefix="/api/powers", tags=["Powers"])


@router.get("", response_model=list[Power])
def get_powers(
    request: Request,
    type: str | None = Query(None, description="Filter by type (Buff/Debuff)"),
    stack_type: str | None = Query(None, description="Filter by stack type (Counter/Single/None)"),
    search: str | None = Query(None, description="Search by name"),
):
    powers = load_powers()
    if type:
        powers = [p for p in powers if p["type"].lower() == type.lower()]
    if stack_type:
        powers = [p for p in powers if p.get("stack_type", "").lower() == stack_type.lower()]
    if search:
        powers = [p for p in powers if search.lower() in p["name"].lower()]
    return powers


@router.get("/{power_id}", response_model=Power)
def get_power(request: Request, power_id: str):
    powers = load_powers()
    for power in powers:
        if power["id"] == power_id.upper():
            return power
    raise HTTPException(status_code=404, detail=f"Power '{power_id}' not found")
