/**
 * Shape consumed by HouseProjectCard and the catalog/home grids, plus a mapper
 * that accepts either a raw Mongo document (server) or an API item (client) so
 * the listing can be server-rendered for crawlers and still hydrate normally.
 */
export type PlanCardData = {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  area: number;
  description: string;
  location: string;
  style: string;
  type: string;
  category: string;
  rooms: number;
  status: string;
};

const HIDDEN_STATUSES = ['draft', 'hidden', 'archived', 'unpublished'];

export function toPlanCard(p: any): PlanCardData {
  return {
    id: String(p?.id ?? p?._id ?? ''),
    slug: p?.slug ?? '',
    title: p?.title ?? '',
    price: Number(p?.price) || 0,
    image: p?.thumbnail ?? p?.image ?? '',
    bedrooms: p?.bedrooms ?? 0,
    bathrooms: p?.bathrooms ?? 0,
    floors: p?.floors ?? 0,
    area: p?.areaSqFt ?? p?.area ?? 0,
    description: p?.description ?? '',
    location: p?.location ?? '',
    style: p?.style ?? '',
    type: p?.type ?? '',
    category: p?.category ?? '',
    rooms: p?.rooms ?? 0,
    status: p?.status ?? '',
  };
}

/** Drop obvious drafts/hidden plans and anything without a usable link key. */
export function toVisiblePlanCards(items: any[]): PlanCardData[] {
  return (items || [])
    .map(toPlanCard)
    .filter(
      (p) =>
        (p.slug || p.id) &&
        !HIDDEN_STATUSES.includes(p.status.toLowerCase()),
    );
}
