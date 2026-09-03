'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Tag,
  Users,
  DollarSign,
  Plus,
  CheckCircle,
  Truck,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Store,
} from 'lucide-react';
import { MOCK_PRODUCTS } from '@/data/mock-products';
import { MOCK_ORDERS } from '@/data/mock-orders';
import { formatRupiah } from '@/lib/format';

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');
  const activeTab: 'ringkasan' | 'produk' | 'pesanan' | 'promo' =
    tabParam === 'produk' || tabParam === 'pesanan' || tabParam === 'promo'
      ? tabParam
      : 'ringkasan';

  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [resiInput, setResiInput] = useState<{ [orderId: string]: string }>({});
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleTabChange = (tab: 'ringkasan' | 'produk' | 'pesanan' | 'promo') => {
    router.push(`/admin?tab=${tab}`);
  };

  const handleProcessOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'diproses',
              statusLabel: 'Sedang Diproses Penjual',
              statusColor: 'bg-amber-100 text-amber-700 border-amber-200',
            }
          : o
      )
    );
    showToast(`Pesanan ${orderId} diubah status menjadi Diproses.`);
  };

  const handleShipOrder = (orderId: string) => {
    const resi = resiInput[orderId] || `EXP-${Date.now().toString().slice(-8)}`;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'dikirim',
              statusLabel: 'Sedang Dikirim',
              statusColor: 'bg-sky-100 text-sky-700 border-sky-200',
              nomorResi: resi,
            }
          : o
      )
    );
    showToast(`Pesanan ${orderId} berhasil dikirim dengan No. Resi ${resi}!`);
  };

  const totalPenjualan = orders.reduce((sum, o) => sum + o.totalBayar, 0);

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 text-xs sm:text-sm font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
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
              Pantau statistik penjualan, kelola inventori produk anak, dan proses pengiriman kurir ke seluruh Indonesia.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors border border-slate-700"
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
          { id: 'pesanan', label: `Kelola Pesanan (${orders.length})`, icon: Package },
          { id: 'produk', label: `Daftar Produk (${products.length})`, icon: ShoppingBag },
          { id: 'promo', label: 'Diskon & Promo', icon: Tag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
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

      {/* TAB 1: RINGKASAN */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Total Penjualan</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-800">{formatRupiah(totalPenjualan)}</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +24% bulan ini
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Pesanan Masuk</span>
                <Package className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl font-black text-slate-800">{orders.length} Pesanan</div>
              <span className="text-[11px] text-sky-600 font-semibold mt-1 block">Siap dikirim ke pembeli</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Total Produk Aktif</span>
                <ShoppingBag className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-slate-800">{products.length} SKU</div>
              <span className="text-[11px] text-slate-400 mt-1 block">3 Kategori Utama</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Jangkauan Pengiriman</span>
                <Truck className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-800">Se-Indonesia</div>
              <span className="text-[11px] text-amber-600 font-semibold mt-1 block">34+ Provinsi terjangkau</span>
            </div>
          </div>

          {/* Pesanan Terbaru */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100 mb-4">
              Pesanan Masuk yang Perlu Diproses Segera
            </h2>
            <div className="divide-y divide-slate-100">
              {orders.map((ord) => (
                <div key={ord.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-800">{ord.nomorInvoice}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ord.statusColor}`}>
                        {ord.statusLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Penerima: <strong>{ord.namaPenerima}</strong> • Kurir: {ord.kurir} ({ord.layananKurir})
                    </p>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="font-bold text-xs text-rose-600">{formatRupiah(ord.totalBayar)}</span>
                    {ord.status === 'menunggu_pembayaran' && (
                      <button
                        onClick={() => handleProcessOrder(ord.id)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Proses Pesanan
                      </button>
                    )}
                    {ord.status === 'diproses' && (
                      <button
                        onClick={() => handleShipOrder(ord.id)}
                        className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Kirim Barang
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KELOLA PESANAN */}
      {activeTab === 'pesanan' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">
            Daftar Seluruh Pesanan Pembeli
          </h2>
          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-slate-800">{ord.nomorInvoice}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ord.statusColor}`}>
                      {ord.statusLabel}
                    </span>
                    <span className="text-xs text-slate-400">{ord.tanggalPesanan}</span>
                  </div>
                  <p className="text-xs text-slate-700">
                    <strong>{ord.namaPenerima}</strong> ({ord.teleponPenerima}) — {ord.alamatLengkap}
                  </p>
                  <p className="text-xs text-slate-500">
                    Kurir: <strong>{ord.kurir}</strong> • No. Resi: <strong>{ord.nomorResi || 'Belum diinput'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end lg:self-auto flex-wrap">
                  <span className="font-black text-sm text-rose-600">{formatRupiah(ord.totalBayar)}</span>

                  {ord.status === 'diproses' && (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Ketik No. Resi Kurir"
                        value={resiInput[ord.id] || ''}
                        onChange={(e) => setResiInput({ ...resiInput, [ord.id]: e.target.value })}
                        className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg w-36 focus:outline-none focus:border-rose-400"
                      />
                      <button
                        onClick={() => handleShipOrder(ord.id)}
                        className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Input Resi & Kirim
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUK */}
      {activeTab === 'produk' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-base font-bold text-slate-800">Katalog Produk Toko</h2>
            <span className="text-xs font-bold text-rose-600">{products.length} Produk Terdaftar</span>
          </div>
          <div className="divide-y divide-slate-100">
            {products.map((prod) => (
              <div key={prod.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={prod.gambar} alt={prod.nama} className="w-12 h-12 rounded-xl object-cover bg-slate-100" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">{prod.nama}</h4>
                    <span className="text-[11px] text-slate-500">
                      Kategori: <strong>{prod.kategoriLabel}</strong> • Stok: <strong>{prod.stok} pcs</strong> • Terjual: {prod.terjual}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-bold text-rose-600">{formatRupiah(prod.harga)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PROMO */}
      {activeTab === 'promo' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">
            Kelola Diskon & Promo Toko
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-rose-700 font-mono">KODE: ANAKHEMAT</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-md">AKTIF</span>
              </div>
              <p className="text-xs text-slate-600">Diskon langsung Rp 20.000 untuk belanja kebutuhan anak.</p>
            </div>
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-amber-700 font-mono">KODE: BABY20</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-md">AKTIF</span>
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
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat Admin Dashboard...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
