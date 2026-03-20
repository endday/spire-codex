"""Parse card data from decompiled C# files and localization JSON."""
import json
import os
import re
from pathlib import Path
from description_resolver import resolve_description as shared_resolve_description, extract_vars_from_source

BASE = Path(__file__).resolve().parents[3]
DECOMPILED = BASE / "extraction" / "decompiled"
CARDS_DIR = DECOMPILED / "MegaCrit.Sts2.Core.Models.Cards"
POOLS_DIR = DECOMPILED / "MegaCrit.Sts2.Core.Models.CardPools"
STATIC_IMAGES = BASE / "backend" / "static" / "images" / "cards"

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


def load_localization(loc_dir: Path) -> dict:
    loc_file = loc_dir / "cards.json"
    if loc_file.exists():
        with open(loc_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


# Compendium pool order (matches AllCharacterCardPools + AllSharedCardPools in ModelDb.cs)
POOL_ORDER = [
    "ironclad", "silent", "regent", "necrobinder", "defect",
    "colorless", "curse", "deprecated", "event", "quest", "status", "token",
]
POOL_INDEX = {p: i for i, p in enumerate(POOL_ORDER)}

# Compendium rarity order within each pool
RARITY_ORDER = ["Basic", "Common", "Uncommon", "Rare", "Ancient", "Event", "Token", "Status", "Curse", "Quest", "None"]
RARITY_INDEX = {r: i for i, r in enumerate(RARITY_ORDER)}


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

    # Extract dynamic vars using shared extractor first
    damage = None
    block = None
    magic_number = None
    keywords = []
    all_vars: dict[str, int] = extract_vars_from_source(content)

    # PowerVar patterns - collect for structured output
    powers_applied = []
    for pm in re.finditer(r'new PowerVar<(\w+)>\((\d+)m\)', content):
        power_name = pm.group(1)
        power_val = int(pm.group(2))
        powers_applied.append({"power": power_name.replace("Power", ""), "amount": power_val})

    # Extract explicit Damage/Block from vars
    damage = all_vars.get("Damage")
    block = all_vars.get("Block")
    # OstyDamage maps to Damage in descriptions
    if damage is None and "OstyDamage" in all_vars:
        damage = all_vars["OstyDamage"]
        all_vars["Damage"] = damage

    # Star cost: CanonicalStarCost => N means the card costs stars
    star_cost_match = re.search(r'CanonicalStarCost\s*=>\s*(\d+)', content)
    if star_cost_match:
        all_vars["StarCost"] = int(star_cost_match.group(1))

    cards_draw = all_vars.get("Cards")
    energy_gain = all_vars.get("Energy")
    hp_loss = all_vars.get("HpLoss")

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
    # Alternative pattern: base.EnergyCost.UpgradeBy(-1)
    if cost_upgrade is None:
        cost_up2 = re.search(r'EnergyCost\.UpgradeBy\((-?\d+)\)', content)
        if cost_up2:
            cost_upgrade = cost + int(cost_up2.group(1))

    # Keywords from CanonicalKeywords array (most common pattern)
    canonical_kw_match = re.search(r'CanonicalKeywords\s*=>', content)
    canonical_keywords_block = ""
    if canonical_kw_match:
        # Extract the block after CanonicalKeywords =>
        start = canonical_kw_match.end()
        # Find the matching closing of the property (next semicolon at property level)
        depth = 0
        end = start
        for i in range(start, len(content)):
            if content[i] == '{':
                depth += 1
            elif content[i] == '}':
                depth -= 1
            elif content[i] == ';' and depth <= 0:
                end = i
                break
        canonical_keywords_block = content[start:end]

    for kw in ("Exhaust", "Innate", "Ethereal", "Retain", "Unplayable", "Sly", "Eternal"):
        if f"CardKeyword.{kw}" in canonical_keywords_block:
            keywords.append(kw)

    # Keywords from property overrides (additional patterns)
    if "Ethereal" not in keywords and re.search(r'IsEthereal\s*=>\s*true', content):
        keywords.append("Ethereal")
    if "Innate" not in keywords and re.search(r'IsInnate\s*=>\s*true', content):
        keywords.append("Innate")
    if "Exhaust" not in keywords:
        if re.search(r'ExhaustOnPlay\s*=>\s*true', content) or re.search(r'ShouldExhaust\s*=>\s*true', content):
            keywords.append("Exhaust")
        if re.search(r'CardKeyword\.Exhaust', content) and 'AddKeyword' in content:
            keywords.append("Exhaust")
    if "Retain" not in keywords and (re.search(r'IsRetain\s*=>\s*true', content) or re.search(r'IsRetainable\s*=>\s*true', content)):
        keywords.append("Retain")
    if "Unplayable" not in keywords and re.search(r'IsUnplayable\s*=>\s*true', content):
        keywords.append("Unplayable")
    if "Sly" not in keywords and re.search(r'CardKeyword\.Sly', content) and 'AddKeyword' in content:
        keywords.append("Sly")
    if "Eternal" not in keywords and re.search(r'CardKeyword\.Eternal', content) and 'AddKeyword' in content:
        keywords.append("Eternal")

    # Tags (Strike, Defend, Minion, OstyAttack, Shiv)
    tags = []
    for tag in ("Strike", "Defend", "Minion", "OstyAttack", "Shiv"):
        if re.search(rf'CardTag\.{tag}', content):
            tags.append(tag)

    # Related/spawned cards — detect via multiple patterns
    related = set()
    all_card_files = {f.stem for f in CARDS_DIR.glob("*.cs")}
    # HoverTipFactory.FromCard<X> — the game's own "related card" system
    for m in re.finditer(r'HoverTipFactory\.FromCard(?:WithCardHoverTips)?<(\w+)>', content):
        related.add(m.group(1))
    # CreateCard<X> — direct card creation
    for m in re.finditer(r'CreateCard<(\w+)>', content):
        related.add(m.group(1))
    # CardClass.Create( — static factory, only if it's a known card
    for m in re.finditer(r'(\w+)\.Create\(', content):
        if m.group(1) in all_card_files:
            related.add(m.group(1))
    # .OfType<X>() — type-based card references, only if it's a known card
    for m in re.finditer(r'\.OfType<(\w+)>\(\)', content):
        if m.group(1) in all_card_files:
            related.add(m.group(1))
    # Remove self-references
    related.discard(class_name)
    spawns_cards = sorted(class_name_to_id(s) for s in related) if related else None

    # X-cost detection
    is_x_cost = bool(re.search(r'HasEnergyCostX\s*=>\s*true', content) or re.search(r'CostsX', content))
    is_x_star_cost = bool(re.search(r'HasStarCostX\s*=>\s*true', content))

    # Multi-hit
    hit_count = None
    hit_match = re.search(r'WithHitCount\((\d+)\)', content)
    if hit_match:
        hit_count = int(hit_match.group(1))

    # Get localization
    title = localization.get(f"{card_id}.title", class_name)
    description = localization.get(f"{card_id}.description", "")

    # Note: description will be rendered with resolve_description below

    # Character color from pool
    color = card_pools.get(class_name, "unknown")

    desc_rendered = shared_resolve_description(description, all_vars)

    star_cost = all_vars.get("StarCost")

    card = {
        "id": card_id,
        "name": title,
        "description": desc_rendered,
        "description_raw": description,
        "cost": cost,
        "is_x_cost": is_x_cost if is_x_cost else None,
        "is_x_star_cost": is_x_star_cost if is_x_star_cost else None,
        "star_cost": star_cost,
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
        "spawns_cards": spawns_cards,
        "vars": all_vars if all_vars else None,
        "upgrade": {},
        "image_url": f"/static/images/cards/{card_id.lower()}.png" if (STATIC_IMAGES / f"{card_id.lower()}.png").exists() else None,
        "beta_image_url": f"/static/images/cards/beta/{card_id.lower()}.png" if (STATIC_IMAGES / "beta" / f"{card_id.lower()}.png").exists() else None,
    }

    if upgrade_damage:
        card["upgrade"]["damage"] = f"+{upgrade_damage}"
    if upgrade_block:
        card["upgrade"]["block"] = f"+{upgrade_block}"
    if cost_upgrade is not None:
        card["upgrade"]["cost"] = cost_upgrade

    # Upgrade power vars — property access: Xxx.UpgradeValueBy(Nm)
    for pm in re.finditer(r'(\w+)\.UpgradeValueBy\((-?\d+)m\)', content):
        var_name = pm.group(1)
        val = int(pm.group(2))
        if var_name not in ("Damage", "Block"):
            card["upgrade"][var_name.lower()] = f"{val:+d}"

    # Upgrade vars — dictionary access: ["VarName"].UpgradeValueBy(Nm)
    for pm in re.finditer(r'\["(\w+)"\]\.UpgradeValueBy\((-?\d+)m\)', content):
        var_name = pm.group(1)
        val = int(pm.group(2))
        if var_name.lower() not in card["upgrade"]:
            card["upgrade"][var_name.lower()] = f"{val:+d}"

    # Keyword upgrades: AddKeyword/RemoveKeyword inside OnUpgrade
    upgrade_block_match = re.search(r'void\s+OnUpgrade\(\)\s*\{', content)
    if upgrade_block_match:
        start = upgrade_block_match.end()
        depth = 1
        i = start
        while i < len(content) and depth > 0:
            if content[i] == '{':
                depth += 1
            elif content[i] == '}':
                depth -= 1
            i += 1
        upgrade_body = content[start:i - 1]
        for km in re.finditer(r'AddKeyword\(CardKeyword\.(\w+)\)', upgrade_body):
            card["upgrade"][f"add_{km.group(1).lower()}"] = True
        for km in re.finditer(r'RemoveKeyword\(CardKeyword\.(\w+)\)', upgrade_body):
            card["upgrade"][f"remove_{km.group(1).lower()}"] = True

    if not card["upgrade"]:
        card["upgrade"] = None

    return card


def load_gameplay_ui(loc_dir: Path) -> dict:
    """Load gameplay_ui.json for type/rarity translations."""
    loc_file = loc_dir / "gameplay_ui.json"
    if loc_file.exists():
        with open(loc_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def load_keyword_names(loc_dir: Path) -> dict[str, str]:
    """Load keyword localization to map English enum names to localized names."""
    loc_file = loc_dir / "card_keywords.json"
    if not loc_file.exists():
        return {}
    with open(loc_file, "r", encoding="utf-8") as f:
        loc = json.load(f)
    name_map = {}
    seen = set()
    for key in loc:
        kw_id = key.split(".")[0]
        if kw_id in seen:
            continue
        seen.add(kw_id)
        title = loc.get(f"{kw_id}.title", "")
        if title:
            name_map[kw_id] = title
            name_map[kw_id.upper()] = title
    return name_map


def load_power_names(loc_dir: Path) -> dict[str, str]:
    """Load power localization to map English power names to localized names."""
    loc_file = loc_dir / "powers.json"
    if not loc_file.exists():
        return {}
    with open(loc_file, "r", encoding="utf-8") as f:
        loc = json.load(f)
    # Build mapping: "Thorns" -> "가시", "Dexterity" -> "민첩"
    # Power IDs are like THORNS_POWER, class names are ThornsPower
    name_map = {}
    seen = set()
    for key in loc:
        power_id = key.split(".")[0]
        if power_id in seen:
            continue
        seen.add(power_id)
        title = loc.get(f"{power_id}.title", "")
        if title:
            # Strip "_POWER" suffix to get the base name: THORNS_POWER -> THORNS
            base = power_id.replace("_POWER", "")
            # Convert THORNS -> Thorns for matching
            base_title = base.replace("_", " ").title().replace(" ", "")
            name_map[base_title] = title
    return name_map


def build_type_map(gameplay_ui: dict) -> dict[str, str]:
    """Build card type translation map from gameplay_ui data."""
    return {
        "Attack": gameplay_ui.get("CARD_TYPE.ATTACK", "Attack"),
        "Skill": gameplay_ui.get("CARD_TYPE.SKILL", "Skill"),
        "Power": gameplay_ui.get("CARD_TYPE.POWER", "Power"),
        "Status": gameplay_ui.get("CARD_TYPE.STATUS", "Status"),
        "Curse": gameplay_ui.get("CARD_TYPE.CURSE", "Curse"),
        "Quest": gameplay_ui.get("CARD_TYPE.QUEST", "Quest"),
    }


def build_rarity_map(gameplay_ui: dict) -> dict[str, str]:
    """Build card rarity translation map from gameplay_ui data."""
    return {
        "Basic": gameplay_ui.get("CARD_RARITY.BASIC", "Basic"),
        "Common": gameplay_ui.get("CARD_RARITY.COMMON", "Common"),
        "Uncommon": gameplay_ui.get("CARD_RARITY.UNCOMMON", "Uncommon"),
        "Rare": gameplay_ui.get("CARD_RARITY.RARE", "Rare"),
        "Ancient": gameplay_ui.get("CARD_RARITY.ANCIENT", "Ancient"),
        "Event": gameplay_ui.get("CARD_RARITY.EVENT", "Event"),
        "Token": gameplay_ui.get("CARD_RARITY.TOKEN", "Token"),
        "Status": gameplay_ui.get("CARD_RARITY.STATUS", "Status"),
        "Curse": gameplay_ui.get("CARD_RARITY.CURSE", "Curse"),
        "Quest": gameplay_ui.get("CARD_RARITY.QUEST", "Quest"),
    }


def localize_card(card: dict, type_map: dict, rarity_map: dict,
                  kw_names: dict, power_names: dict) -> dict:
    """Localize display fields on a card."""
    card["type"] = type_map.get(card["type"], card["type"])
    card["rarity"] = rarity_map.get(card["rarity"], card["rarity"])
    if card["keywords"]:
        card["keywords"] = [kw_names.get(kw.upper(), kw) for kw in card["keywords"]]
    if card["powers_applied"]:
        for pa in card["powers_applied"]:
            pa["power"] = power_names.get(pa["power"], pa["power"])
    return card


def parse_all_cards(loc_dir: Path) -> list[dict]:
    localization = load_localization(loc_dir)
    card_pools = parse_card_pools()
    gameplay_ui = load_gameplay_ui(loc_dir)
    type_map = build_type_map(gameplay_ui)
    rarity_map = build_rarity_map(gameplay_ui)
    kw_names = load_keyword_names(loc_dir)
    power_names = load_power_names(loc_dir)
    cards = []

    for filepath in sorted(CARDS_DIR.glob("*.cs")):
        if filepath.stem.startswith("Mock") or filepath.stem == "DeprecatedCard":
            continue
        card = parse_single_card(filepath, localization, card_pools)
        if card:
            localize_card(card, type_map, rarity_map, kw_names, power_names)
            cards.append(card)

    # Assign compendium_order: pool index → rarity → ID (matches in-game card library)
    cards.sort(key=lambda c: (
        POOL_INDEX.get(c.get("color", ""), 99),
        RARITY_INDEX.get(c.get("rarity", ""), 99),
        c["id"],
    ))
    for i, card in enumerate(cards):
        card["compendium_order"] = i

    # Restore alphabetical order (default)
    cards.sort(key=lambda c: c["name"])

    return cards


def main(lang: str = "eng"):
    loc_dir = BASE / "extraction" / "raw" / "localization" / lang
    output_dir = BASE / "data" / lang
    output_dir.mkdir(parents=True, exist_ok=True)
    cards = parse_all_cards(loc_dir)
    with open(output_dir / "cards.json", "w", encoding="utf-8") as f:
        json.dump(cards, f, indent=2, ensure_ascii=False)
    print(f"Parsed {len(cards)} cards -> data/{lang}/cards.json")


if __name__ == "__main__":
    main()
