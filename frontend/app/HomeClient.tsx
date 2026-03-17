"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Stats } from "@/lib/api";
import { cachedFetch } from "@/lib/fetch-cache";
import { useLanguage } from "./contexts/LanguageContext";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Translations {
  sections?: Record<string, string>;
  section_descs?: Record<string, string>;
  character_names?: Record<string, string>;
}

const CHARACTERS = [
  { id: "ironclad", color: "from-red-900/40" },
  { id: "silent", color: "from-emerald-900/40" },
  { id: "defect", color: "from-blue-900/40" },
  { id: "necrobinder", color: "from-purple-900/40" },
  { id: "regent", color: "from-amber-900/40" },
];

const FALLBACK_DESCS: Record<string, string> = {
  cards: "Browse all cards across every character",
  characters: "View character stats, starting decks, and relics",
  relics: "Explore relics from starter to ancient tier",
  monsters: "Study monster HP, moves, and ascension scaling",
  potions: "Discover all available potions and their effects",
  enchantments: "View card enchantments and their effects",
  encounters: "Browse combat encounters across all acts",
  events: "Explore non-combat events and their choices",
  powers: "Browse all buffs, debuffs, and status effects",
  timeline: "Explore the lore epochs and story arcs of the Spire",
  images: "Browse and download all game art assets",
  reference: "Acts, ascension, keywords, orbs, afflictions, and more",
};

interface HomeClientProps {
  initialStats: Stats | null;
  initialTranslations: Translations;
}

export default function HomeClient({ initialStats, initialTranslations }: HomeClientProps) {
  const [stats, setStats] = useState<Stats | null>(initialStats);
  const [t, setT] = useState<Translations>(initialTranslations);
  const { lang } = useLanguage();
  const initialRender = useRef(true);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      if (lang === "eng") return;
    }
    cachedFetch<Stats>(`${API}/api/stats?lang=${lang}`)
      .then(setStats);
    cachedFetch<Translations>(`${API}/api/translations?lang=${lang}`)
      .then(setT);
  }, [lang]);

  const sectionKey = (key: string) => t.sections?.[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
  const sectionDesc = (key: string) => t.section_descs?.[key] ?? FALLBACK_DESCS[key] ?? "";

  const sections = [
    {
      href: "/cards",
      key: "cards",
      count: stats?.cards ?? "–",
      gradient: "from-red-900/30 to-transparent",
      accent: "text-red-400",
    },
    {
      href: "/characters",
      key: "characters",
      count: stats?.characters ?? "–",
      gradient: "from-amber-900/30 to-transparent",
      accent: "text-amber-400",
    },
    {
      href: "/relics",
      key: "relics",
      count: stats?.relics ?? "–",
      gradient: "from-purple-900/30 to-transparent",
      accent: "text-purple-400",
    },
    {
      href: "/monsters",
      key: "monsters",
      count: stats?.monsters ?? "–",
      gradient: "from-emerald-900/30 to-transparent",
      accent: "text-emerald-400",
    },
    {
      href: "/potions",
      key: "potions",
      count: stats?.potions ?? "–",
      gradient: "from-blue-900/30 to-transparent",
      accent: "text-blue-400",
    },
    {
      href: "/enchantments",
      key: "enchantments",
      count: stats?.enchantments ?? "–",
      gradient: "from-cyan-900/30 to-transparent",
      accent: "text-cyan-400",
    },
    {
      href: "/encounters",
      key: "encounters",
      count: stats?.encounters ?? "–",
      gradient: "from-rose-900/30 to-transparent",
      accent: "text-rose-400",
    },
    {
      href: "/events",
      key: "events",
      count: stats?.events ?? "–",
      gradient: "from-indigo-900/30 to-transparent",
      accent: "text-indigo-400",
    },
    {
      href: "/powers",
      key: "powers",
      count: stats?.powers ?? "–",
      gradient: "from-teal-900/30 to-transparent",
      accent: "text-teal-400",
    },
    {
      href: "/timeline",
      key: "timeline",
      count: stats?.epochs ?? "–",
      gradient: "from-violet-900/30 to-transparent",
      accent: "text-violet-400",
    },
    {
      href: "/images",
      key: "images",
      count: stats?.images ?? "–",
      gradient: "from-pink-900/30 to-transparent",
      accent: "text-pink-400",
    },
    {
      href: "/reference",
      key: "reference",
      count: stats
        ? (stats.keywords ?? 0) +
          (stats.orbs ?? 0) +
          (stats.afflictions ?? 0) +
          (stats.intents ?? 0) +
          (stats.modifiers ?? 0) +
          (stats.achievements ?? 0) +
          (stats.acts ?? 0) +
          (stats.ascensions ?? 0)
        : "–",
      gradient: "from-slate-800/30 to-transparent",
      accent: "text-slate-400",
    },
  ];

  return (
    <>
      {/* Character showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-5 gap-2 sm:gap-4">
          {CHARACTERS.map((char) => {
            const charName = t.character_names?.[char.id] ?? char.id.charAt(0).toUpperCase() + char.id.slice(1);
            return (
              <Link
                key={char.id}
                href={`/characters/${char.id.toLowerCase()}`}
                className="group relative overflow-hidden rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-accent)] transition-all"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${char.color} to-transparent opacity-60`}
                />
                <div className="relative aspect-square flex items-end justify-center">
                  <img
                    src={`${API}/static/images/characters/combat_${char.id}.png`}
                    alt={charName}
                    className="w-full h-full object-contain p-1 sm:p-2 group-hover:scale-105 transition-transform duration-300"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="relative text-center pb-2 sm:pb-3">
                  <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--accent-gold)] transition-colors">
                    {charName}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stats grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-all hover:border-[var(--border-accent)] hover:shadow-xl hover:shadow-black/20"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
              />
              <div className="relative p-6">
                <div className="flex items-baseline justify-between mb-3">
                  <h2 className="text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">
                    {sectionKey(s.key)}
                  </h2>
                  <span className={`text-2xl font-bold ${s.accent}`}>
                    {s.count}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{sectionDesc(s.key)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
