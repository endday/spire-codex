import type { Metadata } from "next";
import EventDetail from "./EventDetail";
import { stripTags } from "@/lib/seo";
import JsonLd from "@/app/components/JsonLd";
import { buildDetailPageJsonLd } from "@/lib/jsonld";

const API_INTERNAL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PUBLIC = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL || "";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_INTERNAL}/api/events/${id}`);
    if (!res.ok) return { title: "Event Not Found - Spire Codex" };
    const event = await res.json();
    const desc = stripTags(event.description || "");
    const title = `${event.name} - Spire Codex - Slay the Spire 2 Database`;
    return {
      title,
      description: desc || `${event.name} event from Slay the Spire 2`,
      openGraph: {
        title: `${event.name} - Spire Codex - Slay the Spire 2`,
        description: desc || `${event.name} event from Slay the Spire 2`,
        images: event.image_url ? [{ url: `${API_PUBLIC}${event.image_url}` }] : [],
      },
      twitter: { card: "summary_large_image" },
      alternates: { canonical: `/events/${id}` },
    };
  } catch {
    return { title: "Spire Codex - Slay the Spire 2 Database" };
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  let jsonLd = null;
  try {
    const res = await fetch(`${API_INTERNAL}/api/events/${id}`);
    if (res.ok) {
      const event = await res.json();
      const desc = stripTags(event.description || "");
      jsonLd = buildDetailPageJsonLd({
        name: event.name,
        description: desc || `${event.name} event from Slay the Spire 2`,
        path: `/events/${id}`,
        imageUrl: event.image_url ? `${API_PUBLIC}${event.image_url}` : undefined,
        category: "Event",
        breadcrumbs: [
          { name: "Home", href: "/" },
          { name: "Events", href: "/events" },
          { name: event.name, href: `/events/${id}` },
        ],
      });
    }
  } catch {}
  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <EventDetail />
    </>
  );
}
