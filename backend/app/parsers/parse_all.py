"""Run all parsers and generate structured JSON data files."""
from card_parser import main as parse_cards
from character_parser import main as parse_characters
from relic_parser import main as parse_relics
from monster_parser import main as parse_monsters
from potion_parser import main as parse_potions

if __name__ == "__main__":
    print("=== Parsing Slay the Spire 2 Game Data ===\n")
    parse_cards()
    parse_characters()
    parse_relics()
    parse_monsters()
    parse_potions()
    print("\n=== Done! ===")
