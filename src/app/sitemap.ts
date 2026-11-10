import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.nearme-india.org';

  // Cross-multiplying key hubs and categories for automated Google indexing
  const hubs = ['560001', '600001', '500001', '400001', '110001', '517325'];
  const categories = ['mri-scan', 'ac-repair', 'dental', 'tailoring', 'hostels', 'bus-seats', 'salons', 'wholesale'];

  const highIntentRoutes: string[] = [];

  hubs.forEach(hub => {
      categories.forEach(cat => {
          highIntentRoutes.push(`/in/${hub}/${cat}`);
      });
  });

  const sitemapRoutes = highIntentRoutes.map(route => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    ...sitemapRoutes
  ];
}
