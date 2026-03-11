import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Characters - Spire Codex - Slay the Spire 2 Database",
  description:
    "All playable characters in Slay the Spire 2 — Ironclad, Silent, Defect, Necrobinder, and Regent. View starting decks, relics, stats, and NPC dialogues.",
  openGraph: {
    title: "Characters - Spire Codex - Slay the Spire 2",
    description:
      "All playable characters in Slay the Spire 2 — Ironclad, Silent, Defect, Necrobinder, and Regent.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
