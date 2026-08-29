import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * Served at /robots.txt. Single source of truth — the old static
 * public/robots.txt and next-sitemap were removed in favour of this.
 *
 * The suspension middleware matcher excludes *.txt / *.xml, so this and
 * the sitemap stay reachable even while the site is suspended.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/login', '/orders', '/my-custom-plans'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
