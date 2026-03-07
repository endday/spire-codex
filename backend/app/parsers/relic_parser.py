"""Parse relic data from decompiled C# files and localization JSON."""
import json
import re
from pathlib import Path

BASE = Path(__file__).resolve().parents[3]
DECOMPILED = BASE / "extraction" / "decompiled"
LOCALIZATION = BASE / "extraction" / "raw" / "localization" / "eng"
RELICS_DIR = DECOMPILED / "MegaCrit.Sts2.Core.Models.Relics"
RELIC_POOLS_DIR = DECOMPILED / "MegaCrit.Sts2.Core.Models.RelicPools"
OUTPUT = BASE / "data"


def class_name_to_id(name: str) -> str:
    s = re.sub(r'(?<=[a-z0-9])(?=[A-Z])', '_', name)
    s = re.sub(r'(?<=[A-Z])(?=[A-Z][a-z])', '_', s)
    return s.upper()


def load_localization() -> dict:
    loc_file = LOCALIZATION / "relics.json"
    if loc_file.exists():
        with open(loc_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def parse_relic_pools() -> dict[str, str]:
    """Map relic class names to character pools."""
    relic_to_pool = {}
    pool_map = {
        "IroncladRelicPool.cs": "ironclad",
        "SilentRelicPool.cs": "silent",
        "DefectRelicPool.cs": "defect",
        "NecrobinderRelicPool.cs": "necrobinder",
        "RegentRelicPool.cs": "regent",
        "SharedRelicPool.cs": "shared",
    }
    for filename, pool_name in pool_map.items():
        filepath = RELIC_POOLS_DIR / filename
        if not filepath.exists():
            continue
        content = filepath.read_text(encoding="utf-8")
        for m in re.finditer(r'ModelDb\.Relic<(\w+)>\(\)', content):
            relic_to_pool[m.group(1)] = pool_name
    return relic_to_pool


def parse_single_relic(filepath: Path, localization: dict, relic_pools: dict) -> dict | None:
    content = filepath.read_text(encoding="utf-8")
    class_name = filepath.stem

    if class_name.startswith("Deprecated") or class_name.startswith("Mock"):
        return None

    relic_id = class_name_to_id(class_name)

    # Rarity
    rarity_match = re.search(r'Rarity\s*=>\s*RelicRarity\.(\w+)', content)
    rarity = rarity_match.group(1) if rarity_match else "Unknown"

    # Localization
    title = localization.get(f"{relic_id}.title", class_name)
    description = localization.get(f"{relic_id}.description", "")
    flavor = localization.get(f"{relic_id}.flavor", "")
    desc_clean = re.sub(r'\[/?(?:gold|blue|red|purple|green|orange|pink)\]', '', description)
    flavor_clean = re.sub(r'\[/?(?:gold|blue|red|purple|green|orange|pink)\]', '', flavor)

    # Pool/character
    pool = relic_pools.get(class_name, "shared")

    return {
        "id": relic_id,
        "name": title,
        "description": desc_clean,
        "description_raw": description,
        "flavor": flavor_clean,
        "rarity": rarity,
        "pool": pool,
        "image_url": f"/static/images/relics/{relic_id.lower()}.png",
    }


def parse_all_relics() -> list[dict]:
    localization = load_localization()
    relic_pools = parse_relic_pools()
    relics = []
    for filepath in sorted(RELICS_DIR.glob("*.cs")):
        relic = parse_single_relic(filepath, localization, relic_pools)
        if relic:
            relics.append(relic)
    return relics


def main():
    OUTPUT.mkdir(exist_ok=True)
    relics = parse_all_relics()
    with open(OUTPUT / "relics.json", "w", encoding="utf-8") as f:
        json.dump(relics, f, indent=2, ensure_ascii=False)
    print(f"Parsed {len(relics)} relics -> data/relics.json")


if __name__ == "__main__":
    main()
