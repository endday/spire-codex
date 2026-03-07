# Spire Codex

A comprehensive database and API for **Slay the Spire 2** game data, featuring a FastAPI backend and a Next.js frontend.

**Live data**: 576 cards, 5 characters, 289 relics, 121 monsters (16 bosses, 17 elites), and 63 potions — all extracted directly from the game.

## How It Was Built

This project was built by reverse-engineering Slay the Spire 2's game files:

1. **PCK Extraction** — Used [GDRE Tools](https://github.com/bruvzg/gdsdecomp) to extract the Godot 4 `.pck` file, recovering all game assets (images, localization, scenes).

2. **DLL Decompilation** — Discovered the game logic lives in `sts2.dll` (C#/.NET), not GDScript. Used [ILSpy](https://github.com/icsharpcode/ILSpy) to decompile the assembly into ~3,300 readable C# source files.

3. **Data Parsing** — Built Python regex-based parsers that extract structured data from the decompiled C# source files:
   - **Cards**: Constructor pattern `base(cost, CardType, CardRarity, TargetType)` + `DamageVar`, `BlockVar`, `PowerVar<T>` for stats
   - **Characters**: `StartingHp`, `StartingGold`, `MaxEnergy`, `StartingDeck`, `StartingRelics`
   - **Relics/Potions**: Rarity, pool assignment, descriptions from localization JSON
   - **Monsters**: HP ranges, ascension scaling via `AscensionHelper.GetValueIfAscension()`, move state machines, damage values
   - **Monster Types**: Parsed from encounter files (`RoomType.Boss`, `RoomType.Elite`, `RoomType.Monster`)

4. **Localization** — Names and descriptions come from the game's English localization JSON files, with markup tags stripped.

5. **Images** — Card portraits, relic icons, potion icons, and character art extracted from the game assets and served as static files.

## Project Structure

```
spire-codex/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── main.py         # App entry point, CORS, rate limiting, static files
│   │   ├── routers/        # API endpoints (cards, characters, relics, monsters, potions)
│   │   ├── models/         # Pydantic schemas
│   │   ├── services/       # Data loading from JSON
│   │   └── parsers/        # C# source file parsers
│   ├── static/images/      # Game images (cards, relics, potions, characters)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # Next.js 16 + TypeScript + Tailwind CSS
│   ├── app/                # App Router pages (cards, characters, relics, monsters, potions)
│   ├── lib/api.ts          # TypeScript API client + interfaces
│   └── Dockerfile
├── data/                   # Parsed JSON data files
│   ├── cards.json
│   ├── characters.json
│   ├── relics.json
│   ├── monsters.json
│   └── potions.json
├── extraction/             # Raw game files (not committed)
│   ├── raw/                # Extracted PCK contents
│   └── decompiled/         # ILSpy output
└── docker-compose.yml
```

## API Endpoints

| Endpoint | Description | Filters |
|---|---|---|
| `GET /api/cards` | All cards | `color`, `type`, `rarity`, `search` |
| `GET /api/cards/{id}` | Single card | — |
| `GET /api/characters` | All characters | — |
| `GET /api/characters/{id}` | Single character | — |
| `GET /api/relics` | All relics | `rarity`, `pool`, `search` |
| `GET /api/relics/{id}` | Single relic | — |
| `GET /api/monsters` | All monsters | `type`, `search` |
| `GET /api/monsters/{id}` | Single monster | — |
| `GET /api/potions` | All potions | `rarity`, `search` |
| `GET /api/potions/{id}` | Single potion | — |
| `GET /api/stats` | Entity counts | — |

Rate limited to **60 requests per minute** per IP.

Interactive API docs available at `/docs` (Swagger UI).

## Running Locally (Development)

### Prerequisites

- Python 3.12+
- Node.js 22+

### Backend

```bash
# Create virtual environment and install dependencies
python -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# Start the API server
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Backend runs at **http://localhost:8000**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**

## Running with Docker

### Prerequisites

- Docker and Docker Compose

### Build and Run

```bash
docker compose up --build
```

This starts both services:
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000

### Stop

```bash
docker compose down
```

## Re-parsing Game Data

If you have the game files extracted, you can regenerate the JSON data:

```bash
source venv/bin/activate

# Run all parsers
python -m backend.app.parsers.parse_all

# Or run individually
python -m backend.app.parsers.card_parser
python -m backend.app.parsers.character_parser
python -m backend.app.parsers.relic_parser
python -m backend.app.parsers.monster_parser
python -m backend.app.parsers.potion_parser
```

To copy game images into the static directory:

```bash
python backend/scripts/copy_images.py
```

## Roadmap

### Automation
- **Automated extraction pipeline** — End-to-end script that takes the game install path, runs PCK extraction (GDRE Tools), DLL decompilation (ILSpy), parsing, and image copying in one command. Currently each step is manual.
- **CI/CD for game updates** — Detect new game versions on Steam and automatically re-extract/re-parse data so the API stays current with patches.

### Missing Data
- **Monster images** — Only ~15 monsters have proper portrait images. The rest use Spine animation spritesheets (disassembled body parts) which aren't usable as portraits. Need to either render assembled sprites from the Spine atlas/skeleton data, or capture screenshots in-game.
- **Powers / Buffs / Debuffs** — 262 power models exist in the decompiled code (`MegaCrit.Sts2.Core.Models.Powers/`) but aren't yet parsed or exposed via the API.
- **Encounters & Events** — 88 encounter definitions and 50+ event files are available but not parsed. Would show which monsters appear together and event choices/outcomes.
- **Enchantments** — 22 enchantment types exist in the game data but aren't exposed yet.
- **Description template resolution** — Card/relic descriptions still contain raw template syntax like `{Damage:diff()}` instead of resolved values. Need to implement SmartFormat-style template rendering to show actual numbers.

### Frontend
- **Individual detail pages** — Click-through pages for each card, relic, monster, etc. with full details instead of just grid views.
- **Card upgrade previews** — Show base vs. upgraded stats side by side.
- **Synergy explorer** — Browse cards by keyword/tag combinations and character synergies.
- **Search across all entities** — Global search bar that searches cards, relics, potions, and monsters simultaneously.

### Infrastructure
- **Database backend** — Replace JSON file loading with SQLite or PostgreSQL for better query performance and filtering.
- **Redis rate limiting** — Current rate limiting uses in-memory storage (resets on restart). Switch to Redis for persistent limits across deploys.
- **CDN for images** — Serve static images from a CDN instead of the API server for better performance.

## Tech Stack

- **Backend**: FastAPI, Pydantic, slowapi (rate limiting), uvicorn
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Containerization**: Docker, Docker Compose
