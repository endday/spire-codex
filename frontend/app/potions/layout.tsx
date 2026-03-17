import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Slay the Spire 2 Potions - Complete Potion List | Spire Codex",
  description:
    "Browse all 63+ Slay the Spire 2 potions. Filter by rarity (Common, Uncommon, Rare) and character pool (Ironclad, Silent, Defect, Necrobinder, Regent). View potion effects and descriptions.",
  openGraph: {
    title: "Slay the Spire 2 Potions - Complete Potion List | Spire Codex",
    description:
      "Browse all 63+ Slay the Spire 2 potions. Filter by rarity and character pool.",
  },
  alternates: {
    canonical: "/potions",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
