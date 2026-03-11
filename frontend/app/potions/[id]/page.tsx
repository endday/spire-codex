import type { Metadata } from "next";
import PotionDetail from "./PotionDetail";

const API_INTERNAL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PUBLIC = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL || "";

function stripTags(text: string): string {
  return text.replace(/\[\/?\w+(?:[=:][^\]]+)?\]/g, "").trim();
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_INTERNAL}/api/potions/${id}`);
    if (!res.ok) return { title: "Potion Not Found - Spire Codex" };
    const potion = await res.json();
    const desc = stripTags(potion.description || "");
    const title = `${potion.name} - Spire Codex - Slay the Spire 2 Database`;
    return {
      title,
      description: desc || `${potion.name} potion from Slay the Spire 2`,
      openGraph: {
        title: `${potion.name} - Spire Codex - Slay the Spire 2`,
        description: desc || `${potion.name} potion from Slay the Spire 2`,
        images: potion.image_url ? [{ url: `${API_PUBLIC}${potion.image_url}` }] : [],
      },
    };
  } catch {
    return { title: "Spire Codex - Slay the Spire 2 Database" };
  }
}

export default function Page() {
  return <PotionDetail />;
}
