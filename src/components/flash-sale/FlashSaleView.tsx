'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Flame, Clock, Sparkles, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/product/ProductCard';
import { mapDbProductToProduct } from '@/lib/mappers';

interface FlashSaleViewProps {
  initialProducts?: Product[];
  settings?: {
    isActive?: boolean;
    title?: string | null;
    endTime?: string | Date | null;
  } | null;
}

export function FlashSaleView({ initialProducts = [], settings }: FlashSaleViewProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(initialProducts.length === 0);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const title = settings?.title?.trim() || 'Flash Sale Spesial';

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

  useEffect(() => {
    setIsMounted(true);

    let targetMs: number;
    if (settings?.endTime) {
      const parsedTime = new Date(settings.endTime).getTime();
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
  }, [settings?.endTime]);

  // Fetch flash sale products if not passed initially
  useEffect(() => {
    if (initialProducts.length > 0) return;

    let isSubscribed = true;
    async function loadFlashSaleProducts() {
      try {
        setLoading(true);
        const res = await fetch('/api/products?isFlashSale=true&limit=50');
        if (res.ok) {
          const json = await res.json();
          if (isSubscribed && json.success && Array.isArray(json.data)) {
            const mapped = json.data.map(mapDbProductToProduct);
            setProducts(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to load flash sale products:', err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    loadFlashSaleProducts();
    return () => {
      isSubscribed = false;
    };
  }, [initialProducts]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Breadcrumb Back Action */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-slate-600 hover:text-[#D96B00] bg-white px-3 py-1.5 rounded-xl border border-[#FFE8D6] shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* Hero Campaign Header - Vibrant Fiery Claymorphism */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FF9F43] via-[#EE8A2B] to-[#FF5E7E] text-white p-6 sm:p-10 border-4 border-white shadow-[0_16px_36px_rgba(255,159,67,0.28),inset_0_2px_4px_rgba(255,255,255,0.8)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/90 text-[#D96B00] px-3.5 py-1 rounded-full text-xs font-heading font-black tracking-wide border border-[#FFD4B2] shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-current text-[#FF9F43]" />
              <span>EVENT SPESIAL DISKON BESAR</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white drop-shadow-xs">
              ⚡ {title}
            </h1>
            <p className="text-xs sm:text-sm font-body font-medium text-white/95 leading-relaxed">
              Dapatkan produk pakaian anak, perlengkapan bayi, dan mainan edukasi favorit dengan harga paling hemat sebelum waktu promo berakhir!
            </p>
          </div>

          {/* Large Countdown Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-white shadow-[0_10px_24px_rgba(0,0,0,0.1)] text-slate-800 shrink-0 flex flex-col items-center justify-center min-w-[240px]">
            <div className="flex items-center gap-1.5 text-xs font-heading font-bold text-rose-600 mb-2">
              <Clock className="w-4 h-4 animate-spin text-rose-500" />
              <span>{timeLeft.isEnded ? 'Promo Telah Berakhir' : 'Berakhir Dalam:'}</span>
            </div>

            {isMounted && timeLeft.isEnded ? (
              <span className="text-xs font-heading font-bold text-slate-400 py-1">
                Nantikan Flash Sale Selanjutnya!
              </span>
            ) : (
              <div className="flex items-center gap-2 font-mono text-white text-base sm:text-xl font-black">
                <div className="flex flex-col items-center">
                  <span className="bg-[#D96B00] px-3 py-1.5 rounded-xl border border-[#B85700] shadow-xs">
                    {isMounted ? timeLeft.hours : '00'}
                  </span>
                  <span className="text-[10px] font-body text-slate-500 font-bold mt-1">Jam</span>
                </div>
                <span className="text-slate-700 -mt-4">:</span>
                <div className="flex flex-col items-center">
                  <span className="bg-[#D96B00] px-3 py-1.5 rounded-xl border border-[#B85700] shadow-xs">
                    {isMounted ? timeLeft.minutes : '00'}
                  </span>
                  <span className="text-[10px] font-body text-slate-500 font-bold mt-1">Menit</span>
                </div>
                <span className="text-slate-700 -mt-4">:</span>
                <div className="flex flex-col items-center">
                  <span className="bg-rose-500 px-3 py-1.5 rounded-xl border border-rose-600 shadow-xs animate-pulse">
                    {isMounted ? timeLeft.seconds : '00'}
                  </span>
                  <span className="text-[10px] font-body text-slate-500 font-bold mt-1">Detik</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FF9F43]" />
            <h2 className="text-lg sm:text-xl font-heading font-black text-slate-800">
              Daftar Produk Flash Sale ({products.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 font-heading font-bold animate-pulse">
            Memuat produk flash sale...
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border-2 border-[#FFE8D6] space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#FFF2E5] text-[#FF9F43] mx-auto flex items-center justify-center text-2xl">
              ⚡
            </div>
            <h3 className="text-base sm:text-lg font-heading font-bold text-slate-800">
              Belum Ada Produk Flash Sale Aktif
            </h3>
            <p className="text-xs sm:text-sm font-body text-slate-500 max-w-md mx-auto">
              Saat ini belum ada produk yang masuk ke dalam periode flash sale. Silakan jelajahi katalog produk lainnya.
            </p>
            <div className="pt-2">
              <Link
                href="/katalog"
                className="clay-btn-orange text-white text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Lihat Seluruh Katalog</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
