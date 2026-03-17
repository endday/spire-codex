import type { Metadata } from "next";
import CardDetail from "./CardDetail";
import { stripTags } from "@/lib/seo";
import JsonLd from "@/app/components/JsonLd";
import { buildDetailPageJsonLd } from "@/lib/jsonld";

const API_INTERNAL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PUBLIC = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL || "";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_INTERNAL}/api/cards/${id}`);
    if (!res.ok) return { title: "Card Not Found - Spire Codex" };
    const card = await res.json();
    const desc = stripTags(card.description || "");
    const title = `${card.name} - Spire Codex - Slay the Spire 2 Database`;
    return {
      title,
      description: desc || `${card.name} card from Slay the Spire 2`,
      openGraph: {
        title: `${card.name} - Spire Codex - Slay the Spire 2`,
        description: desc || `${card.name} card from Slay the Spire 2`,
        images: card.image_url ? [{ url: `${API_PUBLIC}${card.image_url}` }] : [],
      },
      twitter: { card: "summary_large_image" },
      alternates: { canonical: `/cards/${id}` },
    };
  } catch {
    return { title: "Spire Codex - Slay the Spire 2 Database" };
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  let jsonLd = null;
  try {
    const res = await fetch(`${API_INTERNAL}/api/cards/${id}`);
    if (res.ok) {
      const card = await res.json();
      const desc = stripTags(card.description || "");
      jsonLd = buildDetailPageJsonLd({
        name: card.name,
        description: desc || `${card.name} card from Slay the Spire 2`,
        path: `/cards/${id}`,
        imageUrl: card.image_url ? `${API_PUBLIC}${card.image_url}` : undefined,
        category: "Card",
        breadcrumbs: [
          { name: "Home", href: "/" },
          { name: "Cards", href: "/cards" },
          { name: card.name, href: `/cards/${id}` },
        ],
      });
    }
  } catch {}
  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <CardDetail />
    </>
  );
}
