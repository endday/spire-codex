"""Shared FastAPI dependencies."""
from fastapi import Query

VALID_LANGUAGES = {
    "deu", "eng", "esp", "fra", "ita", "jpn",
    "kor", "pol", "ptb", "rus", "spa", "tha", "tur", "zhs",
}

LANGUAGE_NAMES = {
    "deu": "Deutsch",
    "eng": "English",
    "esp": "Español (ES)",
    "fra": "Français",
    "ita": "Italiano",
    "jpn": "日本語",
    "kor": "한국어",
    "pol": "Polski",
    "ptb": "Português (BR)",
    "rus": "Русский",
    "spa": "Español (LA)",
    "tha": "ไทย",
    "tur": "Türkçe",
    "zhs": "简体中文",
}

DEFAULT_LANG = "eng"


def get_lang(lang: str = Query("eng", description="Language code")) -> str:
    """Validate and return language code, falling back to English."""
    return lang if lang in VALID_LANGUAGES else DEFAULT_LANG
