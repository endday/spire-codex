import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Canonicalise news article URLs.
 *
 *   - Old shape:  /news/{encoded canonical Steam URL}     (PR #96)
 *   - Old shape:  /{lang}/news/{encoded canonical URL}
 *   - New shape:  /news/{gid}                             (current canonical)
 *   - New shape:  /{lang}/news/{gid}
 *
 * The article catchall route ALSO handles the old shape via a runtime
 * `permanentRedirect`, but Next.js dev with Turbopack swallows in-route
 * redirects into an internal re-render so curl / crawlers see a 200 at
 * the legacy URL. Doing it at the middleware layer guarantees a real
 * 308 hits the wire in both dev and prod, and lets the page route stay
 * a simple "render the article" function.
 *
 * The middleware only fires when the slug looks like an encoded Steam
 * URL — bare-gid requests skip it entirely, so the cost on the hot path
 * is one regex test per /news/* request. */
const NEWS_PATH = /^(\/[a-z]{3})?\/news\/(.+)$/;
// Matches both Steam URL flavours that the API hands back: the canonical
// `store.steampowered.com/news/app/...` form and the older
// `steamstore-a.akamaihd.net/news/externalpost/...` wrapper press
// articles ship with. Both URL-encoded (%3A, %2F) since they're sitting
// inside a URL slug.
const ENCODED_STEAM =
  /^https?(?:%3A|:)\/?(?:%2F|\/){2}(?:store\.steampowered\.com|steamstore-a\.akamaihd\.net)/i;

function gidFromEncoded(seg: string): string | null {
  let decoded = seg;
  try {
    decoded = decodeURIComponent(seg);
  } catch {
    /* leave raw */
  }
  // Pull the last digit-only segment — Steam puts the gid at the end of
  // every URL variant (`view/{gid}`, `externalpost/{feed}/{gid}`).
  const parts = decoded.split(/[/?#]/).filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    if (/^\d{6,}$/.test(parts[i])) return parts[i];
  }
  return null;
}

export function middleware(req: NextRequest) {
  const m = req.nextUrl.pathname.match(NEWS_PATH);
  if (!m) return NextResponse.next();
  const langPrefix = m[1] ?? "";
  const slug = m[2];
  if (!ENCODED_STEAM.test(slug)) return NextResponse.next();
  const gid = gidFromEncoded(slug);
  if (!gid) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = `${langPrefix}/news/${gid}`;
  // 308 (permanent) so search engines transfer the existing index entries
  // for the old encoded URLs over to the bare-gid canonical.
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/news/:slug*", "/:lang/news/:slug*"],
};
