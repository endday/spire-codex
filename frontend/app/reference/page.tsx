import type {
  Act,
  Ascension,
  Keyword,
  Orb,
  Affliction,
  Intent,
  Modifier,
  Achievement,
} from "@/lib/api";
import ReferenceClient from "./ReferenceClient";
import type { ReferenceData } from "./ReferenceClient";

const API =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

async function fetchSection<T>(endpoint: string): Promise<T[]> {
  try {
    const res = await fetch(`${API}/api/${endpoint}?lang=eng`, {
      next: { revalidate: 300 },
    });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

export default async function ReferencePage() {
  const [acts, ascensions, keywords, orbs, afflictions, intents, modifiers, achievements] =
    await Promise.all([
      fetchSection<Act>("acts"),
      fetchSection<Ascension>("ascensions"),
      fetchSection<Keyword>("keywords"),
      fetchSection<Orb>("orbs"),
      fetchSection<Affliction>("afflictions"),
      fetchSection<Intent>("intents"),
      fetchSection<Modifier>("modifiers"),
      fetchSection<Achievement>("achievements"),
    ]);

  const data: ReferenceData = {
    acts,
    ascensions,
    keywords,
    orbs,
    afflictions,
    intents,
    modifiers,
    achievements,
  };

  const totalCount =
    acts.length +
    ascensions.length +
    keywords.length +
    orbs.length +
    afflictions.length +
    intents.length +
    modifiers.length +
    achievements.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">
        <span className="text-[var(--accent-gold)]">
          Slay the Spire 2 Reference
        </span>
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Quick reference for all {totalCount} game mechanics across keywords,
        orbs, afflictions, intents, modifiers, achievements, acts, and ascension
        levels.
      </p>

      <ReferenceClient initialData={data} />
    </div>
  );
}
