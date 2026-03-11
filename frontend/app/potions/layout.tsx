import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Potions - Spire Codex - Slay the Spire 2 Database",
  description:
    "Browse all 63+ potions in Slay the Spire 2. Filter by rarity and character pool. View potion effects and descriptions.",
  openGraph: {
    title: "Potions - Spire Codex - Slay the Spire 2",
    description:
      "Browse all 63+ potions in Slay the Spire 2. Filter by rarity and character pool.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
