import Link from "next/link";
import { t } from "@/lib/ui-translations";

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const REVALIDATE = 1800;

interface GuideStub {
  slug: string;
  title: string;
  author: string;
  date: string;
  category: string;
  difficulty?: string;
  character?: string;
  summary: string;
  tags?: string[];
}

const CATEGORY_ACCENTS: Record<string, string> = {
  general: "from-amber-500/30 to-amber-700/10",
  character: "from-rose-500/30 to-rose-700/10",
  strategy: "from-emerald-500/30 to-emerald-700/10",
  boss: "from-red-500/30 to-red-800/10",
};

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

async function loadLatestGuides(): Promise<GuideStub[]> {
  try {
    const res = await fetch(`${API}/api/guides`, { next: { revalidate: REVALIDATE } });
    if (!res.ok) return [];
    const all = (await res.json()) as GuideStub[];
    // Newest first by date string (ISO yyyy-mm-dd sorts lexically).
    return [...all]
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
      .slice(0, 3);
  } catch {
    return [];
  }
}

export default async function HomeGuidesSection({
  langPrefix = "",
  lang = "eng",
}: {
  langPrefix?: string;
  lang?: string;
}) {
  const guides = await loadLatestGuides();
  if (guides.length === 0) return null;
  const guidesBase = `${langPrefix}/guides`;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      <div className="flex items-baseline justify-between gap-3 mb-5">
        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
          {t("Community", lang)}{" "}
          <span className="text-[var(--accent-gold)]">{t("Guides", lang)}</span>
        </h2>
        <Link
          href={guidesBase}
          className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors"
        >
          <span>{t("View more", lang)}</span>
          <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {guides.map((g) => {
          const accent =
            CATEGORY_ACCENTS[g.category] ?? "from-[var(--accent-gold)]/30 to-[var(--accent-red)]/10";
          const difficulty = g.difficulty ? DIFFICULTY_LABEL[g.difficulty] ?? g.difficulty : null;
          return (
            <Link
              key={g.slug}
              href={`${guidesBase}/${g.slug}`}
              className="group relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-accent)] hover:shadow-xl hover:shadow-black/30 transition-all flex flex-col"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-60 group-hover:opacity-90 transition-opacity`} />
              <div className="relative p-5 flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  <span className="font-semibold text-[var(--accent-gold)]">{g.category}</span>
                  {difficulty && (
                    <>
                      <span aria-hidden>·</span>
                      <span>{difficulty}</span>
                    </>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] leading-tight group-hover:text-[var(--accent-gold)] transition-colors line-clamp-2">
                  {g.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-snug line-clamp-3 flex-1">
                  {g.summary}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  By <span className="text-[var(--text-secondary)]">{g.author}</span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
