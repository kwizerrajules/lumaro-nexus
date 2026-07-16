import type { MetadataRoute } from 'next';
import { HouseProjectModel } from '@/src/lib/models/houseProject.model';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://lumaronexus.com';

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
      changeFrequency: 'weekly',
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
    const { data } = await HouseProjectModel.getAll({ limit: 5000, offset: 0 });
    planRoutes = data
      .filter((p) => p.slug || p.id)
      .map((p) => ({
        url: `${base}/plans/${p.slug || p.id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      }));
  } catch (err) {
    console.error('sitemap: failed to load plans', err);
  }

  return [...staticRoutes, ...planRoutes];
}
