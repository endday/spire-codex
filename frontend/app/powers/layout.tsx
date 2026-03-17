import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Slay the Spire 2 Powers - Complete Power List | Spire Codex",
  description:
    "Browse all 260 Slay the Spire 2 powers — buffs, debuffs, and neutral effects. Filter by type and stack behavior. View descriptions, icons, and details for every power.",
  openGraph: {
    title: "Slay the Spire 2 Powers - Complete Power List | Spire Codex",
    description:
      "Browse all 260 Slay the Spire 2 powers — buffs, debuffs, and neutral effects. Filter by type and stack behavior.",
  },
  alternates: {
    canonical: "/powers",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
