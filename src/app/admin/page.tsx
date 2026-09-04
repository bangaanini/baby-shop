'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Store,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  Clock,
  Truck,
  CheckCircle2,
  Package,
  TrendingUp,
  ShoppingBag,
  Star,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  Boxes,
  Layers,
  Settings,
  BarChart3,
  ListOrdered,
  Calendar,
  Eye,
  Loader2,
  Send,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { Order, OrderStatus } from '@/types/order';
import { OrderDetailDrawer } from '@/components/admin/OrderDetailDrawer';

interface DashboardStatsData {
  totalSales: number;
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  totalProducts: number;
  totalStock: number;
  lowStockCount?: number;
  averageRating?: number;
  completedTodayCount?: number;
  recentOrders?: Order[];
}

function SellerCenterDashboardContent() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Recent Orders State
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingRecentOrders, setLoadingRecentOrders] = useState<boolean>(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Order Detail Drawer State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // Toast feedback
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memuat statistik dashboard');
      }
      setStats(data.data);
    } catch (err: any) {
      console.error('Error fetching admin stats:', err);
      setStatsError(err.message || 'Terjadi gangguan saat mengambil data ringkasan');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 2. Fetch 5 Recent Orders
  const fetchRecentOrders = useCallback(async () => {
    setLoadingRecentOrders(true);
    try {
      const res = await fetch('/api/admin/orders?limit=5');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setRecentOrders(data.data);
      }
    } catch (err) {
      console.error('Error fetching recent orders:', err);
    } finally {
      setLoadingRecentOrders(false);
    }
  }, []);

  // Refresh All Data
  const refreshAll = () => {
    fetchStats();
    fetchRecentOrders();
  };

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
  }, [fetchStats, fetchRecentOrders]);

  // Quick process order from menunggu_pembayaran -> diproses
  const handleQuickProcessOrder = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: 'diproses',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses pesanan');
      }

      showToast('Pesanan berhasil diproses!');
      fetchStats();
      fetchRecentOrders();
    } catch (err: any) {
      console.error('Quick process error:', err);
      showToast(err.message || 'Gagal memproses pesanan', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleOpenDrawer = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleOrderUpdatedFromDrawer = (updatedOrder: Order) => {
    setRecentOrders((prev) =>
      prev.map((ord) => (ord.id === updatedOrder.id ? updatedOrder : ord))
    );
    fetchStats();
    showToast(`Pesanan ${updatedOrder.nomorInvoice} berhasil diperbarui.`);
  };

  // Helper values
  const pendingOrdersCount =
    (stats?.ordersByStatus?.menunggu_pembayaran || 0) + (stats?.ordersByStatus?.diproses || 0);
  const perluDiprosesCount = stats?.ordersByStatus?.menunggu_pembayaran || 0;
  const readyToShipCount = stats?.ordersByStatus?.diproses || 0;
  const lowStockCount = stats?.lowStockCount ?? 0;
  const completedTodayCount =
    stats?.completedTodayCount ?? stats?.ordersByStatus?.selesai ?? 0;
  const averageRating = stats?.averageRating ?? 5.0;

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium transition-all transform animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* TOP BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 sm:p-8 text-white shadow-xl shadow-slate-950/10 border border-slate-700/50">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Toko Aktif & Buka
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-medium">
                <Store className="w-3.5 h-3.5 text-rose-400" />
                NBusiness Official Store
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Selamat Datang di Seller Center NBusiness 💼
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pantau pesanan pelanggan, kelola inventaris produk bayi, dan tingkatkan performa penjualan toko Anda dalam satu dasbor terpadu.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            <button
              onClick={refreshAll}
              disabled={isMounted ? (loadingStats || loadingRecentOrders) : false}
              title="Perbarui Data"
              className="p-3 bg-white/10 hover:bg-white/15 active:bg-white/20 text-slate-200 hover:text-white rounded-2xl border border-white/10 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center shadow-xs"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  isMounted && (loadingStats || loadingRecentOrders) ? 'animate-spin text-rose-400' : ''
                }`}
              />
            </button>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white rounded-2xl font-bold text-xs border border-white/10 transition-colors flex items-center gap-2 backdrop-blur-xs shadow-xs"
            >
              <span>Lihat Website Toko</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/admin/produk/tambah"
              className="px-5 py-3 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-rose-500/30 hover:shadow-rose-500/40 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Produk Baru</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ACTION CENTER ("Penting Hari Ini" / Hal yang Perlu Tindakan) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Penting Hari Ini
              <span className="text-xs font-normal text-slate-600">
                (Hal yang Memerlukan Tindakan Cepat)
              </span>
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            Realtime Status
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: 🔴 Pesanan Perlu Diproses */}
          <Link
            href="/admin/pesanan?status=perlu_diproses"
            className="group relative overflow-hidden bg-white p-5 rounded-3xl border border-rose-100 hover:border-rose-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125" />
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/60">
                🔴 Perlu Tindakan
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {loadingStats ? (
                  <div className="h-9 w-16 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  perluDiprosesCount
                )}
              </div>
              <div className="text-sm font-bold text-slate-800 mt-1">
                Pesanan Perlu Diproses
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Menunggu konfirmasi & pengemasan
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-700 group-hover:translate-x-0.5 transition-transform">
              <span>Buka Pesanan</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 2: 🟡 Siap Dikirim / Menunggu Resi */}
          <Link
            href="/admin/pesanan?status=dikirim"
            className="group relative overflow-hidden bg-white p-5 rounded-3xl border border-amber-100 hover:border-amber-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125" />
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                🟡 Menunggu Resi
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {loadingStats ? (
                  <div className="h-9 w-16 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  readyToShipCount
                )}
              </div>
              <div className="text-sm font-bold text-slate-800 mt-1">
                Siap Dikirim / Menunggu Resi
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Kemas paket & masukkan nomor resi
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform">
              <span>Input Resi</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 3: 🟠 Stok Produk Menipis */}
          <Link
            href="/admin/produk"
            className="group relative overflow-hidden bg-white p-5 rounded-3xl border border-orange-100 hover:border-orange-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125" />
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/80 text-orange-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200/60">
                🟠 Perlu Restok
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {loadingStats ? (
                  <div className="h-9 w-16 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  lowStockCount
                )}
              </div>
              <div className="text-sm font-bold text-slate-800 mt-1">
                Stok Produk Menipis
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Produk dengan sisa stok ≤ 5 unit
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-700 group-hover:translate-x-0.5 transition-transform">
              <span>Kelola Stok</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card 4: 🟢 Pesanan Selesai Hari Ini */}
          <Link
            href="/admin/pesanan?status=selesai"
            className="group relative overflow-hidden bg-white p-5 rounded-3xl border border-emerald-100 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125" />
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                🟢 Berhasil
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {loadingStats ? (
                  <div className="h-9 w-16 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  completedTodayCount
                )}
              </div>
              <div className="text-sm font-bold text-slate-800 mt-1">
                Pesanan Selesai Hari Ini
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Barang telah sampai ke pembeli
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
              <span>Lihat Laporan</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </section>

      {/* KPI METRICS ROW */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          Ringkasan Metrik Toko
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: 💰 Total Omzet Toko */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Total Omzet Penjualan</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {loadingStats ? (
                  <div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  formatRupiah(stats?.totalSales || 0)
                )}
              </div>
            </div>
            <div className="mt-3 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Akumulasi dari pesanan sukses</span>
            </div>
          </div>

          {/* KPI 2: 📦 Total Pesanan Masuk */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Total Pesanan Masuk</span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {loadingStats ? (
                  <div className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  `${stats?.totalOrders || 0} Order`
                )}
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-600 font-medium">
              {stats?.ordersByStatus?.selesai || 0} pesanan telah selesai
            </div>
          </div>

          {/* KPI 3: 🛍️ Total Produk Aktif */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Total Produk Aktif</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {loadingStats ? (
                  <div className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  `${stats?.totalProducts || 0} SKU`
                )}
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-600 font-medium flex items-center gap-1">
              <Boxes className="w-3.5 h-3.5 text-slate-400" />
              <span>Total {stats?.totalStock || 0} unit stok tersedia</span>
            </div>
          </div>

          {/* KPI 4: ⭐ Rata-rata Rating Toko */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Rating & Kepuasan</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
                {loadingStats ? (
                  <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  <>
                    <span>{averageRating.toFixed(1)}</span>
                    <span className="text-sm text-slate-400 font-semibold">/ 5.0</span>
                  </>
                )}
              </div>
            </div>
            <div className="mt-3 text-[11px] text-amber-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Performa toko sangat prima</span>
            </div>
          </div>
        </div>
      </section>

      {/* GRID DUA KOLOM: 5 Pesanan Terbaru & Pintasan Cepat Seller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KOLOM KIRI (2/3 Width): 5 Pesanan Terbaru yang Masuk */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                5 Pesanan Terbaru yang Masuk
              </h2>
              <p className="text-xs text-slate-600">
                Pantau dan proses pesanan yang baru masuk secara instan
              </p>
            </div>
            <Link
              href="/admin/pesanan"
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 group"
            >
              <span>Lihat Semua Pesanan</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            {loadingRecentOrders ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                <span className="text-xs font-semibold">Memuat pesanan terbaru...</span>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                  <Package className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">Belum ada pesanan masuk</p>
                <p className="text-xs text-slate-600 max-w-xs">
                  Pesanan baru dari pembeli akan muncul secara realtime di daftar ini.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentOrders.map((ord) => {
                  const invoice = ord.nomorInvoice || ord.id.slice(0, 8);
                  const recipient = ord.namaPenerima || 'Pembeli';
                  const courier = ord.kurir ? `${ord.kurir} (${ord.layananKurir || 'Reguler'})` : 'JNE Reguler';
                  const total = ord.totalBayar || 0;
                  const isUpdating = updatingOrderId === ord.id;
                  const itemsCount = ord.items?.length || 0;
                  const firstItem = ord.items?.[0];

                  return (
                    <div
                      key={ord.id}
                      className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Left: Info Pesanan */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                            {invoice}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              ord.statusColor ||
                              (ord.status === 'selesai'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : ord.status === 'dikirim'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : ord.status === 'diproses'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-orange-50 text-orange-700 border-orange-200')
                            }`}
                          >
                            {ord.statusLabel || ord.status.replace('_', ' ').toUpperCase()}
                          </span>

                          <span className="text-[11px] text-slate-600">
                            {ord.tanggalPesanan || 'Baru saja'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-700">
                          Penerima: <strong className="text-slate-900">{recipient}</strong>{' '}
                          <span className="text-slate-600">• Kurir: {courier}</span>
                        </div>

                        {firstItem && (
                          <p className="text-xs text-slate-600 truncate max-w-md">
                            🛒 {firstItem.nama}{' '}
                            {itemsCount > 1 ? `+ ${itemsCount - 1} produk lainnya` : ''}
                          </p>
                        )}
                      </div>

                      {/* Right: Nominal & Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <span className="font-bold text-sm text-rose-600">
                          {formatRupiah(total)}
                        </span>

                        <div className="flex items-center gap-2">
                          {ord.status === 'menunggu_pembayaran' && (
                            <button
                              onClick={() => handleQuickProcessOrder(ord.id)}
                              disabled={isUpdating}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>Proses</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenDrawer(ord)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Detail</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* KOLOM KANAN (1/3 Width): Pintasan Cepat Seller & Info Toko */}
        <div className="space-y-6">
          {/* Pintasan Cepat Seller */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">
              Pintasan Cepat Seller
            </h2>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 space-y-2">
              {/* Shortcut 1: Tambah Produk Baru */}
              <Link
                href="/admin/produk/tambah"
                className="group flex items-center justify-between p-3 rounded-2xl hover:bg-rose-50/60 border border-transparent hover:border-rose-200/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                      Tambah Produk Baru
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Upload foto, varian & dimensi
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Shortcut 2: Daftar Produk */}
              <Link
                href="/admin/produk"
                className="group flex items-center justify-between p-3 rounded-2xl hover:bg-purple-50/60 border border-transparent hover:border-purple-200/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                      Daftar & Kelola Produk
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Atur stok, promo & harga
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Shortcut 3: Kelola Pesanan */}
              <Link
                href="/admin/pesanan"
                className="group flex items-center justify-between p-3 rounded-2xl hover:bg-sky-50/60 border border-transparent hover:border-sky-200/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      Kelola Pesanan Masuk
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Proses pesanan & cetak resi
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Shortcut 4: Statistik Toko */}
              <Link
                href="/admin/statistik"
                className="group flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50/60 border border-transparent hover:border-emerald-200/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Statistik & Laporan Toko
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Analisis performa & omzet
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Shortcut 5: Pengaturan Toko */}
              <Link
                href="/admin/setting"
                className="group flex items-center justify-between p-3 rounded-2xl hover:bg-amber-50/60 border border-transparent hover:border-amber-200/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      Pengaturan Toko
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Alamat toko, kurir & akun
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          {/* Operational Info Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 border border-slate-700/60 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Informasi Operasional Toko
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start justify-between border-b border-slate-700/50 pb-2">
                <span className="text-slate-400">Jam Operasional:</span>
                <span className="font-semibold text-slate-200 text-right">
                  08:00 - 21:00 WIB
                </span>
              </div>
              <div className="flex items-start justify-between border-b border-slate-700/50 pb-2">
                <span className="text-slate-400">Lokasi Toko:</span>
                <span className="font-semibold text-slate-200 text-right">
                  Jakarta Barat, DKI Jakarta
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400">Kurir Terintegrasi:</span>
                <span className="font-semibold text-rose-300 text-right">
                  JNE, J&T, SiCepat, GoSend
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        isOpen={drawerOpen}
        order={selectedOrder}
        onClose={() => setDrawerOpen(false)}
        onOrderUpdated={handleOrderUpdatedFromDrawer}
      />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          <span className="text-xs font-semibold">Memuat Seller Center Dashboard...</span>
        </div>
      }
    >
      <SellerCenterDashboardContent />
    </Suspense>
  );
}
