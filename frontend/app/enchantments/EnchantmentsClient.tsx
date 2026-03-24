"use client";

import { useState, useEffect, useRef } from "react";
import type { Enchantment } from "@/lib/api";
import { cachedFetch } from "@/lib/fetch-cache";
import SearchFilter from "../components/SearchFilter";
import RichDescription from "../components/RichDescription";
import { useLanguage } from "../contexts/LanguageContext";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const cardTypeColors: Record<string, string> = {
  Attack: "bg-red-950/50 text-red-300 border-red-900/30",
  Skill: "bg-blue-950/50 text-blue-300 border-blue-900/30",
  Power: "bg-purple-950/50 text-purple-300 border-purple-900/30",
};

const cardTypeOptions = [
  { label: "Attack", value: "Attack" },
  { label: "Skill", value: "Skill" },
  { label: "Power", value: "Power" },
];

export default function EnchantmentsClient({ initialEnchantments }: { initialEnchantments: Enchantment[] }) {
  const [enchantments, setEnchantments] = useState<Enchantment[]>(initialEnchantments);
  const [search, setSearch] = useState("");
  const [cardType, setCardType] = useState("");
  const { lang } = useLanguage();
  const initialRender = useRef(true);

  useEffect(() => {
    // Skip the first fetch if we have server data and lang is English with no filters
    if (initialRender.current) {
      initialRender.current = false;
      if (lang === "eng" && !cardType && !search && initialEnchantments.length > 0) {
        return;
      }
    }
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (cardType) params.set("card_type", cardType);
    params.set("lang", lang);
    cachedFetch<Enchantment[]>(`${API}/api/enchantments?${params}`)
      .then(setEnchantments);
  }, [search, cardType, lang]);

  return (
    <>
      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        placeholder="Search enchantments..."
        resultCount={enchantments.length}
        filters={[
          {
            label: "All Card Types",
            value: cardType,
            options: cardTypeOptions,
            onChange: setCardType,
          },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {enchantments.map((ench) => (
          <div
            key={ench.id}
            className="bg-[var(--bg-card)] rounded-lg border border-cyan-800/40 p-4 hover:bg-[var(--bg-card-hover)] transition-all"
          >
            <div className="flex items-start gap-3 mb-2">
              {ench.image_url && (
                <img
                  src={`${API}${ench.image_url}`}
                  alt={`${ench.name} enchantment icon`}
                  className="w-10 h-10 object-contain flex-shrink-0"
                  loading="lazy"
                  crossOrigin="anonymous"
                />
              )}
              <div className="flex-1 flex items-start justify-between">
              <h3 className="font-semibold text-[var(--text-primary)]">
                {ench.name}
              </h3>
              <div className="flex gap-1.5 ml-2 flex-shrink-0">
                {ench.card_type && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      cardTypeColors[ench.card_type] ||
                      "bg-gray-800 text-gray-300 border-gray-700"
                    }`}
                  >
                    {ench.card_type}
                  </span>
                )}
                {ench.is_stackable && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded border bg-cyan-950/50 text-cyan-300 border-cyan-900/30">
                    Stackable
                  </span>
                )}
              </div>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-2">
              <RichDescription text={ench.description} />
            </p>

            {ench.extra_card_text && (
              <p className="text-xs text-[var(--text-muted)] leading-relaxed italic">
                Card text: <RichDescription text={ench.extra_card_text} />
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
