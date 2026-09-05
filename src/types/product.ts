export interface ProductVariant {
  id: string;
  warna: string;
  ukuran: string;
  stok: number;
  hargaTambahan?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
}

export interface Product {
  id: string;
  nama: string;
  slug: string;
  kategori: 'perlengkapan' | 'pakaian' | 'mainan';
  kategoriLabel: string;
  deskripsi: string;
  harga: number;
  hargaCoret?: number;
  diskonPersen?: number;
  terjual: number;
  rating: number;
  reviewCount: number;
  stok: number;
  bahan?: string;
  usiaCocok?: string;
  gambar: string;
  galeri?: ProductImage[];
  varian?: ProductVariant[];
  isPopuler?: boolean;
  isTerbaru?: boolean;
  isRekomendasi?: boolean;
  isPromo?: boolean;
  isFlashSale?: boolean;
  hargaFlashSale?: number;
  tag?: string;
  weightGram?: number;
  dimensionLength?: number;
  dimensionWidth?: number;
  dimensionHeight?: number;
}

export interface CategoryItem {
  id: string;
  slug: string;
  nama: string;
  deskripsi: string;
  iconName: string;
  warnaBg: string;
  jumlahProduk: number;
}
