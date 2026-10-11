import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/merchant/dashboard'],
    },
    sitemap: 'https://www.nearme-india.org/sitemap.xml',
  };
}
