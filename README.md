# Spire Codex

A comprehensive database and API for **Slay the Spire 2** game data, built by reverse-engineering the game files.

**Live site**: [spire-codex.com](https://spire-codex.com)

**Steam App ID**: 2868840

## How It Was Built

Slay the Spire 2 is built with Godot 4 but all game logic lives in a C#/.NET 8 DLL (`sts2.dll`), not GDScript. The data pipeline:

1. **PCK Extraction** — [GDRE Tools](https://github.com/bruvzg/gdsdecomp) extracts the Godot `.pck` file to recover images, Spine animations, and localization data (~9,947 files).

2. **DLL Decompilation** — [ILSpy](https://github.com/icsharpcode/ILSpy) decompiles `sts2.dll` into ~3,300 readable C# source files containing all game models.

3. **Data Parsing** — Python regex-based parsers extract structured data from the decompiled C# source:
   - **Cards**: `base(cost, CardType, CardRarity, TargetType)` constructors + `DamageVar`, `BlockVar`, `PowerVar<T>` for stats
   - **Characters**: `StartingHp`, `StartingGold`, `MaxEnergy`, `StartingDeck`, `StartingRelics`
   - **Relics/Potions**: Rarity, pool, descriptions resolved from SmartFormat templates
   - **Monsters**: HP ranges, ascension scaling via `AscensionHelper`, move state machines, damage values
   - **Enchantments**: Card type restrictions, stackability, Amount-based scaling
   - **Encounters**: Monster compositions, room type (Boss/Elite/Monster), act placement, tags
   - **Events**: Multi-page decision trees (56 of 66 events), choices with outcomes, act placement, `StringVar` model references resolved to display names
   - **Ancients**: 8 Ancient NPCs with epithets, character-specific dialogue, relic offerings, portrait icons
   - **Powers**: PowerType (Buff/Debuff), PowerStackType (Counter/Single), DynamicVars, descriptions
   - **Epochs/Stories**: Timeline progression data with unlock requirements
   - **Orbs**: Passive/Evoke values, descriptions
   - **Afflictions**: Stackability, extra card text, descriptions
   - **Modifiers**: Run modifier descriptions
   - **Keywords**: Card keyword definitions (Exhaust, Ethereal, Innate, etc.)
   - **Intents**: Monster intent descriptions
   - **Achievements**: Unlock conditions, descriptions

4. **Description Resolution** — A shared `description_resolver.py` module resolves SmartFormat localization templates (`{Damage:diff()}`, `{Energy:energyIcons()}`, `{Cards:plural:card|cards}`) into human-readable text with rich text markers for frontend rendering. Runtime-dynamic variables (e.g., `{Card}`, `{Relic}`) are preserved as readable placeholders. `StringVar` references in events (e.g., `{Enchantment1}` → `ModelDb.Enchantment<Sharp>().Title`) are resolved to display names via localization lookup.

5. **Spine Rendering** — Characters and monsters are Spine skeletal animations, not static images. A headless Node.js renderer assembles idle poses into 512×512 portrait PNGs. Renders 125 of 158 skeleton files including all 5 characters (combat, rest site, character select poses), 95+ monsters, NPCs (Neow, Tezcatara), and more. Skin-based variants (Cultists, Bowlbugs) are rendered individually. See [Spine Renderer](#spine-renderer) below.

6. **Images** — Card portraits, relic/potion icons, character art, monster sprites, Ancient portrait icons, and boss encounter icons extracted from game assets and served as static files.

7. **Changelog Diffing** — A diff tool compares JSON data between game versions (via git refs or directories), tracking added/removed/changed entities per category with field-level diffs. Changelogs are keyed by Steam game version + optional Codex revision number.

## Project Structure

```
spire-codex/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py             # App entry, CORS, rate limiting, static files
│   │   ├── routers/            # API endpoints (19 routers)
│   │   ├── models/schemas.py   # Pydantic models
│   │   ├── services/           # JSON data loading
│   │   └── parsers/            # C# source → JSON parsers
│   │       ├── card_parser.py
│   │       ├── character_parser.py
│   │       ├── monster_parser.py
│   │       ├── relic_parser.py
│   │       ├── potion_parser.py
│   │       ├── enchantment_parser.py
│   │       ├── encounter_parser.py
│   │       ├── event_parser.py
│   │       ├── power_parser.py
│   │       ├── keyword_parser.py        # Keywords, intents, orbs, afflictions, modifiers, achievements
│   │       ├── epoch_parser.py
│   │       ├── description_resolver.py   # Shared SmartFormat resolver
│   │       └── parse_all.py
│   ├── static/images/          # Game images (not committed)
│   ├── scripts/copy_images.py  # Copies images from extraction → static
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                   # Next.js 16 + TypeScript + Tailwind CSS
│   ├── app/                    # Pages: cards, characters, relics, monsters, potions,
│   │   │                       #   enchantments, encounters, events, powers, timeline,
│   │   │                       #   reference, images, changelog, about
│   │   └── components/         # CardGrid, RichDescription, SearchFilter, Navbar, Footer
│   ├── lib/api.ts              # API client + TypeScript interfaces
│   └── Dockerfile
├── tools/
│   ├── spine-renderer/         # Headless Spine skeleton renderer
│   │   ├── render.mjs           # Monster renderer
│   │   ├── render_all.mjs       # Universal renderer (all .skel files)
│   │   ├── render_skins2.mjs    # Skin variant renderer
│   │   └── package.json
│   ├── diff_data.py            # Changelog diff generator
│   ├── update.py               # Cross-platform update pipeline
│   └── deploy.py               # Local Docker build + push to Docker Hub
├── data/                       # Parsed JSON data files
│   └── changelogs/             # Changelog JSON files (keyed by game version)
├── extraction/                 # Raw game files (not committed)
│   ├── raw/                    # GDRE extracted Godot project
│   └── decompiled/             # ILSpy output
├── docker-compose.yml          # Local dev
├── docker-compose.prod.yml     # Production
└── .forgejo/workflows/
    └── build.yml               # CI: builds + pushes to Docker Hub
```

## Website Pages

| Page | Route | Description |
|---|---|---|
| Home | `/` | Dashboard with entity counts and category cards |
| Cards | `/cards` | Filterable card grid with modal detail view |
| Characters | `/characters` | Character stats, starting decks, relics |
| Relics | `/relics` | Filterable relic grid |
| Monsters | `/monsters` | Monster grid with HP, moves, Spine renders |
| Potions | `/potions` | Filterable potion grid |
| Enchantments | `/enchantments` | Enchantment list with card type filters |
| Encounters | `/encounters` | Encounter compositions by act/room type |
| Events | `/events` | Multi-page event trees with expandable choices |
| Powers | `/powers` | Buffs, debuffs, and neutral powers |
| Timeline | `/timeline` | Epoch progression with unlock requirements |
| Reference | `/reference` | Keywords, intents, orbs, afflictions, modifiers, achievements |
| Images | `/images` | Browsable game assets with ZIP download per category |
| Changelog | `/changelog` | Data diffs between game updates |
| About | `/about` | Project info |

## API Endpoints

| Endpoint | Description | Filters |
|---|---|---|
| `GET /api/cards` | All cards | `color`, `type`, `rarity`, `keyword`, `search` |
| `GET /api/cards/{id}` | Single card | — |
| `GET /api/characters` | All characters | — |
| `GET /api/characters/{id}` | Single character | — |
| `GET /api/relics` | All relics | `rarity`, `pool`, `search` |
| `GET /api/relics/{id}` | Single relic | — |
| `GET /api/monsters` | All monsters | `type`, `search` |
| `GET /api/monsters/{id}` | Single monster | — |
| `GET /api/potions` | All potions | `rarity`, `search` |
| `GET /api/potions/{id}` | Single potion | — |
| `GET /api/enchantments` | All enchantments | `card_type`, `search` |
| `GET /api/enchantments/{id}` | Single enchantment | — |
| `GET /api/encounters` | All encounters | `room_type`, `act`, `search` |
| `GET /api/encounters/{id}` | Single encounter | — |
| `GET /api/events` | All events | `type`, `act`, `search` |
| `GET /api/events/{id}` | Single event | — |
| `GET /api/powers` | All powers | `type`, `search` |
| `GET /api/powers/{id}` | Single power | — |
| `GET /api/keywords` | Card keyword definitions | — |
| `GET /api/keywords/{id}` | Single keyword | — |
| `GET /api/intents` | Monster intent types | — |
| `GET /api/intents/{id}` | Single intent | — |
| `GET /api/orbs` | All orbs | — |
| `GET /api/orbs/{id}` | Single orb | — |
| `GET /api/afflictions` | Card afflictions | — |
| `GET /api/afflictions/{id}` | Single affliction | — |
| `GET /api/modifiers` | Run modifiers | — |
| `GET /api/modifiers/{id}` | Single modifier | — |
| `GET /api/achievements` | All achievements | — |
| `GET /api/achievements/{id}` | Single achievement | — |
| `GET /api/epochs` | Timeline epochs | `era`, `search` |
| `GET /api/epochs/{id}` | Single epoch | — |
| `GET /api/stories` | Story entries | — |
| `GET /api/stories/{id}` | Single story | — |
| `GET /api/images` | Image categories with file lists | — |
| `GET /api/images/{category}/download` | ZIP download of image category | — |
| `GET /api/changelogs` | Changelog summaries (all versions) | — |
| `GET /api/changelogs/{tag}` | Full changelog for a version tag | — |
| `GET /api/stats` | Entity counts across all categories | — |

Rate limited to **60 requests per minute** per IP. Interactive docs at `/docs` (Swagger UI).

### Rich Text Formatting

Text fields (`description`, `loss_text`, `flavor`, dialogue `text`, option `title`/`description`) may contain Godot BBCode-style tags preserved from the game's localization data:

| Tag | Type | Example | Rendered as |
|---|---|---|---|
| `[gold]...[/gold]` | Color | `[gold]Enchant[/gold]` | Gold colored text |
| `[red]...[/red]` | Color | `[red]blood[/red]` | Red colored text |
| `[blue]...[/blue]` | Color | `[blue]2[/blue]` | Blue colored text |
| `[green]...[/green]` | Color | `[green]healed[/green]` | Green colored text |
| `[purple]...[/purple]` | Color | `[purple]Sharp[/purple]` | Purple colored text |
| `[orange]...[/orange]` | Color | `[orange]hulking figure[/orange]` | Orange colored text |
| `[pink]...[/pink]` | Color | — | Pink colored text |
| `[aqua]...[/aqua]` | Color | `[aqua]Ascending Spirit[/aqua]` | Cyan colored text |
| `[sine]...[/sine]` | Effect | `[sine]swirling vortex[/sine]` | Wavy animated text |
| `[jitter]...[/jitter]` | Effect | `[jitter]CLANG![/jitter]` | Shaking animated text |
| `[b]...[/b]` | Effect | `[b]bold text[/b]` | Bold text |
| `[energy:N]` | Icon | `[energy:2]` | Energy icon(s) |
| `[star:N]` | Icon | `[star:1]` | Star icon(s) |
| `[Card]`, `[Relic]` | Placeholder | `[Card]` | Runtime-dynamic (italic) |

Tags can be nested: `[b][jitter]CLANG![/jitter][/b]`, `[gold][sine]swirling vortex[/sine][/gold]`.

If you're consuming the API directly, you can strip these with a regex like `\[/?[a-z]+(?::\d+)?\]` or render them in your own frontend. The `description_raw` field (where available) contains the unresolved SmartFormat template.

## Running Locally

### Prerequisites

- Python 3.10+
- Node.js 20+

### Backend

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r backend/requirements.txt

cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Backend runs at **http://localhost:8000**.

### Frontend

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

Frontend runs at **http://localhost:3000**.

### Docker

```bash
docker compose up --build
```

Starts both services (backend on 8000, frontend on 3000).

## Update Pipeline

A cross-platform Python script handles the full update workflow when a new game version is released:

```bash
# Full pipeline — extract game files, parse data, render sprites, copy images:
python3 tools/update.py

# Specify game install path manually:
python3 tools/update.py --game-dir "/path/to/Slay the Spire 2"

# Skip extraction (already have fresh extraction/ directory):
python3 tools/update.py --skip-extract

# Only re-parse data (no extraction or rendering):
python3 tools/update.py --parse-only

# Only re-render Spine sprites:
python3 tools/update.py --render-only

# Generate a changelog after updating:
python3 tools/update.py --changelog --game-version "0.98.2" --build-id "22238966"
```

The script auto-detects your OS and finds the Steam install directory. Requirements per step:

| Step | Tool | Install |
|---|---|---|
| PCK extraction | `gdre_tools` | [GDRE Tools releases](https://github.com/bruvzg/gdsdecomp/releases) |
| DLL decompilation | `ilspycmd` | `dotnet tool install ilspycmd -g` |
| Data parsing | Python 3.10+ | Built-in |
| Image copying | Python 3.10+ | Built-in |
| Spine rendering | Node.js 20+ | [nodejs.org](https://nodejs.org) |

### Manual Steps

If you prefer to run steps individually:

```bash
# Parse all data
cd backend/app/parsers && python3 parse_all.py

# Copy images from extraction to static
python3 backend/scripts/copy_images.py

# Render Spine sprites
cd tools/spine-renderer && npm install
node render_all.mjs          # All skeletons
node render.mjs              # Monsters only (better framing)
node render_skins2.mjs       # Skin variants (Cultists, Bowlbugs, etc.)
```

## Changelog System

Track what changes between game updates with field-level diffs across all entity categories.

### Generating a Changelog

```bash
# Compare current data against a git ref:
python3 tools/diff_data.py HEAD~1 --format json \
    --game-version "0.98.2" --build-id "22238966" \
    --title "March Update"

# Codex-only update (parser improvements, same game version):
python3 tools/diff_data.py HEAD~1 --format json \
    --game-version "0.98.2" --build-id "22238966" \
    --codex-version 2 --title "Improved card descriptions"

# Preview as text or markdown:
python3 tools/diff_data.py HEAD~1 --format text
python3 tools/diff_data.py HEAD~1 --format md
```

### Changelog Schema

Each changelog JSON file contains:

| Field | Description |
|---|---|
| `app_id` | Steam App ID (2868840) |
| `game_version` | Steam game version (e.g. `"0.98.2"`) |
| `build_id` | Steam build ID |
| `codex_version` | Codex revision number (`null` for game updates, `1`/`2`/... for parser updates) |
| `tag` | Unique key: `"0.98.2"` or `"0.98.2-codex2"` |
| `date` | Date of the update |
| `title` | Human-readable title |
| `summary` | Counts: `{ added, removed, changed }` |
| `categories` | Per-category diffs with added/removed/changed entities |

## Deploying

### CI/CD (Forgejo)

Pushes to `main` trigger `.forgejo/workflows/build.yml` which builds and pushes both images to Docker Hub via buildah.

### Local Build + Push

Skip CI and push directly from your machine:

```bash
# Build and push both images:
python3 tools/deploy.py

# Frontend only:
python3 tools/deploy.py --frontend

# Backend only:
python3 tools/deploy.py --backend

# Test build without pushing:
python3 tools/deploy.py --no-push

# Tag a release:
python3 tools/deploy.py --tag v0.98.2
```

Auto-detects Apple Silicon and cross-compiles to `linux/amd64` via `docker buildx`. Requires `docker login` first.

### Production

```bash
# Pull and restart on production server:
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Production data is bind-mounted (`./data:/data:ro`). Container restart required after data changes.

## Spine Renderer

Monster sprites in StS2 are [Spine](http://esotericsoftware.com/) skeletal animations — each monster is a `.skel` (binary skeleton) + `.atlas` + `.png` spritesheet, not a single image. The renderer assembles these into static portrait PNGs.

### How it works

1. Finds `.skel`, `.atlas`, and `.png` files under `extraction/raw/animations/`
2. Applies the idle animation at time 0 using `@esotericsoftware/spine-canvas` (v4.2.106, matching the game's Spine 4.2.x binary format)
3. Calculates a bounding box from all visible attachments, **excluding shadow/ground/VFX slots** (projectile paths, whoosh effects, wind paths, megablade/megatail) for tighter framing
4. Hides VFX-only slots before rendering (paths, whoosh, windpath, vulnerable, projectile, megablade, megatail)
5. Renders at **2× supersampling** (1024px) to reduce canvas triangle-mesh seam artifacts, then downscales to 512×512
6. Handles filename mismatches (e.g., `egg_layer/` dir containing `egglayer.skel`) via fallback file detection
7. Outputs PNGs to `backend/static/images/`

### Render coverage

| Category | Rendered | Total | Notes |
|---|---|---|---|
| Monsters | 97+ | 103 dirs | Skin variants rendered separately (Cultists, Bowlbugs) |
| Characters (combat) | 5 | 5 | Battle stance poses |
| Characters (rest site) | 6 | 6 | Includes Osty |
| Characters (select) | 5 | 5 | Wide cinematic poses |
| Backgrounds/NPCs | 10 | 14 | Neow, Tezcatara, merchant rooms, main menu |
| VFX/UI | 2 | 16 | Most VFX need specific animation frames |
| **Total** | **125** | **158** | |

### Technical details

- Uses `node-canvas` for server-side Canvas API (no browser/GPU needed)
- **Triangle rendering** enabled (`triangleRendering = true`) — required for mesh attachments (most monster body parts). Without it, only RegionAttachments render.
- `Physics.reset` parameter required by spine-canvas 4.2.x `updateWorldTransform()`
- Shadow slots (`shadow`, `shadow2`, `ground`, `ground_shadow`) excluded from bounds calculation but still rendered
- VFX slots (`*path*`, `whoosh`, `windpath`, `vulnerable`, `projectile`, `megablade`, `megatail`) excluded from bounds AND hidden before rendering
- Skin-based skeletons (Cultists: coral/slug, Bowlbugs: cocoon/goop/rock/web, Cubex: circleeye/diamondeye/squareeye) require explicit skin selection

### Dependencies

- `@esotericsoftware/spine-canvas` ^4.2.106 — Spine runtime for Canvas
- `canvas` ^3.1.0 — Node.js Canvas implementation

## Extracting Game Files

If you need to extract from scratch:

```bash
# Extract PCK (GDRE Tools)
/path/to/gdre_tools --headless --recover="/path/to/sts2.pck" --output-dir=extraction/raw

# Decompile DLL (ILSpy CLI)
ilspycmd -p -o extraction/decompiled "/path/to/sts2.dll"
```

Steam install locations:
- **Windows**: `C:\Program Files (x86)\Steam\steamapps\common\Slay the Spire 2\`
- **macOS**: `~/Library/Application Support/Steam/steamapps/common/Slay the Spire 2/`
- **Linux**: `~/.local/share/Steam/steamapps/common/Slay the Spire 2/`

## Roadmap

- **Individual detail pages** — Click-through pages with full details instead of just grids
- **Global search** — Search across all entity types simultaneously
- **Database backend** — Replace JSON loading with SQLite/PostgreSQL

## Tech Stack

- **Backend**: Python, FastAPI, Pydantic, slowapi
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Spine Renderer**: Node.js, @esotericsoftware/spine-canvas, node-canvas
- **Infrastructure**: Docker, Forgejo CI, buildah
- **Tools**: Python (update pipeline, changelog diffing, image copying)

## Disclaimer

This project is for educational purposes. Game data belongs to Mega Crit Games. This should not be used to recompile or redistribute the game.
