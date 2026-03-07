"""Potion API endpoints."""
from fastapi import APIRouter, HTTPException, Query, Request
from ..models.schemas import Potion
from ..services.data_service import load_potions

router = APIRouter(prefix="/api/potions", tags=["Potions"])


@router.get("", response_model=list[Potion])
def get_potions(
    request: Request,
    rarity: str | None = Query(None, description="Filter by rarity"),
    search: str | None = Query(None, description="Search by name"),
):
    potions = load_potions()
    if rarity:
        potions = [p for p in potions if p["rarity"].lower() == rarity.lower()]
    if search:
        potions = [p for p in potions if search.lower() in p["name"].lower()]
    return potions


@router.get("/{potion_id}", response_model=Potion)
def get_potion(request: Request, potion_id: str):
    potions = load_potions()
    for potion in potions:
        if potion["id"] == potion_id.upper():
            return potion
    raise HTTPException(status_code=404, detail=f"Potion '{potion_id}' not found")
