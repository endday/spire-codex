import type { Metadata } from "next";
import JsonLd from "@/app/components/JsonLd";
import { buildSoftwareApplicationJsonLd, buildBreadcrumbJsonLd } from "@/lib/jsonld";
import { IS_BETA } from "@/lib/seo";

const API_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://spire-codex.com";

export const metadata: Metadata = {
  title: "Slay the Spire 2 Developer API & Tooltip Widget | Spire Codex",
  description:
    "Integrate Slay the Spire 2 game data into your projects. Public REST API with 22+ endpoints, embeddable tooltip widget, and multi-language support.",
  openGraph: {
    title: "Slay the Spire 2 Developer API & Tooltip Widget | Spire Codex",
    description:
      "Public REST API and embeddable tooltip widget for Slay the Spire 2 game data.",
  },
  alternates: { canonical: "/developers" },
};

export default function DevelopersPage() {
  const jsonLd = [
    buildSoftwareApplicationJsonLd(),
    buildBreadcrumbJsonLd([
      { name: "Home", href: "/" },
      { name: "Developers", href: "/developers" },
    ]),
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd data={jsonLd} />
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
        Developers
      </h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Build tools, bots, and content with Spire Codex data. Everything is free and open.
      </p>

      {IS_BETA && (
        <div className="bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 rounded-xl p-4 mb-8">
          <p className="text-sm text-[var(--accent-gold)] font-medium mb-1">Beta API</p>
          <p className="text-sm text-[var(--text-secondary)]">
            This API serves data from the Steam beta branch and may include unreleased content.
            For stable data, use <a href="https://spire-codex.com/developers" className="text-[var(--accent-gold)] hover:underline">spire-codex.com</a>.
          </p>
        </div>
      )}

      {/* Tooltip Widget */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[var(--accent-gold)] mb-4">
          Tooltip Widget
        </h2>
        <p className="text-[var(--text-secondary)] mb-4">
          Add Wowhead-style hoverable tooltips for cards, relics, and potions to any website. One script tag, zero dependencies.
        </p>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-5 mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Installation
          </h3>
          <pre className="bg-[var(--bg-primary)] rounded-lg p-4 text-sm text-[var(--text-secondary)] overflow-x-auto">
            <code>{`<script src="${API_URL}/widget/spire-codex-tooltip.js"></script>`}</code>
          </pre>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-5 mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Syntax
          </h3>
          <div className="space-y-2 text-sm">
            {[
              { syntax: "[[Strike]]", desc: "Card tooltip (default type)" },
              { syntax: "[[card:Bash]]", desc: "Card (explicit)" },
              { syntax: "[[relic:Burning Blood]]", desc: "Relic" },
              { syntax: "[[potion:Fire Potion]]", desc: "Potion" },
              { syntax: "[[character:Ironclad]]", desc: "Character" },
              { syntax: "[[monster:Jaw Worm]]", desc: "Monster" },
              { syntax: "[[power:Strength]]", desc: "Power" },
              { syntax: "[[event:Neow]]", desc: "Event" },
              { syntax: "[[encounter:Lagavulin]]", desc: "Encounter" },
              { syntax: "[[enchantment:Sharp]]", desc: "Enchantment" },
              { syntax: "[[keyword:Exhaust]]", desc: "Keyword" },
              { syntax: "[[orb:Lightning]]", desc: "Orb" },
              { syntax: "[[affliction:Bound]]", desc: "Affliction" },
              { syntax: "[[achievement:Minimalist]]", desc: "Achievement" },
            ].map((item) => (
              <div key={item.syntax} className="flex gap-4">
                <code className="text-[var(--accent-gold)] whitespace-nowrap">{item.syntax}</code>
                <span className="text-[var(--text-muted)]">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            JavaScript API
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <code className="text-[var(--accent-gold)]">SpireCodex.scan()</code>
              <span className="text-[var(--text-muted)] ml-2">Re-scan the page for new {"[[...]]"} patterns (for SPAs)</span>
            </div>
            <div>
              <code className="text-[var(--accent-gold)]">SpireCodex.scan(element)</code>
              <span className="text-[var(--text-muted)] ml-2">Scan a specific DOM element</span>
            </div>
          </div>
        </div>
      </section>

      {/* Changelog Widget */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[var(--accent-gold)] mb-4">
          Changelog Widget
        </h2>
        <p className="text-[var(--text-secondary)] mb-4">
          Embed a compact, interactive changelog viewer showing Spire Codex update history with version switching.
        </p>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-5 mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Installation
          </h3>
          <pre className="bg-[var(--bg-primary)] rounded-lg p-4 text-sm text-[var(--text-secondary)] overflow-x-auto">
            <code>{`<div id="scx-changelog"></div>
<script src="${API_URL}/widget/spire-codex-changelog.js"></script>`}</code>
          </pre>
          <div className="space-y-2 text-sm mt-3">
            <div className="flex gap-4">
              <code className="text-[var(--accent-gold)] whitespace-nowrap">data-version=&quot;1.0.4&quot;</code>
              <span className="text-[var(--text-muted)]">Show a specific version (default: latest)</span>
            </div>
          </div>
        </div>
      </section>

      {/* REST API */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[var(--accent-gold)] mb-4">
          REST API
        </h2>
        <p className="text-[var(--text-secondary)] mb-4">
          Full game database accessible via a public REST API. No authentication required. Rate limited to 60 requests/minute.
        </p>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-5 mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Base URL
          </h3>
          <code className="text-[var(--accent-gold)]">{API_URL}</code>
          {!IS_BETA && (
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Beta API (unreleased content from Steam beta branch): <code className="text-[var(--text-secondary)]">https://beta.spire-codex.com</code>
            </p>
          )}
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-5 mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Endpoints
          </h3>
          <div className="space-y-1.5 text-sm font-mono">
            {[
              { method: "GET", path: "/api/cards", desc: "All cards (filter: color, type, rarity, keyword, tag, search)" },
              { method: "GET", path: "/api/cards/{id}", desc: "Single card" },
              { method: "GET", path: "/api/characters", desc: "All characters" },
              { method: "GET", path: "/api/relics", desc: "All relics (filter: rarity, pool, search)" },
              { method: "GET", path: "/api/potions", desc: "All potions (filter: rarity, pool, search)" },
              { method: "GET", path: "/api/monsters", desc: "All monsters (filter: type, search)" },
              { method: "GET", path: "/api/powers", desc: "All powers (filter: type, stack_type, search)" },
              { method: "GET", path: "/api/events", desc: "All events (filter: type, act, search)" },
              { method: "GET", path: "/api/encounters", desc: "All encounters (filter: room_type, act, search)" },
              { method: "GET", path: "/api/enchantments", desc: "All enchantments" },
              { method: "GET", path: "/api/keywords", desc: "Card keywords" },
              { method: "GET", path: "/api/orbs", desc: "Orb types" },
              { method: "GET", path: "/api/afflictions", desc: "Affliction types" },
              { method: "GET", path: "/api/achievements", desc: "Achievements" },
              { method: "GET", path: "/api/stats", desc: "Entity counts" },
            ].map((ep) => (
              <div key={ep.path} className="flex items-start gap-3">
                <span className="text-emerald-400 w-8 flex-shrink-0">{ep.method}</span>
                <span className="text-[var(--text-primary)]">{ep.path}</span>
                <span className="text-[var(--text-muted)] font-sans text-xs ml-auto">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-5 mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Multi-Language
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            Add <code className="text-[var(--accent-gold)]">?lang=jpn</code> to any endpoint. 14 languages supported:
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            eng, deu, esp, fra, ita, jpn, kor, pol, ptb, rus, spa, tha, tur, zhs
          </p>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Quick Start
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">cURL</p>
              <pre className="bg-[var(--bg-primary)] rounded-lg p-3 text-sm text-[var(--text-secondary)] overflow-x-auto">
                <code>{`curl ${API_URL}/api/cards?color=ironclad&rarity=Rare`}</code>
              </pre>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Python</p>
              <pre className="bg-[var(--bg-primary)] rounded-lg p-3 text-sm text-[var(--text-secondary)] overflow-x-auto">
                <code>{`import requests
cards = requests.get("${API_URL}/api/cards", params={"color": "ironclad"}).json()
for card in cards:
    print(f"{card['name']} - {card['type']} ({card['rarity']})")`}</code>
              </pre>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">JavaScript</p>
              <pre className="bg-[var(--bg-primary)] rounded-lg p-3 text-sm text-[var(--text-secondary)] overflow-x-auto">
                <code>{`const res = await fetch("${API_URL}/api/relics?pool=ironclad");
const relics = await res.json();
console.log(relics.map(r => r.name));`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Data Exports */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[var(--accent-gold)] mb-4">
          Data Exports
        </h2>
        <p className="text-[var(--text-secondary)] mb-4">
          Download all game data as a single ZIP archive. Each archive contains JSON files for every entity type (cards, relics, monsters, powers, and more).
        </p>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-5 mb-4">
          <a
            href={`${API_URL}/api/exports/eng`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 rounded-lg text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/20 transition-colors font-medium"
          >
            Download English Data (ZIP)
          </a>
          <p className="text-sm text-[var(--text-muted)] mt-4">
            14 languages available. Example downloads:{" "}
            {[
              { code: "jpn", label: "Japanese" },
              { code: "kor", label: "Korean" },
              { code: "zhs", label: "Chinese" },
              { code: "fra", label: "French" },
              { code: "deu", label: "German" },
            ].map((lang, i) => (
              <span key={lang.code}>
                {i > 0 && ", "}
                <a
                  href={`${API_URL}/api/exports/${lang.code}`}
                  className="text-[var(--accent-gold)] hover:underline"
                >
                  {lang.label}
                </a>
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* Interactive Docs */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-[var(--accent-gold)] mb-4">
          Interactive API Docs
        </h2>
        <p className="text-[var(--text-secondary)] mb-4">
          Full Swagger/OpenAPI documentation with try-it-out functionality.
        </p>
        <a
          href={`${API_URL}/docs`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--accent-gold)] hover:border-[var(--border-accent)] transition-colors"
        >
          Open API Docs &rarr;
        </a>
      </section>

      {/* Source */}
      <section>
        <h2 className="text-2xl font-semibold text-[var(--accent-gold)] mb-4">
          Open Source
        </h2>
        <p className="text-[var(--text-secondary)] mb-4">
          Spire Codex is open source. The data extraction pipeline, API, and frontend are all available on GitHub.
        </p>
        <a
          href="https://github.com/ptrlrd/spire-codex"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] hover:border-[var(--border-accent)] transition-colors"
        >
          View on GitHub &rarr;
        </a>
      </section>
    </div>
  );
}
