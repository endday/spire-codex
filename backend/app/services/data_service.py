"""Service layer that loads and serves parsed game data from JSON files."""
import json
import os
from pathlib import Path
from functools import lru_cache

DATA_DIR = Path(os.environ.get("DATA_DIR", Path(__file__).resolve().parents[3] / "data"))
DEFAULT_LANG = "eng"


@lru_cache(maxsize=512)
def _load_json(lang: str, entity: str) -> list[dict]:
    """Load a parsed JSON data file for the given language and entity."""
    filepath = DATA_DIR / lang / f"{entity}.json"
    if not filepath.exists():
        filepath = DATA_DIR / DEFAULT_LANG / f"{entity}.json"
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def load_cards(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "cards")


def load_characters(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "characters")


def load_relics(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "relics")


def load_monsters(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "monsters")


def load_potions(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "potions")


def load_enchantments(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "enchantments")


def load_encounters(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "encounters")


def load_events(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "events")


def load_powers(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "powers")


def load_keywords(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "keywords")


def load_intents(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "intents")


def load_orbs(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "orbs")


def load_afflictions(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "afflictions")


def load_modifiers(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "modifiers")


def load_achievements(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "achievements")


def load_epochs(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "epochs")


def load_stories(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "stories")


def load_acts(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "acts")


def load_ascensions(lang: str = DEFAULT_LANG) -> list[dict]:
    return _load_json(lang, "ascensions")


@lru_cache(maxsize=16)
def load_translation_maps(lang: str = DEFAULT_LANG) -> dict:
    """Load translation maps for filter values (English -> localized)."""
    filepath = DATA_DIR / lang / "translations.json"
    if not filepath.exists():
        filepath = DATA_DIR / DEFAULT_LANG / "translations.json"
    if not filepath.exists():
        # Fallback: identity maps
        return {
            "card_types": {},
            "card_rarities": {},
            "relic_rarities": {},
            "potion_rarities": {},
            "keywords": {},
        }
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def count_images() -> int:
    images_dir = Path(os.environ.get("STATIC_DIR", Path(__file__).resolve().parents[2] / "static")) / "images"
    if not images_dir.exists():
        return 0
    return sum(1 for _ in images_dir.rglob("*.png"))


def get_stats(lang: str = DEFAULT_LANG) -> dict:
    return {
        "cards": len(load_cards(lang)),
        "characters": len(load_characters(lang)),
        "relics": len(load_relics(lang)),
        "monsters": len(load_monsters(lang)),
        "potions": len(load_potions(lang)),
        "enchantments": len(load_enchantments(lang)),
        "encounters": len(load_encounters(lang)),
        "events": len(load_events(lang)),
        "powers": len(load_powers(lang)),
        "keywords": len(load_keywords(lang)),
        "intents": len(load_intents(lang)),
        "orbs": len(load_orbs(lang)),
        "afflictions": len(load_afflictions(lang)),
        "modifiers": len(load_modifiers(lang)),
        "achievements": len(load_achievements(lang)),
        "epochs": len(load_epochs(lang)),
        "acts": len(load_acts(lang)),
        "ascensions": len(load_ascensions(lang)),
        "images": count_images(),
    }
