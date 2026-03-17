import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Slay the Spire 2 Relics - Complete Relic List | Spire Codex",
  description:
    "Browse all 289+ Slay the Spire 2 relics. Filter by rarity (Common, Uncommon, Rare, Shop, Event, Ancient) and character pool (Ironclad, Silent, Defect, Necrobinder, Regent). View relic effects, flavor text, and images.",
  openGraph: {
    title: "Slay the Spire 2 Relics - Complete Relic List | Spire Codex",
    description:
      "Browse all 289+ Slay the Spire 2 relics. Filter by rarity and character pool. View relic effects and images.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
