import { randomBytes } from "crypto";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/** kebab-case stem from a plan title, capped for readable URLs */
export function slugifyTitle(title: string): string {
  const stem = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 60)
    .replace(/-+$/g, "");

  return stem || "plan";
}

/** Short random suffix, e.g. a7k2x9 */
export function shortSlugSuffix(length = 6): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

/**
 * SEO slug: `{title-kebab}-{suffix}`
 * Example: modern-villa-a7k2x9
 */
export function buildPlanSlug(title: string): string {
  return `${slugifyTitle(title)}-${shortSlugSuffix(6)}`;
}
