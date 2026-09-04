'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  RefreshCw,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  Loader2,
  Calendar,
  DollarSign,
  Send,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Eye,
  CheckCheck,
  Building2,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types/order';
import { formatRupiah } from '@/lib/format';
import { OrderDetailDrawer } from '@/components/admin/OrderDetailDrawer';

type FilterTabKey = 'semua' | 'perlu_diproses' | 'dikirim' | 'selesai' | 'dibatalkan';

interface TabConfig {
  key: FilterTabKey;
  label: string;
  countKey?: string;
  statusQuery?: string;
}

const TABS: TabConfig[] = [
  { key: 'semua', label: 'Semua Pesanan', statusQuery: 'semua' },
  { key: 'perlu_diproses', label: 'Perlu Diproses', statusQuery: 'perlu_diproses' },
  { key: 'dikirim', label: 'Sedang Dikirim', statusQuery: 'dikirim' },
  { key: 'selesai', label: 'Selesai', statusQuery: 'selesai' },
  { key: 'dibatalkan', label: 'Dibatalkan', statusQuery: 'dibatalkan' },
];

function AdminPesananContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab & Search state from URL or default
  const statusParam = (searchParams.get('status') as FilterTabKey) || 'semua';
  const queryParam = searchParams.get('q') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [activeTab, setActiveTab] = useState<FilterTabKey>(statusParam);
  const [searchInput, setSearchInput] = useState<string>(queryParam);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(queryParam);
  const [page, setPage] = useState<number>(pageParam || 1);

  // Orders data state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 15;

  // Selected order for Detail Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // Inline quick tracking update
  const [resiInputs, setResiInputs] = useState<{ [orderId: string]: string }>({});
  const [quickProcessingId, setQuickProcessingId] = useState<string | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Sync state with URL params
  useEffect(() => {
    setActiveTab(statusParam);
  }, [statusParam]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));

      const tabConfig = TABS.find((t) => t.key === activeTab);
      if (tabConfig?.statusQuery && tabConfig.statusQuery !== 'semua') {
        params.set('status', tabConfig.statusQuery);
      }

      if (debouncedSearch.trim()) {
        params.set('q', debouncedSearch.trim());
      }

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memuat pesanan');
      }

      const items = (json.data || []) as Order[];
      setOrders(items);
      setTotalCount(json.pagination?.total || items.length);
      setTotalPages(json.pagination?.totalPages || 1);

      // Pre-fill resiInputs from loaded orders
      const initialResi: { [key: string]: string } = {};
      items.forEach((item) => {
        if (item.nomorResi) {
          initialResi[item.id] = item.nomorResi;
        }
      });
      setResiInputs((prev) => ({ ...initialResi, ...prev }));
    } catch (err: any) {
      console.error('Fetch orders error:', err);
      setError(err.message || 'Terjadi kesalahan sistem saat memuat pesanan');
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedSearch, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle Tab change
  const handleTabSelect = (key: FilterTabKey) => {
    setActiveTab(key);
    setPage(1);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('status', key);
    newParams.set('page', '1');
    router.replace(`/admin/pesanan?${newParams.toString()}`);
  };

  // Quick action: Tandai Diproses
  const handleQuickProcess = async (orderId: string) => {
    setQuickProcessingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: 'diproses',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memproses pesanan');
      }

      showToast('Pesanan berhasil ditandai sedang diproses');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(json.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal memproses pesanan', 'error');
    } finally {
      setQuickProcessingId(null);
    }
  };

  // Quick action: Input Resi & Kirim
  const handleQuickShipWithResi = async (orderId: string) => {
    const resi = (resiInputs[orderId] || '').trim();
    if (!resi) {
      showToast('Nomor resi tidak boleh kosong', 'error');
      return;
    }

    setQuickProcessingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: 'dikirim',
          trackingNumber: resi,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan resi');
      }

      showToast('Nomor resi disimpan dan status pesanan diubah ke Dikirim');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(json.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan resi', 'error');
    } finally {
      setQuickProcessingId(null);
    }
  };

  // Open Detail Drawer
  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  // Callback when updated in Drawer
  const handleOrderUpdatedInDrawer = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
    setSelectedOrder(updatedOrder);
  };

  // Calculate active tab metrics
  const activeTabTotalOmzet = orders.reduce((sum, ord) => {
    if (ord.status !== 'dibatalkan') {
      return sum + (ord.totalBayar || 0);
    }
    return sum;
  }, 0);

  const getStatusBadgeStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'menunggu_pembayaran':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'diproses':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'dikirim':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'selesai':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'dibatalkan':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {toast && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Pesanan Sesuai Filter */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Total Pesanan Ditampilkan</span>
            <Package className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">
            {loading ? (
              <div className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              `${totalCount} Pesanan`
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Filter: {TABS.find((t) => t.key === activeTab)?.label}
          </span>
        </div>

        {/* Total Nilai Transaksi Tab */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Nilai Transaksi Halaman Ini</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">
            {loading ? (
              <div className="h-8 w-32 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              formatRupiah(activeTabTotalOmzet)
            )}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            Transaksi non-batal
          </span>
        </div>

        {/* Tindakan Prioritas */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Prioritas Pengiriman</span>
            <Truck className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">
            {loading ? (
              <div className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              `${orders.filter((o) => o.status === 'diproses' || o.status === 'menunggu_pembayaran').length} Perlu Resi`
            )}
          </div>
          <span className="text-[11px] text-rose-500 font-semibold mt-1 block">
            Segera proses & kirim paket
          </span>
        </div>
      </div>

      {/* Main Order Container */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
        {/* Navigation Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 scrollbar-none">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabSelect(tab.key)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                    {totalCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nomor invoice (BK-...), nama pembeli, no HP, atau nama barang..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={fetchOrders}
              disabled={loading}
              className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-colors cursor-pointer"
              title="Refresh Data Pesanan"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Orders Table / Cards List */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-rose-500" />
            Memuat data pesanan pembeli...
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800">{error}</p>
            <button
              type="button"
              onClick={fetchOrders}
              className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-14 h-14 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Tidak ada pesanan ditemukan</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {debouncedSearch
                ? `Tidak ada pesanan yang sesuai dengan kata kunci "${debouncedSearch}".`
                : 'Belum ada pesanan pada kategori status ini.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => {
              const isUpdating = quickProcessingId === ord.id;
              const inputResi = resiInputs[ord.id] ?? ord.nomorResi ?? '';

              return (
                <div
                  key={ord.id}
                  className="p-5 bg-slate-50/70 hover:bg-white rounded-3xl border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs hover:shadow-md space-y-4"
                >
                  {/* Card Header: Invoice, Date, Status, Detail Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-black text-xs text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                        {ord.nomorInvoice}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {ord.tanggalPesanan}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                          ord.status
                        )}`}
                      >
                        {ord.statusLabel || ord.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(ord)}
                        className="px-3.5 py-1.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Buka Detail Pesanan</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Body: Items Snapshot & Buyer Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left: Product Snapshot (7 cols) */}
                    <div className="lg:col-span-7 space-y-2.5">
                      {(ord.items || []).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-slate-100"
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                            {item.gambar ? (
                              <img
                                src={item.gambar}
                                alt={item.nama}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate" title={item.nama}>
                              {item.nama}
                            </h4>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {item.warna && <span className="mr-2">Warna: {item.warna}</span>}
                              {item.ukuran && <span className="mr-2">Ukuran: {item.ukuran}</span>}
                              <span className="font-semibold text-slate-600">
                                {item.jumlah}x @ {formatRupiah(item.harga)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-xs font-bold text-slate-800 pr-1">
                            {formatRupiah((item.harga || 0) * (item.jumlah || 1))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right: Buyer & Delivery Info (5 cols) */}
                    <div className="lg:col-span-5 bg-white p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="font-medium flex items-center gap-1">
                          <User className="w-3 h-3" /> Penerima
                        </span>
                        <span className="font-mono text-slate-600">{ord.teleponPenerima}</span>
                      </div>
                      <div className="font-bold text-slate-800">{ord.namaPenerima}</div>
                      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2" title={ord.alamatLengkap}>
                        {ord.alamatLengkap}
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Kurir:</span>
                        <span className="font-bold text-slate-700">
                          {ord.kurir} ({ord.layananKurir})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Total Bayar:</span>
                        <span className="font-black text-rose-600 text-xs">
                          {formatRupiah(ord.totalBayar)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Fast Courier & Tracking Action */}
                  <div className="pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      <Truck className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={inputResi}
                        onChange={(e) =>
                          setResiInputs((prev) => ({
                            ...prev,
                            [ord.id]: e.target.value,
                          }))
                        }
                        placeholder="Input Nomor Resi Kurir..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:outline-none focus:border-rose-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuickShipWithResi(ord.id)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs flex items-center gap-1"
                      >
                        {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        <span>Simpan Resi</span>
                      </button>
                    </div>

                    {/* Quick status button */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {ord.status === 'menunggu_pembayaran' && (
                        <button
                          type="button"
                          onClick={() => handleQuickProcess(ord.id)}
                          disabled={isUpdating}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                          <span>Proses Cepat</span>
                        </button>
                      )}

                      {ord.status === 'diproses' && (
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(ord)}
                          className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Kirim Barang</span>
                        </button>
                      )}

                      {ord.status === 'dikirim' && (
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(ord)}
                          className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Lihat Tracking</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Halaman {page} dari {totalPages} ({totalCount} pesanan)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Order Detail Drawer */}
      <OrderDetailDrawer
        isOpen={drawerOpen}
        order={selectedOrder}
        onClose={() => setDrawerOpen(false)}
        onOrderUpdated={handleOrderUpdatedInDrawer}
      />
    </div>
  );
}

export default function AdminPesananPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-rose-500" />
          Memuat halaman pesanan Seller Center...
        </div>
      }
    >
      <AdminPesananContent />
    </Suspense>
  );
}
