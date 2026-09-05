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
  Zap,
} from 'lucide-react';
import { Product, ProductVariant } from '@/types/product';
import { formatRupiah } from '@/lib/format';
import { ProductCard } from '@/components/product/ProductCard';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts?: Product[];
}

export function ProductDetailView({
  product,
  relatedProducts = [],
}: ProductDetailViewProps) {
  const router = useRouter();

  // Selected image for gallery
  const [selectedImage, setSelectedImage] = useState<string>(product.gambar);
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlist, setIsWishlist] = useState<boolean>(false);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [isBuyingNow, setIsBuyingNow] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Variant selections
  const hasVariants = Boolean(product.varian && product.varian.length > 0);

  // Extract unique available colors and sizes
  const availableColors = Array.from(
    new Set(product.varian?.map((v) => v.warna).filter(Boolean) as string[])
  );
  const availableSizes = Array.from(
    new Set(product.varian?.map((v) => v.ukuran).filter(Boolean) as string[])
  );

  // Find first variant with stock > 0 for sensible default, or fallback to first
  const initialVariant =
    product.varian?.find((v) => v.stok > 0) || product.varian?.[0] || null;

  const [selectedColor, setSelectedColor] = useState<string>(
    initialVariant?.warna || (availableColors[0] ?? '')
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    initialVariant?.ukuran || (availableSizes[0] ?? '')
  );

  // Derive current matched variant
  const selectedVariant: ProductVariant | undefined = product.varian?.find(
    (v) =>
      (!selectedColor || v.warna === selectedColor) &&
      (!selectedSize || v.ukuran === selectedSize)
  );

  // Flash Sale derivation & active price / stock calculation
  const isFlashSaleActive = Boolean(product.isFlashSale && product.hargaFlashSale);
  const basePrice = isFlashSaleActive ? product.hargaFlashSale! : product.harga;
  const currentPrice = basePrice + (selectedVariant?.hargaTambahan || 0);
  const strikethroughPrice = isFlashSaleActive ? product.harga : product.hargaCoret;
  const discountPercent = isFlashSaleActive
    ? Math.max(1, Math.round(((product.harga - product.hargaFlashSale!) / product.harga) * 100))
    : product.diskonPersen;

  const currentStock = hasVariants
    ? selectedVariant?.stok ?? 0
    : product.stok;

  const isOutOfStock = currentStock <= 0;

  // Build image gallery list: main image + gallery images
  const galleryImages = [
    product.gambar,
    ...(product.galeri?.map((g) => g.url) || []),
  ].filter(Boolean);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleAddToCart = async () => {
    if (isAddingToCart || isBuyingNow) return;

    if (hasVariants && (!selectedVariant || isOutOfStock)) {
      showToast(
        `Maaf, varian warna "${selectedColor}" ukuran "${selectedSize}" sedang habis`,
        'error'
      );
      return;
    }

    if (currentStock <= 0) {
      showToast('Maaf, stok produk saat ini sedang habis', 'error');
      return;
    }

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

      showToast(
        `🎉 Berhasil menambahkan ${quantity}x "${product.nama}" (${selectedColor ? `${selectedColor} - ` : ''}${selectedSize || 'Standard'}) ke keranjang belanja!`,
        'success'
      );
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      showToast('Terjadi kesalahan jaringan saat menambahkan ke keranjang', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (isAddingToCart || isBuyingNow) return;

    if (hasVariants && (!selectedVariant || isOutOfStock)) {
      showToast(
        `Maaf, varian warna "${selectedColor}" ukuran "${selectedSize}" sedang habis`,
        'error'
      );
      return;
    }

    if (currentStock <= 0) {
      showToast('Maaf, stok produk saat ini sedang habis', 'error');
      return;
    }

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

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }

      router.push('/checkout');
    } catch (err: any) {
      console.error('Error in buy now:', err);
      showToast('Terjadi kesalahan jaringan', 'error');
      setIsBuyingNow(false);
    }
  };

  const handleColorChange = (warna: string) => {
    setSelectedColor(warna);
  };

  const handleSizeChange = (ukuran: string) => {
    setSelectedSize(ukuran);
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-xs sm:text-sm font-heading font-bold border-2 ${
              toastType === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-[#FFF8F0] border-[#FF9F43] text-[#D96B00]'
            }`}
          >
            {toastType === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#FF9F43] text-white flex items-center justify-center shrink-0 text-xs">
                ✓
              </div>
            )}
            <span>{toastMessage}</span>
            {toastType !== 'error' && (
              <Link
                href="/keranjang"
                className="ml-2 underline hover:text-[#FF9F43] font-black"
              >
                Lihat Keranjang
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#D96B00]">
        <Link href="/" className="hover:text-[#FF9F43] transition-colors">
          Beranda
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/katalog" className="hover:text-[#FF9F43] transition-colors">
          Katalog
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link
          href={`/kategori/${product.kategori}`}
          className="hover:text-[#FF9F43] transition-colors capitalize"
        >
          {product.kategoriLabel}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-500 truncate max-w-[200px] sm:max-w-md">
          {product.nama}
        </span>
      </div>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl bg-white border-2 border-[#FFE8D6] overflow-hidden shadow-[0_12px_28px_-4px_rgba(255,159,67,0.14),inset_0_2px_4px_rgba(255,255,255,0.95)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt={product.nama}
              className="w-full h-full object-cover"
            />
            {discountPercent && discountPercent > 0 && (
              <div className={`absolute top-4 left-4 ${isFlashSaleActive ? 'bg-gradient-to-r from-amber-500 to-rose-500 border-rose-400' : 'bg-[#FF9F43] border-[#F38C26]'} text-white text-xs font-heading font-black px-3 py-1 rounded-full border shadow-sm flex items-center gap-1`}>
                {isFlashSaleActive && <Zap className="w-3.5 h-3.5 fill-current" />}
                Hemat {discountPercent}%
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsWishlist(!isWishlist)}
              className={`absolute top-4 right-4 p-2.5 rounded-2xl backdrop-blur-md border border-white/60 shadow-md transition-all cursor-pointer ${
                isWishlist
                  ? 'bg-[#FF9F43] text-white border-[#F38C26]'
                  : 'bg-white/90 hover:bg-white text-slate-600'
              }`}
              title="Tambah ke Favorit"
            >
              <Heart className={`w-5 h-5 ${isWishlist ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Thumbnail Strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {galleryImages.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(imgUrl)}
                className={`relative w-18 h-18 rounded-2xl overflow-hidden bg-white border-2 shrink-0 transition-all cursor-pointer ${
                  selectedImage === imgUrl
                    ? 'border-[#FF9F43] scale-105 shadow-[0_4px_12px_rgba(255,159,67,0.25)]'
                    : 'border-[#FFE8D6] opacity-70 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Guarantee Badges - Clay Block */}
          <div className="p-4.5 bg-[#FFF2E5]/70 rounded-3xl border-2 border-[#FFD4B2] space-y-2.5 text-xs font-heading font-bold text-slate-700">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
              <span>100% Produk Berkualitas Terstandar SNI & Bebas BPA</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#0E678E]">
              <Truck className="w-4.5 h-4.5 shrink-0" />
              <span>Pengiriman Cepat & Asuransi Otomatis Se-Indonesia</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#D96B00]">
              <RotateCcw className="w-4.5 h-4.5 shrink-0" />
              <span>Garansi 7 Hari Retur Jika Barang Cacat / Rusak</span>
            </div>
          </div>
        </div>

        {/* Center/Right Column: Product Details & Purchase Form (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFE8D6] shadow-[0_10px_24px_-4px_rgba(255,159,67,0.12),inset_0_2px_4px_rgba(255,255,255,0.95)] mb-6">
            {/* Category & Brand Tag */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="clay-badge-sky text-xs px-3 py-0.5">
                {product.kategoriLabel}
              </span>
              {isFlashSaleActive && (
                <span className="clay-badge-solid-orange text-xs px-3 py-0.5 animate-pulse flex items-center gap-1 font-heading font-black">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  ⚡ FLASH SALE
                </span>
              )}
              {product.usiaCocok && (
                <span className="clay-badge-orange text-xs px-3 py-0.5">
                  👶 {product.usiaCocok}
                </span>
              )}
              {product.tag && (
                <span className="clay-badge-solid-orange text-xs px-3 py-0.5">
                  {product.tag}
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-800 tracking-tight leading-snug mb-3">
              {product.nama}
            </h1>

            {/* Rating & Sold count */}
            <div className="flex items-center gap-4 text-xs font-body font-semibold text-slate-500 pb-4 border-b-2 border-[#FFE8D6] mb-5">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-heading font-bold text-slate-700 text-sm">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-slate-400">({product.reviewCount} ulasan pembeli)</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">Terjual {product.terjual} pcs</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-600 font-heading font-bold">Stok Ready</span>
            </div>

            {/* Price Box - Clay Highlight Container */}
            <div className="p-4.5 rounded-2xl bg-[#FFF8F0] border-2 border-[#FFE8D6] mb-6">
              {isFlashSaleActive && (
                <div className="flex items-center gap-1.5 text-xs font-heading font-black text-[#D96B00] mb-2 uppercase tracking-wide">
                  <Zap className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
                  <span>Harga Spesial Flash Sale</span>
                </div>
              )}
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-heading font-black text-[#D96B00]">
                  {formatRupiah(currentPrice)}
                </span>
                {strikethroughPrice && strikethroughPrice > currentPrice && (
                  <span className="text-sm font-body font-medium text-slate-400 line-through">
                    {formatRupiah(strikethroughPrice)}
                  </span>
                )}
                {discountPercent && discountPercent > 0 && (
                  <span className="text-xs font-heading font-black bg-[#FF9F43] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                    HEMAT {discountPercent}%
                  </span>
                )}
              </div>
            </div>

            {/* Varian Selection Form */}
            {hasVariants && (
              <div className="space-y-5 pt-2 border-t-2 border-[#FFE8D6] mb-6">
                {/* Pilihan Varian Warna */}
                {availableColors.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs font-heading font-bold text-slate-700">
                        Pilih Warna / Motif:{' '}
                        <span className="text-[#D96B00] font-black">{selectedColor}</span>
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {availableColors.map((warna) => {
                        const isSelected = selectedColor === warna;
                        const hasStockForColor = product.varian?.some(
                          (v) =>
                            v.warna === warna &&
                            (!selectedSize || v.ukuran === selectedSize) &&
                            v.stok > 0
                        );

                        return (
                          <button
                            key={warna}
                            type="button"
                            onClick={() => handleColorChange(warna)}
                            className={`px-4 py-2 rounded-2xl text-xs font-heading font-bold border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'border-[#FF9F43] bg-[#FFF2E5] text-[#D96B00] shadow-[0_4px_10px_rgba(255,159,67,0.2)]'
                                : hasStockForColor
                                ? 'border-[#FFE8D6] hover:border-[#FF9F43] text-slate-700 bg-white'
                                : 'border-slate-200 text-slate-400 bg-slate-50'
                            }`}
                          >
                            <span>{warna}</span>
                            {!hasStockForColor && (
                              <span className="text-[10px] text-rose-500 bg-rose-100 px-1.5 py-0.5 rounded-md">
                                Habis
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pilihan Varian Ukuran */}
                {availableSizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs font-heading font-bold text-slate-700">
                        Pilih Ukuran / Tipe:{' '}
                        <span className="text-[#0E678E] font-black">{selectedSize}</span>
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {availableSizes.map((ukuran) => {
                        const isSelected = selectedSize === ukuran;
                        const matchedVar = product.varian?.find(
                          (v) =>
                            (!selectedColor || v.warna === selectedColor) &&
                            v.ukuran === ukuran
                        );
                        const isStockAvailable = Boolean(matchedVar && matchedVar.stok > 0);

                        return (
                          <button
                            key={ukuran}
                            type="button"
                            onClick={() => handleSizeChange(ukuran)}
                            className={`px-4 py-2 rounded-2xl text-xs font-heading font-bold border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? isStockAvailable
                                  ? 'border-[#87CEEB] bg-[#F0F9FD] text-[#0E678E] shadow-[0_4px_10px_rgba(135,206,235,0.25)]'
                                  : 'border-rose-400 bg-rose-50 text-rose-600'
                                : isStockAvailable
                                ? 'border-[#FFE8D6] hover:border-[#87CEEB] text-slate-700 bg-white'
                                : 'border-slate-200 text-slate-400 bg-slate-50'
                            }`}
                          >
                            <span>{ukuran}</span>
                            {!isStockAvailable && (
                              <span className="text-[10px] text-rose-500 bg-rose-100 px-1.5 py-0.5 rounded-md">
                                Habis
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selector & Stock Status */}
            <div className="pt-4 border-t-2 border-[#FFE8D6] mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-heading font-bold text-slate-700 block mb-1">
                    Jumlah Pembelian
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border-2 border-[#FFE8D6] bg-white rounded-2xl p-1 shadow-xs">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="w-8 h-8 rounded-xl bg-[#FFF8F0] hover:bg-[#FFF2E5] text-slate-700 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-12 text-center text-sm font-heading font-black text-slate-800">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(Math.min(currentStock || 99, quantity + 1))
                        }
                        disabled={quantity >= currentStock || isOutOfStock}
                        className="w-8 h-8 rounded-xl bg-[#FFF8F0] hover:bg-[#FFF2E5] text-slate-700 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-xs font-body font-semibold text-slate-500">
                      {isOutOfStock ? (
                        <span className="text-rose-600 font-heading font-bold">
                          ⚠️ Stok Habis
                        </span>
                      ) : (
                        `Tersisa ${currentStock} pcs`
                      )}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-body font-medium text-slate-500 block">Subtotal:</span>
                  <span className="text-lg sm:text-xl font-heading font-black text-[#D96B00]">
                    {formatRupiah(currentPrice * quantity)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons - Dual Clay CTA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAddingToCart || isBuyingNow || isOutOfStock}
                className={`py-3.5 px-5 rounded-2xl font-heading font-bold text-xs sm:text-sm border-2 flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'clay-btn-white text-[#D96B00] hover:text-[#B85700] hover:scale-[1.02] cursor-pointer'
                }`}
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#FF9F43]" />
                    <span>Menambahkan...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#FF9F43]" />
                    <span>+ Tambah ke Keranjang</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isAddingToCart || isBuyingNow || isOutOfStock}
                className={`py-3.5 px-5 rounded-2xl font-heading font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 border-2 border-slate-300 cursor-not-allowed'
                    : 'clay-btn-orange text-white hover:scale-[1.02] cursor-pointer'
                }`}
              >
                {isBuyingNow ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Menyiapkan Checkout...</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Stok Tidak Tersedia</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Beli Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Deskripsi Produk - Clay Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFE8D6] shadow-[0_8px_20px_-4px_rgba(255,159,67,0.1),inset_0_2px_4px_rgba(255,255,255,0.95)]">
            <h2 className="text-base sm:text-lg font-heading font-black text-slate-800 pb-3 border-b-2 border-[#FFE8D6] mb-4">
              Deskripsi & Spesifikasi Lengkap 📋
            </h2>
            <div className="text-xs sm:text-sm font-body font-medium text-slate-600 leading-relaxed space-y-3">
              <p>{product.deskripsi}</p>
              <p>
                Produk ini dirancang khusus untuk kenyamanan dan keamanan si kecil, diproduksi menggunakan material ramah anak bersertifikat standar nasional (SNI). Cocok dijadikan sebagai perlengkapan harian maupun hadiah terbaik untuk anak tersayang.
              </p>
              <div className="pt-2">
                <h3 className="font-heading font-bold text-slate-800 mb-1.5">Keunggulan Utama:</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-600 font-body">
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
        <section className="mt-14 pt-8 border-t-2 border-[#FFE8D6]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-800">
                Produk Terkait Lainnya
              </h2>
              <p className="text-xs sm:text-sm font-body text-slate-500">
                Pilihan produk sejenis yang sering dibeli bersamaan
              </p>
            </div>
            <Link
              href={`/kategori/${product.kategori}`}
              className="text-xs sm:text-sm font-heading font-bold text-[#D96B00] hover:text-[#FF9F43] flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#FFD4B2] shadow-xs"
            >
              <span>Lihat Kategori {product.kategoriLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
