"""Card API endpoints."""
from fastapi import APIRouter, HTTPException, Query, Request
from ..models.schemas import Card
from ..services.data_service import load_cards

router = APIRouter(prefix="/api/cards", tags=["Cards"])


@router.get("", response_model=list[Card])
def get_cards(
    request: Request,
    color: str | None = Query(None, description="Filter by character color (ironclad, silent, defect, necrobinder, regent, colorless)"),
    type: str | None = Query(None, description="Filter by card type (Attack, Skill, Power, Status, Curse)"),
    rarity: str | None = Query(None, description="Filter by rarity (Basic, Common, Uncommon, Rare, Ancient)"),
    keyword: str | None = Query(None, description="Filter by keyword (Exhaust, Innate, Ethereal, Retain, Unplayable, Sly, Eternal)"),
    search: str | None = Query(None, description="Search by name"),
):
    cards = load_cards()
    if color:
        cards = [c for c in cards if c["color"].lower() == color.lower()]
    if type:
        cards = [c for c in cards if c["type"].lower() == type.lower()]
    if rarity:
        cards = [c for c in cards if c["rarity"].lower() == rarity.lower()]
    if keyword:
        cards = [c for c in cards if c.get("keywords") and keyword in c["keywords"]]
    if search:
        cards = [c for c in cards if search.lower() in c["name"].lower()]
    return cards


@router.get("/{card_id}", response_model=Card)
def get_card(request: Request, card_id: str):
    cards = load_cards()
    for card in cards:
        if card["id"] == card_id.upper():
            return card
    raise HTTPException(status_code=404, detail=f"Card '{card_id}' not found")
