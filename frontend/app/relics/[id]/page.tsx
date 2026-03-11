import type { Metadata } from "next";
import RelicDetail from "./RelicDetail";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function stripTags(text: string): string {
  return text.replace(/\[\/?\w+(?:[=:][^\]]+)?\]/g, "").trim();
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API}/api/relics/${id}`);
    if (!res.ok) return { title: "Relic Not Found - Spire Codex" };
    const relic = await res.json();
    const desc = stripTags(relic.description || "");
    const title = `${relic.name} - Spire Codex - Slay the Spire 2 Database`;
    return {
      title,
      description: desc || `${relic.name} relic from Slay the Spire 2`,
      openGraph: {
        title: `${relic.name} - Spire Codex`,
        description: desc || `${relic.name} relic from Slay the Spire 2`,
        images: relic.image_url ? [{ url: `${API}${relic.image_url}` }] : [],
      },
    };
  } catch {
    return { title: "Spire Codex - Slay the Spire 2 Database" };
  }
}

export default function Page() {
  return <RelicDetail />;
}
