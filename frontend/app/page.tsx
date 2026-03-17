import type { Stats } from "@/lib/api";
import HomeClient from "./HomeClient";

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Translations {
  sections?: Record<string, string>;
  section_descs?: Record<string, string>;
  character_names?: Record<string, string>;
}

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const [stats, translations] = await Promise.all([
    fetchJSON<Stats>(`${API}/api/stats?lang=eng`),
    fetchJSON<Translations>(`${API}/api/translations?lang=eng`),
  ]);

  const total = stats
    ? Object.entries(stats)
        .filter(([k]) => k !== "images")
        .reduce((sum, [, v]) => sum + (typeof v === "number" ? v : 0), 0)
    : 0;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-red)]/8 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold mb-4">
              <span className="text-[var(--accent-gold)]">SPIRE</span>{" "}
              <span className="text-[var(--text-primary)] font-light">
                CODEX
              </span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-2">
              The complete database for Slay the Spire 2
            </p>
            {total > 0 && (
              <p className="text-sm text-[var(--text-muted)]">
                {total.toLocaleString()} entities across cards, relics, monsters, potions, and more
              </p>
            )}
          </div>
        </div>
      </section>

      <HomeClient initialStats={stats} initialTranslations={translations ?? {}} />
    </div>
  );
}
