'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  RotateCcw,
  Sparkles,
  Baby,
  Shirt,
  Gamepad2,
  Check,
  Star,
} from 'lucide-react';
import { Product } from '@/types/product';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/data/mock-products';
import { ProductCard } from '@/components/product/ProductCard';
import { formatRupiah } from '@/lib/format';

type SortOption = 'rekomendasi' | 'terpopuler' | 'terbaru' | 'harga-asc' | 'harga-desc' | 'rating';

export function CatalogView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL query params initialization
  const initialCategory = searchParams.get('kategori') || 'semua';
  const initialQuery = searchParams.get('q') || '';
  const initialSort = (searchParams.get('sort') as SortOption) || 'rekomendasi';

  // Component state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSort, setSelectedSort] = useState<SortOption>(initialSort);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      // 1. Search Query Filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = product.nama.toLowerCase().includes(q);
        const matchDesc = product.deskripsi.toLowerCase().includes(q);
        const matchCategory = product.kategoriLabel.toLowerCase().includes(q);
        const matchBahan = product.bahan?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCategory && !matchBahan) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'semua') {
        if (product.kategori !== selectedCategory) {
          return false;
        }
      }

      // 3. Price Filter
      if (minPrice !== '' && product.harga < minPrice) {
        return false;
      }
      if (maxPrice !== '' && product.harga > maxPrice) {
        return false;
      }

      // 4. Rating Filter
      if (minRating > 0 && product.rating < minRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (selectedSort) {
        case 'terpopuler':
          return b.terjual - a.terjual;
        case 'terbaru':
          return (b.isTerbaru ? 1 : 0) - (a.isTerbaru ? 1 : 0);
        case 'harga-asc':
          return a.harga - b.harga;
        case 'harga-desc':
          return b.harga - a.harga;
        case 'rating':
          return b.rating - a.rating;
        case 'rekomendasi':
        default:
          return (b.isRekomendasi ? 1 : 0) - (a.isRekomendasi ? 1 : 0);
      }
    });
  }, [searchQuery, selectedCategory, selectedSort, minPrice, maxPrice, minRating]);

  // Reset all filters
  const handleResetFilter = () => {
    setSearchQuery('');
    setSelectedCategory('semua');
    setSelectedSort('rekomendasi');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'semua' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    minRating > 0;

  return (
    <div className="py-4">
      {/* Header & Search Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-rose-100 shadow-xs mb-8">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full inline-block mb-2">
            Katalog Lengkap Toko
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-2">
            Cari & Saring Kebutuhan Anak 🛍️
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed">
            Temukan ribuan produk perlengkapan, baju modis, dan mainan edukasi terpercaya untuk buah hati tercinta dengan mudah.
          </p>

          {/* Search Input Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik nama produk, misal: stroller, piyama, botol susu, balok kayu..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-rose-200 bg-rose-50/20 text-sm focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-100 transition-all text-slate-800 placeholder-slate-400"
            />
            <Search className="w-5 h-5 text-rose-500 absolute left-4 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick category badges */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-medium text-slate-500 shrink-0">Kategori Cepat:</span>
          <button
            onClick={() => setSelectedCategory('semua')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'semua'
                ? 'bg-rose-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({MOCK_PRODUCTS.length})
          </button>
          {MOCK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedCategory === cat.slug
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.slug === 'perlengkapan' && <Baby className="w-3.5 h-3.5" />}
              {cat.slug === 'pakaian' && <Shirt className="w-3.5 h-3.5" />}
              {cat.slug === 'mainan' && <Gamepad2 className="w-3.5 h-3.5" />}
              <span>{cat.nama.split('&')[0].trim()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Sidebar Filter + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Sidebar Filter */}
        <div className="hidden lg:block lg:col-span-1 space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <SlidersHorizontal className="w-4 h-4 text-rose-500" />
                <span>Filter & Saring</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilter}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Kategori Filter */}
            <div className="mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                Kategori Produk
              </h4>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === 'semua'}
                    onChange={() => setSelectedCategory('semua')}
                    className="accent-rose-500"
                  />
                  <span className={selectedCategory === 'semua' ? 'font-bold text-rose-600' : 'text-slate-600'}>
                    Semua Kategori
                  </span>
                </label>
                {MOCK_CATEGORIES.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat.slug}
                      onChange={() => setSelectedCategory(cat.slug)}
                      className="accent-rose-500"
                    />
                    <span className={selectedCategory === cat.slug ? 'font-bold text-rose-600' : 'text-slate-600'}>
                      {cat.nama}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rentang Harga */}
            <div className="mb-5 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                Rentang Harga (Rp)
              </h4>
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Harga Minimum</label>
                  <input
                    type="number"
                    placeholder="Rp 0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Harga Maksimum</label>
                  <input
                    type="number"
                    placeholder="Rp 1.000.000+"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200"
                  />
                </div>
              </div>
            </div>

            {/* Rating Bintang */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                Rating Minimal
              </h4>
              <div className="space-y-1.5 text-xs">
                {[0, 4.5, 4.8].map((ratingVal) => (
                  <button
                    key={ratingVal}
                    type="button"
                    onClick={() => setMinRating(ratingVal)}
                    className={`w-full text-left p-1.5 rounded-lg flex items-center justify-between transition-colors ${
                      minRating === ratingVal ? 'bg-rose-50 text-rose-600 font-bold' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {ratingVal === 0 ? (
                        <span>Semua Rating</span>
                      ) : (
                        <>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{ratingVal} ke atas</span>
                        </>
                      )}
                    </div>
                    {minRating === ratingVal && <Check className="w-3.5 h-3.5 text-rose-500" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {/* Top Bar: Results Count & Sort Dropdown */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="lg:hidden px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1.5 border border-rose-200"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filter</span>
              </button>

              <p className="text-xs sm:text-sm text-slate-600">
                Menampilkan <span className="font-bold text-slate-800">{filteredProducts.length}</span> produk
                {selectedCategory !== 'semua' && (
                  <span> dalam <span className="font-semibold text-rose-600">{selectedCategory}</span></span>
                )}
                {searchQuery && (
                  <span> untuk &ldquo;<span className="font-semibold text-rose-600">{searchQuery}</span>&rdquo;</span>
                )}
              </p>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Urutkan:
              </span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as SortOption)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:border-rose-500"
              >
                <option value="rekomendasi">Rekomendasi Ahli</option>
                <option value="terpopuler">Paling Banyak Dibeli</option>
                <option value="terbaru">Koleksi Terbaru</option>
                <option value="harga-asc">Harga: Termurah ke Termahal</option>
                <option value="harga-desc">Harga: Termahal ke Termurah</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
            </div>
          </div>

          {/* Mobile Filter Sheet */}
          {isMobileFilterOpen && (
            <div className="lg:hidden bg-white p-5 rounded-2xl border border-rose-200 shadow-md mb-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-800">Filter Pencarian</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="text-slate-400 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-xl"
                >
                  <option value="semua">Semua Kategori</option>
                  {MOCK_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.nama}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Harga Min (Rp)</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Harga Max (Rp)</label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xs p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold"
                >
                  Terapkan Filter
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilter}
                    className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Grid Products */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-xs">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                Tidak ada produk yang cocok
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
                Coba ubah kata kunci pencarian, sesuaikan filter harga, atau reset filter untuk melihat semua koleksi toko.
              </p>
              <button
                onClick={handleResetFilter}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Tampilkan Semua Produk
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
