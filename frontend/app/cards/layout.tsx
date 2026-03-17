import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Slay the Spire 2 Cards - Complete Card List | Spire Codex",
  description:
    "Browse all 576+ Slay the Spire 2 cards. Filter by character (Ironclad, Silent, Defect, Necrobinder, Regent), type, rarity, and keywords. View card art, stats, upgrades, and related cards.",
  openGraph: {
    title: "Slay the Spire 2 Cards - Complete Card List | Spire Codex",
    description:
      "Browse all 576+ Slay the Spire 2 cards. Filter by character, type, rarity, and keywords.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
