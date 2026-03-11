import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reference - Spire Codex - Slay the Spire 2 Database",
  description:
    "Slay the Spire 2 reference guide — keywords, intents, orbs, afflictions, modifiers, achievements, acts, and ascension levels all in one place.",
  openGraph: {
    title: "Reference - Spire Codex - Slay the Spire 2",
    description:
      "Slay the Spire 2 reference guide — keywords, intents, orbs, afflictions, modifiers, achievements, and more.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
