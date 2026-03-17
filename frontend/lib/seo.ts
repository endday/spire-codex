export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://spire-codex.com";
export const SITE_NAME = "Spire Codex";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export function stripTags(text: string): string {
  return text
    .replace(/\[\/?\w+(?:[=:][^\]]+)?\]/g, "")
    .replace(/\{[^}]+\}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
