import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Slay the Spire 2 Monsters - Complete Monster List | Spire Codex",
  description:
    "Slay the Spire 2 monsters — browse all 111 normals, elites, and bosses. View HP values, moves, damage stats, and ascension scaling.",
  openGraph: {
    title: "Slay the Spire 2 Monsters - Complete Monster List | Spire Codex",
    description:
      "Slay the Spire 2 monsters — browse all 111 normals, elites, and bosses. View HP, moves, and ascension scaling.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
