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
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-lg hover:border-rose-200 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Badge Tag */}
      {product.tag && (
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            {product.tag}
          </span>
        </div>
      )}

      {/* Image container with aspect ratio */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.gambar}
          alt={product.nama}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.diskonPersen && (
          <div className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            -{product.diskonPersen}%
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Pill */}
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md inline-block mb-1.5">
            {product.kategoriLabel}
          </span>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors mb-1.5" title={product.nama}>
            {product.nama}
          </h3>

          {/* Suitable Age tag if available */}
          {product.usiaCocok && (
            <p className="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
              <span>👶</span> {product.usiaCocok}
            </p>
          )}
        </div>

        <div>
          {/* Price & Discount */}
          <div className="mb-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-bold text-rose-600">
                {formatRupiah(product.harga)}
              </span>
              {product.hargaCoret && (
                <span className="text-xs text-slate-400 line-through">
                  {formatRupiah(product.hargaCoret)}
                </span>
              )}
            </div>
          </div>

          {/* Rating & Sold count */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 mb-3">
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount})</span>
            </div>
            <span className="text-slate-400 text-[11px]">Terjual {product.terjual}</span>
          </div>

          {/* Action button */}
          <Link
            href={`/produk/${product.slug}`}
            className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Lihat Detail / Beli</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
