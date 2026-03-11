import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Powers - Spire Codex - Slay the Spire 2 Database",
  description:
    "All 260 powers in Slay the Spire 2 — buffs, debuffs, and neutral effects. Filter by type and stack behavior. View descriptions and icons.",
  openGraph: {
    title: "Powers - Spire Codex - Slay the Spire 2",
    description:
      "All 260 powers in Slay the Spire 2 — buffs, debuffs, and neutral effects.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
