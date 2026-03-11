import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Spire Codex - Slay the Spire 2 Database",
  description:
    "About Spire Codex — a community-built database for Slay the Spire 2. Learn about the data pipeline, tech stack, and how the site works.",
  openGraph: {
    title: "About - Spire Codex - Slay the Spire 2",
    description:
      "About Spire Codex — a community-built database for Slay the Spire 2.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
