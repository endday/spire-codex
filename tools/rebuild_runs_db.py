#!/usr/bin/env python3
"""Rebuild runs.db from saved run JSON files using the corrected multiplayer logic."""
import json
import os
import sys
from pathlib import Path

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

data_dir = Path(os.environ.get("DATA_DIR", Path(__file__).resolve().parents[1] / "data"))
runs_dir = data_dir / "runs"
db_path = data_dir / "runs.db"

if not runs_dir.exists():
    print(f"No runs directory at {runs_dir}")
    sys.exit(1)

run_files = sorted(runs_dir.glob("*.json"))
print(f"Found {len(run_files)} run JSON files in {runs_dir}")

if len(run_files) == 0:
    print("Nothing to rebuild.")
    sys.exit(0)

# Delete existing DB
if db_path.exists():
    backup = db_path.with_suffix(".db.bak")
    print(f"Backing up existing DB to {backup}")
    db_path.rename(backup)

# Import after path setup
from app.services.runs_db import init_db, submit_run

# Initialize fresh DB
init_db()
print("Created fresh database")

success = 0
dupes = 0
errors = 0

for f in run_files:
    try:
        data = json.load(open(f, "r", encoding="utf-8"))
        result = submit_run(data)
        if result.get("success"):
            success += 1
        elif result.get("duplicate"):
            dupes += 1
        else:
            errors += 1
            print(f"  Error on {f.name}: {result.get('error')}")
    except Exception as e:
        errors += 1
        print(f"  Exception on {f.name}: {e}")

print(f"\nDone: {success} imported, {dupes} duplicates, {errors} errors")

# Verify
import sqlite3
conn = sqlite3.connect(str(db_path))
conn.row_factory = sqlite3.Row
total = conn.execute("SELECT COUNT(*) as c FROM runs").fetchone()["c"]
print(f"Total runs in new DB: {total}")
for r in conn.execute("SELECT character, COUNT(*) as c, SUM(win) as w FROM runs GROUP BY character ORDER BY c DESC").fetchall():
    print(f"  {r['character']}: {r['c']} runs, {r['w']} wins")

# Spot check
print("\nSpot check — Ironclad cards:")
for r in conn.execute("SELECT rc.card_id FROM run_cards rc JOIN runs r ON rc.run_id=r.id WHERE r.character='IRONCLAD' LIMIT 5").fetchall():
    print(f"  {r['card_id']}")
print("Silent cards:")
for r in conn.execute("SELECT rc.card_id FROM run_cards rc JOIN runs r ON rc.run_id=r.id WHERE r.character='SILENT' LIMIT 5").fetchall():
    print(f"  {r['card_id']}")
conn.close()
