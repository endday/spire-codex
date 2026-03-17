import type { Relic } from "@/lib/api";
import RelicsClient from "./RelicsClient";

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default async function RelicsPage() {
  let relics: Relic[] = [];
  try {
    const res = await fetch(`${API}/api/relics?lang=eng`, { next: { revalidate: 300 } });
    if (res.ok) relics = await res.json();
  } catch {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">
        <span className="text-[var(--accent-gold)]">Slay the Spire 2 Relics</span>
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Browse every relic across Ironclad, Silent, Defect, Necrobinder, and Regent. Filter by rarity and character pool.
      </p>

      <RelicsClient initialRelics={relics} />
    </div>
  );
}
