import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.nearme-india.org';

  const highIntentRoutes = [
    '/in/560001/medical',
    '/in/560001/ac-repair',
    '/in/500001/hospital',
    '/in/400001/loans'
  ];

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
