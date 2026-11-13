import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/services/', '/search', '/pricing', '/about', '/contact', '/llms.txt', '/sitemap.xml'],
      disallow: ['/api/', '/dashboard/', '/owner/'],
    },
    sitemap: 'https://www.nearme-india.org/sitemap.xml',
  };
}