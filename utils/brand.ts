import { DEFAULT_SITE_SETTINGS } from '@/src/schemas/siteSettings.schema';
import { getCachedSiteSettings } from '@/utils/siteSettingsCache';

/** Fallback defaults — live values come from Site Settings (MongoDB). */
export const WHATSAPP_NUMBER = DEFAULT_SITE_SETTINGS.whatsappNumber;
export const WHATSAPP_DISPLAY = DEFAULT_SITE_SETTINGS.phoneDisplay;
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

import { formatCurrency, type EacCurrencyCode } from '@/utils/currency';

export function whatsappPlanUrl(opts: {
  title: string;
  id: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  price?: number;
  quantity?: number;
  currency?: EacCurrencyCode | string;
  convertedPriceText?: string;
}): string {
  const number =
    typeof window !== 'undefined'
      ? getCachedSiteSettings().whatsappNumber
      : WHATSAPP_NUMBER;
  const base = `https://wa.me/${number}`;

  const lines = [
    `Hello, I am interested in the house plan "${opts.title}" (ID: ${opts.id}).`,
    "",
    "Details:",
  ];
  if (opts.bedrooms != null) lines.push(`  - Bedrooms: ${opts.bedrooms}`);
  if (opts.bathrooms != null) lines.push(`  - Bathrooms: ${opts.bathrooms}`);
  if (opts.area != null) lines.push(`  - Area: ${opts.area} m²`);
  if (opts.quantity != null) lines.push(`  - Quantity: ${opts.quantity}`);
  if (opts.price != null) {
    const totalUsd = opts.price * (opts.quantity ?? 1);
    let priceLine = `  - Estimated Price: ${formatPlanPrice(totalUsd)}`;
    if (opts.convertedPriceText) {
      priceLine += ` (${opts.convertedPriceText})`;
    }
    lines.push(priceLine);
  }
  return `${base}?text=${encodeURIComponent(lines.join("\n"))}`;
}

/**
 * Format plan prices in USD ($) by default, or in a specified EAC currency.
 * Database prices are stored in USD.
 */
export function formatPlanPrice(
  price: number,
  currencyCode: EacCurrencyCode | string = 'USD'
): string {
  return formatCurrency(price, currencyCode);
}

/** Public plan path — prefer SEO slug, fall back to id during transition */
export function planHref(project: { slug?: string | null; id?: string }): string {
  const key = (project.slug && String(project.slug).trim()) || project.id;
  return key ? `/plans/${key}` : "/catalog";
}

/** Format floor count into architectural G+ notation (e.g. 1 -> 'G', 2 -> 'G+1', 3 -> 'G+2') */
export function formatFloor(floors?: number | string | null): string {
  if (floors === null || floors === undefined || floors === '') return 'G';
  if (typeof floors === 'string') {
    const trimmed = floors.trim();
    if (/^G(\+\d+)?$/i.test(trimmed)) return trimmed.toUpperCase();
  }
  const n = typeof floors === 'number' ? floors : parseInt(String(floors), 10);
  if (isNaN(n) || n <= 1) return 'G';
  return `G+${n - 1}`;
}

export const FLOOR_G_OPTIONS = [
  { value: 1, label: 'G (Ground Floor)' },
  { value: 2, label: 'G+1 (2 Levels)' },
  { value: 3, label: 'G+2 (3 Levels)' },
  { value: 4, label: 'G+3 (4 Levels)' },
  { value: 5, label: 'G+4 (5 Levels)' },
  { value: 6, label: 'G+5 (6 Levels)' },
  { value: 7, label: 'G+6 (7 Levels)' },
  { value: 8, label: 'G+7 (8 Levels)' },
  { value: 9, label: 'G+8 (9 Levels)' },
  { value: 10, label: 'G+9 (10 Levels)' },
  { value: 11, label: 'G+10 (11 Levels)' },
  { value: 12, label: 'G+11 (12 Levels)' },
];


/** Map API house project → search / card shape */
export function mapProjectForSearch(item: any) {
  return {
    id: item.id,
    slug: item.slug || "",
    name: item.title || item.name || "",
    title: item.title || item.name || "",
    price: Number(item.price) || 0,
    floors: item.floors ?? 0,
    bedrooms: item.bedrooms ?? 0,
    bathrooms: item.bathrooms ?? 0,
    type: item.type || item.category || "Residential",
    category: item.category || "",
    style: item.style || "",
    area: item.areaSqFt ?? item.area ?? 0,
    image: item.thumbnail || item.image || "",
    description: item.description || "",
  };
}

/**
 * Natural-ish client search: "4 bedroom", title, category, style, beds, baths.
 */
export function matchesHouseSearch(
  house: {
    name?: string;
    title?: string;
    type?: string;
    category?: string;
    style?: string;
    id?: string | number;
    bedrooms?: number;
    bathrooms?: number;
    floors?: number;
  },
  rawQuery: string
): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return false;

  const bedMatch = q.match(/(\d+)\s*(bed|bedroom|bedrooms|br)\b/);
  const bathMatch = q.match(/(\d+)\s*(bath|bathroom|bathrooms|ba)\b/);

  if (bedMatch) {
    const n = Number(bedMatch[1]);
    if (house.bedrooms !== n) return false;
  }
  if (bathMatch) {
    const n = Number(bathMatch[1]);
    if (house.bathrooms !== n) return false;
  }

  // Strip bed/bath phrases so remaining text still filters by name/category
  const textQ = q
    .replace(/\d+\s*(bed|bedroom|bedrooms|br)\b/g, "")
    .replace(/\d+\s*(bath|bathroom|bathrooms|ba)\b/g, "")
    .trim();

  if (!textQ && (bedMatch || bathMatch)) return true;

  const haystack = [
    house.name,
    house.title,
    house.type,
    house.category,
    house.style,
    String(house.id ?? ""),
    house.bedrooms != null ? String(house.bedrooms) : "",
    house.bathrooms != null ? String(house.bathrooms) : "",
    house.floors != null ? `${house.floors} ${formatFloor(house.floors)}` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!textQ) return haystack.includes(q);
  return textQ.split(/\s+/).every((term) => haystack.includes(term));
}
