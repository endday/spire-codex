import type { Metadata } from "next";
import MonsterDetail from "./MonsterDetail";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API}/api/monsters/${id}`);
    if (!res.ok) return { title: "Monster Not Found - Spire Codex" };
    const monster = await res.json();
    const hpText = monster.min_hp ? `${monster.min_hp}${monster.max_hp && monster.max_hp !== monster.min_hp ? `–${monster.max_hp}` : ""} HP` : "";
    const desc = `${monster.type} monster${hpText ? ` · ${hpText}` : ""}`;
    const title = `${monster.name} - Spire Codex - Slay the Spire 2 Database`;
    return {
      title,
      description: desc,
      openGraph: {
        title: `${monster.name} - Spire Codex`,
        description: desc,
        images: monster.image_url ? [{ url: `${API}${monster.image_url}` }] : [],
      },
    };
  } catch {
    return { title: "Spire Codex - Slay the Spire 2 Database" };
  }
}

export default function Page() {
  return <MonsterDetail />;
}
