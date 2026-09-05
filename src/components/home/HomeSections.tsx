'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, ArrowRight, Sparkles, Star, Zap } from 'lucide-react';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/product/ProductCard';

interface SectionProps {
  products: Product[];
}

export interface FlashSaleSettingsProp {
  isActive?: boolean;
  title?: string | null;
  endTime?: string | Date | null;
}

interface PromoSectionProps {
  products: Product[];
  flashSaleSettings?: FlashSaleSettingsProp;
}

export function PopularSection({ products }: SectionProps) {
  const popularList = products.filter((p) => p.isPopuler);

  return (
    <section id="populer" className="mb-14 scroll-mt-28">
      <div className="flex items-end justify-between mb-6 pb-3 border-b-2 border-[#FFE8D6]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FF9F43] text-white flex items-center justify-center border-2 border-[#F38C26] shadow-[0_6px_14px_rgba(255,159,67,0.35),inset_0_2px_4px_rgba(255,255,255,0.6)]">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-800 tracking-tight">
                Produk Paling Populer
              </h2>
              <span className="clay-badge-orange text-[10px] sm:text-[11px] font-heading font-extrabold px-2.5 py-0.5">
                🔥 Favorit Bunda
              </span>
            </div>
            <p className="text-xs sm:text-sm font-body font-medium text-slate-500 mt-0.5">
              Pilihan favorit orang tua lain dengan penilaian dan review terbaik
            </p>
          </div>
        </div>

        <Link
          href="/katalog?sort=terpopuler"
          className="text-xs sm:text-sm font-heading font-bold text-[#D96B00] hover:text-[#FF9F43] flex items-center gap-1 group whitespace-nowrap bg-white px-3 py-1.5 rounded-xl border border-[#FFD4B2] shadow-xs hover:shadow-sm transition-all"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
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
      <div className="flex items-end justify-between mb-6 pb-3 border-b-2 border-[#FFE8D6]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#87CEEB] text-[#0A445C] flex items-center justify-center border-2 border-[#6EBEDB] shadow-[0_6px_14px_rgba(135,206,235,0.4),inset_0_2px_4px_rgba(255,255,255,0.7)] text-xl">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-800 tracking-tight">
                Koleksi Baru Masuk
              </h2>
              <span className="clay-badge-sky text-[10px] sm:text-[11px] font-heading font-extrabold px-2.5 py-0.5">
                🌟 New Arrival
              </span>
            </div>
            <p className="text-xs sm:text-sm font-body font-medium text-slate-500 mt-0.5">
              Barang baru masuk toko dengan model kekinian dan stok lengkap
            </p>
          </div>
        </div>

        <Link
          href="/katalog?sort=terbaru"
          className="text-xs sm:text-sm font-heading font-bold text-[#0E678E] hover:text-[#87CEEB] flex items-center gap-1 group whitespace-nowrap bg-white px-3 py-1.5 rounded-xl border border-[#BCE4F7] shadow-xs hover:shadow-sm transition-all"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
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
      <div className="flex items-end justify-between mb-6 pb-3 border-b-2 border-[#FFE8D6]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF9F43] to-[#87CEEB] text-white flex items-center justify-center border-2 border-white/60 shadow-[0_6px_14px_rgba(255,159,67,0.25)] text-xl">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-800 tracking-tight">
                Rekomendasi Ahli Tumbuh Kembang
              </h2>
              <span className="clay-badge-orange text-[10px] sm:text-[11px] font-heading font-extrabold px-2.5 py-0.5">
                SNI Teruji
              </span>
            </div>
            <p className="text-xs sm:text-sm font-body font-medium text-slate-500 mt-0.5">
              Saran perlengkapan terstandar aman untuk menunjang kenyamanan dan kecerdasan anak
            </p>
          </div>
        </div>

        <Link
          href="/katalog?filter=rekomendasi"
          className="text-xs sm:text-sm font-heading font-bold text-[#D96B00] hover:text-[#FF9F43] flex items-center gap-1 group whitespace-nowrap bg-white px-3 py-1.5 rounded-xl border border-[#FFD4B2] shadow-xs hover:shadow-sm transition-all"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
        {recommendedList.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export function PromoSection({ products, flashSaleSettings }: PromoSectionProps) {
  // If explicitly deactivated or no products available, handle gracefully by not rendering
  if (flashSaleSettings?.isActive === false || !products || products.length === 0) {
    return null;
  }

  const title = flashSaleSettings?.title?.trim() || 'Promo Hemat Rutin';

  // Live countdown state
  const [timeLeft, setTimeLeft] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    isEnded: boolean;
  }>({
    hours: '00',
    minutes: '00',
    seconds: '00',
    isEnded: false,
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Target time: if endTime is set in DB, use it; otherwise fallback to 24 hours from today
    let targetMs: number;
    if (flashSaleSettings?.endTime) {
      const parsedTime = new Date(flashSaleSettings.endTime).getTime();
      targetMs = !isNaN(parsedTime) ? parsedTime : Date.now() + 24 * 60 * 60 * 1000;
    } else {
      targetMs = Date.now() + 24 * 60 * 60 * 1000;
    }

    const calculateTime = () => {
      const now = Date.now();
      const diff = Math.max(0, targetMs - now);

      if (diff <= 0) {
        setTimeLeft({
          hours: '00',
          minutes: '00',
          seconds: '00',
          isEnded: true,
        });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        isEnded: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [flashSaleSettings?.endTime]);

  return (
    <section
      id="promo"
      className="mb-14 scroll-mt-28 bg-gradient-to-r from-[#FFF2E5] via-[#FFF8F0] to-[#F0F9FD] p-4.5 sm:p-8 rounded-3xl border-2 border-[#FFD4B2] shadow-[0_14px_30px_-4px_rgba(255,159,67,0.18),inset_0_2px_4px_rgba(255,255,255,0.9)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 sm:mb-6 gap-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#FF9F43] text-white flex items-center justify-center border-2 border-[#F38C26] shadow-[0_6px_14px_rgba(255,159,67,0.4),inset_0_2px_4px_rgba(255,255,255,0.6)] text-lg sm:text-xl animate-bounce shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-2xl font-heading font-black text-[#D96B00] tracking-tight">
                {title}
              </h2>
              <span className="clay-badge-solid-orange text-[9px] sm:text-[11px] font-heading font-extrabold px-2.5 py-0.5 animate-pulse">
                Flash Sale Terbatas
              </span>
            </div>
            <p className="text-[11px] sm:text-sm font-body font-medium text-slate-600 mt-0.5 hidden xs:block">
              Diskon spesial berkala agar belanja kebutuhan anak jadi jauh lebih hemat!
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
          {/* Countdown Timer Clay Block */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border-2 border-[#FFD4B2] shadow-[0_4px_12px_rgba(255,159,67,0.12),inset_0_2px_3px_rgba(255,255,255,0.9)] text-[11px] sm:text-xs font-heading font-bold text-slate-700">
            <span className="text-[#D96B00]">Berakhir:</span>
            {isMounted && timeLeft.isEnded ? (
              <span className="text-rose-500 font-bold px-2 py-0.5 bg-rose-50 rounded-lg border border-rose-200">
                Berakhir
              </span>
            ) : (
              <div className="flex items-center gap-1 font-mono text-white text-xs">
                <span className="bg-[#FF9F43] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border border-[#F38C26] shadow-xs">
                  {isMounted ? timeLeft.hours : '00'}
                </span>
                :
                <span className="bg-[#FF9F43] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border border-[#F38C26] shadow-xs">
                  {isMounted ? timeLeft.minutes : '00'}
                </span>
                :
                <span className="bg-[#FF9F43] px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg border border-[#F38C26] shadow-xs">
                  {isMounted ? timeLeft.seconds : '00'}
                </span>
              </div>
            )}
          </div>

          {/* Tombol Lihat Semua */}
          <Link
            href="/flash-sale"
            className="text-xs sm:text-sm font-heading font-bold text-[#D96B00] hover:text-[#FF9F43] flex items-center gap-1 group whitespace-nowrap bg-white px-3 py-1.5 rounded-xl border border-[#FFD4B2] shadow-xs hover:shadow-sm transition-all shrink-0"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Mobile Horizontal Slider & Desktop 4-Col Grid */}
      <div className="flex md:grid overflow-x-auto snap-x snap-mandatory gap-3.5 sm:gap-6 pb-2 md:pb-0 scrollbar-none md:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="min-w-[150px] max-w-[170px] sm:min-w-0 sm:max-w-none snap-start shrink-0 md:shrink">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
