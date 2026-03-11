import type { Metadata } from "next";
import CharacterDetail from "./CharacterDetail";

const API_INTERNAL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PUBLIC = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL || "";

function stripTags(text: string): string {
  return text.replace(/\[\/?\w+(?:[=:][^\]]+)?\]/g, "").trim();
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_INTERNAL}/api/characters/${id}`);
    if (!res.ok) return { title: "Character Not Found - Spire Codex" };
    const char = await res.json();
    const desc = stripTags(char.description || "");
    const title = `${char.name} - Spire Codex - Slay the Spire 2 Database`;
    return {
      title,
      description: desc || `${char.name} from Slay the Spire 2`,
      openGraph: {
        title: `${char.name} - Spire Codex - Slay the Spire 2`,
        description: desc || `${char.name} from Slay the Spire 2`,
        images: [{ url: `${API_PUBLIC}/static/images/characters/combat_${char.id.toLowerCase()}.png` }],
      },
    };
  } catch {
    return { title: "Spire Codex - Slay the Spire 2 Database" };
  }
}

export default function Page() {
  return <CharacterDetail />;
}
