import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.nearme-india.org';

  // Base routes
  const routes = [
    '',
    '/owner',
    '/search',
    '/account',
    '/dashboard'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Programmatic SEO Routes (Top All India Pincodes * Categories)
  const pincodes = ['560001', '560034', '560095', '560100', '560103'];
  const categories = ['medical', 'auto-repair', 'electronics', 'fashion', 'real-estate'];

  const programmaticRoutes = pincodes.flatMap(pincode =>
    categories.map(category => ({
      url: `${baseUrl}/services/${pincode}/${category}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  );

  return [...routes, ...programmaticRoutes];
}
