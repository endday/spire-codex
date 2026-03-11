import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monsters - Spire Codex - Slay the Spire 2 Database",
  description:
    "All 111 monsters in Slay the Spire 2 — elites, bosses, and minions. View HP values, moves, damage stats, and ascension scaling.",
  openGraph: {
    title: "Monsters - Spire Codex - Slay the Spire 2",
    description:
      "All 111 monsters in Slay the Spire 2 — elites, bosses, and minions. View HP, moves, and ascension scaling.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
