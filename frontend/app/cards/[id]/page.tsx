import type { Metadata } from "next";
import CardDetail from "./CardDetail";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function stripTags(text: string): string {
  return text.replace(/\[\/?\w+(?:[=:][^\]]+)?\]/g, "").trim();
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API}/api/cards/${id}`);
    if (!res.ok) return { title: "Card Not Found - Spire Codex" };
    const card = await res.json();
    const desc = stripTags(card.description || "");
    const title = `${card.name} - Spire Codex - Slay the Spire 2 Database`;
    return {
      title,
      description: desc || `${card.name} card from Slay the Spire 2`,
      openGraph: {
        title: `${card.name} - Spire Codex`,
        description: desc || `${card.name} card from Slay the Spire 2`,
        images: card.image_url ? [{ url: `${API}${card.image_url}` }] : [],
      },
    };
  } catch {
    return { title: "Spire Codex - Slay the Spire 2 Database" };
  }
}

export default function Page() {
  return <CardDetail />;
}
