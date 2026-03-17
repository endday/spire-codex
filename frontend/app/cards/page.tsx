import type { Card } from "@/lib/api";
import CardsClient from "./CardsClient";

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default async function CardsPage() {
  let cards: Card[] = [];
  try {
    const res = await fetch(`${API}/api/cards?lang=eng`, { next: { revalidate: 300 } });
    if (res.ok) cards = await res.json();
  } catch {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">
        <span className="text-[var(--accent-gold)]">Slay the Spire 2 Cards</span>
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Browse every card across Ironclad, Silent, Defect, Necrobinder, and Regent. Filter by character, type, rarity, and keywords.
      </p>

      <CardsClient initialCards={cards} />
    </div>
  );
}
