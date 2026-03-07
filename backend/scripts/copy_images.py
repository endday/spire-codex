"""Copy and organize game images into backend/static/images/."""
import shutil
from pathlib import Path

BASE = Path(__file__).resolve().parents[2]
RAW_IMAGES = BASE / "extraction" / "raw" / "images"
STATIC_IMAGES = BASE / "backend" / "static" / "images"

CARD_PORTRAITS = RAW_IMAGES / "packed" / "card_portraits"
RELICS_SRC = RAW_IMAGES / "relics"
POTIONS_SRC = RAW_IMAGES / "potions"
CHAR_SELECT_SRC = RAW_IMAGES / "packed" / "character_select"
CHAR_ICON_SRC = RAW_IMAGES / "ui" / "top_panel"
MONSTERS_SRC = RAW_IMAGES / "monsters"

CARDS_DST = STATIC_IMAGES / "cards"
RELICS_DST = STATIC_IMAGES / "relics"
POTIONS_DST = STATIC_IMAGES / "potions"
CHARS_DST = STATIC_IMAGES / "characters"
MONSTERS_DST = STATIC_IMAGES / "monsters"


def copy_cards():
    """Copy card portraits, flattening subdirectory structure."""
    CARDS_DST.mkdir(parents=True, exist_ok=True)
    count = 0
    # Top-level pngs (e.g. ancient_beta.png, beta.png)
    for png in CARD_PORTRAITS.glob("*.png"):
        if png.suffix == ".png" and not png.name.endswith(".import"):
            shutil.copy2(png, CARDS_DST / png.name)
            count += 1
    # Subdirectory pngs (ironclad/bash.png, etc.) including beta subdirs
    for png in CARD_PORTRAITS.rglob("*.png"):
        if png.name.endswith(".import"):
            continue
        if png.parent == CARD_PORTRAITS:
            continue  # already handled above
        dst = CARDS_DST / png.name
        shutil.copy2(png, dst)
        count += 1
    print(f"Copied {count} card images -> static/images/cards/")


def copy_relics():
    RELICS_DST.mkdir(parents=True, exist_ok=True)
    count = 0
    for png in RELICS_SRC.glob("*.png"):
        if png.name.endswith(".import"):
            continue
        shutil.copy2(png, RELICS_DST / png.name)
        count += 1
    print(f"Copied {count} relic images -> static/images/relics/")


def copy_potions():
    POTIONS_DST.mkdir(parents=True, exist_ok=True)
    count = 0
    for png in POTIONS_SRC.glob("*.png"):
        if png.name.endswith(".import"):
            continue
        shutil.copy2(png, POTIONS_DST / png.name)
        count += 1
    print(f"Copied {count} potion images -> static/images/potions/")


def copy_characters():
    CHARS_DST.mkdir(parents=True, exist_ok=True)
    count = 0
    # char_select images
    for png in CHAR_SELECT_SRC.glob("*.png"):
        if png.name.endswith(".import"):
            continue
        shutil.copy2(png, CHARS_DST / png.name)
        count += 1
    # character_icon images
    for png in CHAR_ICON_SRC.glob("character_icon_*.png"):
        if png.name.endswith(".import"):
            continue
        shutil.copy2(png, CHARS_DST / png.name)
        count += 1
    print(f"Copied {count} character images -> static/images/characters/")


def copy_monsters():
    MONSTERS_DST.mkdir(parents=True, exist_ok=True)
    count = 0
    for png in MONSTERS_SRC.rglob("*.png"):
        if png.name.endswith(".import"):
            continue
        shutil.copy2(png, MONSTERS_DST / png.name)
        count += 1
    print(f"Copied {count} monster images -> static/images/monsters/")


def main():
    print("=== Copying game images to static directory ===\n")
    copy_cards()
    copy_relics()
    copy_potions()
    copy_characters()
    copy_monsters()
    print("\n=== Done! ===")


if __name__ == "__main__":
    main()
