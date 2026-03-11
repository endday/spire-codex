import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enchantments - Spire Codex - Slay the Spire 2 Database",
  description:
    "All 22 enchantments in Slay the Spire 2. View enchantment effects, card type restrictions, and stackability.",
  openGraph: {
    title: "Enchantments - Spire Codex - Slay the Spire 2",
    description:
      "All 22 enchantments in Slay the Spire 2. View effects, card type restrictions, and stackability.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
