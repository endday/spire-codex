"""Ascension API endpoints."""
from fastapi import APIRouter, Depends, Request
from ..models.schemas import Ascension
from ..services.data_service import load_ascensions
from ..dependencies import get_lang

router = APIRouter(prefix="/api/ascensions", tags=["Ascensions"])


@router.get("", response_model=list[Ascension])
def get_ascensions(request: Request, lang: str = Depends(get_lang)):
    return load_ascensions(lang)
