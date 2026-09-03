import { eq, and, or, ilike, gte, lte, desc, asc, ne, count, sql, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import {
  categoriesTable,
  productsTable,
  productVariantsTable,
  productImagesTable,
} from '@/db/schema';
import { ProductFilterInput } from '@/server/validators/product.schema';

export interface GetProductsResult {
  items: Array<any>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get all categories with their product count.
 */
export async function getCategories() {
  const categories = await db
    .select({
      id: categoriesTable.id,
      slug: categoriesTable.slug,
      name: categoriesTable.name,
      description: categoriesTable.description,
      icon_name: categoriesTable.icon_name,
      color_bg: categoriesTable.color_bg,
      created_at: categoriesTable.created_at,
      updated_at: categoriesTable.updated_at,
      productCount: count(productsTable.id),
    })
    .from(categoriesTable)
    .leftJoin(productsTable, eq(productsTable.category_id, categoriesTable.id))
    .groupBy(categoriesTable.id)
    .orderBy(asc(categoriesTable.name));

  return categories.map((cat) => ({
    ...cat,
    productCount: Number(cat.productCount) || 0,
  }));
}

/**
 * Get filtered, sorted, and paginated products with relational joins.
 */
export async function getProducts(filters: Partial<ProductFilterInput> = {}): Promise<GetProductsResult> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const offset = (page - 1) * limit;

  let categoryId: string | undefined = undefined;

  // Resolve category if slug or id provided
  if (filters.kategori && filters.kategori !== 'semua') {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      filters.kategori
    );
    if (isUuid) {
      categoryId = filters.kategori;
    } else {
      const foundCategory = await db.query.categoriesTable.findFirst({
        where: eq(categoriesTable.slug, filters.kategori),
      });

      if (!foundCategory) {
        return {
          items: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }
      categoryId = foundCategory.id;
    }
  }

  const conditions: SQL[] = [];

  if (categoryId) {
    conditions.push(eq(productsTable.category_id, categoryId));
  }

  if (filters.q && filters.q.trim()) {
    const queryTerm = `%${filters.q.trim()}%`;
    conditions.push(
      or(
        ilike(productsTable.name, queryTerm),
        ilike(productsTable.description, queryTerm),
        ilike(productsTable.material, queryTerm)
      )!
    );
  }

  if (filters.minPrice !== undefined) {
    conditions.push(gte(productsTable.price, filters.minPrice));
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(lte(productsTable.price, filters.maxPrice));
  }

  if (filters.minRating !== undefined) {
    conditions.push(gte(sql`${productsTable.rating}::numeric`, filters.minRating.toString()));
  }

  if (filters.isPopular !== undefined) {
    conditions.push(eq(productsTable.is_popular, filters.isPopular));
  }

  if (filters.isNewArrival !== undefined) {
    conditions.push(eq(productsTable.is_new_arrival, filters.isNewArrival));
  }

  if (filters.isRecommended !== undefined) {
    conditions.push(eq(productsTable.is_recommended, filters.isRecommended));
  }

  if (filters.isPromo !== undefined) {
    conditions.push(eq(productsTable.is_promo, filters.isPromo));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Order By condition
  let orderByClause: SQL[];
  switch (filters.sort) {
    case 'terpopuler':
      orderByClause = [desc(productsTable.sold_count)];
      break;
    case 'terbaru':
      orderByClause = [desc(productsTable.created_at)];
      break;
    case 'harga-asc':
      orderByClause = [asc(productsTable.price)];
      break;
    case 'harga-desc':
      orderByClause = [desc(productsTable.price)];
      break;
    case 'rating':
      orderByClause = [desc(productsTable.rating), desc(productsTable.review_count)];
      break;
    case 'rekomendasi':
    default:
      orderByClause = [desc(productsTable.is_recommended), desc(productsTable.sold_count)];
      break;
  }

  // Count total matching records
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(productsTable)
    .where(whereClause);

  const total = Number(totalCount) || 0;
  const totalPages = Math.ceil(total / limit);

  // Query products with relational joins
  const items = await db.query.productsTable.findMany({
    where: whereClause,
    orderBy: orderByClause,
    limit,
    offset,
    with: {
      category: true,
      variants: true,
      images: {
        orderBy: (images, { asc }) => [asc(images.sort_order)],
      },
    },
  });

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Get product details by slug, including category, variants, and images.
 */
export async function getProductBySlug(slug: string) {
  const product = await db.query.productsTable.findFirst({
    where: eq(productsTable.slug, slug),
    with: {
      category: true,
      variants: true,
      images: {
        orderBy: (images, { asc }) => [asc(images.sort_order)],
      },
    },
  });

  return product || null;
}

/**
 * Get related products in the same category, excluding the current product.
 */
export async function getRelatedProducts(
  kategoriId: string,
  excludeProductId?: string,
  limit = 4
) {
  let catId = kategoriId;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(kategoriId);
  if (!isUuid) {
    const cat = await db.query.categoriesTable.findFirst({
      where: eq(categoriesTable.slug, kategoriId),
    });
    if (cat) {
      catId = cat.id;
    }
  }

  const conditions: SQL[] = [eq(productsTable.category_id, catId)];

  if (excludeProductId) {
    const isExcludeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      excludeProductId
    );
    if (isExcludeUuid) {
      conditions.push(ne(productsTable.id, excludeProductId));
    } else {
      conditions.push(ne(productsTable.slug, excludeProductId));
    }
  }

  const items = await db.query.productsTable.findMany({
    where: and(...conditions),
    orderBy: [desc(productsTable.sold_count), desc(productsTable.is_recommended)],
    limit,
    with: {
      category: true,
      variants: true,
      images: {
        orderBy: (images, { asc }) => [asc(images.sort_order)],
      },
    },
  });

  return items;
}

export const productService = {
  getCategories,
  getProducts,
  getProductBySlug,
  getRelatedProducts,
};
