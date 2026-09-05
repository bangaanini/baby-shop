'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Loader2,
} from 'lucide-react';
import { Product, CategoryItem } from '@/types/product';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/data/mock-products';
import { ProductCard } from '@/components/product/ProductCard';
import { mapDbProductToProduct, mapDbCategoryToCategoryItem } from '@/lib/mappers';

type SortOption = 'rekomendasi' | 'terpopuler' | 'terbaru' | 'harga-asc' | 'harga-desc' | 'rating';

interface CatalogViewProps {
  initialCategory?: string;
}

export function CatalogView({ initialCategory: initialCategoryProp }: CatalogViewProps = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL query params initialization
  const initialCategory = initialCategoryProp || searchParams.get('kategori') || 'semua';
  const initialQuery = searchParams.get('q') || '';
  const initialSort = (searchParams.get('sort') as SortOption) || 'rekomendasi';

  // Categories & Products state
  const [categories, setCategories] = useState<CategoryItem[]>(MOCK_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [totalCount, setTotalCount] = useState<number>(MOCK_PRODUCTS.length);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search state
  const [searchInput, setSearchInput] = useState<string>(initialQuery);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSort, setSelectedSort] = useState<SortOption>(initialSort);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Keep URL parameters in sync when initial values change
  useEffect(() => {
    const cat = searchParams.get('kategori');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('q');
    if (q) {
      setSearchInput(q);
      setDebouncedSearchQuery(q);
    }
    const sort = searchParams.get('sort') as SortOption;
    if (sort) setSelectedSort(sort);
  }, [searchParams]);

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchInput);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch Categories on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCategories(json.data.map(mapDbCategoryToCategoryItem));
        }
      } catch (err) {
        console.error('Failed to fetch categories from API:', err);
      }
    }
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Products dynamically based on filters
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchQuery.trim()) {
        params.set('q', debouncedSearchQuery.trim());
      }
      if (selectedCategory && selectedCategory !== 'semua') {
        params.set('kategori', selectedCategory);
      }
      if (selectedSort) {
        params.set('sort', selectedSort);
      }
      if (minPrice !== '') {
        params.set('minPrice', String(minPrice));
      }
      if (maxPrice !== '') {
        params.set('maxPrice', String(maxPrice));
      }
      if (minRating > 0) {
        params.set('minRating', String(minRating));
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const fetchedItems: Product[] = Array.isArray(json.data.items)
            ? json.data.items.map(mapDbProductToProduct)
            : [];
          setProducts(fetchedItems);
          setTotalCount(json.data.pagination?.total || fetchedItems.length);
          return;
        }
      }
      // Fallback filtering client-side
      const filteredMock = MOCK_PRODUCTS.filter((product) => {
        if (debouncedSearchQuery.trim()) {
          const q = debouncedSearchQuery.toLowerCase();
          const matchName = product.nama.toLowerCase().includes(q);
          const matchDesc = product.deskripsi.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }
        if (selectedCategory !== 'semua' && product.kategori !== selectedCategory) {
          return false;
        }
        if (minPrice !== '' && product.harga < minPrice) return false;
        if (maxPrice !== '' && product.harga > maxPrice) return false;
        if (minRating > 0 && product.rating < minRating) return false;
        return true;
      });
      setProducts(filteredMock);
      setTotalCount(filteredMock.length);
    } catch (err: any) {
      console.warn('Error fetching products from API, falling back to local dataset:', err);
      const filteredMock = MOCK_PRODUCTS.filter((product) => {
        if (debouncedSearchQuery.trim()) {
          const q = debouncedSearchQuery.toLowerCase();
          const matchName = product.nama.toLowerCase().includes(q);
          const matchDesc = product.deskripsi.toLowerCase().includes(q);
          if (!matchName && !matchDesc) return false;
        }
        if (selectedCategory !== 'semua' && product.kategori !== selectedCategory) {
          return false;
        }
        if (minPrice !== '' && product.harga < minPrice) return false;
        if (maxPrice !== '' && product.harga > maxPrice) return false;
        if (minRating > 0 && product.rating < minRating) return false;
        return true;
      });
      setProducts(filteredMock);
      setTotalCount(filteredMock.length);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, selectedCategory, selectedSort, minPrice, maxPrice, minRating]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset all filters
  const handleResetFilter = () => {
    setSearchInput('');
    setDebouncedSearchQuery('');
    setSelectedCategory('semua');
    setSelectedSort('rekomendasi');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    router.push('/katalog');
  };

  const hasActiveFilters =
    debouncedSearchQuery !== '' ||
    selectedCategory !== 'semua' ||
    selectedSort !== 'rekomendasi' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    minRating > 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb - Clay Block Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFE8D6] shadow-[0_10px_24px_-4px_rgba(255,159,67,0.12),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-3px_6px_rgba(255,159,67,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#D96B00] mb-1.5">
            <span>Beranda</span>
            <span>/</span>
            <span className="text-slate-500">Katalog Produk</span>
            {selectedCategory !== 'semua' && (
              <>
                <span>/</span>
                <span className="text-[#FF9F43] capitalize">{selectedCategory}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-800 tracking-tight">
            Katalog Kebutuhan Si Kecil 👶
          </h1>
          <p className="text-xs sm:text-sm font-body font-medium text-slate-500 mt-0.5">
            Menampilkan {totalCount} produk berkualitas terstandar SNI untuk buah hati
          </p>
        </div>

        {/* Quick Category Pills with Clay Badge */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('semua')}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-heading font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'semua'
                ? 'clay-btn-orange text-white'
                : 'bg-white text-slate-700 border-2 border-[#FFE8D6] hover:border-[#FF9F43]'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-heading font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.slug
                  ? 'clay-btn-orange text-white'
                  : 'bg-white text-slate-700 border-2 border-[#FFE8D6] hover:border-[#FF9F43]'
              }`}
            >
              {cat.nama}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Sidebar Filter + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Sidebar Filter - Clay Card */}
        <div className="hidden lg:block lg:col-span-1 space-y-5">
          <div className="bg-white rounded-3xl p-5 border-2 border-[#FFE8D6] shadow-[0_8px_20px_-4px_rgba(255,159,67,0.1),inset_0_2px_4px_rgba(255,255,255,0.9)]">
            <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#FFE8D6] mb-4">
              <div className="flex items-center gap-2 font-heading font-black text-sm text-slate-800">
                <SlidersHorizontal className="w-4 h-4 text-[#FF9F43]" />
                <span>Filter & Saring</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilter}
                  className="text-xs font-heading font-bold text-[#D96B00] hover:text-[#FF9F43] flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Kategori Filter */}
            <div className="mb-5">
              <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#D96B00] mb-2.5">
                Kategori Produk
              </h4>
              <div className="space-y-1.5 text-xs font-body font-semibold">
                <label className="flex items-center gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-[#FFF2E5] transition-colors">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === 'semua'}
                    onChange={() => setSelectedCategory('semua')}
                    className="accent-[#FF9F43] w-4 h-4"
                  />
                  <span className={selectedCategory === 'semua' ? 'font-heading font-bold text-[#D96B00]' : 'text-slate-600'}>
                    Semua Kategori
                  </span>
                </label>
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-[#FFF2E5] transition-colors">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat.slug}
                      onChange={() => setSelectedCategory(cat.slug)}
                      className="accent-[#FF9F43] w-4 h-4"
                    />
                    <span className={selectedCategory === cat.slug ? 'font-heading font-bold text-[#D96B00]' : 'text-slate-600'}>
                      {cat.nama}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rentang Harga Filter */}
            <div className="mb-5 pt-4 border-t-2 border-[#FFE8D6]">
              <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#D96B00] mb-2.5">
                Rentang Harga (Rp)
              </h4>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Harga Minimum"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs font-body font-medium p-2.5 rounded-xl border-2 border-[#FFE8D6] focus:outline-none focus:border-[#FF9F43] bg-white text-slate-800"
                />
                <input
                  type="number"
                  placeholder="Harga Maksimum"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs font-body font-medium p-2.5 rounded-xl border-2 border-[#FFE8D6] focus:outline-none focus:border-[#FF9F43] bg-white text-slate-800"
                />
              </div>
            </div>

            {/* Rating Bintang Filter */}
            <div className="pt-4 border-t-2 border-[#FFE8D6]">
              <h4 className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#D96B00] mb-2.5">
                Rating Penilaian
              </h4>
              <div className="space-y-1.5 text-xs font-body font-semibold">
                {[0, 4.5, 4.0, 3.5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setMinRating(rating)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                      minRating === rating ? 'bg-[#FFF2E5] text-[#D96B00] font-heading font-bold' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Star className={`w-3.5 h-3.5 ${rating > 0 ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      <span>{rating === 0 ? 'Semua Penilaian' : `${rating.toFixed(1)} ke atas`}</span>
                    </div>
                    {minRating === rating && <Check className="w-3.5 h-3.5 text-[#FF9F43]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid & Controls */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Control Bar: Search Filter Toggle & Sort Dropdown */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border-2 border-[#FFE8D6] shadow-[0_4px_12px_rgba(255,159,67,0.08)] flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="w-full sm:w-auto lg:hidden clay-btn-orange px-4 py-2 text-xs text-white flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter ({hasActiveFilters ? 'Aktif' : 'Semua'})</span>
            </button>

            <div className="hidden sm:block">
              <p className="text-xs font-heading font-bold text-slate-600">
                Menampilkan <span className="text-[#D96B00] font-black">{products.length}</span> dari {totalCount} produk
              </p>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs font-heading font-bold text-slate-500 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#FF9F43]" />
                Urutkan:
              </span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as SortOption)}
                className="text-xs font-heading font-bold bg-[#FFF8F0] border-2 border-[#FFE8D6] rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:border-[#FF9F43] cursor-pointer"
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
            <div className="lg:hidden bg-white p-5 rounded-3xl border-2 border-[#FFD4B2] shadow-lg mb-6 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b-2 border-[#FFE8D6]">
                <h3 className="font-heading font-black text-sm text-slate-800">Filter Pencarian</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="text-slate-400 p-1 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-heading font-bold text-slate-700 block mb-1">Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs font-body p-2.5 border-2 border-[#FFE8D6] rounded-xl bg-[#FFF8F0]"
                >
                  <option value="semua">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.nama}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-heading font-bold text-slate-700 block mb-1">Harga Min (Rp)</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xs font-body p-2 border-2 border-[#FFE8D6] rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-heading font-bold text-slate-700 block mb-1">Harga Max (Rp)</label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xs font-body p-2 border-2 border-[#FFE8D6] rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-2.5 clay-btn-orange text-white rounded-xl text-xs font-heading font-bold"
                >
                  Terapkan Filter
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilter}
                    className="px-3.5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-heading font-bold"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Loading Skeleton / Spinner State */}
          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-10 gap-3 text-[#FF9F43] font-heading font-bold text-sm">
                <Loader2 className="w-6 h-6 animate-spin text-[#FF9F43]" />
                <span>Memuat koleksi produk terbaik...</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-5">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="bg-white rounded-3xl border-2 border-[#FFE8D6] p-4 animate-pulse">
                    <div className="aspect-square bg-[#FFF8F0] rounded-2xl mb-3" />
                    <div className="h-4 bg-[#FFE8D6] rounded-md w-3/4 mb-2" />
                    <div className="h-3 bg-[#FFE8D6] rounded-md w-1/2 mb-4" />
                    <div className="h-6 bg-[#FFF2E5] rounded-xl w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border-2 border-[#FFE8D6] shadow-[0_8px_20px_rgba(255,159,67,0.1)]">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="text-base sm:text-lg font-heading font-black text-slate-800 mb-1">
                Tidak ada produk yang cocok
              </h3>
              <p className="text-xs sm:text-sm font-body font-medium text-slate-500 max-w-md mx-auto mb-6">
                Coba ubah kata kunci pencarian, sesuaikan rentang harga, atau reset filter untuk melihat semua koleksi toko kami.
              </p>
              <button
                onClick={handleResetFilter}
                className="clay-btn-orange px-5 py-2.5 text-xs text-white"
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
