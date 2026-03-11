import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timeline - Spire Codex - Slay the Spire 2 Database",
  description:
    "The full timeline of Slay the Spire 2 — 57 epochs across multiple eras. View story progression, unlockable cards, relics, and potions.",
  openGraph: {
    title: "Timeline - Spire Codex - Slay the Spire 2",
    description:
      "The full timeline of Slay the Spire 2 — 57 epochs across multiple eras and story arcs.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
