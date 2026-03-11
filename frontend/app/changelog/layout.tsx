import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog - Spire Codex - Slay the Spire 2 Database",
  description:
    "Slay the Spire 2 update history and Spire Codex changelog. Track game patches, balance changes, and new content additions.",
  openGraph: {
    title: "Changelog - Spire Codex - Slay the Spire 2",
    description:
      "Slay the Spire 2 update history and Spire Codex changelog. Track patches, balance changes, and new content.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
