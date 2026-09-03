'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  ShoppingBag,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Product, ProductVariant } from '@/types/product';
import { formatRupiah } from '@/lib/format';
import { ProductCard } from '@/components/product/ProductCard';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const router = useRouter();

  // Selected state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.varian && product.varian.length > 0 ? product.varian[0] : undefined
  );
  const [selectedImage, setSelectedImage] = useState<string>(product.gambar);
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlist, setIsWishlist] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [isBuyingNow, setIsBuyingNow] = useState<boolean>(false);

  // Available unique colors and sizes from variants
  const availableColors = Array.from(
    new Set((product.varian?.map((v) => v.warna) || []).filter(Boolean))
  );
  const availableSizes = Array.from(
    new Set((product.varian?.map((v) => v.ukuran) || []).filter(Boolean))
  );

  const [selectedColor, setSelectedColor] = useState<string>(
    product.varian && product.varian.length > 0 ? product.varian[0].warna : ''
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.varian && product.varian.length > 0 ? product.varian[0].ukuran : ''
  );

  const handleColorChange = (warna: string) => {
    setSelectedColor(warna);
    const matched =
      product.varian?.find((v) => v.warna === warna && v.ukuran === selectedSize) ||
      product.varian?.find((v) => v.warna === warna);
    if (matched) {
      setSelectedVariant(matched);
      if (matched.ukuran) setSelectedSize(matched.ukuran);
    }
  };

  const handleSizeChange = (ukuran: string) => {
    setSelectedSize(ukuran);
    const matched =
      product.varian?.find((v) => v.ukuran === ukuran && v.warna === selectedColor) ||
      product.varian?.find((v) => v.ukuran === ukuran);
    if (matched) {
      setSelectedVariant(matched);
      if (matched.warna) setSelectedColor(matched.warna);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAddToCart = async () => {
    if (isAddingToCart || isBuyingNow) return;
    setIsAddingToCart(true);

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant?.id || undefined,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data?.error || 'Gagal menambahkan produk ke keranjang', 'error');
        return;
      }

      showToast(`🎉 Berhasil menambahkan ${quantity}x "${product.nama}" ke keranjang belanja!`, 'success');
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      showToast('Terjadi kesalahan jaringan saat menambahkan ke keranjang', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (isAddingToCart || isBuyingNow) return;
    setIsBuyingNow(true);

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant?.id || undefined,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data?.error || 'Gagal menambahkan produk ke keranjang', 'error');
        setIsBuyingNow(false);
        return;
      }

      router.push('/checkout');
    } catch (err: any) {
      console.error('Error in buy now:', err);
      showToast('Terjadi kesalahan jaringan', 'error');
      setIsBuyingNow(false);
    }
  };

  const galleryImages =
    product.galeri && product.galeri.length > 0
      ? Array.from(new Set([product.gambar, ...product.galeri.map((g) => g.url)])).filter(Boolean)
      : [
          product.gambar,
          'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&auto=format&fit=crop&q=60',
        ].filter(Boolean);

  const currentPrice = product.harga + (selectedVariant?.hargaTambahan || 0);
  const currentStock = selectedVariant ? selectedVariant.stok : product.stok;

  return (
    <div className="py-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border animate-in fade-in slide-in-from-bottom-5 ${
            toastType === 'error'
              ? 'bg-rose-900 border-rose-700'
              : 'bg-slate-900 border-slate-700'
          }`}
        >
          {toastType === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          {toastType !== 'error' && (
            <Link
              href="/keranjang"
              className="text-xs font-bold text-rose-400 hover:text-rose-300 underline ml-2 whitespace-nowrap"
            >
              Lihat Keranjang
            </Link>
          )}
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 overflow-x-auto pb-1 scrollbar-none">
        <Link href="/" className="hover:text-rose-600 transition-colors">Beranda</Link>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <Link href="/katalog" className="hover:text-rose-600 transition-colors">Katalog</Link>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <Link href={`/kategori/${product.kategori}`} className="hover:text-rose-600 transition-colors">
          {product.kategoriLabel}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="font-semibold text-slate-800 truncate max-w-xs">{product.nama}</span>
      </nav>

      {/* Product Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left Column: Image Gallery (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt={product.nama}
              className="w-full h-full object-cover"
            />
            {product.diskonPersen && (
              <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                DISKON {product.diskonPersen}%
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsWishlist(!isWishlist)}
              className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md shadow-md transition-all ${
                isWishlist ? 'bg-rose-500 text-white' : 'bg-white/80 hover:bg-white text-slate-600'
              }`}
              title="Tambah ke Favorit"
            >
              <Heart className={`w-5 h-5 ${isWishlist ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {galleryImages.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(imgUrl)}
                className={`relative w-18 h-18 rounded-2xl overflow-hidden bg-slate-100 border-2 shrink-0 transition-all ${
                  selectedImage === imgUrl ? 'border-rose-500 scale-105 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Guarantee Badges */}
          <div className="p-4 bg-rose-50/40 rounded-2xl border border-rose-100 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Produk Berkualitas & Aman untuk Anak</span>
            </div>
            <div className="flex items-center gap-2 text-sky-600 font-medium">
              <Truck className="w-4 h-4" />
              <span>Pengiriman Cepat & Asuransi Otomatis Se-Indonesia</span>
            </div>
            <div className="flex items-center gap-2 text-amber-600 font-medium">
              <RotateCcw className="w-4 h-4" />
              <span>Garansi 7 Hari Retur Jika Barang Cacat / Rusak</span>
            </div>
          </div>
        </div>

        {/* Center/Right Column: Product Details & Purchase Form (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs mb-6">
            {/* Header info */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                {product.kategoriLabel}
              </span>
              {product.tag && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                  {product.tag}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 leading-tight mb-3">
              {product.nama}
            </h1>

            {/* Rating & Sold count */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500 pb-4 border-b border-slate-100 mb-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-slate-800 font-black">{product.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({product.reviewCount} Penilaian Pembeli)</span>
              </div>
              <span>•</span>
              <span className="font-semibold text-slate-700">Terjual {product.terjual}+ Produk</span>
            </div>

            {/* Price Box */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50/70 via-pink-50/50 to-amber-50/40 rounded-2xl border border-rose-100 mb-6">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-rose-600">
                  {formatRupiah(currentPrice)}
                </span>
                {product.hargaCoret && (
                  <span className="text-sm sm:text-base text-slate-400 line-through">
                    {formatRupiah(product.hargaCoret)}
                  </span>
                )}
                {product.diskonPersen && (
                  <span className="text-xs font-bold text-rose-600 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                    Hemat {product.diskonPersen}%
                  </span>
                )}
              </div>
            </div>

            {/* Spesifikasi Ringkas */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 mb-6">
              <div>
                <span className="text-slate-400 block mb-0.5">Bahan / Material:</span>
                <strong className="text-slate-800">{product.bahan || 'Bahan Premium Aman Anak'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Rekomendasi Usia:</span>
                <strong className="text-slate-800">{product.usiaCocok || 'Semua Usia Anak'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Kondisi Barang:</span>
                <strong className="text-slate-800">100% Baru & Original</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Sisa Ketersediaan:</span>
                <strong className={currentStock > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {currentStock > 0 ? `Tersedia (${currentStock} pcs)` : 'Stok Habis'}
                </strong>
              </div>
            </div>

            {/* Pilihan Varian Warna */}
            {availableColors.length > 0 && (
              <div className="mb-5">
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Pilih Warna: <span className="text-rose-600 font-semibold">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((warna) => (
                    <button
                      key={warna}
                      type="button"
                      onClick={() => handleColorChange(warna)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        selectedColor === warna
                          ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      {warna}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pilihan Varian Ukuran */}
            {availableSizes.length > 0 && (
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Pilih Ukuran / Tipe: <span className="text-rose-600 font-semibold">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((ukuran) => (
                    <button
                      key={ukuran}
                      type="button"
                      onClick={() => handleSizeChange(ukuran)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        selectedSize === ukuran
                          ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      {ukuran}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Jumlah & Beli Controls */}
            <div className="pt-5 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700">Jumlah:</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-slate-800 min-w-10 text-center bg-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock}
                    className="p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-400">
                  Total: <strong className="text-slate-800 font-bold">{formatRupiah(currentPrice * quantity)}</strong>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || isBuyingNow || currentStock <= 0}
                  className="py-3.5 px-5 rounded-2xl bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed text-rose-600 font-bold text-xs sm:text-sm border border-rose-200 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menambahkan...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Tambah ke Keranjang</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isAddingToCart || isBuyingNow || currentStock <= 0}
                  className="py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  {isBuyingNow ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Beli Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Deskripsi Produk */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100 mb-4">
              Deskripsi & Spesifikasi Lengkap
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
              <p>{product.deskripsi}</p>
              <p>
                Produk ini dirancang khusus untuk kenyamanan dan keamanan si kecil, diproduksi menggunakan material ramah anak bersertifikat standar nasional (SNI). Cocok dijadikan sebagai perlengkapan harian maupun hadiah terbaik untuk anak tersayang.
              </p>
              <div className="pt-2">
                <h3 className="font-bold text-slate-800 mb-1">Keunggulan Utama:</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Material pilihan berkualitas tinggi, lembut dan tidak menimbulkan iritasi kulit anak.</li>
                  <li>Desain ergonomis, praktis digunakan oleh orang tua modern.</li>
                  <li>Telah teruji keamanannya (Non-Toxic & BPA-Free).</li>
                  <li>Mudah dibersihkan dan awet digunakan untuk pemakaian jangka panjang.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-rose-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Produk Terkait Lainnya</h2>
              <p className="text-xs text-slate-500">Pilihan produk sejenis yang sering dibeli bersamaan</p>
            </div>
            <Link
              href={`/kategori/${product.kategori}`}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>Lihat Kategori {product.kategoriLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
