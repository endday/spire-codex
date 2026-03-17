"use client";

import { useState, useEffect, useRef } from "react";
import type { Encounter } from "@/lib/api";
import { cachedFetch } from "@/lib/fetch-cache";
import SearchFilter from "../components/SearchFilter";
import RichDescription from "../components/RichDescription";
import { useLanguage } from "../contexts/LanguageContext";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const roomTypeColors: Record<string, string> = {
  Monster: "border-gray-600/40",
  Elite: "border-amber-600/40",
  Boss: "border-red-600/40",
};

const roomTypeBadge: Record<string, string> = {
  Monster: "bg-gray-800 text-gray-300 border-gray-700",
  Elite: "bg-amber-950/50 text-amber-300 border-amber-900/30",
  Boss: "bg-red-950/50 text-red-300 border-red-900/30",
};

const roomTypeOptions = [
  { label: "Monster", value: "Monster" },
  { label: "Elite", value: "Elite" },
  { label: "Boss", value: "Boss" },
];

const actOptions = [
  { label: "Act 1 - Overgrowth", value: "overgrowth" },
  { label: "Act 2 - Hive", value: "hive" },
  { label: "Act 3 - Glory", value: "glory" },
  { label: "Underdocks", value: "underdocks" },
];

export default function EncountersClient({ initialEncounters }: { initialEncounters: Encounter[] }) {
  const [encounters, setEncounters] = useState<Encounter[]>(initialEncounters);
  const [search, setSearch] = useState("");
  const [roomType, setRoomType] = useState("");
  const [act, setAct] = useState("");
  const { lang } = useLanguage();
  const initialRender = useRef(true);

  useEffect(() => {
    // Skip the first fetch if we have server data and lang is English with no filters
    if (initialRender.current) {
      initialRender.current = false;
      if (lang === "eng" && !roomType && !act && !search) {
        return;
      }
    }
    const params = new URLSearchParams();
    if (roomType) params.set("room_type", roomType);
    if (act) params.set("act", act);
    if (search) params.set("search", search);
    params.set("lang", lang);
    cachedFetch<Encounter[]>(`${API}/api/encounters?${params}`)
      .then(setEncounters);
  }, [roomType, act, search, lang]);

  return (
    <>
      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        placeholder="Search encounters..."
        resultCount={encounters.length}
        filters={[
          {
            label: "All Types",
            value: roomType,
            options: roomTypeOptions,
            onChange: setRoomType,
          },
          {
            label: "All Acts",
            value: act,
            options: actOptions,
            onChange: setAct,
          },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {encounters.map((enc) => (
          <div
            key={enc.id}
            className={`bg-[var(--bg-card)] rounded-lg border ${
              roomTypeColors[enc.room_type] || "border-[var(--border-subtle)]"
            } p-4 hover:bg-[var(--bg-card-hover)] transition-all`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-[var(--text-primary)]">
                {enc.name}
              </h3>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0 ml-2 ${
                  roomTypeBadge[enc.room_type] || "bg-gray-800 text-gray-300 border-gray-700"
                }`}
              >
                {enc.room_type}
                {enc.is_weak && " (Weak)"}
              </span>
            </div>

            {enc.act && (
              <p className="text-xs text-[var(--text-muted)] mb-2">
                {enc.act}
              </p>
            )}

            {enc.monsters && enc.monsters.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {enc.monsters.map((m) => (
                  <span
                    key={m.id}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                  >
                    {m.name}
                  </span>
                ))}
              </div>
            )}

            {enc.tags && enc.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {enc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-900/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {enc.loss_text && (
              <p className="text-xs text-[var(--text-muted)] italic leading-relaxed">
                <RichDescription text={enc.loss_text} />
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
