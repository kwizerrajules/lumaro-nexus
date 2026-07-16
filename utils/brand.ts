/** Canonical brand contact — keep Footer, Newsletter, ModalForm, and plan pages in sync. */
export const WHATSAPP_NUMBER = "250791756343";
export const WHATSAPP_DISPLAY = "+250 791 756 343";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function whatsappPlanUrl(opts: {
  title: string;
  id: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  price?: number;
  quantity?: number;
}): string {
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
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(opts.price * (opts.quantity ?? 1));
    lines.push(`  - Estimated Price: ${formatted}`);
  }
  return `${WHATSAPP_URL}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function formatPlanPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
}

/** Public plan path — prefer SEO slug, fall back to id during transition */
export function planHref(project: { slug?: string | null; id?: string }): string {
  const key = (project.slug && String(project.slug).trim()) || project.id;
  return key ? `/plans/${key}` : "/catalog";
}

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
    house.floors != null ? String(house.floors) : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!textQ) return haystack.includes(q);
  return textQ.split(/\s+/).every((term) => haystack.includes(term));
}
