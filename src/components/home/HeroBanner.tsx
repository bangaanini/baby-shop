'use client';

import React from 'react';
import Link from 'next/link';
import { Baby, Shirt, Gamepad2, Sparkles, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { CategoryItem } from '@/types/product';
import { MOCK_CATEGORIES } from '@/data/mock-products';

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-400 text-white p-6 sm:p-10 lg:p-12 mb-10 shadow-lg">
      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-white/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NBusiness • Marketplace Kebutuhan Anak No. 1</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
          Semua Kebutuhan Si Kecil dalam Satu Sentuhan 👶✨
        </h1>
        <p className="text-sm sm:text-base text-rose-50 mb-6 leading-relaxed">
          Temukan perlengkapan bayi berkualitas, pakaian anak nyaman dan modis, serta mainan edukasi terstandar aman SNI dengan pengiriman ke seluruh Indonesia.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="#promo"
            className="px-6 py-3 bg-white text-rose-600 hover:bg-rose-50 font-bold rounded-2xl shadow-md transition-all flex items-center gap-2 text-sm hover:scale-105"
          >
            <span>Belanja Diskon Hari Ini</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#populer"
            className="px-6 py-3 bg-rose-600/40 hover:bg-rose-600/60 text-white border border-white/30 font-semibold rounded-2xl backdrop-blur-sm transition-all text-sm"
          >
            Lihat Produk Populer
          </Link>
        </div>
      </div>

      {/* Floating illustration emojis */}
      <div className="hidden md:block absolute right-8 bottom-4 lg:right-16 lg:bottom-8 select-none pointer-events-none opacity-90 text-[110px] lg:text-[140px] drop-shadow-xl animate-pulse">
        🧸
      </div>

      {/* Trust badges footer in hero */}
      <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-200" />
          <span>100% Produk Aman & Bebas Racun</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-amber-200" />
          <span>Ongkir Otomatis Se-Indonesia</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-sky-200" />
          <span>Garansi Retur Bila Barang Rusak</span>
        </div>
      </div>
    </div>
  );
}

interface CategorySectionProps {
  categories?: CategoryItem[];
}

export function CategorySection({ categories }: CategorySectionProps = {}) {
  const displayCategories = categories && categories.length > 0 ? categories : MOCK_CATEGORIES;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">Kategori Utama</h2>
          <p className="text-xs sm:text-sm text-slate-500">Pilih kategori belanja yang dicari untuk si kecil</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {displayCategories.map((cat) => (
          <Link
            key={cat.id}
            href={`/kategori/${cat.slug}`}
            className="group p-5 rounded-2xl bg-white border border-slate-100 hover:border-rose-200 shadow-xs hover:shadow-md transition-all flex items-start gap-4"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${cat.warnaBg || 'bg-rose-100 text-rose-700'} group-hover:scale-110 transition-transform`}>
              {cat.slug === 'perlengkapan' && <Baby className="w-6 h-6" />}
              {cat.slug === 'pakaian' && <Shirt className="w-6 h-6" />}
              {cat.slug === 'mainan' && <Gamepad2 className="w-6 h-6" />}
              {!['perlengkapan', 'pakaian', 'mainan'].includes(cat.slug) && <Sparkles className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                {cat.nama}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-2">
                {cat.deskripsi}
              </p>
              <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Lihat {cat.jumlahProduk}+ Produk <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
