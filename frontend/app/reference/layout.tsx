import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Slay the Spire 2 Reference - Keywords, Orbs, Afflictions & More | Spire Codex",
  description:
    "Slay the Spire 2 reference guide covering keywords, orbs, afflictions, intents, modifiers, achievements, acts, and ascension levels all in one place.",
  openGraph: {
    title:
      "Slay the Spire 2 Reference - Keywords, Orbs, Afflictions & More | Spire Codex",
    description:
      "Slay the Spire 2 reference guide covering keywords, orbs, afflictions, intents, modifiers, achievements, and more.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
