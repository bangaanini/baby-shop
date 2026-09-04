'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Tag,
  DollarSign,
  Truck,
  ArrowUpRight,
  Store,
  CheckCircle,
  AlertCircle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ExternalLink,
  ChevronRight,
  Send,
  Boxes,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { ProductTable } from '@/components/admin/ProductTable';

interface DashboardStatsData {
  totalSales: number;
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  totalProducts: number;
  totalStock: number;
  recentOrders: Array<{
    id: string;
    orderNumber?: string;
    nomorInvoice?: string;
    recipientName?: string;
    namaPenerima?: string;
    recipientPhone?: string;
    teleponPenerima?: string;
    shippingAddress?: string;
    alamatLengkap?: string;
    courier?: string;
    kurir?: string;
    courierService?: string;
    layananKurir?: string;
    trackingNumber?: string | null;
    nomorResi?: string | null;
    status: string;
    statusLabel?: string;
    statusColor?: string;
    totalAmount?: number;
    totalBayar?: number;
    createdAt?: string | Date;
    tanggalPesanan?: string;
    items?: Array<any>;
  }>;
}

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');
  const activeTab: 'ringkasan' | 'produk' | 'pesanan' | 'promo' =
    tabParam === 'produk' || tabParam === 'pesanan' || tabParam === 'promo'
      ? tabParam
      : 'ringkasan';

  // Stats state
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Orders list state for Pesanan Tab
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('semua');
  const [resiInput, setResiInput] = useState<{ [orderId: string]: string }>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleTabChange = (tab: 'ringkasan' | 'produk' | 'pesanan' | 'promo') => {
    router.push(`/admin?tab=${tab}`);
  };

  // Fetch Live Dashboard Stats
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

  // Fetch Live Orders for Pesanan Tab
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const params = new URLSearchParams();
      if (orderStatusFilter && orderStatusFilter !== 'semua') {
        params.set('status', orderStatusFilter);
      }
      params.set('limit', '50');

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setOrdersList(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, [orderStatusFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'pesanan') {
      fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  // Order Status Update Handlers
  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: string,
    trackingNumber?: string
  ) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          trackingNumber: trackingNumber || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengubah status pesanan');
      }

      showToast(`Status pesanan berhasil diubah menjadi "${newStatus}".`);
      fetchStats();
      if (activeTab === 'pesanan') {
        fetchOrders();
      }
    } catch (err: any) {
      console.error('Order status update error:', err);
      showToast(err.message || 'Gagal memperbarui pesanan', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleProcessOrder = (orderId: string) => {
    handleUpdateOrderStatus(orderId, 'diproses');
  };

  const handleShipOrder = (orderId: string) => {
    const resi = resiInput[orderId]?.trim() || `EXP-${Date.now().toString().slice(-8)}`;
    handleUpdateOrderStatus(orderId, 'dikirim', resi);
  };

  const handleCompleteOrder = (orderId: string) => {
    handleUpdateOrderStatus(orderId, 'selesai');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border text-xs sm:text-sm font-bold animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Admin Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/20 px-2.5 py-1 rounded-full inline-block mb-2">
              Panel Kontrol Toko
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
              Admin Dashboard BabyKids 📊
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Pantau statistik penjualan live, kelola inventori produk & varian anak, dan proses pengiriman kurir.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors border border-slate-700 cursor-pointer"
            >
              <Store className="w-4 h-4 text-rose-400" />
              <span>Lihat Website Toko</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ringkasan', label: 'Ringkasan Penjualan', icon: TrendingUp },
          {
            id: 'produk',
            label: stats ? `Daftar Produk (${stats.totalProducts})` : 'Daftar Produk',
            icon: ShoppingBag,
          },
          {
            id: 'pesanan',
            label: stats ? `Kelola Pesanan (${stats.totalOrders})` : 'Kelola Pesanan',
            icon: Package,
          },
          { id: 'promo', label: 'Diskon & Promo', icon: Tag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-[1.02]'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: RINGKASAN PENJUALAN */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Penjualan */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Total Omzet Penjualan</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-800">
                {loadingStats ? (
                  <div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  formatRupiah(stats?.totalSales || 0)
                )}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> Transaksi non-batal
              </span>
            </div>

            {/* Total Pesanan */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Total Pesanan Masuk</span>
                <Package className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl font-black text-slate-800">
                {loadingStats ? (
                  <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  `${stats?.totalOrders || 0} Pesanan`
                )}
              </div>
              <span className="text-[11px] text-sky-600 font-semibold mt-1 block">
                {stats?.ordersByStatus?.diproses || 0} sedang diproses
              </span>
            </div>

            {/* Total Produk SKU */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Total Produk Aktif</span>
                <ShoppingBag className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-slate-800">
                {loadingStats ? (
                  <div className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  `${stats?.totalProducts || 0} SKU`
                )}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Katalog produk terpublikasi
              </span>
            </div>

            {/* Total Stok Fisik */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Total Stok Inventori</span>
                <Boxes className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-800">
                {loadingStats ? (
                  <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  `${stats?.totalStock || 0} Pcs`
                )}
              </div>
              <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
                Akumulasi seluruh varian
              </span>
            </div>
          </div>

          {/* Status Breakdown Chips */}
          {stats && (
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                Distribusi Status Pesanan
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-orange-600 uppercase block">Menunggu Bayar</span>
                  <span className="text-lg font-black text-orange-900 mt-0.5 block">
                    {stats.ordersByStatus?.menunggu_pembayaran || 0}
                  </span>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-amber-600 uppercase block">Diproses</span>
                  <span className="text-lg font-black text-amber-900 mt-0.5 block">
                    {stats.ordersByStatus?.diproses || 0}
                  </span>
                </div>
                <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-sky-600 uppercase block">Sedang Dikirim</span>
                  <span className="text-lg font-black text-sky-900 mt-0.5 block">
                    {stats.ordersByStatus?.dikirim || 0}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase block">Selesai</span>
                  <span className="text-lg font-black text-emerald-900 mt-0.5 block">
                    {stats.ordersByStatus?.selesai || 0}
                  </span>
                </div>
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-rose-600 uppercase block">Dibatalkan</span>
                  <span className="text-lg font-black text-rose-900 mt-0.5 block">
                    {stats.ordersByStatus?.dibatalkan || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pesanan Terbaru yang Perlu Tindakan */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Pesanan Masuk Terbaru
                </h2>
                <p className="text-xs text-slate-400">
                  5 pesanan transaksi terakhir yang masuk ke dalam sistem
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/pesanan"
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors"
                >
                  <span>Kelola Pesanan</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={fetchStats}
                  disabled={loadingStats}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Segarkan data ringkasan"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {loadingStats ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                Memuat pesanan terbaru...
              </div>
            ) : !stats?.recentOrders || stats.recentOrders.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 italic">
                Belum ada pesanan yang masuk ke toko.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats.recentOrders.map((ord) => {
                  const invoice = ord.orderNumber || ord.nomorInvoice || ord.id;
                  const recipient = ord.recipientName || ord.namaPenerima || 'Pembeli';
                  const courier = ord.courier || ord.kurir || 'Kurir Standar';
                  const total = ord.totalAmount ?? ord.totalBayar ?? 0;
                  const isUpdating = updatingOrderId === ord.id;

                  return (
                    <div
                      key={ord.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-800">
                            {invoice}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              ord.statusColor ||
                              (ord.status === 'selesai'
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                : ord.status === 'dikirim'
                                ? 'bg-sky-100 text-sky-700 border-sky-200'
                                : ord.status === 'diproses'
                                ? 'bg-amber-100 text-amber-700 border-amber-200'
                                : 'bg-orange-100 text-orange-700 border-orange-200')
                            }`}
                          >
                            {ord.statusLabel || ord.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Penerima: <strong>{recipient}</strong> • Kurir: {courier}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="font-bold text-xs text-rose-600">
                          {formatRupiah(total)}
                        </span>

                        {ord.status === 'menunggu_pembayaran' && (
                          <button
                            onClick={() => handleProcessOrder(ord.id)}
                            disabled={isUpdating}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                          >
                            {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            <span>Proses Pesanan</span>
                          </button>
                        )}

                        {ord.status === 'diproses' && (
                          <button
                            onClick={() => handleShipOrder(ord.id)}
                            disabled={isUpdating}
                            className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                          >
                            {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            <span>Kirim Barang</span>
                          </button>
                        )}

                        {ord.status === 'dikirim' && (
                          <button
                            onClick={() => handleCompleteOrder(ord.id)}
                            disabled={isUpdating}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                          >
                            {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            <span>Selesaikan</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DAFTAR PRODUK (Interactive Product CRUD Table) */}
      {activeTab === 'produk' && <ProductTable />}

      {/* TAB 3: KELOLA PESANAN */}
      {activeTab === 'pesanan' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Daftar Seluruh Pesanan Pelanggan
              </h2>
              <p className="text-xs text-slate-400">
                Kelola status pembayaran, konfirmasi resi kurir, dan penyelesaian pesanan
              </p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-rose-400"
              >
                <option value="semua">Semua Status</option>
                <option value="menunggu_pembayaran">Menunggu Bayar</option>
                <option value="diproses">Diproses</option>
                <option value="dikirim">Dikirim</option>
                <option value="selesai">Selesai</option>
                <option value="dibatalkan">Dibatalkan</option>
              </select>

              <button
                type="button"
                onClick={fetchOrders}
                disabled={loadingOrders}
                className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {loadingOrders ? (
            <div className="py-16 text-center text-xs text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-rose-500" />
              Memuat data pesanan...
            </div>
          ) : ordersList.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 italic">
              Tidak ada pesanan yang sesuai dengan filter.
            </div>
          ) : (
            <div className="space-y-3.5">
              {ordersList.map((ord) => {
                const invoice = ord.orderNumber || ord.nomorInvoice || ord.id;
                const recipient = ord.recipientName || ord.namaPenerima || 'Pembeli';
                const phone = ord.recipientPhone || ord.teleponPenerima || '-';
                const address = ord.shippingAddress || ord.alamatLengkap || '-';
                const courier = ord.courier || ord.kurir || 'Kurir';
                const tracking = ord.trackingNumber || ord.nomorResi || '';
                const total = ord.totalAmount ?? ord.totalBayar ?? 0;
                const isUpdating = updatingOrderId === ord.id;

                return (
                  <div
                    key={ord.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-slate-800">
                          {invoice}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            ord.statusColor ||
                            (ord.status === 'selesai'
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : ord.status === 'dikirim'
                              ? 'bg-sky-100 text-sky-700 border-sky-200'
                              : ord.status === 'diproses'
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-orange-100 text-orange-700 border-orange-200')
                          }`}
                        >
                          {ord.statusLabel || ord.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">
                        <strong>{recipient}</strong> ({phone}) — <span className="text-slate-500">{address}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Kurir: <strong>{courier}</strong> • No. Resi:{' '}
                        <strong>{tracking || 'Belum diinput'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end lg:self-auto flex-wrap">
                      <span className="font-black text-sm text-rose-600">
                        {formatRupiah(total)}
                      </span>

                      {ord.status === 'menunggu_pembayaran' && (
                        <button
                          onClick={() => handleProcessOrder(ord.id)}
                          disabled={isUpdating}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                          <span>Proses Pesanan</span>
                        </button>
                      )}

                      {ord.status === 'diproses' && (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Ketik No. Resi Kurir"
                            value={resiInput[ord.id] || ''}
                            onChange={(e) =>
                              setResiInput({ ...resiInput, [ord.id]: e.target.value })
                            }
                            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg w-36 focus:outline-none focus:border-rose-400 font-mono"
                          />
                          <button
                            onClick={() => handleShipOrder(ord.id)}
                            disabled={isUpdating}
                            className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                          >
                            {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            <Send className="w-3 h-3" />
                            <span>Kirim Barang</span>
                          </button>
                        </div>
                      )}

                      {ord.status === 'dikirim' && (
                        <button
                          onClick={() => handleCompleteOrder(ord.id)}
                          disabled={isUpdating}
                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tandai Selesai</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PROMO & DISKON */}
      {activeTab === 'promo' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">
            Kelola Voucher Diskon & Promo Toko
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-rose-700 font-mono">KODE: ANAKHEMAT</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-md">
                  AKTIF
                </span>
              </div>
              <p className="text-xs text-slate-600">Diskon langsung Rp 20.000 untuk belanja kebutuhan anak.</p>
            </div>
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-amber-700 font-mono">KODE: BABY20</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-md">
                  AKTIF
                </span>
              </div>
              <p className="text-xs text-slate-600">Diskon khusus perlengkapan bayi minimal belanja Rp 100.000.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          <span className="text-xs font-semibold">Memuat Admin Dashboard BabyKids...</span>
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
