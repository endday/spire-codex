# Spire Codex — Frontend

Next.js 16 frontend for Spire Codex, a Slay the Spire 2 database.

## Setup

```bash
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

Runs at **http://localhost:3000**. Requires the backend running on port 8000.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — entity counts, category cards, character links |
| `/cards` | Filterable card grid with upgrade toggle and beta art |
| `/cards/[id]` | Card detail — stats, upgrade info, image |
| `/characters` | Character overview grid |
| `/characters/[id]` | Character detail — stats, starting deck/relics, quotes, NPC dialogues |
| `/relics` | Filterable relic grid |
| `/relics/[id]` | Relic detail with rich text |
| `/monsters` | Monster grid with Spine-rendered sprites |
| `/monsters/[id]` | Monster detail — HP, moves, damage, ascension scaling |
| `/potions` | Filterable potion grid (rarity, character pool) |
| `/potions/[id]` | Potion detail |
| `/enchantments` | Enchantments with card type filter |
| `/enchantments/[id]` | Enchantment detail |
| `/encounters` | Encounters by act/room type |
| `/encounters/[id]` | Encounter detail — monster lineup, room type |
| `/events` | Multi-page event trees with expandable choices |
| `/events/[id]` | Event detail — pages, options, Ancient dialogue |
| `/powers` | Buffs, debuffs with type/stack filters |
| `/timeline` | Epoch progression with era grouping |
| `/reference` | Keywords, intents, orbs, afflictions, modifiers, achievements, acts, ascensions |
| `/images` | Browsable game assets with ZIP download |
| `/changelog` | Data diffs between game updates |
| `/about` | Project info, live stats, pipeline visualization |

## Key Components

- **`RichDescription.tsx`** — Tokenizer + tree builder for nested Godot BBCode tags (colors, effects, icons, placeholders)
- **`SearchFilter.tsx`** — Reusable search bar + dropdown filters
- **`GlobalSearch.tsx`** — Press `.` anywhere to search across all categories
- **`CardGrid.tsx`** — Card grid with inline icons, upgrade rendering
- **`Navbar.tsx`** — Navigation with search trigger
- **`Footer.tsx`** — Footer with feedback modal

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL |

## Docker

```bash
docker build -t spire-codex-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://backend:8000 spire-codex-frontend
```

Output is set to `standalone` mode for Docker builds (see `next.config.ts`).
