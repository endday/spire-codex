#!/usr/bin/env python3
"""Fix potion IDs in runs.db — strip POTION. prefix from existing data."""
import sqlite3
import os

db_path = os.environ.get("DATA_DIR", "/data") + "/runs.db"
conn = sqlite3.connect(db_path)
cur = conn.execute(
    "UPDATE run_potions SET potion_id = REPLACE(potion_id, 'POTION.', '') "
    "WHERE potion_id LIKE 'POTION.%'"
)
conn.commit()
print(f"Updated {cur.rowcount} potion rows")
conn.close()
