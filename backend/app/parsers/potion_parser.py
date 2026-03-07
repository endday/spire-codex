"""Parse potion data from decompiled C# files and localization JSON."""
import json
import re
from pathlib import Path

BASE = Path(__file__).resolve().parents[3]
DECOMPILED = BASE / "extraction" / "decompiled"
LOCALIZATION = BASE / "extraction" / "raw" / "localization" / "eng"
POTIONS_DIR = DECOMPILED / "MegaCrit.Sts2.Core.Models.Potions"
OUTPUT = BASE / "data"


def class_name_to_id(name: str) -> str:
    s = re.sub(r'(?<=[a-z0-9])(?=[A-Z])', '_', name)
    s = re.sub(r'(?<=[A-Z])(?=[A-Z][a-z])', '_', s)
    return s.upper()


def load_localization() -> dict:
    loc_file = LOCALIZATION / "potions.json"
    if loc_file.exists():
        with open(loc_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def parse_single_potion(filepath: Path, localization: dict) -> dict | None:
    content = filepath.read_text(encoding="utf-8")
    class_name = filepath.stem

    if class_name.startswith("Deprecated") or class_name.startswith("Mock"):
        return None

    potion_id = class_name_to_id(class_name)

    # Rarity
    rarity_match = re.search(r'Rarity\s*=>\s*PotionRarity\.(\w+)', content)
    rarity = rarity_match.group(1) if rarity_match else "Common"

    # Localization
    title = localization.get(f"{potion_id}.title", class_name)
    description = localization.get(f"{potion_id}.description", "")
    desc_clean = re.sub(r'\[/?(?:gold|blue|red|purple|green|orange|pink)\]', '', description)

    return {
        "id": potion_id,
        "name": title,
        "description": desc_clean,
        "description_raw": description,
        "rarity": rarity,
        "image_url": f"/static/images/potions/{potion_id.lower()}.png",
    }


def parse_all_potions() -> list[dict]:
    localization = load_localization()
    potions = []
    for filepath in sorted(POTIONS_DIR.glob("*.cs")):
        potion = parse_single_potion(filepath, localization)
        if potion:
            potions.append(potion)
    return potions


def main():
    OUTPUT.mkdir(exist_ok=True)
    potions = parse_all_potions()
    with open(OUTPUT / "potions.json", "w", encoding="utf-8") as f:
        json.dump(potions, f, indent=2, ensure_ascii=False)
    print(f"Parsed {len(potions)} potions -> data/potions.json")


if __name__ == "__main__":
    main()
