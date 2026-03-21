"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Card } from "@/lib/api";
import CardGrid from "@/app/components/CardGrid";
import RichDescription from "@/app/components/RichDescription";
import SearchFilter from "@/app/components/SearchFilter";
import { cachedFetch } from "@/lib/fetch-cache";
import { useLanguage } from "../../contexts/LanguageContext";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Keyword {
  id: string;
  name: string;
  description: string;
}

const colorOptions = [
  { label: "Ironclad", value: "ironclad" },
  { label: "Silent", value: "silent" },
  { label: "Defect", value: "defect" },
  { label: "Necrobinder", value: "necrobinder" },
  { label: "Regent", value: "regent" },
  { label: "Colorless", value: "colorless" },
];

export default function KeywordDetail() {
  const params = useParams();
  const id = params.id as string;
  const { lang } = useLanguage();

  const [keyword, setKeyword] = useState<Keyword | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [search, setSearch] = useState("");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);

    Promise.all([
      cachedFetch<Keyword>(`${API}/api/keywords/${id}?lang=${lang}`),
      cachedFetch<Card[]>(`${API}/api/cards?keyword=${encodeURIComponent(id)}&lang=${lang}`),
    ])
      .then(([kw, cardList]) => {
        setKeyword(kw);
        setCards(cardList);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, lang]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12 text-[var(--text-muted)]">Loading...</div>
      </div>
    );
  }

  if (notFound || !keyword) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/keywords" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          &larr; Back to Keywords
        </Link>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Keyword Not Found</h1>
        </div>
      </div>
    );
  }

  let filtered = cards;
  if (color) filtered = filtered.filter((c) => c.color === color);
  if (search) filtered = filtered.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/keywords" className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
        &larr; Back to Keywords
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          {keyword.name}
        </h1>
        <p className="text-[var(--text-secondary)] text-lg mb-1">
          <RichDescription text={keyword.description} />
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          {cards.length} card{cards.length !== 1 ? "s" : ""} with this keyword
        </p>
      </div>

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        placeholder={`Search ${keyword.name} cards...`}
        resultCount={filtered.length}
        filters={[
          {
            label: "All Characters",
            value: color,
            options: colorOptions,
            onChange: setColor,
          },
        ]}
      />

      <CardGrid cards={filtered} />
    </div>
  );
}
