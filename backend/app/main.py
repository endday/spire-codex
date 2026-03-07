"""Spire Codex API - FastAPI Application."""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from .routers import cards, characters, relics, monsters, potions
from .services.data_service import get_stats

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

app = FastAPI(
    title="Spire Codex API",
    description="Comprehensive API for Slay the Spire 2 game data including cards, characters, relics, monsters, and potions.",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cards.router)
app.include_router(characters.router)
app.include_router(relics.router)
app.include_router(monsters.router)
app.include_router(potions.router)


@app.get("/api/stats", tags=["Stats"])
def stats(request: Request):
    """Get total counts of all game entities."""
    return get_stats()


@app.get("/", tags=["Root"])
def root(request: Request):
    return {
        "name": "Spire Codex API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "cards": "/api/cards",
            "characters": "/api/characters",
            "relics": "/api/relics",
            "monsters": "/api/monsters",
            "potions": "/api/potions",
            "stats": "/api/stats",
        },
    }


STATIC_DIR = Path(__file__).resolve().parents[1] / "static"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
