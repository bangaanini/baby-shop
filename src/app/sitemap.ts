import { MetadataRoute } from 'next';
import { db } from '@/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/katalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    // Categories
    const categories = await db.query.categoriesTable.findMany();
    for (const cat of categories) {
      routes.push({
        url: `${baseUrl}/kategori/${cat.slug}`,
        lastModified: cat.updated_at || new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    // Products
    const products = await db.query.productsTable.findMany();
    for (const prod of products) {
      routes.push({
        url: `${baseUrl}/produk/${prod.slug}`,
        lastModified: prod.updated_at || new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
  }

  return routes;
}
