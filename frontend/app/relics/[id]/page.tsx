import type { Metadata } from "next";
import RelicDetail from "./RelicDetail";
import { stripTags } from "@/lib/seo";
import JsonLd from "@/app/components/JsonLd";
import { buildDetailPageJsonLd } from "@/lib/jsonld";

const API_INTERNAL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PUBLIC = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL || "";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_INTERNAL}/api/relics/${id}`);
    if (!res.ok) return { title: "Relic Not Found - Spire Codex" };
    const relic = await res.json();
    const desc = stripTags(relic.description || "");
    const title = `${relic.name} - Spire Codex - Slay the Spire 2 Database`;
    return {
      title,
      description: desc || `${relic.name} relic from Slay the Spire 2`,
      openGraph: {
        title: `${relic.name} - Spire Codex - Slay the Spire 2`,
        description: desc || `${relic.name} relic from Slay the Spire 2`,
        images: relic.image_url ? [{ url: `${API_PUBLIC}${relic.image_url}` }] : [],
      },
      twitter: { card: "summary_large_image" },
      alternates: { canonical: `/relics/${id}` },
    };
  } catch {
    return { title: "Spire Codex - Slay the Spire 2 Database" };
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  let jsonLd = null;
  try {
    const res = await fetch(`${API_INTERNAL}/api/relics/${id}`);
    if (res.ok) {
      const relic = await res.json();
      const desc = stripTags(relic.description || "");
      jsonLd = buildDetailPageJsonLd({
        name: relic.name,
        description: desc || `${relic.name} relic from Slay the Spire 2`,
        path: `/relics/${id}`,
        imageUrl: relic.image_url ? `${API_PUBLIC}${relic.image_url}` : undefined,
        category: "Relic",
        breadcrumbs: [
          { name: "Home", href: "/" },
          { name: "Relics", href: "/relics" },
          { name: relic.name, href: `/relics/${id}` },
        ],
      });
    }
  } catch {}
  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <RelicDetail />
    </>
  );
}
