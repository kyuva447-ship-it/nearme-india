import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.nearme-india.org';

  const coreRoutes = [
    '',
    '/search',
    '/claim',
    '/dashboard',
    '/escrow',
    '/login',
    '/pricing',
    '/leaderboard',
    '/edge',
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
    priority: route === '' ? 1.0 : ['/search', '/claim', '/dashboard', '/escrow', '/login'].includes(route) ? 0.9 : 0.8,
  }));

  const citiesAndPincodes = [
    'bengaluru',
    'madanapalle',
    'hyderabad',
    'mumbai',
    'delhi',
    'pune',
    'chennai',
    'kolkata',
    'jaipur',
    'indore',
    '560001',
    '517325',
    '110001',
    '400002',
    '500081',
    '600001',
  ];

  const categories = [
    'plumber',
    'electrician',
    'tailor',
    'diagnostic-labs',
    'ac-repair',
    'carpenter',
    'hospital-bill-audit',
    'wholesale-cement-tmt',
    'pharmacy-jan-aushadhi',
    'gold-bullion-making',
    'agri-drip-irrigation',
    'plumbing-electrical',
  ];

  const programmaticRoutes = citiesAndPincodes.flatMap((city) =>
    categories.map((category) => ({
      url: `${baseUrl}/services/${city}/${category}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }))
  );

  return [...coreRoutes, ...programmaticRoutes];
}

