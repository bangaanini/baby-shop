import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/katalog', '/kategori/', '/produk/'],
        disallow: ['/admin/', '/api/', '/user/', '/auth/unauthorized'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/katalog', '/kategori/', '/produk/'],
        disallow: ['/admin/', '/api/', '/user/', '/auth/unauthorized'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
