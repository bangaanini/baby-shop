'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Globe, Sparkles, ExternalLink, CheckCircle2, Copy, AlertCircle } from 'lucide-react';

interface SeoSettingsTabProps {
  metaTitle: string;
  setMetaTitle: (val: string) => void;
  metaDescription: string;
  setMetaDescription: (val: string) => void;
  keywords: string;
  setKeywords: (val: string) => void;
  googleVerification: string;
  setGoogleVerification: (val: string) => void;
  ogImage: string;
  setOgImage: (val: string) => void;
  onChange: () => void;
}

export function SeoSettingsTab({
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  keywords,
  setKeywords,
  googleVerification,
  setGoogleVerification,
  ogImage,
  setOgImage,
  onChange,
}: SeoSettingsTabProps) {
  const displayTitle = metaTitle || 'NBusiness — Toko Kebutuhan Anak & Perlengkapan Terlengkap';
  const displayDesc =
    metaDescription ||
    'Beli perlengkapan bayi, baju anak modis, dan mainan edukatif terpercaya dengan pengiriman cepat ke seluruh Indonesia di NBusiness.';
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nbusiness.id';

  const titleLength = metaTitle.length;
  const descLength = metaDescription.length;

  return (
    <div className="space-y-6">
      {/* 1. Google Search Live Snippet Preview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Pratinjau Hasil Pencarian Google (SERP Preview)
              </h2>
              <p className="text-xs text-slate-500">
                Simulasi tampilan toko online Anda saat ditemukan oleh calon pembeli di Google Search
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </span>
        </div>

        {/* Google Snippet Box */}
        <div className="p-5 bg-slate-50/70 border border-slate-200 rounded-2xl max-w-2xl font-sans space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
              N
            </div>
            <span className="font-medium text-slate-800">NBusiness</span>
            <span className="text-slate-400">›</span>
            <span className="text-slate-500 text-[11px] truncate">{currentUrl}</span>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-blue-800 hover:underline cursor-pointer line-clamp-1 leading-snug">
            {displayTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {displayDesc}
          </p>
        </div>
      </div>

      {/* 2. SEO & Meta Tags Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Globe className="w-5 h-5 text-rose-500" />
            <span>Konfigurasi Tag Meta & Mesin Telusur</span>
          </h2>
          <p className="text-xs text-slate-500">
            Sesuaikan judul, deskripsi, dan kata kunci agar website mudah diindeks oleh bot Google
          </p>
        </div>

        <div className="space-y-4">
          {/* Meta Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Judul Halaman (Meta Title) <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-[11px] font-semibold ${
                  titleLength >= 50 && titleLength <= 65
                    ? 'text-emerald-600'
                    : titleLength > 65
                    ? 'text-amber-600'
                    : 'text-slate-400'
                }`}
              >
                {titleLength} / 60 karakter (Rekomendasi: 50-60)
              </span>
            </div>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => {
                setMetaTitle(e.target.value);
                onChange();
              }}
              placeholder="Contoh: NBusiness — Toko Kebutuhan Anak & Perlengkapan Terlengkap"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 font-medium text-slate-800"
            />
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Deskripsi Snippet (Meta Description) <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-[11px] font-semibold ${
                  descLength >= 140 && descLength <= 165
                    ? 'text-emerald-600'
                    : descLength > 165
                    ? 'text-amber-600'
                    : 'text-slate-400'
                }`}
              >
                {descLength} / 160 karakter (Rekomendasi: 140-160)
              </span>
            </div>
            <textarea
              rows={3}
              value={metaDescription}
              onChange={(e) => {
                setMetaDescription(e.target.value);
                onChange();
              }}
              placeholder="Jelaskan secara ringkas keunggulan toko Anda, produk yang dijual, serta promo menarik untuk menarik klik dari pencarian Google..."
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 leading-relaxed text-slate-800"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Kata Kunci Google (Meta Keywords)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => {
                setKeywords(e.target.value);
                onChange();
              }}
              placeholder="nbusiness, toko anak, perlengkapan bayi, pakaian anak, mainan edukasi, belanja anak online"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-800"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Pisahkan antar kata kunci menggunakan tanda koma (,)
            </span>
          </div>

          {/* Google Search Console Verification */}
          <div className="pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Kode Verifikasi Google Search Console (<code className="font-mono text-rose-600">google-site-verification</code>)
            </label>
            <input
              type="text"
              value={googleVerification}
              onChange={(e) => {
                setGoogleVerification(e.target.value);
                onChange();
              }}
              placeholder="Contoh token: 4aBcdEfGhIjKlMnOpQrStUvWxYz1234567890"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 font-mono text-slate-800"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Dapatkan kode ini dari Google Search Console (Metode HTML Tag) agar website resmi Anda cepat terverifikasi.
            </span>
          </div>

          {/* Open Graph Image */}
          <div className="pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              URL Foto Pratinjau Media Sosial (Open Graph Image)
            </label>
            <input
              type="text"
              value={ogImage}
              onChange={(e) => {
                setOgImage(e.target.value);
                onChange();
              }}
              placeholder="https://images.unsplash.com/... atau URL banner promosi NBusiness"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-slate-800"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Foto ini akan otomatis muncul saat link website NBusiness dibagikan di WhatsApp, Telegram, Facebook, atau Twitter.
            </span>
          </div>
        </div>
      </div>

      {/* 3. Crawling & Sitemap Verification Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-800">
              Peta Situs (Sitemap.xml) & Aturan Bot (Robots.txt) Otomatis
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            Active Auto-Generator
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Next.js App Router secara dinamis menghasilkan peta situs XML yang memperbarui seluruh URL produk, kategori, dan beranda untuk diindeks oleh bot perayap Googlebot.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🗺️</span>
              <div>
                <span className="font-bold text-xs text-slate-800 block group-hover:text-rose-600 transition-colors">
                  Lihat Sitemap XML
                </span>
                <span className="text-[11px] text-slate-400 font-mono">/sitemap.xml</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
          </a>

          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🤖</span>
              <div>
                <span className="font-bold text-xs text-slate-800 block group-hover:text-rose-600 transition-colors">
                  Lihat Aturan Robots.txt
                </span>
                <span className="text-[11px] text-slate-400 font-mono">/robots.txt</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
          </a>
        </div>
      </div>
    </div>
  );
}
