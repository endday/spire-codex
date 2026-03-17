import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Slay the Spire 2 Events - All In-Game Events | Spire Codex",
  description:
    "Slay the Spire 2 events — browse all 66 shrine events, Ancient encounters, and story events. View choices, dialogue, relic offerings, and outcomes for every event.",
  openGraph: {
    title: "Slay the Spire 2 Events - All In-Game Events | Spire Codex",
    description:
      "Slay the Spire 2 events — browse all 66 shrine events, Ancient encounters, and story events with choices, dialogue, and outcomes.",
  },
  alternates: {
    canonical: "/events",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
