'use client';

import React from 'react';
import Link from 'next/link';
import { Baby, Shirt, Gamepad2, Sparkles, ArrowRight, ShieldCheck, Truck, RotateCcw, Heart, ShoppingBag } from 'lucide-react';
import { CategoryItem } from '@/types/product';
import { MOCK_CATEGORIES } from '@/data/mock-products';

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF9F43] via-[#FFAE5C] to-[#87CEEB] text-white p-6 sm:p-10 lg:p-12 mb-10 border-4 border-white shadow-[0_18px_40px_rgba(255,159,67,0.28),inset_0_4px_8px_rgba(255,255,255,0.7),inset_0_-4px_8px_rgba(200,95,10,0.2)]">
      {/* Playful background decorative bubbles */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/15 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 rounded-full bg-[#87CEEB]/30 blur-xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        {/* Top Tag Pill */}
        <div className="inline-flex items-center gap-2 bg-white/90 text-[#D96B00] px-4 py-1.5 rounded-full text-xs font-heading font-extrabold uppercase tracking-wider mb-4 shadow-[0_4px_12px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)] border border-[#FFD4B2]">
          <Sparkles className="w-3.5 h-3.5 text-[#FF9F43]" />
          <span>NBusiness • Toko Kebutuhan Anak Ceria</span>
        </div>

        {/* Main Heading with Nunito Bold */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] text-white">
          Semua Kebutuhan Si Kecil dalam Satu Sentuhan 👶✨
        </h1>

        {/* Description with Quicksand */}
        <p className="text-sm sm:text-base font-body font-semibold text-white/95 mb-7 leading-relaxed max-w-xl drop-shadow-xs">
          Temukan perlengkapan bayi berkualitas, pakaian anak nyaman & modis, serta mainan edukasi terstandar aman SNI dengan pengiriman ke seluruh Nusantara.
        </p>

        {/* Action Buttons - Claymorphic 3D */}
        <div className="flex flex-wrap items-center gap-3.5">
          <Link
            href="#promo"
            className="clay-btn-white px-6 py-3.5 text-sm sm:text-base text-[#D96B00] hover:text-[#B85700] hover:scale-105 transition-all flex items-center gap-2 font-heading font-black rounded-2xl"
          >
            <ShoppingBag className="w-4 h-4 text-[#FF9F43]" />
            <span>Belanja Diskon Hari Ini</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#populer"
            className="px-6 py-3.5 bg-white/20 hover:bg-white/30 text-white border-2 border-white/60 font-heading font-bold rounded-2xl backdrop-blur-md transition-all text-sm sm:text-base shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:scale-105"
          >
            Lihat Produk Populer 🔥
          </Link>
        </div>
      </div>

      {/* Floating 3D Toy Icon for Desktop */}
      <div className="hidden md:block absolute right-8 bottom-4 lg:right-14 lg:bottom-6 select-none pointer-events-none text-[120px] lg:text-[150px] drop-shadow-[0_20px_25px_rgba(0,0,0,0.25)] hover:scale-110 transition-transform duration-300">
        🧸
      </div>

      {/* Trust Badges Bar - Clay Strip */}
      <div className="mt-8 pt-6 border-t border-white/30 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm font-heading font-bold">
        <div className="flex items-center gap-2.5 bg-white/15 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/20 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>100% Terstandar SNI & Bebas Racun</span>
        </div>
        <div className="flex items-center gap-2.5 bg-white/15 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/20 shadow-xs">
          <Truck className="w-5 h-5 text-amber-200 shrink-0" />
          <span>Ongkir Terjangkau Se-Indonesia</span>
        </div>
        <div className="flex items-center gap-2.5 bg-white/15 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/20 shadow-xs">
          <RotateCcw className="w-5 h-5 text-sky-200 shrink-0" />
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF9F43] shadow-[0_0_8px_#FF9F43]" />
            <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-800 tracking-tight">
              Kategori Pilihan Si Kecil
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-body font-medium text-slate-500 mt-0.5">
            Pilih kebutuhan yang tepat untuk setiap momen tumbuh kembang buah hati
          </p>
        </div>
      </div>

      {/* Block-based 3-Column Clay Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {displayCategories.map((cat, idx) => {
          const isPerlengkapan = cat.slug === 'perlengkapan';
          const isPakaian = cat.slug === 'pakaian';
          const isMainan = cat.slug === 'mainan';

          return (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className="group p-6 rounded-3xl bg-white border-2 border-[#FFE8D6] hover:border-[#FF9F43] shadow-[0_10px_24px_-4px_rgba(255,159,67,0.12),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-3px_6px_rgba(255,159,67,0.1)] hover:shadow-[0_16px_32px_-4px_rgba(255,159,67,0.22)] hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-transform group-hover:scale-110 shadow-[0_6px_14px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.8)] ${
                    isPerlengkapan
                      ? 'bg-[#FFF2E5] text-[#D96B00] border-[#FFD4B2]'
                      : isPakaian
                      ? 'bg-[#F0F9FD] text-[#0E678E] border-[#BCE4F7]'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isPerlengkapan && <Baby className="w-7 h-7" />}
                  {isPakaian && <Shirt className="w-7 h-7" />}
                  {isMainan && <Gamepad2 className="w-7 h-7" />}
                  {!isPerlengkapan && !isPakaian && !isMainan && <Sparkles className="w-7 h-7" />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-heading font-black text-slate-800 group-hover:text-[#D96B00] transition-colors">
                    {cat.nama}
                  </h3>
                  <p className="text-xs font-body font-medium text-slate-500 line-clamp-2 mt-1">
                    {cat.deskripsi}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#FFE8D6] flex items-center justify-between text-xs font-heading font-bold text-[#D96B00]">
                <span>{cat.jumlahProduk}+ Koleksi Siap Kirim</span>
                <span className="w-7 h-7 rounded-xl bg-[#FFF2E5] group-hover:bg-[#FF9F43] group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
