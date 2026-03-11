import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events - Spire Codex - Slay the Spire 2 Database",
  description:
    "All 66 events in Slay the Spire 2 — shrine events, Ancient encounters, and story events. View choices, dialogue, and outcomes.",
  openGraph: {
    title: "Events - Spire Codex - Slay the Spire 2",
    description:
      "All 66 events in Slay the Spire 2 — shrine events, Ancient encounters, and story events.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
