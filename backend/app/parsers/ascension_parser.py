"""Parse ascension level data from localization JSON."""
import json
import re
from pathlib import Path

BASE = Path(__file__).resolve().parents[3]


def load_localization(loc_dir: Path) -> dict:
    loc_file = loc_dir / "ascension.json"
    if loc_file.exists():
        with open(loc_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def parse_all_ascensions(loc_dir: Path) -> list[dict]:
    loc = load_localization(loc_dir)
    levels = []
    for key in sorted(loc.keys()):
        m = re.match(r'LEVEL_(\d+)\.title$', key)
        if not m:
            continue
        level = int(m.group(1))
        title = loc[key]
        desc_key = f"LEVEL_{m.group(1)}.description"
        description = loc.get(desc_key, "")
        levels.append({
            "id": f"LEVEL_{level:02d}",
            "level": level,
            "name": title,
            "description": description,
        })
    return sorted(levels, key=lambda x: x["level"])


def main(lang: str = "eng"):
    loc_dir = BASE / "extraction" / "raw" / "localization" / lang
    output_dir = BASE / "data" / lang
    output_dir.mkdir(parents=True, exist_ok=True)
    ascensions = parse_all_ascensions(loc_dir)
    with open(output_dir / "ascensions.json", "w", encoding="utf-8") as f:
        json.dump(ascensions, f, indent=2, ensure_ascii=False)
    print(f"Parsed {len(ascensions)} ascension levels -> data/{lang}/ascensions.json")


if __name__ == "__main__":
    main()
