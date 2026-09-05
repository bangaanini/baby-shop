'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Zap } from 'lucide-react';
import { Product } from '@/types/product';
import { formatRupiah } from '@/lib/format';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isFlashSaleActive = Boolean(product.isFlashSale && product.hargaFlashSale);
  const displayPrice = isFlashSaleActive ? product.hargaFlashSale! : product.harga;
  const strikePrice = isFlashSaleActive ? product.harga : product.hargaCoret;
  const discountPercent = isFlashSaleActive
    ? Math.max(1, Math.round(((product.harga - product.hargaFlashSale!) / product.harga) * 100))
    : product.diskonPersen;
  const topBadge = isFlashSaleActive ? '⚡ Flash Sale' : product.tag;

  return (
    <Link
      href={`/produk/${product.slug}`}
      className="group bg-white rounded-2xl sm:rounded-3xl border-2 border-[#FFE8D6] hover:border-[#FF9F43] shadow-[0_4px_14px_rgba(255,159,67,0.08),inset_0_2px_4px_0_rgba(255,255,255,0.95)] hover:shadow-[0_14px_28px_-4px_rgba(255,159,67,0.22)] hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden relative cursor-pointer h-full"
    >
      {/* Top Left Badge Tag - Clay Pill */}
      {topBadge && (
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
          <span className="clay-badge-solid-orange text-[9px] sm:text-[11px] font-heading font-black px-2 py-0.5 sm:px-2.5 sm:py-0.5 shadow-xs">
            {topBadge}
          </span>
        </div>
      )}

      {/* Image container with aspect ratio */}
      <div className="relative aspect-square w-full bg-[#FFF8F0] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.gambar}
          alt={product.nama}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discountPercent && discountPercent > 0 && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#FF9F43] text-white text-[9px] sm:text-[11px] font-heading font-black px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full border border-[#F38C26] shadow-xs">
            -{discountPercent}%
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Category Pill - Desktop Only */}
          <div className="hidden sm:block mb-1.5">
            <span className="clay-badge-sky text-[10px] font-heading font-bold px-2 py-0.5">
              {product.kategoriLabel}
            </span>
          </div>

          {/* Product Name */}
          <h3
            className="text-xs sm:text-sm font-heading font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#D96B00] transition-colors mb-1 sm:mb-2"
            title={product.nama}
          >
            {product.nama}
          </h3>

          {/* Age tag - Desktop Only */}
          {product.usiaCocok && (
            <p className="hidden sm:flex text-xs font-body font-semibold text-slate-500 mb-2.5 items-center gap-1">
              <span className="text-xs">👶</span>
              <span>Untuk {product.usiaCocok}</span>
            </p>
          )}
        </div>

        <div>
          {/* Price & Strike Price */}
          <div className="mb-0 sm:mb-2">
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-xs sm:text-base font-heading font-black text-[#D96B00]">
                {formatRupiah(displayPrice)}
              </span>
              {strikePrice && strikePrice > displayPrice && (
                <span className="text-[10px] sm:text-xs font-body font-medium text-slate-400 line-through">
                  {formatRupiah(strikePrice)}
                </span>
              )}
            </div>
          </div>

          {/* Rating & Sold count - Desktop Only */}
          <div className="hidden sm:flex items-center justify-between text-xs font-body font-semibold text-slate-500 pt-2 border-t border-[#FFE8D6]">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-heading font-bold text-slate-700">{product.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount})</span>
            </div>
            <span className="text-slate-400 text-[11px] font-medium">Terjual {product.terjual}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
