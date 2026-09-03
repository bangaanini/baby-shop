'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShoppingBag,
  ChevronRight,
  MapPin,
  FileText,
  CreditCard,
  Search,
  ExternalLink,
} from 'lucide-react';
import { MOCK_ORDERS } from '@/data/mock-orders';
import { Order, OrderStatus } from '@/types/order';
import { formatRupiah } from '@/lib/format';

export function OrderHistoryView() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState<string>('semua');
  const [searchInvoice, setSearchInvoice] = useState<string>('');
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConfirmReceived = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'selesai',
            statusLabel: 'Pesanan Selesai',
            statusColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            trackingTimeline: [
              {
                id: `tr-${Date.now()}`,
                waktu: 'Baru Saja',
                status: 'Konfirmasi Terima Pembeli',
                keterangan: 'Pembeli telah mengonfirmasi bahwa barang diterima dengan kondisi baik.',
                lokasi: 'Alamat Pembeli',
                isPassed: true,
              },
              ...ord.trackingTimeline,
            ],
          };
        }
        return ord;
      })
    );
    showToast('🎉 Terima kasih! Pesanan telah dikonfirmasi selesai.');
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab !== 'semua' && order.status !== activeTab) {
      return false;
    }
    if (searchInvoice.trim() !== '') {
      const q = searchInvoice.toLowerCase();
      const matchInvoice = order.nomorInvoice.toLowerCase().includes(q);
      const matchProduct = order.items.some((i) => i.nama.toLowerCase().includes(q));
      if (!matchInvoice && !matchProduct) return false;
    }
    return true;
  });

  return (
    <div className="py-4">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-xs mb-8">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full inline-block mb-2">
            Akun Saya & Pesanan
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-2">
            Riwayat & Status Pesanan 📦
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Pantau status proses barang, lacak posisi kurir ekspres secara real-time, konfirmasi penerimaan paket, atau beli lagi produk favorit.
          </p>
        </div>

        {/* Search Invoice / Product */}
        <div className="mt-5 relative max-w-md">
          <input
            type="text"
            placeholder="Cari no. invoice (BK-...) atau nama produk..."
            value={searchInvoice}
            onChange={(e) => setSearchInvoice(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:border-rose-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {[
          { key: 'semua', label: 'Semua Pesanan' },
          { key: 'diproses', label: 'Sedang Diproses' },
          { key: 'dikirim', label: 'Sedang Dikirim' },
          { key: 'selesai', label: 'Selesai' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-rose-500 text-white shadow-xs scale-105'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs hover:border-rose-200 transition-all"
            >
              {/* Order Card Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {order.nomorInvoice}
                  </span>
                  <span className="text-xs text-slate-400">{order.tanggalPesanan}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${order.statusColor}`}
                  >
                    {order.statusLabel}
                  </span>
                </div>
              </div>

              {/* Items in this Order */}
              <div className="divide-y divide-slate-100 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.gambar}
                        alt={item.nama}
                        className="w-16 h-16 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                      />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
                          {item.nama}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>Varian: {item.warna}</span>
                          <span>•</span>
                          <span>Ukuran: {item.ukuran}</span>
                        </div>
                        <span className="text-xs text-slate-600 mt-1 block">
                          {item.jumlah} barang x {formatRupiah(item.harga)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        {formatRupiah(item.harga * item.jumlah)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Courier & Shipping info bar */}
              <div className="p-3.5 bg-slate-50 rounded-2xl text-xs text-slate-600 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>
                    Kurir: <strong>{order.kurir} ({order.layananKurir})</strong>
                    {order.nomorResi && (
                      <span className="ml-2 font-mono text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        No. Resi: {order.nomorResi}
                      </span>
                    )}
                  </span>
                </div>
                <div>
                  Metode Bayar: <strong>{order.metodePembayaran}</strong>
                </div>
              </div>

              {/* Order Footer Actions & Total */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-100 gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">Total Pesanan:</span>
                  <span className="text-lg font-black text-rose-600">{formatRupiah(order.totalBayar)}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Lacak Paket Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForTracking(order)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Lacak Paket</span>
                  </button>

                  {/* Konfirmasi Terima Button if dikirim */}
                  {order.status === 'dikirim' && (
                    <button
                      type="button"
                      onClick={() => handleConfirmReceived(order.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Konfirmasi Terima</span>
                    </button>
                  )}

                  {/* Beli Lagi Button if selesai */}
                  {order.status === 'selesai' && (
                    <Link
                      href={`/produk/${order.items[0].slug}`}
                      className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Beli Lagi</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
            <div className="text-5xl mb-3">📦</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Tidak Ada Riwayat Pesanan</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6">
              Belum ada pesanan dengan status ini. Mulai belanja kebutuhan si kecil sekarang!
            </p>
            <Link
              href="/katalog"
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs inline-block"
            >
              Katalog Produk
            </Link>
          </div>
        )}
      </div>

      {/* TRACKING TIMELINE MODAL */}
      {selectedOrderForTracking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-rose-500" />
                  <span>Pelacakan Pengiriman Kurir</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {selectedOrderForTracking.kurir} — No. Resi: <strong>{selectedOrderForTracking.nomorResi || 'Menunggu Penjemputan'}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForTracking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Destination Info */}
            <div className="p-3 bg-rose-50/50 rounded-2xl text-xs text-slate-700">
              <span className="font-bold text-rose-700 block mb-0.5">Tujuan Pengiriman:</span>
              <p>{selectedOrderForTracking.alamatLengkap}</p>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {selectedOrderForTracking.trackingTimeline.map((step, idx) => (
                <div key={step.id} className="flex gap-3 relative">
                  {idx !== selectedOrderForTracking.trackingTimeline.length - 1 && (
                    <div className="absolute left-3.5 top-6 bottom-0 w-0.5 bg-slate-200" />
                  )}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 z-10 ${
                      idx === 0 ? 'bg-rose-500' : 'bg-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800">{step.status}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{step.waktu}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{step.keterangan}</p>
                    <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      📍 {step.lokasi}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrderForTracking(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
