import type { Monster } from "@/lib/api";
import MonstersClient from "./MonstersClient";

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default async function MonstersPage() {
  let monsters: Monster[] = [];
  try {
    const res = await fetch(`${API}/api/monsters?lang=eng`, { next: { revalidate: 300 } });
    if (res.ok) monsters = await res.json();
  } catch {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">
        <span className="text-[var(--accent-gold)]">Slay the Spire 2 Monsters</span>
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Browse all {monsters.length} monsters in Slay the Spire 2 — normals, elites, and bosses. View HP values, moves, damage stats, and ascension scaling.
      </p>

      <MonstersClient initialMonsters={monsters} />
    </div>
  );
}
