/**
 * Shared SEO constants and JSON-LD (schema.org) builders.
 *
 * One source of truth for the canonical site URL so metadata, the sitemap
 * and robots.txt never drift apart.
 */
import type { HouseProject } from '@/src/schemas/house.projects.schema';

/**
 * Canonical origin, no trailing slash. This MUST be the host Vercel actually
 * serves — the apex (lumaronexus.com) 301-redirects here, so pointing canonical
 * / sitemap / hreflang at the apex would send crawlers through a redirect.
 * Override per environment with NEXT_PUBLIC_SITE_URL.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lumaronexus.com'
).replace(/\/+$/, '');

export const SITE_NAME = 'Lumaro Nexus';

/** Primary market. Used for geo meta tags, hreflang and structured data. */
export const SITE_COUNTRY = 'RW';
export const SITE_LOCALE = 'en-RW';
export const SITE_GEO = { lat: -1.9440727, lng: 30.0618851, city: 'Kigali' };

export const SITE_DESCRIPTION =
  'Lumaro Nexus is a Kigali-based house-plan platform: browse ready designs, ' +
  'request custom plans, and order construction documents prepared for Rwanda ' +
  'District One Stop Centre and BPMIS requirements.';

/** Absolute URL helper. */
export const abs = (path = '/') =>
  `${SITE_URL}/${String(path).replace(/^\/+/, '')}`;

/** Organisation node — emitted once, in the root layout. */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: abs('image/logo_images/Unex_log.png'),
    description: SITE_DESCRIPTION,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE_GEO.city,
      addressCountry: SITE_COUNTRY,
    },
    areaServed: { '@type': 'Country', name: 'Rwanda' },
    knowsLanguage: ['en', 'rw'],
  };
}

/** WebSite node — enables the sitelinks search box in Google. */
export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/catalog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Product node for a single house plan. */
export function planProductJsonLd(plan: HouseProject) {
  const canonicalSlug = plan.slug || plan.id;
  const url = abs(`plans/${canonicalSlug}`);
  const images = [plan.thumbnail, ...(plan.additionalImages || [])].filter(
    Boolean,
  );

  const product: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: plan.title,
    description: (plan.description || '').replace(/\s+/g, ' ').trim().slice(0, 500),
    url,
    sku: plan.id,
    category: plan.category || 'House plan',
    brand: { '@type': 'Brand', name: SITE_NAME },
  };

  if (images.length) product.image = images;

  if (typeof plan.price === 'number' && plan.price > 0) {
    product.offers = {
      '@type': 'Offer',
      price: plan.price,
      priceCurrency: 'RWF',
      availability: 'https://schema.org/InStock',
      url,
    };
  }

  return product;
}

/** Breadcrumb trail for a single house plan. */
export function planBreadcrumbJsonLd(plan: HouseProject) {
  const canonicalSlug = plan.slug || plan.id;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Catalog', item: abs('catalog') },
      {
        '@type': 'ListItem',
        position: 3,
        name: plan.title,
        item: abs(`plans/${canonicalSlug}`),
      },
    ],
  };
}

/** Serialise one or more JSON-LD nodes for a <script type="application/ld+json"> tag. */
export function jsonLdScript(data: unknown) {
  return {
    __html: JSON.stringify(data).replace(/</g, '\\u003c'),
  };
}
