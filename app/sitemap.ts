import type { MetadataRoute } from 'next';
import { HouseProjectModel } from '@/src/lib/models/houseProject.model';

/**
 * Refresh sitemap at most every hour so new house plans appear in
 * Google without a full redeploy.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://lumaronexus.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${base}/custom-plan`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/tos`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  let planRoutes: MetadataRoute.Sitemap = [];
  try {
    // Pull all catalog plans from MongoDB — new admin uploads show up after revalidate
    const { data } = await HouseProjectModel.getAll({ limit: 5000, offset: 0 });

    planRoutes = data
      .filter((p) => {
        if (!p.slug && !p.id) return false;
        // Skip obvious drafts / hidden if status is set that way
        const status = (p.status || '').toLowerCase();
        if (status && ['draft', 'hidden', 'archived', 'unpublished'].includes(status)) {
          return false;
        }
        return true;
      })
      .map((p) => ({
        url: `${base}/plans/${encodeURIComponent(String(p.slug || p.id))}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      }));
  } catch (err) {
    console.error('sitemap: failed to load plans', err);
  }

  return [...staticRoutes, ...planRoutes];
}
