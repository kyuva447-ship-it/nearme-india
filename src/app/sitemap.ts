import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.nearme-india.org';

  const coreRoutes = [
    '',
    '/search',
    '/pricing',
    '/claim',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/refund-policy',
    '/shipping-policy',
    '/add-shop',
    '/account',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const citiesAndPincodes = [
    'bengaluru',
    'hyderabad',
    'mumbai',
    'delhi',
    'pune',
    'chennai',
    'kolkata',
    'jaipur',
    'indore',
    '560001',
    '110001',
    '400002',
    '500081',
    '600001',
  ];

  const categories = [
    'hospital-bill-audit',
    'wholesale-cement-tmt',
    'pharmacy-jan-aushadhi',
    'gold-bullion-making',
    'agri-drip-irrigation',
    'diagnostic-labs',
    'plumbing-electrical',
  ];

  const programmaticRoutes = citiesAndPincodes.flatMap((city) =>
    categories.map((category) => ({
      url: `${baseUrl}/services/${city}/${category}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );

  return [...coreRoutes, ...programmaticRoutes];
}
