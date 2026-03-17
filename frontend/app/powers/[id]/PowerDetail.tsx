"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Power } from "@/lib/api";
import RichDescription from "@/app/components/RichDescription";
import { cachedFetch } from "@/lib/fetch-cache";
import { useLanguage } from "../../contexts/LanguageContext";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const typeColors: Record<string, string> = {
  Buff: "text-emerald-400",
  Debuff: "text-red-400",
  None: "text-gray-400",
};

export default function PowerDetail() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const [power, setPower] = useState<Power | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    cachedFetch<Power>(`${API}/api/powers/${id}?lang=${lang}`)
      .then((data) => setPower(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, lang]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-[var(--text-muted)]">
        Loading...
      </div>
    );
  }

  if (notFound || !power) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-[var(--text-muted)] mb-4">Power not found.</p>
        <Link href="/powers" className="text-[var(--accent-gold)] hover:underline">
          &larr; Back to Powers
        </Link>
      </div>
    );
  }

  const typeColor = typeColors[power.type] || "text-gray-400";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/powers"
        className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6 inline-block"
      >
        &larr; Back to Powers
      </Link>

      <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] p-6">
        {power.image_url && (
          <div className="flex justify-center mb-6">
            <img
              src={`${API}${power.image_url}`}
              alt={`${power.name} - Slay the Spire 2 Power`}
              className="w-24 h-24 object-contain"
              crossOrigin="anonymous"
            />
          </div>
        )}

        <h1 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-4">
          {power.name}
        </h1>

        <div className="flex items-center justify-center gap-3 mb-6 text-sm">
          <span className={typeColor}>{power.type}</span>
          <span className="text-[var(--text-muted)]">&middot;</span>
          <span className="text-[var(--text-muted)]">{power.stack_type}</span>
        </div>

        {power.description && (
          <div className="text-[var(--text-secondary)] leading-relaxed">
            <RichDescription text={power.description} />
          </div>
        )}
      </div>
    </div>
  );
}
