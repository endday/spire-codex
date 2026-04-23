# Spire Codex API — Terms of Use

Everything under `https://spire-codex.com/api/*` is free for community use, within the rate limits below. If your project needs more, open a [GitHub issue](https://github.com/ptrlrd/spire-codex/issues) or ping the [Discord](https://discord.gg/xMsTBeh) and we'll work something out.

These terms cover the **hosted API and the tooltip / changelog widgets at spire-codex.com**. They do not replace the software license — source code is covered by [LICENSE.md](LICENSE.md) (PolyForm Noncommercial 1.0.0).

## Rate limits

| Endpoint | Limit |
|---|---|
| Data endpoints (`/api/cards`, `/api/relics`, `/api/monsters`, ...) | 60 requests / minute / IP |
| `/api/runs/shared/{hash}` | 60 requests / minute / IP |
| Feedback submission (`POST /api/feedback`) | 5 requests / minute / IP |
| Guide submission (`POST /api/guides`) | 3 requests / minute / IP |

Hit a limit and you'll get `429 Too Many Requests`. Back off and retry.

If you're building a bot, a site, or a large-scale tool and the default limits aren't enough, reach out — higher limits are usually fine, we just want to know about the traffic.

## Attribution (encouraged, not required)

If you ship something useful built on this API or the extracted assets, a link back to `https://spire-codex.com` somewhere visible helps other players find the data and keeps the ecosystem visible.

## No warranty, no SLA

The API is offered as-is:

- No uptime guarantees.
- No guarantees the data is complete, correct, or up-to-date.
- No guarantees the response schema won't change between game patches.

Field-level changes between game versions are tracked at `/changelog`, but not every breaking change is backwards-compatible.

## Game data ownership

Card, relic, monster, potion, event, and all other Slay the Spire 2 game data belongs to **Mega Crit Games**. This project serves it as a community reference under fair-use / educational terms. If you build something with it, do not use the data to recompile, repackage, or redistribute the game itself, or in any way that competes with Mega Crit's own commercial interests.

## Abuse

Scraper traffic that bypasses rate limits, attempts to enumerate run hashes, or otherwise degrades service quality for other users will be blocked without notice.

## Contact

- Bugs and higher-limit requests: [GitHub issues](https://github.com/ptrlrd/spire-codex/issues)
- Community / chat: [Discord](https://discord.gg/xMsTBeh)
- Media / press: media@spire-codex.com
