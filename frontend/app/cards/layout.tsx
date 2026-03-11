import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cards - Spire Codex - Slay the Spire 2 Database",
  description:
    "Browse all 576+ cards in Slay the Spire 2. Filter by character, type, rarity, and keywords. View card art, stats, upgrades, and related cards.",
  openGraph: {
    title: "Cards - Spire Codex - Slay the Spire 2",
    description:
      "Browse all 576+ cards in Slay the Spire 2. Filter by character, type, rarity, and keywords.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
