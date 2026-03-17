import type { GameEvent } from "@/lib/api";
import EventsClient from "./EventsClient";

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default async function EventsPage() {
  let events: GameEvent[] = [];
  try {
    const res = await fetch(`${API}/api/events?lang=eng`, { next: { revalidate: 300 } });
    if (res.ok) events = await res.json();
  } catch {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">
        <span className="text-[var(--accent-gold)]">Slay the Spire 2 Events</span>
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Browse every Slay the Spire 2 event including shrine events, Ancient encounters, and story events. View choices, dialogue, and outcomes.
      </p>

      <EventsClient initialEvents={events} />
    </div>
  );
}
