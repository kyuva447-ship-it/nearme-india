import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.nearme-india.org';

  const coreRoutes = [
    '',
    '/search',
    '/pricing',
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

  const pincodes = [
    '560001',
    '110001',
    '400002',
    '500081',
    '600001',
    '411001',
    '700001',
    '517325',
    '302001',
    '452001',
    '781001',
    '800001',
  ];
  const categories = [
    'hospital-bill-audit',
    'wholesale-cement-tmt',
    'pharmacy-jan-aushadhi',
    'gold-bullion-making',
    'agri-drip-irrigation',
  ];

  const programmaticRoutes = pincodes.flatMap((pincode) =>
    categories.map((category) => ({
      url: `${baseUrl}/services/${pincode}/${category}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );

  return [...coreRoutes, ...programmaticRoutes];
}
