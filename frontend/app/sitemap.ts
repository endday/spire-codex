import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://spire-codex.com";
const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STATIC_PAGES = [
  { path: "/", priority: 1.0 },
  { path: "/cards", priority: 0.9 },
  { path: "/characters", priority: 0.9 },
  { path: "/relics", priority: 0.9 },
  { path: "/monsters", priority: 0.8 },
  { path: "/potions", priority: 0.8 },
  { path: "/powers", priority: 0.7 },
  { path: "/enchantments", priority: 0.7 },
  { path: "/encounters", priority: 0.7 },
  { path: "/events", priority: 0.7 },
  { path: "/timeline", priority: 0.6 },
  { path: "/reference", priority: 0.6 },
  { path: "/images", priority: 0.5 },
  { path: "/changelog", priority: 0.5 },
  { path: "/about", priority: 0.4 },
];

const DYNAMIC_ROUTES: { endpoint: string; prefix: string; priority: number }[] = [
  { endpoint: "/api/cards", prefix: "/cards", priority: 0.8 },
  { endpoint: "/api/characters", prefix: "/characters", priority: 0.8 },
  { endpoint: "/api/relics", prefix: "/relics", priority: 0.8 },
  { endpoint: "/api/monsters", prefix: "/monsters", priority: 0.7 },
  { endpoint: "/api/potions", prefix: "/potions", priority: 0.7 },
  { endpoint: "/api/powers", prefix: "/powers", priority: 0.6 },
  { endpoint: "/api/events", prefix: "/events", priority: 0.6 },
];

async function fetchIds(endpoint: string): Promise<string[]> {
  try {
    const res = await fetch(`${API}${endpoint}`);
    if (!res.ok) return [];
    const data: { id: string }[] = await res.json();
    return data.map((e) => e.id.toLowerCase());
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    changeFrequency: "weekly",
    priority: p.priority,
  }));

  const dynamicResults = await Promise.all(
    DYNAMIC_ROUTES.map(async (route) => {
      const ids = await fetchIds(route.endpoint);
      return ids.map((id) => ({
        url: `${SITE_URL}${route.prefix}/${id}`,
        changeFrequency: "weekly" as const,
        priority: route.priority,
      }));
    })
  );

  return [...staticEntries, ...dynamicResults.flat()];
}
