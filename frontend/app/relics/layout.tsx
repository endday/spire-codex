import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Relics - Spire Codex - Slay the Spire 2 Database",
  description:
    "Browse all 289+ relics in Slay the Spire 2. Filter by rarity and character pool. View relic effects, flavor text, and images.",
  openGraph: {
    title: "Relics - Spire Codex - Slay the Spire 2",
    description:
      "Browse all 289+ relics in Slay the Spire 2. Filter by rarity and character pool.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
