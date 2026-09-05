'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Zap,
  ZapOff,
  Save,
  Plus,
  Search,
  Trash2,
  Clock,
  Calendar,
  TrendingUp,
  Tag,
  Package,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  Percent,
  ChevronRight,
  ExternalLink,
  Edit3,
  RefreshCw,
  ShoppingBag,
  ArrowUpDown,
  Check,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price?: number | null;
  stock: number;
  image_url: string;
  is_flash_sale: boolean;
  flash_sale_price?: number | null;
  category?: CategoryInfo | null;
  category_id?: string | null;
  sold_count?: number;
}

interface FlashSaleSettings {
  flash_sale_is_active?: boolean;
  flash_sale_title?: string;
  flash_sale_end_time?: string | Date | null;
}

function dateToDatetimeLocal(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function AdminFlashSalePage() {
  // Main Data States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<ProductItem[]>([]);

  // Settings State
  const [isActive, setIsActive] = useState<boolean>(false);
  const [eventTitle, setEventTitle] = useState<string>('Promo Hemat Rutin');
  const [endTime, setEndTime] = useState<string>('');
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);

  // Table & Inline Editing State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingPrices, setEditingPrices] = useState<Record<string, number | ''>>({});
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [removingProductId, setRemovingProductId] = useState<string | null>(null);

  // Modal State for Adding Products
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalSearch, setModalSearch] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [modalPrice, setModalPrice] = useState<number | ''>('');
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Fetch all Flash Sale data
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch('/api/admin/flash-sale');
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memuat data Flash Sale');
      }

      const { settings, flashSaleProducts: fsProducts, allProducts: prods } = json.data;

      // Set Settings
      if (settings) {
        setIsActive(Boolean(settings.flash_sale_is_active));
        setEventTitle(settings.flash_sale_title || 'Promo Hemat Rutin');
        setEndTime(dateToDatetimeLocal(settings.flash_sale_end_time));
      }

      // Set Products
      const normalizedFs = Array.isArray(fsProducts) ? fsProducts : [];
      const normalizedAll = Array.isArray(prods) ? prods : [];

      setFlashSaleProducts(normalizedFs);
      setAllProducts(normalizedAll);

      // Initialize inline editing prices map
      const initialPrices: Record<string, number | ''> = {};
      normalizedFs.forEach((p: ProductItem) => {
        initialPrices[p.id] = p.flash_sale_price ?? Math.round(p.price * 0.8);
      });
      setEditingPrices(initialPrices);
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save Settings
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);

    try {
      const payload = {
        isActive,
        title: eventTitle.trim() || 'Promo Hemat Rutin',
        endTime: endTime ? new Date(endTime).toISOString() : null,
      };

      const res = await fetch('/api/admin/flash-sale/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan pengaturan Flash Sale');
      }

      showToast('Pengaturan Flash Sale berhasil disimpan!');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan pengaturan', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Quick Preset Handlers for Datetime
  const setQuickDeadline = (hoursFromNow: number) => {
    const target = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
    setEndTime(dateToDatetimeLocal(target));
  };

  // Update Single Product Flash Sale Price
  const handleSaveProductPrice = async (product: ProductItem) => {
    const rawPrice = editingPrices[product.id];
    const newPrice = Number(rawPrice);

    if (isNaN(newPrice) || newPrice <= 0) {
      showToast('Harga Flash Sale harus berupa angka lebih dari 0', 'error');
      return;
    }

    if (newPrice >= product.price) {
      showToast('Harga Flash Sale harus lebih rendah dari harga normal produk', 'error');
      return;
    }

    setSavingProductId(product.id);
    try {
      const res = await fetch('/api/admin/flash-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          isFlashSale: true,
          flashSalePrice: newPrice,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memperbarui harga Flash Sale');
      }

      showToast(`Harga Flash Sale "${product.name}" berhasil diperbarui!`);
      // Update local state
      setFlashSaleProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, flash_sale_price: newPrice } : p))
      );
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui harga Flash Sale', 'error');
    } finally {
      setSavingProductId(null);
    }
  };

  // Remove Product from Flash Sale
  const handleRemoveFromFlashSale = async (product: ProductItem) => {
    if (!confirm(`Keluarkan "${product.name}" dari Flash Sale?`)) {
      return;
    }

    setRemovingProductId(product.id);
    try {
      const res = await fetch('/api/admin/flash-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          isFlashSale: false,
          flashSalePrice: null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghapus produk dari Flash Sale');
      }

      showToast(`"${product.name}" telah dikeluarkan dari Flash Sale.`);
      // Update local lists
      setFlashSaleProducts((prev) => prev.filter((p) => p.id !== product.id));
      setAllProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_flash_sale: false, flash_sale_price: null } : p))
      );
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus produk', 'error');
    } finally {
      setRemovingProductId(null);
    }
  };

  // Add Selected Product to Flash Sale
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      showToast('Pilih produk terlebih dahulu', 'error');
      return;
    }

    const priceNum = Number(modalPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Masukkan harga Flash Sale yang valid', 'error');
      return;
    }

    if (priceNum >= selectedProduct.price) {
      showToast('Harga Flash Sale harus lebih rendah dari harga normal', 'error');
      return;
    }

    setIsAddingProduct(true);
    try {
      const res = await fetch('/api/admin/flash-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          isFlashSale: true,
          flashSalePrice: priceNum,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menambahkan produk ke Flash Sale');
      }

      showToast(`"${selectedProduct.name}" berhasil ditambahkan ke Flash Sale!`);

      // Update local states
      const updatedItem: ProductItem = {
        ...selectedProduct,
        is_flash_sale: true,
        flash_sale_price: priceNum,
      };

      setFlashSaleProducts((prev) => [updatedItem, ...prev.filter((p) => p.id !== selectedProduct.id)]);
      setAllProducts((prev) =>
        prev.map((p) => (p.id === selectedProduct.id ? updatedItem : p))
      );
      setEditingPrices((prev) => ({
        ...prev,
        [selectedProduct.id]: priceNum,
      }));

      // Reset modal
      setIsModalOpen(false);
      setSelectedProduct(null);
      setModalPrice('');
    } catch (err: any) {
      showToast(err.message || 'Gagal menambahkan produk', 'error');
    } finally {
      setIsAddingProduct(false);
    }
  };

  // Filtered Products for Active Table
  const filteredFlashSaleProducts = useMemo(() => {
    if (!searchQuery.trim()) return flashSaleProducts;
    const q = searchQuery.toLowerCase();
    return flashSaleProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [flashSaleProducts, searchQuery]);

  // Candidates for Modal Picker (not currently in Flash Sale)
  const candidateProducts = useMemo(() => {
    const activeIds = new Set(flashSaleProducts.map((p) => p.id));
    const nonFlash = allProducts.filter((p) => !activeIds.has(p.id) && !p.is_flash_sale);

    if (!modalSearch.trim()) return nonFlash;
    const q = modalSearch.toLowerCase();
    return nonFlash.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [allProducts, flashSaleProducts, modalSearch]);

  // Stats Calculations
  const averageDiscount = useMemo(() => {
    if (flashSaleProducts.length === 0) return 0;
    const totalDiscountPct = flashSaleProducts.reduce((acc, p) => {
      const fsPrice = p.flash_sale_price || p.price;
      if (p.price > 0 && fsPrice < p.price) {
        const pct = ((p.price - fsPrice) / p.price) * 100;
        return acc + pct;
      }
      return acc;
    }, 0);
    return Math.round(totalDiscountPct / flashSaleProducts.length);
  }, [flashSaleProducts]);

  // Remaining Time Helper
  const timeStatus = useMemo(() => {
    if (!endTime) {
      return { status: 'unset', text: 'Batas waktu belum diatur' };
    }
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) {
      return { status: 'expired', text: 'Event telah berakhir' };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;

    if (days > 0) {
      return { status: 'active', text: `Sisa ${days} hari ${remHours} jam` };
    }
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { status: 'active', text: `Sisa ${hours} jam ${minutes} menit` };
  }, [endTime]);

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs font-semibold animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === 'error'
              ? 'bg-rose-900 text-rose-100 border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner & Event Controls */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#FF9F43]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 bottom-0 w-64 h-64 bg-[#87CEEB]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Title & Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-black tracking-wide bg-[#FF9F43]/20 text-[#FF9F43] border border-[#FF9F43]/30">
                  <Zap className="w-3.5 h-3.5 fill-[#FF9F43]" />
                  SELLER CENTER FLASH SALE
                </span>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE AKTIF
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-700/60 text-slate-300 border border-slate-600">
                    NON-AKTIF
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white flex items-center gap-2">
                Pusat Pengelolaan Flash Sale ⚡
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-body max-w-2xl">
                Atur jadwal hitung mundur event promo, tentukan produk diskon terbatas, dan pantau performa flash sale toko secara langsung.
              </p>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={loading || refreshing}
              className="self-start sm:self-center px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white rounded-xl text-xs font-heading font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#FF9F43]' : ''}`} />
              <span>Muat Ulang Data</span>
            </button>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Form Settings Grid */}
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Toggle Event Status */}
              <div className="bg-slate-800/60 backdrop-blur-xs p-5 rounded-2xl border border-slate-700/70 flex flex-col justify-between space-y-4">
                <div>
                  <label className="text-xs font-heading font-black text-slate-200 uppercase tracking-wider block mb-1">
                    Status Kampanye
                  </label>
                  <p className="text-xs text-slate-400 font-body">
                    Aktifkan agar banner dan produk flash sale tampil di halaman utama toko.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                  <span className="text-xs font-bold text-slate-300">
                    {isActive ? 'Flash Sale Aktif' : 'Flash Sale Non-Aktif'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isActive ? 'bg-[#FF9F43]' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isActive ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 2. Judul Kampanye Event */}
              <div className="bg-slate-800/60 backdrop-blur-xs p-5 rounded-2xl border border-slate-700/70 flex flex-col justify-between space-y-4">
                <div>
                  <label className="text-xs font-heading font-black text-slate-200 uppercase tracking-wider block mb-1">
                    Judul Event Promo
                  </label>
                  <p className="text-xs text-slate-400 font-body mb-2">
                    Nama promo yang muncul pada banner hitung mundur.
                  </p>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="e.g. Promo Hemat Rutin / Flash Sale Gajian"
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 text-white rounded-xl border border-slate-700 text-xs font-bold focus:outline-none focus:border-[#FF9F43] focus:ring-1 focus:ring-[#FF9F43] transition-all"
                  />
                </div>

                {/* Quick Title Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Promo Hemat Rutin', 'Flash Sale Gajian', 'Super Sale 9.9'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEventTitle(preset)}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/50 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Batas Waktu Countdown (Datetime Picker) */}
              <div className="bg-slate-800/60 backdrop-blur-xs p-5 rounded-2xl border border-slate-700/70 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-heading font-black text-slate-200 uppercase tracking-wider">
                      Target Batas Waktu
                    </label>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        timeStatus.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : timeStatus.status === 'expired'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {timeStatus.text}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-body mb-2">
                    Waktu hitung mundur otomatis selesai.
                  </p>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900/90 text-white rounded-xl border border-slate-700 text-xs font-bold focus:outline-none focus:border-[#FF9F43] focus:ring-1 focus:ring-[#FF9F43] transition-all color-scheme-dark"
                    />
                  </div>
                </div>

                {/* Quick Presets for Datetime */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Tambah:</span>
                  {[
                    { label: '+12 Jam', h: 12 },
                    { label: '+24 Jam', h: 24 },
                    { label: '+3 Hari', h: 72 },
                    { label: '+7 Hari', h: 168 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setQuickDeadline(p.h)}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-700/60 hover:bg-[#FF9F43]/20 hover:text-[#FF9F43] text-slate-300 border border-slate-600/50 hover:border-[#FF9F43]/40 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Settings Action */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-3 bg-gradient-to-r from-[#FF9F43] to-[#EE8A2B] hover:from-[#EE8A2B] hover:to-[#D46B08] active:scale-95 text-white font-heading font-black text-xs rounded-2xl shadow-lg shadow-[#FF9F43]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSavingSettings ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Pengaturan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Pengaturan Flash Sale</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Flash Sale Products */}
        <div className="bg-white p-5 rounded-3xl border-2 border-[#FFE8D6] shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF2E5] text-[#FF9F43] flex items-center justify-center shrink-0 border border-[#FFDFC2]">
            <Zap className="w-6 h-6 fill-[#FF9F43]" />
          </div>
          <div>
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-400">
              Produk Terdaftar
            </span>
            <div className="text-2xl font-heading font-black text-slate-800">
              {loading ? <div className="h-7 w-16 bg-slate-100 rounded-lg animate-pulse" /> : `${flashSaleProducts.length} Produk`}
            </div>
            <span className="text-[11px] text-slate-500 font-body font-medium">
              dari {allProducts.length} katalog toko
            </span>
          </div>
        </div>

        {/* Campaign Status */}
        <div className="bg-white p-5 rounded-3xl border-2 border-[#DDF2FC] shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F0F9FD] text-[#2E86AB] flex items-center justify-center shrink-0 border border-[#BCE4F7]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-400">
              Status Tayang
            </span>
            <div className="text-xl font-heading font-black text-slate-800 flex items-center gap-2">
              {isActive ? (
                <span className="text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Aktif Tayang
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  Non-Aktif
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-body font-medium">
              {isActive ? 'Tampil di etalase beranda' : 'Disembunyikan dari beranda'}
            </span>
          </div>
        </div>

        {/* Countdown Timer Status */}
        <div className="bg-white p-5 rounded-3xl border-2 border-[#FFE8D6] shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF2E5] text-[#FF9F43] flex items-center justify-center shrink-0 border border-[#FFDFC2]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-400">
              Batas Waktu Event
            </span>
            <div className="text-lg font-heading font-black text-slate-800 truncate max-w-[180px]">
              {timeStatus.text}
            </div>
            <span className="text-[11px] text-slate-500 font-body font-medium">
              {endTime ? new Date(endTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Belum diatur'}
            </span>
          </div>
        </div>

        {/* Average Discount */}
        <div className="bg-white p-5 rounded-3xl border-2 border-[#DDF2FC] shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F0F9FD] text-[#2E86AB] flex items-center justify-center shrink-0 border border-[#BCE4F7]">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-400">
              Rata-rata Diskon
            </span>
            <div className="text-2xl font-heading font-black text-slate-800">
              {loading ? <div className="h-7 w-14 bg-slate-100 rounded-lg animate-pulse" /> : `${averageDiscount}%`}
            </div>
            <span className="text-[11px] text-slate-500 font-body font-medium">
              Potongan harga flash sale
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-3xl border-2 border-[#FFE8D6] shadow-md p-6 sm:p-8 space-y-6">
        {/* Section Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-heading font-black text-slate-900 flex items-center gap-2">
              Daftar Produk Flash Sale
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFF2E5] text-[#D96B00] border border-[#FFD4B2] font-black">
                {flashSaleProducts.length} Produk
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-body mt-0.5">
              Edit harga promo khusus flash sale atau keluarkan produk dari kampanye.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk flash sale..."
                className="pl-9 pr-4 py-2 bg-[#FFF8F0]/70 text-slate-800 placeholder:text-slate-400 text-xs font-bold rounded-2xl border border-[#FFE8D6] focus:outline-none focus:border-[#FF9F43] focus:bg-white transition-all w-full sm:w-64"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Add to Flash Sale Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedProduct(null);
                setModalPrice('');
                setModalSearch('');
                setIsModalOpen(true);
              }}
              className="clay-btn-orange text-white px-4 py-2.5 rounded-2xl text-xs font-heading font-black shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk ke Flash Sale</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#FF9F43] animate-spin mx-auto" />
            <p className="text-xs font-heading font-bold text-slate-500">Memuat daftar produk Flash Sale...</p>
          </div>
        ) : filteredFlashSaleProducts.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-[#FFE8D6] rounded-3xl p-8 space-y-4 bg-[#FFF8F0]/30">
            <div className="w-16 h-16 rounded-3xl bg-[#FFF2E5] text-[#FF9F43] flex items-center justify-center mx-auto border border-[#FFDFC2]">
              <ZapOff className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-heading font-black text-slate-800">
                {searchQuery ? 'Produk Tidak Ditemukan' : 'Belum Ada Produk Flash Sale'}
              </h3>
              <p className="text-xs text-slate-500 font-body">
                {searchQuery
                  ? `Tidak ada produk flash sale yang cocok dengan pencarian "${searchQuery}".`
                  : 'Tambahkan produk terbaik toko Anda ke dalam Flash Sale untuk menarik lebih banyak pembeli.'}
              </p>
            </div>
            {!searchQuery && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="clay-btn-orange text-white px-5 py-2.5 rounded-2xl text-xs font-heading font-black shadow-md inline-flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Pilih Produk Sekarang</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#FFE8D6]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF8F0] border-b border-[#FFE8D6] text-[11px] font-heading font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Produk</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Harga Normal</th>
                  <th className="py-3.5 px-4 w-48">Harga Flash Sale</th>
                  <th className="py-3.5 px-4 text-center">Diskon</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFE8D6] text-xs font-body">
                {filteredFlashSaleProducts.map((product) => {
                  const currentPrice = Number(editingPrices[product.id] ?? product.flash_sale_price ?? product.price);
                  const isModified = currentPrice !== (product.flash_sale_price ?? product.price);
                  const discountPct =
                    product.price > 0 && currentPrice < product.price
                      ? Math.round(((product.price - currentPrice) / product.price) * 100)
                      : 0;

                  return (
                    <tr key={product.id} className="hover:bg-[#FFF8F0]/40 transition-colors">
                      {/* Product Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-heading font-black text-slate-800 text-xs sm:text-sm line-clamp-1">
                              {product.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-medium">
                              <span>Stok: {product.stock}</span>
                              <span>•</span>
                              <Link
                                href={`/produk/${product.slug}`}
                                target="_blank"
                                className="text-[#D96B00] hover:underline flex items-center gap-0.5"
                              >
                                <span>Lihat</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-xl text-[11px] font-heading font-bold bg-[#F0F9FD] text-[#2E86AB] border border-[#BCE4F7]">
                          {product.category?.name || 'Umum'}
                        </span>
                      </td>

                      {/* Normal Price */}
                      <td className="py-3.5 px-4 font-heading font-bold text-slate-700">
                        {formatRupiah(product.price)}
                      </td>

                      {/* Flash Sale Price Input */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="relative flex items-center">
                            <span className="absolute left-3 text-xs font-bold text-slate-400">Rp</span>
                            <input
                              type="number"
                              min={0}
                              max={product.price - 1}
                              value={editingPrices[product.id] ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : Number(e.target.value);
                                setEditingPrices((prev) => ({ ...prev, [product.id]: val }));
                              }}
                              className={`w-full pl-9 pr-3 py-1.5 text-xs font-heading font-black rounded-xl border transition-all ${
                                isModified
                                  ? 'border-[#FF9F43] bg-[#FFF2E5] text-[#D96B00] ring-1 ring-[#FF9F43]'
                                  : 'border-slate-300 bg-white text-slate-800 focus:border-[#FF9F43]'
                              }`}
                            />
                          </div>
                          {isModified && (
                            <span className="text-[10px] text-[#D96B00] font-bold block animate-pulse">
                              * Belum disimpan
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Discount Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {discountPct > 0 ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-heading font-black bg-gradient-to-r from-[#FF9F43] to-rose-500 text-white shadow-xs">
                              -{discountPct}%
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                              Hemat {formatRupiah(product.price - currentPrice)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-bold">0%</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isModified && (
                            <button
                              type="button"
                              onClick={() => handleSaveProductPrice(product)}
                              disabled={savingProductId === product.id}
                              className="px-3 py-1.5 bg-[#FF9F43] hover:bg-[#EE8A2B] text-white text-xs font-heading font-black rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Simpan perubahan harga"
                            >
                              {savingProductId === product.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )}
                              <span>Simpan</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveFromFlashSale(product)}
                            disabled={removingProductId === product.id}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                            title="Keluarkan dari Flash Sale"
                          >
                            {removingProductId === product.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Picker Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-[#FFE8D6] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#FFF8F0] to-[#FFF2E5] border-b border-[#FFE8D6] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF9F43] text-white flex items-center justify-center shadow-md shadow-[#FF9F43]/20">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-black text-slate-900">
                    Tambah Produk ke Flash Sale
                  </h3>
                  <p className="text-xs text-slate-500 font-body">
                    Pilih produk dari katalog toko dan tetapkan harga diskon terbatas.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Product Selection List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-heading font-black text-slate-700 uppercase tracking-wider">
                    1. Pilih Produk Katalog ({candidateProducts.length} Tersedia)
                  </label>
                  {selectedProduct && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null);
                        setModalPrice('');
                      }}
                      className="text-[11px] font-bold text-[#D96B00] hover:underline"
                    >
                      Ganti Pilihan
                    </button>
                  )}
                </div>

                {/* Search candidate products */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    placeholder="Ketik nama produk atau kategori..."
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FFF8F0]/80 rounded-2xl border border-[#FFE8D6] text-xs font-bold focus:outline-none focus:border-[#FF9F43] focus:bg-white transition-all"
                  />
                </div>

                {/* Candidate List Container */}
                <div className="max-h-56 overflow-y-auto rounded-2xl border border-[#FFE8D6] divide-y divide-[#FFE8D6]">
                  {candidateProducts.length === 0 ? (
                    <div className="py-8 text-center text-xs font-medium text-slate-400">
                      Tidak ada produk katalog yang tersedia untuk ditambahkan.
                    </div>
                  ) : (
                    candidateProducts.map((p) => {
                      const isSelected = selectedProduct?.id === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedProduct(p);
                            // Default 20% discount preset
                            setModalPrice(Math.round(p.price * 0.8));
                          }}
                          className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#FFF2E5] border-l-4 border-l-[#FF9F43]'
                              : 'hover:bg-[#FFF8F0]/60'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                              {p.image_url ? (
                                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <Package className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-heading font-black text-slate-800 line-clamp-1">
                                {p.name}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                <span className="text-[#2E86AB] font-bold">{p.category?.name || 'Umum'}</span>
                                <span>•</span>
                                <span>Stok: {p.stock}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-heading font-black text-slate-800">
                              {formatRupiah(p.price)}
                            </div>
                            {isSelected && (
                              <span className="text-[10px] font-bold text-[#D96B00] flex items-center gap-0.5 justify-end">
                                <Check className="w-3 h-3" /> Dipilih
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Price Configuration (Visible once product selected) */}
              {selectedProduct && (
                <div className="p-4 rounded-2xl bg-[#FFF8F0] border border-[#FFE8D6] space-y-4 animate-in fade-in duration-150">
                  <label className="text-xs font-heading font-black text-slate-800 uppercase tracking-wider block">
                    2. Tentukan Harga Flash Sale
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Normal Price Reference */}
                    <div className="p-3 bg-white rounded-xl border border-[#FFE8D6]">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Harga Normal
                      </span>
                      <span className="text-base font-heading font-black text-slate-700">
                        {formatRupiah(selectedProduct.price)}
                      </span>
                    </div>

                    {/* Flash Sale Price Input */}
                    <div className="p-3 bg-white rounded-xl border border-[#FFD4B2]">
                      <span className="text-[10px] text-[#D96B00] font-bold uppercase block">
                        Harga Khusus Flash Sale (Rp)
                      </span>
                      <div className="relative mt-1">
                        <input
                          type="number"
                          min={1}
                          max={selectedProduct.price - 1}
                          value={modalPrice}
                          onChange={(e) => {
                            setModalPrice(e.target.value === '' ? '' : Number(e.target.value));
                          }}
                          placeholder="Contoh: 75000"
                          className="w-full px-3 py-1.5 bg-[#FFF2E5] text-slate-900 rounded-lg text-sm font-heading font-black border border-[#FF9F43] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                      Pilihan Cepat Diskon:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[10, 20, 30, 40, 50, 70].map((pct) => {
                        const targetPrice = Math.round(selectedProduct.price * (1 - pct / 100));
                        const isCurrent = Number(modalPrice) === targetPrice;
                        return (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setModalPrice(targetPrice)}
                            className={`px-3 py-1 rounded-xl text-xs font-heading font-bold border transition-colors ${
                              isCurrent
                                ? 'bg-[#FF9F43] text-white border-[#EE8A2B] shadow-xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:border-[#FF9F43] hover:text-[#D96B00]'
                            }`}
                          >
                            Diskon {pct}% ({formatRupiah(targetPrice)})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Calculated Preview Banner */}
                  {Number(modalPrice) > 0 && Number(modalPrice) < selectedProduct.price && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>
                          Hemat {formatRupiah(selectedProduct.price - Number(modalPrice))} (
                          {Math.round(
                            ((selectedProduct.price - Number(modalPrice)) / selectedProduct.price) * 100
                          )}
                          %)
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-lg text-[10px]">
                        Diskon Valid
                      </span>
                    </div>
                  )}

                  {Number(modalPrice) >= selectedProduct.price && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Harga Flash Sale harus lebih murah dari harga normal produk.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-[#FFF8F0] border-t border-[#FFE8D6] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-2xl text-xs font-heading font-bold text-slate-600 hover:bg-white transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleAddProductSubmit}
                disabled={
                  !selectedProduct ||
                  !modalPrice ||
                  Number(modalPrice) <= 0 ||
                  Number(modalPrice) >= (selectedProduct?.price || 0) ||
                  isAddingProduct
                }
                className="clay-btn-orange text-white px-6 py-2.5 rounded-2xl text-xs font-heading font-black shadow-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isAddingProduct ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menambahkan...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Tambahkan ke Flash Sale</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
