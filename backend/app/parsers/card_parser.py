"""Parse card data from decompiled C# files and localization JSON."""
import json
import os
import re
from pathlib import Path

BASE = Path(__file__).resolve().parents[3]
DECOMPILED = BASE / "extraction" / "decompiled"
LOCALIZATION = BASE / "extraction" / "raw" / "localization" / "eng"
CARDS_DIR = DECOMPILED / "MegaCrit.Sts2.Core.Models.Cards"
POOLS_DIR = DECOMPILED / "MegaCrit.Sts2.Core.Models.CardPools"
OUTPUT = BASE / "data"

CARD_TYPE_MAP = {0: "None", 1: "Attack", 2: "Skill", 3: "Power", 4: "Status", 5: "Curse", 6: "Quest"}
CARD_RARITY_MAP = {0: "None", 1: "Basic", 2: "Common", 3: "Uncommon", 4: "Rare", 5: "Ancient", 6: "Event", 7: "Token", 8: "Status", 9: "Curse", 10: "Quest"}
TARGET_TYPE_MAP = {0: "None", 1: "Self", 2: "AnyEnemy", 3: "AllEnemies", 4: "RandomEnemy", 5: "AnyPlayer", 6: "AnyAlly", 7: "AllAllies", 8: "TargetedNoCreature", 9: "Osty"}

# Map enum names to values for when code uses named enums
CARD_TYPE_NAME = {"Attack": "Attack", "Skill": "Skill", "Power": "Power", "Status": "Status", "Curse": "Curse", "Quest": "Quest", "None": "None"}
CARD_RARITY_NAME = {"Basic": "Basic", "Common": "Common", "Uncommon": "Uncommon", "Rare": "Rare", "Ancient": "Ancient", "Event": "Event", "Token": "Token", "Status": "Status", "Curse": "Curse", "Quest": "Quest", "None": "None"}
TARGET_TYPE_NAME = {"None": "None", "Self": "Self", "AnyEnemy": "AnyEnemy", "AllEnemies": "AllEnemies", "RandomEnemy": "RandomEnemy", "AnyPlayer": "AnyPlayer", "AnyAlly": "AnyAlly", "AllAllies": "AllAllies", "TargetedNoCreature": "TargetedNoCreature", "Osty": "Osty"}


def class_name_to_id(name: str) -> str:
    """Convert PascalCase class name to SNAKE_CASE id."""
    s = re.sub(r'(?<=[a-z0-9])(?=[A-Z])', '_', name)
    s = re.sub(r'(?<=[A-Z])(?=[A-Z][a-z])', '_', s)
    return s.upper()


def load_localization() -> dict:
    loc_file = LOCALIZATION / "cards.json"
    if loc_file.exists():
        with open(loc_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def parse_card_pools() -> dict[str, str]:
    """Parse card pool files to map card class names to character colors."""
    card_to_color = {}
    pool_map = {
        "IroncladCardPool.cs": "ironclad",
        "SilentCardPool.cs": "silent",
        "DefectCardPool.cs": "defect",
        "NecrobinderCardPool.cs": "necrobinder",
        "RegentCardPool.cs": "regent",
        "ColorlessCardPool.cs": "colorless",
        "CurseCardPool.cs": "curse",
        "StatusCardPool.cs": "status",
        "EventCardPool.cs": "event",
        "TokenCardPool.cs": "token",
        "QuestCardPool.cs": "quest",
    }
    for filename, color in pool_map.items():
        filepath = POOLS_DIR / filename
        if not filepath.exists():
            continue
        content = filepath.read_text(encoding="utf-8")
        for match in re.finditer(r'ModelDb\.Card<(\w+)>\(\)', content):
            card_to_color[match.group(1)] = color
    return card_to_color


def parse_single_card(filepath: Path, localization: dict, card_pools: dict) -> dict | None:
    """Parse a single card C# file."""
    content = filepath.read_text(encoding="utf-8")
    class_name = filepath.stem

    # Extract constructor: base(cost, CardType.X, CardRarity.Y, TargetType.Z)
    base_match = re.search(
        r':\s*base\(\s*(-?\d+)\s*,\s*CardType\.(\w+)\s*,\s*CardRarity\.(\w+)\s*,\s*TargetType\.(\w+)',
        content
    )
    if not base_match:
        # Some cards use numeric enum values
        base_match = re.search(r':\s*base\(\s*(-?\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)', content)
        if base_match:
            cost = int(base_match.group(1))
            card_type = CARD_TYPE_MAP.get(int(base_match.group(2)), "Unknown")
            rarity = CARD_RARITY_MAP.get(int(base_match.group(3)), "Unknown")
            target = TARGET_TYPE_MAP.get(int(base_match.group(4)), "Unknown")
        else:
            return None
    else:
        cost = int(base_match.group(1))
        card_type = CARD_TYPE_NAME.get(base_match.group(2), base_match.group(2))
        rarity = CARD_RARITY_NAME.get(base_match.group(3), base_match.group(3))
        target = TARGET_TYPE_NAME.get(base_match.group(4), base_match.group(4))

    card_id = class_name_to_id(class_name)

    # Extract dynamic vars
    damage = None
    block = None
    magic_number = None
    keywords = []

    # DamageVar patterns
    dmg_match = re.search(r'new DamageVar\((\d+)m', content)
    if dmg_match:
        damage = int(dmg_match.group(1))

    # BlockVar patterns
    blk_match = re.search(r'new BlockVar\((\d+)m', content)
    if blk_match:
        block = int(blk_match.group(1))

    # PowerVar patterns - collect all
    powers_applied = []
    for pm in re.finditer(r'new PowerVar<(\w+)>\((\d+)m\)', content):
        powers_applied.append({"power": pm.group(1).replace("Power", ""), "amount": int(pm.group(2))})

    # CardsVar (draw cards)
    cards_draw = None
    cards_match = re.search(r'new CardsVar\((\d+)\)', content)
    if cards_match:
        cards_draw = int(cards_match.group(1))

    # EnergyVar
    energy_gain = None
    energy_match = re.search(r'new EnergyVar\((\d+)\)', content)
    if energy_match:
        energy_gain = int(energy_match.group(1))

    # HpLossVar
    hp_loss = None
    hp_match = re.search(r'new HpLossVar\((\d+)\)', content)
    if hp_match:
        hp_loss = int(hp_match.group(1))

    # Upgrade info
    upgrade_damage = None
    upgrade_block = None
    dmg_up = re.search(r'Damage\.UpgradeValueBy\((\d+)m\)', content)
    if dmg_up:
        upgrade_damage = int(dmg_up.group(1))
    blk_up = re.search(r'Block\.UpgradeValueBy\((\d+)m\)', content)
    if blk_up:
        upgrade_block = int(blk_up.group(1))

    # Cost upgrade
    cost_upgrade = None
    cost_up = re.search(r'UpgradeEnergyCost\((\d+)\)', content)
    if cost_up:
        cost_upgrade = int(cost_up.group(1))

    # Keywords (Ethereal, Exhaust, Innate, Unplayable, Retain, Sly, Eternal)
    if re.search(r'IsEthereal\s*=>\s*true', content):
        keywords.append("Ethereal")
    if re.search(r'IsInnate\s*=>\s*true', content):
        keywords.append("Innate")
    if re.search(r'ExhaustOnPlay\s*=>\s*true', content) or re.search(r'ShouldExhaust\s*=>\s*true', content):
        keywords.append("Exhaust")
    if re.search(r'CardKeyword\.Exhaust', content) and 'AddKeyword' in content:
        if "Exhaust" not in keywords:
            keywords.append("Exhaust")
    if re.search(r'IsRetain\s*=>\s*true', content) or re.search(r'IsRetainable\s*=>\s*true', content):
        keywords.append("Retain")
    if re.search(r'IsUnplayable\s*=>\s*true', content) or re.search(r'CardKeyword\.Unplayable', content):
        keywords.append("Unplayable")
    if re.search(r'CardKeyword\.Sly', content):
        keywords.append("Sly")
    if re.search(r'CardKeyword\.Eternal', content):
        keywords.append("Eternal")

    # Tags (Strike, Defend, Minion, OstyAttack, Shiv)
    tags = []
    for tag in ("Strike", "Defend", "Minion", "OstyAttack", "Shiv"):
        if re.search(rf'CardTag\.{tag}', content):
            tags.append(tag)

    # X-cost detection
    is_x_cost = bool(re.search(r'HasEnergyCostX\s*=>\s*true', content) or re.search(r'CostsX', content))

    # Multi-hit
    hit_count = None
    hit_match = re.search(r'WithHitCount\((\d+)\)', content)
    if hit_match:
        hit_count = int(hit_match.group(1))

    # Get localization
    title = localization.get(f"{card_id}.title", class_name)
    description = localization.get(f"{card_id}.description", "")

    # Clean up description - remove markup tags
    desc_clean = re.sub(r'\[/?(?:gold|blue|red|purple|green|orange|pink)\]', '', description)

    # Character color from pool
    color = card_pools.get(class_name, "unknown")

    card = {
        "id": card_id,
        "name": title,
        "description": desc_clean,
        "description_raw": description,
        "cost": cost,
        "is_x_cost": is_x_cost if is_x_cost else None,
        "type": card_type,
        "rarity": rarity,
        "target": target,
        "color": color,
        "damage": damage,
        "block": block,
        "hit_count": hit_count,
        "powers_applied": powers_applied if powers_applied else None,
        "cards_draw": cards_draw,
        "energy_gain": energy_gain,
        "hp_loss": hp_loss,
        "keywords": keywords if keywords else None,
        "tags": tags if tags else None,
        "upgrade": {},
        "image_url": f"/static/images/cards/{card_id.lower()}.png",
    }

    if upgrade_damage:
        card["upgrade"]["damage"] = f"+{upgrade_damage}"
    if upgrade_block:
        card["upgrade"]["block"] = f"+{upgrade_block}"
    if cost_upgrade is not None:
        card["upgrade"]["cost"] = cost_upgrade

    # Upgrade power vars
    for pm in re.finditer(r'(\w+)\.UpgradeValueBy\((\d+)m\)', content):
        var_name = pm.group(1)
        val = int(pm.group(2))
        if var_name not in ("Damage", "Block"):
            card["upgrade"][var_name.lower()] = f"+{val}"

    if not card["upgrade"]:
        card["upgrade"] = None

    return card


def parse_all_cards() -> list[dict]:
    localization = load_localization()
    card_pools = parse_card_pools()
    cards = []

    for filepath in sorted(CARDS_DIR.glob("*.cs")):
        if filepath.stem.startswith("Mock") or filepath.stem == "DeprecatedCard":
            continue
        card = parse_single_card(filepath, localization, card_pools)
        if card:
            cards.append(card)

    return cards


def main():
    OUTPUT.mkdir(exist_ok=True)
    cards = parse_all_cards()
    with open(OUTPUT / "cards.json", "w", encoding="utf-8") as f:
        json.dump(cards, f, indent=2, ensure_ascii=False)
    print(f"Parsed {len(cards)} cards -> data/cards.json")


if __name__ == "__main__":
    main()
