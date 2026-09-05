'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2, ShoppingBag, ArrowRight, Star } from 'lucide-react';
import { Product } from '@/types/product';
import { getWishlistProducts, removeFromWishlist } from '@/lib/wishlist';
import { formatRupiah } from '@/lib/format';

export function FavoritesTab() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setFavorites(getWishlistProducts());

    const handleWishlistUpdated = () => {
      setFavorites(getWishlistProducts());
    };

    window.addEventListener('wishlist-updated', handleWishlistUpdated);
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdated);
    };
  }, []);

  const handleRemove = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = removeFromWishlist(productId);
    setFavorites(updated);
  };

  if (!isMounted) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFE8D6] shadow-[0_10px_24px_-4px_rgba(255,159,67,0.12)] animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 rounded w-48" />
        <div className="h-4 bg-slate-100 rounded w-64" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
          <div className="h-48 bg-slate-100 rounded-2xl" />
          <div className="h-48 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFE8D6] shadow-[0_10px_24px_-4px_rgba(255,159,67,0.12),inset_0_2px_4px_rgba(255,255,255,0.95)]">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-[#FFE8D6] mb-6 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF2E5] text-[#D96B00] flex items-center justify-center border border-[#FFD4B2] shadow-xs">
            <Heart className="w-5 h-5 fill-[#FF9F43] text-[#FF9F43]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-heading font-black text-slate-800">
              Produk Favorit Saya
            </h2>
            <p className="text-xs font-body text-slate-500">
              Daftar barang impian & perlengkapan anak yang Anda simpan
            </p>
          </div>
        </div>

        {favorites.length > 0 && (
          <span className="clay-badge-orange text-xs px-3 py-1 self-start sm:self-auto">
            {favorites.length} Produk Tersimpan
          </span>
        )}
      </div>

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div className="py-12 sm:py-16 text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-[#FFF2E5] text-[#FF9F43] mx-auto flex items-center justify-center text-3xl border-2 border-[#FFD4B2] shadow-inner">
            ❤️
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-heading font-black text-slate-800">
              Belum Ada Produk yang Disukai
            </h3>
            <p className="text-xs sm:text-sm font-body text-slate-500 leading-relaxed">
              Jelajahi pakaian anak modis, perlengkapan bayi, dan mainan edukasi terstandar SNI, lalu tekan tombol hati ❤️ untuk menyimpannya di sini.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/katalog"
              className="clay-btn-orange text-white text-xs px-6 py-3 rounded-2xl inline-flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Jelajahi Katalog Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Favorites Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-5">
          {favorites.map((product) => {
            const isFlash = Boolean(product.isFlashSale && product.hargaFlashSale);
            const activePrice = isFlash ? product.hargaFlashSale! : product.harga;

            return (
              <div
                key={product.id}
                className="group relative bg-white rounded-2xl sm:rounded-3xl border-2 border-[#FFE8D6] hover:border-[#FF9F43] shadow-[0_4px_14px_rgba(255,159,67,0.08),inset_0_2px_4px_0_rgba(255,255,255,0.95)] hover:shadow-[0_12px_24px_-4px_rgba(255,159,67,0.2)] hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={(e) => handleRemove(product.id, e)}
                  className="absolute top-2.5 right-2.5 z-20 p-2 rounded-xl bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 shadow-sm transition-all cursor-pointer hover:scale-110"
                  title="Hapus dari Favorit"
                  aria-label="Hapus dari Favorit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Product Image */}
                <Link
                  href={`/produk/${product.slug}`}
                  className="relative aspect-square w-full bg-[#FFF8F0] overflow-hidden block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.gambar}
                    alt={product.nama}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.diskonPersen && product.diskonPersen > 0 && (
                    <div className="absolute top-2.5 left-2.5 bg-[#FF9F43] text-white text-[9px] sm:text-[10px] font-heading font-black px-2 py-0.5 rounded-full border border-[#F38C26] shadow-xs">
                      -{product.diskonPersen}%
                    </div>
                  )}
                </Link>

                {/* Product Details */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-heading font-bold text-[#D96B00] uppercase tracking-wider block mb-1">
                      {product.kategoriLabel || 'Produk Anak'}
                    </span>
                    <Link
                      href={`/produk/${product.slug}`}
                      className="text-xs sm:text-sm font-heading font-bold text-slate-800 line-clamp-2 group-hover:text-[#D96B00] transition-colors leading-snug"
                    >
                      {product.nama}
                    </Link>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#FFE8D6] flex items-center justify-between">
                    <div>
                      <span className="text-xs sm:text-sm font-heading font-black text-[#D96B00] block">
                        {formatRupiah(activePrice)}
                      </span>
                    </div>

                    <Link
                      href={`/produk/${product.slug}`}
                      className="p-2 rounded-xl bg-[#FFF2E5] text-[#D96B00] hover:bg-[#FF9F43] hover:text-white transition-colors"
                      title="Lihat Produk"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
