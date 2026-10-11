import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.nearme-india.org';

  const routes = [
    '',
    '/leaderboard',
    '/escrow',
    '/edge',
    '/pricing',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/refund-policy',
    '/shipping-policy',
    '/login'
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
