'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, ArrowRight } from 'lucide-react';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/product/ProductCard';

interface SectionProps {
  products: Product[];
}

export function PopularSection({ products }: SectionProps) {
  const popularList = products.filter((p) => p.isPopuler);

  return (
    <section id="populer" className="mb-14 scroll-mt-28">
      <div className="flex items-end justify-between mb-6 pb-2 border-b border-rose-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Produk Populer
              </h2>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Paling Banyak Dibeli
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Pilihan favorit orang tua lain dengan penilaian terbaik
            </p>
          </div>
        </div>

        <Link
          href="/katalog?sort=terlaris"
          className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group whitespace-nowrap"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        {popularList.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function NewArrivalsSection({ products }: SectionProps) {
  const newArrivalList = products.filter((p) => p.isTerbaru);

  return (
    <section id="terbaru" className="mb-14 scroll-mt-28">
      <div className="flex items-end justify-between mb-6 pb-2 border-b border-rose-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-xs text-xl">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Produk Terbaru
              </h2>
              <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Koleksi Baru Masuk
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Koleksi barang baru yang baru masuk toko untuk buah hati Anda
            </p>
          </div>
        </div>

        <Link
          href="/katalog?sort=terbaru"
          className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group whitespace-nowrap"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        {newArrivalList.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function RecommendedSection({ products }: SectionProps) {
  const recommendedList = products.filter((p) => p.isRekomendasi);

  return (
    <section id="rekomendasi" className="mb-14 scroll-mt-28">
      <div className="flex items-end justify-between mb-6 pb-2 border-b border-rose-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-xs text-xl">
            🌟
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Rekomendasi untuk Anak
              </h2>
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Pilihan Ahli
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Saran produk yang disesuaikan dengan kebutuhan tumbuh kembang si kecil
            </p>
          </div>
        </div>

        <Link
          href="/katalog?filter=rekomendasi"
          className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group whitespace-nowrap"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        {recommendedList.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function PromoSection({ products }: SectionProps) {
  const promoList = products.filter((p) => p.isPromo);

  return (
    <section id="promo" className="mb-14 scroll-mt-28 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 p-6 sm:p-8 rounded-3xl border border-rose-200">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs text-xl animate-bounce">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-rose-700">
                Promo Hemat Rutin
              </h2>
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                Flash Sale Terbatas
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Diskon spesial berkala hingga 50%+ agar belanja kebutuhan anak jadi lebih hemat!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-bold text-slate-700 shadow-2xs self-start sm:self-auto">
          <span className="text-rose-600">Berakhir dalam:</span>
          <div className="flex items-center gap-1 font-mono text-white">
            <span className="bg-rose-500 px-1.5 py-0.5 rounded-md">08</span>:
            <span className="bg-rose-500 px-1.5 py-0.5 rounded-md">45</span>:
            <span className="bg-rose-500 px-1.5 py-0.5 rounded-md">19</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        {promoList.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
