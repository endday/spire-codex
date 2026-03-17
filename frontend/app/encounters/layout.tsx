import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Slay the Spire 2 Encounters - All Combat Encounters | Spire Codex",
  description:
    "Slay the Spire 2 encounters — browse all 87 combat encounters including normal fights, elites, and bosses. View monster compositions, act assignments, and room types.",
  openGraph: {
    title: "Slay the Spire 2 Encounters - All Combat Encounters | Spire Codex",
    description:
      "Slay the Spire 2 encounters — browse all 87 combat encounters including normal fights, elites, and bosses.",
  },
  alternates: {
    canonical: "/encounters",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
