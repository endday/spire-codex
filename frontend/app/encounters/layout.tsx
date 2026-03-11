import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Encounters - Spire Codex - Slay the Spire 2 Database",
  description:
    "All 87 encounters in Slay the Spire 2 — normal fights, elites, and bosses. View monster compositions, act assignments, and room types.",
  openGraph: {
    title: "Encounters - Spire Codex - Slay the Spire 2",
    description:
      "All 87 encounters in Slay the Spire 2 — normal fights, elites, and bosses.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
