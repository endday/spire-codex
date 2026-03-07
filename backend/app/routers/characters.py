"""Character API endpoints."""
from fastapi import APIRouter, HTTPException, Request
from ..models.schemas import Character
from ..services.data_service import load_characters

router = APIRouter(prefix="/api/characters", tags=["Characters"])


@router.get("", response_model=list[Character])
def get_characters(request: Request):
    return load_characters()


@router.get("/{character_id}", response_model=Character)
def get_character(request: Request, character_id: str):
    characters = load_characters()
    for char in characters:
        if char["id"] == character_id.upper():
            return char
    raise HTTPException(status_code=404, detail=f"Character '{character_id}' not found")
