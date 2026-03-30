"""SQLite database for community run data."""
import json
import hashlib
import sqlite3
from pathlib import Path
from contextlib import contextmanager

import os

# Use DATA_DIR env var (Docker) or fall back to project data/
_data_dir = Path(os.environ.get("DATA_DIR", Path(__file__).resolve().parents[3] / "data"))
DB_PATH = _data_dir / "runs.db"


def get_db_path() -> Path:
    """Return the database path, creating the directory if needed."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    return DB_PATH


@contextmanager
def get_conn():
    """Get a database connection with WAL mode for concurrent reads."""
    conn = sqlite3.connect(str(get_db_path()), timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Create tables if they don't exist."""
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                run_hash TEXT UNIQUE NOT NULL,
                seed TEXT NOT NULL,
                character TEXT NOT NULL,
                win INTEGER NOT NULL,
                ascension INTEGER NOT NULL DEFAULT 0,
                game_mode TEXT NOT NULL DEFAULT 'standard',
                run_time INTEGER NOT NULL DEFAULT 0,
                floors_reached INTEGER NOT NULL DEFAULT 0,
                acts_completed INTEGER NOT NULL DEFAULT 0,
                killed_by TEXT,
                deck_size INTEGER NOT NULL DEFAULT 0,
                relic_count INTEGER NOT NULL DEFAULT 0,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS run_cards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                run_id INTEGER NOT NULL REFERENCES runs(id),
                card_id TEXT NOT NULL,
                upgraded INTEGER NOT NULL DEFAULT 0,
                enchantment TEXT,
                floor_added INTEGER
            );

            CREATE TABLE IF NOT EXISTS run_relics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                run_id INTEGER NOT NULL REFERENCES runs(id),
                relic_id TEXT NOT NULL,
                floor_added INTEGER
            );

            CREATE TABLE IF NOT EXISTS run_card_choices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                run_id INTEGER NOT NULL REFERENCES runs(id),
                card_id TEXT NOT NULL,
                was_picked INTEGER NOT NULL,
                floor INTEGER NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_runs_character ON runs(character);
            CREATE INDEX IF NOT EXISTS idx_runs_win ON runs(win);
            CREATE INDEX IF NOT EXISTS idx_runs_ascension ON runs(ascension);
            CREATE INDEX IF NOT EXISTS idx_run_cards_card ON run_cards(card_id);
            CREATE INDEX IF NOT EXISTS idx_run_cards_run ON run_cards(run_id);
            CREATE INDEX IF NOT EXISTS idx_run_relics_relic ON run_relics(relic_id);
            CREATE INDEX IF NOT EXISTS idx_run_choices_card ON run_card_choices(card_id);
            CREATE INDEX IF NOT EXISTS idx_run_choices_run ON run_card_choices(run_id);
        """)


def compute_run_hash(data: dict) -> str:
    """Compute a unique hash for deduplication based on seed + character + start_time."""
    key = f"{data.get('seed', '')}:{data['players'][0]['character']}:{data.get('start_time', '')}"
    return hashlib.sha256(key.encode()).hexdigest()[:16]


def clean_id(raw_id: str) -> str:
    """Strip prefixes like CARD., RELIC., etc."""
    for prefix in ("CARD.", "RELIC.", "ENCHANTMENT.", "MONSTER.", "ENCOUNTER.", "CHARACTER.", "ACT."):
        if raw_id.startswith(prefix):
            return raw_id[len(prefix):]
    return raw_id


def submit_run(data: dict) -> dict:
    """Parse and store a run. Returns status dict."""
    # Validate structure
    if not data.get("players") or not data.get("map_point_history") or not isinstance(data.get("acts"), list):
        return {"error": "Invalid run data — missing required fields"}

    if data.get("was_abandoned"):
        return {"error": "Abandoned runs are not included in stats"}

    run_hash = compute_run_hash(data)
    player = data["players"][0]
    character = clean_id(player["character"])

    total_floors = sum(len(act) for act in data.get("map_point_history", []))
    killed_by = clean_id(data["killed_by_encounter"]) if data.get("killed_by_encounter") else None

    with get_conn() as conn:
        # Check for duplicate
        existing = conn.execute("SELECT id FROM runs WHERE run_hash = ?", (run_hash,)).fetchone()
        if existing:
            return {"error": "This run has already been submitted", "duplicate": True}

        # Insert run
        cursor = conn.execute("""
            INSERT INTO runs (run_hash, seed, character, win, ascension, game_mode, run_time,
                              floors_reached, acts_completed, killed_by, deck_size, relic_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            run_hash, data.get("seed", ""), character, int(data["win"]),
            data.get("ascension", 0), data.get("game_mode", "standard"),
            data.get("run_time", 0), total_floors, len(data.get("acts", [])),
            killed_by, len(player["deck"]), len(player["relics"]),
        ))
        run_id = cursor.lastrowid

        # Insert cards
        for card in player["deck"]:
            card_id = clean_id(card["id"])
            upgraded = card.get("current_upgrade_level", 0)
            enchantment = clean_id(card["enchantment"]["id"]) if card.get("enchantment") else None
            floor_added = card.get("floor_added_to_deck")
            conn.execute(
                "INSERT INTO run_cards (run_id, card_id, upgraded, enchantment, floor_added) VALUES (?, ?, ?, ?, ?)",
                (run_id, card_id, upgraded, enchantment, floor_added),
            )

        # Insert relics
        for relic in player["relics"]:
            relic_id = clean_id(relic["id"])
            floor_added = relic.get("floor_added_to_deck")
            conn.execute(
                "INSERT INTO run_relics (run_id, relic_id, floor_added) VALUES (?, ?, ?)",
                (run_id, relic_id, floor_added),
            )

        # Insert card choices from floor history
        for act_idx, act_floors in enumerate(data.get("map_point_history", [])):
            for floor_idx, floor in enumerate(act_floors):
                floor_num = floor_idx + 1
                for ps in floor.get("player_stats", []):
                    for choice in ps.get("card_choices", []):
                        card_id = clean_id(choice["card"]["id"])
                        was_picked = int(choice.get("was_picked", False))
                        conn.execute(
                            "INSERT INTO run_card_choices (run_id, card_id, was_picked, floor) VALUES (?, ?, ?, ?)",
                            (run_id, card_id, was_picked, floor_num),
                        )

    return {"success": True, "run_id": run_id, "run_hash": run_hash}


def get_stats() -> dict:
    """Compute aggregate community stats from all submitted runs."""
    with get_conn() as conn:
        total = conn.execute("SELECT COUNT(*) as c FROM runs").fetchone()["c"]
        if total == 0:
            return {"total_runs": 0}

        wins = conn.execute("SELECT COUNT(*) as c FROM runs WHERE win = 1").fetchone()["c"]

        # Win rate by character
        char_stats = conn.execute("""
            SELECT character, COUNT(*) as total, SUM(win) as wins
            FROM runs GROUP BY character ORDER BY total DESC
        """).fetchall()

        # Most common cards in winning decks
        win_cards = conn.execute("""
            SELECT rc.card_id, COUNT(*) as count
            FROM run_cards rc JOIN runs r ON rc.run_id = r.id
            WHERE r.win = 1
            GROUP BY rc.card_id ORDER BY count DESC LIMIT 20
        """).fetchall()

        # Most common cards overall
        all_cards = conn.execute("""
            SELECT card_id, COUNT(*) as count
            FROM run_cards GROUP BY card_id ORDER BY count DESC LIMIT 20
        """).fetchall()

        # Card pick rates (offered 3+ times)
        pick_rates = conn.execute("""
            SELECT card_id,
                   COUNT(*) as offered,
                   SUM(was_picked) as picked,
                   ROUND(100.0 * SUM(was_picked) / COUNT(*), 1) as pick_rate
            FROM run_card_choices
            GROUP BY card_id
            HAVING offered >= 3
            ORDER BY pick_rate DESC
            LIMIT 20
        """).fetchall()

        # Most common relics
        top_relics = conn.execute("""
            SELECT relic_id, COUNT(*) as count
            FROM run_relics GROUP BY relic_id ORDER BY count DESC LIMIT 20
        """).fetchall()

        # Most deadly encounters
        deaths = conn.execute("""
            SELECT killed_by, COUNT(*) as count
            FROM runs WHERE win = 0 AND killed_by IS NOT NULL
            GROUP BY killed_by ORDER BY count DESC LIMIT 10
        """).fetchall()

        # Ascension distribution
        asc_stats = conn.execute("""
            SELECT ascension, COUNT(*) as total, SUM(win) as wins
            FROM runs GROUP BY ascension ORDER BY ascension
        """).fetchall()

        return {
            "total_runs": total,
            "total_wins": wins,
            "win_rate": round(wins / total * 100, 1) if total > 0 else 0,
            "characters": [
                {"character": r["character"], "total": r["total"], "wins": r["wins"],
                 "win_rate": round(r["wins"] / r["total"] * 100, 1) if r["total"] > 0 else 0}
                for r in char_stats
            ],
            "ascensions": [
                {"level": r["ascension"], "total": r["total"], "wins": r["wins"],
                 "win_rate": round(r["wins"] / r["total"] * 100, 1) if r["total"] > 0 else 0}
                for r in asc_stats
            ],
            "top_cards": [{"card_id": r["card_id"], "count": r["count"]} for r in all_cards],
            "win_cards": [{"card_id": r["card_id"], "count": r["count"]} for r in win_cards],
            "pick_rates": [
                {"card_id": r["card_id"], "offered": r["offered"], "picked": r["picked"], "pick_rate": r["pick_rate"]}
                for r in pick_rates
            ],
            "top_relics": [{"relic_id": r["relic_id"], "count": r["count"]} for r in top_relics],
            "deadliest": [{"encounter": r["killed_by"], "count": r["count"]} for r in deaths],
        }


# Initialize on import
init_db()
