'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ShoppingBag, Heart, ShieldCheck } from 'lucide-react';
import { Product } from '@/types/product';
import { formatRupiah } from '@/lib/format';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group bg-white rounded-3xl border-2 border-[#FFE8D6] hover:border-[#FF9F43] shadow-[0_10px_24px_-4px_rgba(255,159,67,0.12),0_4px_8px_-2px_rgba(0,0,0,0.03),inset_0_2px_4px_0_rgba(255,255,255,0.95),inset_0_-3px_6px_0_rgba(255,159,67,0.1)] hover:shadow-[0_18px_36px_-4px_rgba(255,159,67,0.24)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top Left Badge Tag - Clay Pill */}
      {product.tag && (
        <div className="absolute top-3 left-3 z-10">
          <span className="clay-badge-solid-orange text-[10px] sm:text-[11px] font-heading font-black px-2.5 py-0.5 shadow-sm">
            {product.tag}
          </span>
        </div>
      )}

      {/* Image container with rounded top & soft background */}
      <div className="relative aspect-square w-full bg-[#FFF8F0] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.gambar}
          alt={product.nama}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Discount Badge */}
        {product.diskonPersen && (
          <div className="absolute top-3 right-3 bg-[#FF9F43] text-white text-[11px] font-heading font-black px-2.5 py-0.5 rounded-full border border-[#F38C26] shadow-[0_4px_8px_rgba(255,159,67,0.4)]">
            -{product.diskonPersen}%
          </div>
        )}
      </div>

      {/* Product Information - Block Structure */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Category Pill */}
          <div className="mb-2">
            <span className="clay-badge-sky text-[10px] font-heading font-bold px-2.5 py-0.5">
              {product.kategoriLabel}
            </span>
          </div>

          {/* Product Name with Nunito Bold */}
          <h3
            className="text-sm sm:text-base font-heading font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#D96B00] transition-colors mb-2"
            title={product.nama}
          >
            {product.nama}
          </h3>

          {/* Age tag if available */}
          {product.usiaCocok && (
            <p className="text-xs font-body font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
              <span className="text-xs">👶</span>
              <span>Untuk {product.usiaCocok}</span>
            </p>
          )}
        </div>

        <div>
          {/* Price & Original Price */}
          <div className="mb-2.5">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-heading font-black text-[#D96B00]">
                {formatRupiah(product.harga)}
              </span>
              {product.hargaCoret && (
                <span className="text-xs font-body font-medium text-slate-400 line-through">
                  {formatRupiah(product.hargaCoret)}
                </span>
              )}
            </div>
          </div>

          {/* Rating & Sold count */}
          <div className="flex items-center justify-between text-xs font-body font-semibold text-slate-500 pt-2.5 border-t border-[#FFE8D6] mb-3.5">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-heading font-bold text-slate-700">{product.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount})</span>
            </div>
            <span className="text-slate-400 text-[11px] font-medium">Terjual {product.terjual}</span>
          </div>

          {/* Clay Button Action */}
          <Link
            href={`/produk/${product.slug}`}
            className="w-full py-2.5 px-3 bg-[#FFF2E5] hover:bg-[#FF9F43] text-[#D96B00] hover:text-white font-heading font-bold text-xs sm:text-sm rounded-2xl border-2 border-[#FFD4B2] hover:border-[#F38C26] shadow-[0_4px_10px_rgba(255,159,67,0.15),inset_0_2px_3px_rgba(255,255,255,0.8)] flex items-center justify-center gap-1.5 active:translate-y-0.5 transition-all duration-200"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Lihat Detail</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
