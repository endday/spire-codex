import type { Metadata } from "next";
import EventDetail from "./EventDetail";

const API_INTERNAL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PUBLIC = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL || "";

function stripTags(text: string): string {
  return text
    .replace(/\[\/?\w+(?:[=:][^\]]+)?\]/g, "")
    .replace(/\{[^}]+\}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

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
    };
  } catch {
    return { title: "Spire Codex - Slay the Spire 2 Database" };
  }
}

export default function Page() {
  return <EventDetail />;
}
