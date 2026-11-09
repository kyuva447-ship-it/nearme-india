import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.nearme-india.org';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    // The rest of the programmatic routes would be generated here dynamically
    // querying the `pincode_clusters` and categories from Supabase.
  ];
}