import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Card Keywords - Spire Codex - Slay the Spire 2 Database",
  description:
    "Browse all card keywords in Slay the Spire 2 — Exhaust, Ethereal, Innate, Retain, Sly, Eternal, and more. See every card with each keyword.",
  openGraph: {
    title: "Card Keywords - Spire Codex - Slay the Spire 2",
    description:
      "Browse all card keywords in Slay the Spire 2 — Exhaust, Ethereal, Innate, Retain, Sly, Eternal, and more.",
  },
  alternates: { canonical: "/keywords" },
};

export default function KeywordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
