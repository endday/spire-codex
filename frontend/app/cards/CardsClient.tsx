"use client";

import { useState, useEffect, useRef } from "react";
import type { Card } from "@/lib/api";
import { cachedFetch } from "@/lib/fetch-cache";
import CardGrid from "../components/CardGrid";
import SearchFilter from "../components/SearchFilter";
import { useLanguage } from "../contexts/LanguageContext";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const colorOptions = [
  { label: "Ironclad", value: "ironclad" },
  { label: "Silent", value: "silent" },
  { label: "Defect", value: "defect" },
  { label: "Necrobinder", value: "necrobinder" },
  { label: "Regent", value: "regent" },
  { label: "Colorless", value: "colorless" },
  { label: "Token", value: "token" },
  { label: "Curse", value: "curse" },
];

const typeOptions = [
  { label: "Attack", value: "Attack" },
  { label: "Skill", value: "Skill" },
  { label: "Power", value: "Power" },
  { label: "Status", value: "Status" },
  { label: "Curse", value: "Curse" },
];

const rarityOptions = [
  { label: "Basic", value: "Basic" },
  { label: "Common", value: "Common" },
  { label: "Uncommon", value: "Uncommon" },
  { label: "Rare", value: "Rare" },
  { label: "Ancient", value: "Ancient" },
  { label: "Token", value: "Token" },
];

const keywordOptions = [
  { label: "Exhaust", value: "Exhaust" },
  { label: "Innate", value: "Innate" },
  { label: "Ethereal", value: "Ethereal" },
  { label: "Retain", value: "Retain" },
  { label: "Unplayable", value: "Unplayable" },
  { label: "Sly", value: "Sly" },
  { label: "Eternal", value: "Eternal" },
];

export default function CardsClient({ initialCards }: { initialCards: Card[] }) {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [search, setSearch] = useState("");
  const [color, setColor] = useState("");
  const [type, setType] = useState("");
  const [rarity, setRarity] = useState("");
  const [keyword, setKeyword] = useState("");
  const { lang } = useLanguage();
  const initialRender = useRef(true);

  useEffect(() => {
    // Skip the first fetch if we have server data and lang is English with no filters
    if (initialRender.current) {
      initialRender.current = false;
      if (lang === "eng" && !color && !type && !rarity && !keyword && !search) {
        return;
      }
    }
    const params = new URLSearchParams();
    if (color) params.set("color", color);
    if (type) params.set("type", type);
    if (rarity) params.set("rarity", rarity);
    if (keyword) params.set("keyword", keyword);
    if (search) params.set("search", search);
    params.set("lang", lang);
    cachedFetch<Card[]>(`${API}/api/cards?${params}`)
      .then(setCards);
  }, [color, type, rarity, keyword, search, lang]);

  return (
    <>
      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        placeholder="Search cards..."
        resultCount={cards.length}
        filters={[
          {
            label: "All Colors",
            value: color,
            options: colorOptions,
            onChange: setColor,
          },
          {
            label: "All Types",
            value: type,
            options: typeOptions,
            onChange: setType,
          },
          {
            label: "All Rarities",
            value: rarity,
            options: rarityOptions,
            onChange: setRarity,
          },
          {
            label: "All Keywords",
            value: keyword,
            options: keywordOptions,
            onChange: setKeyword,
          },
        ]}
      />

      <CardGrid cards={cards} />
    </>
  );
}
