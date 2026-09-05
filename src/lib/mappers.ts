import { Product, CategoryItem, ProductVariant, ProductImage } from '@/types/product';

/**
 * Maps a raw database product record (or API response item) to the standard frontend Product type.
 */
export function mapDbProductToProduct(item: any): Product {
  if (!item) return {} as Product;

  const categorySlug = (item.category?.slug || item.kategori || 'perlengkapan').toLowerCase();
  const validCategory: 'perlengkapan' | 'pakaian' | 'mainan' =
    categorySlug === 'pakaian' ? 'pakaian' : categorySlug === 'mainan' ? 'mainan' : 'perlengkapan';

  const categoryName =
    item.category?.name ||
    item.kategoriLabel ||
    (validCategory === 'perlengkapan'
      ? 'Perlengkapan Bayi & Anak'
      : validCategory === 'pakaian'
      ? 'Pakaian & Fashion Anak'
      : 'Mainan & Edukasi');

  const galeri: ProductImage[] = Array.isArray(item.images)
    ? item.images.map((img: any) => ({
        id: String(img.id),
        url: img.url,
        altText: img.alt_text || img.altText || item.name || item.nama || '',
      }))
    : Array.isArray(item.galeri)
    ? item.galeri
    : [];

  const varian: ProductVariant[] = Array.isArray(item.variants)
    ? item.variants.map((v: any) => ({
        id: String(v.id),
        warna: v.color || v.warna || '',
        ukuran: v.size || v.ukuran || '',
        stok: typeof v.stock === 'number' ? v.stock : typeof v.stok === 'number' ? v.stok : 0,
        hargaTambahan: v.additional_price ?? v.hargaTambahan ?? 0,
      }))
    : Array.isArray(item.varian)
    ? item.varian
    : [];

  return {
    id: String(item.id),
    nama: item.name || item.nama || '',
    slug: item.slug || '',
    kategori: validCategory,
    kategoriLabel: categoryName,
    deskripsi: item.description || item.deskripsi || '',
    harga:
      typeof item.price === 'number'
        ? item.price
        : typeof item.harga === 'number'
        ? item.harga
        : Number(item.price || item.harga || 0),
    hargaCoret: item.original_price ?? item.hargaCoret ?? undefined,
    diskonPersen: item.discount_percent ?? item.diskonPersen ?? undefined,
    terjual:
      typeof item.sold_count === 'number'
        ? item.sold_count
        : typeof item.terjual === 'number'
        ? item.terjual
        : 0,
    rating:
      typeof item.rating === 'number'
        ? item.rating
        : parseFloat(item.rating) || 5.0,
    reviewCount:
      typeof item.review_count === 'number'
        ? item.review_count
        : typeof item.reviewCount === 'number'
        ? item.reviewCount
        : 0,
    stok:
      typeof item.stock === 'number'
        ? item.stock
        : typeof item.stok === 'number'
        ? item.stok
        : 0,
    bahan: item.material || item.bahan || undefined,
    usiaCocok: item.suitable_age || item.usiaCocok || undefined,
    gambar: item.image_url || item.gambar || '',
    galeri,
    varian,
    isPopuler: item.is_popular !== undefined ? Boolean(item.is_popular) : Boolean(item.isPopuler),
    isTerbaru: item.is_new_arrival !== undefined ? Boolean(item.is_new_arrival) : Boolean(item.isTerbaru),
    isRekomendasi:
      item.is_recommended !== undefined
        ? Boolean(item.is_recommended)
        : Boolean(item.isRekomendasi),
    isPromo: item.is_promo !== undefined ? Boolean(item.is_promo) : Boolean(item.isPromo),
    isFlashSale: Boolean(item.is_flash_sale ?? item.isFlashSale ?? false),
    hargaFlashSale:
      item.flash_sale_price != null
        ? Number(item.flash_sale_price)
        : item.hargaFlashSale != null
        ? Number(item.hargaFlashSale)
        : undefined,
    tag: item.tag || undefined,
    weightGram: item.weight_gram ?? item.weightGram ?? 500,
    dimensionLength: item.dimension_length ?? item.dimensionLength ?? 10,
    dimensionWidth: item.dimension_width ?? item.dimensionWidth ?? 10,
    dimensionHeight: item.dimension_height ?? item.dimensionHeight ?? 10,
  };
}

/**
 * Maps a raw database category record (or API response item) to the frontend CategoryItem type.
 */
export function mapDbCategoryToCategoryItem(cat: any): CategoryItem {
  return {
    id: String(cat.id),
    slug: cat.slug,
    nama: cat.name || cat.nama || '',
    deskripsi: cat.description || cat.deskripsi || '',
    iconName: cat.icon_name || cat.iconName || 'Baby',
    warnaBg: cat.color_bg || cat.warnaBg || 'bg-amber-100 text-amber-700',
    jumlahProduk:
      typeof cat.productCount === 'number'
        ? cat.productCount
        : typeof cat.jumlahProduk === 'number'
        ? cat.jumlahProduk
        : Number(cat.productCount || cat.jumlahProduk || 0),
  };
}
