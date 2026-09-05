'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  MapPin,
  ArrowLeft,
  Crown,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { Order, OrderStatus } from '@/types/order';

interface CustomerDetailData {
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    image: string | null;
    role: string;
    emailVerified: boolean;
    createdAt: string;
  };
  metrics: {
    totalOrders: number;
    completedOrders: number;
    totalSpent: number;
  };
  addresses: Array<{
    id: string;
    recipient_name: string;
    phone: string;
    label: string | null;
    full_address: string;
    city: string | null;
    province: string | null;
    postal_code: string | null;
    is_primary: boolean;
  }>;
  orders: Order[];
}

function formatDateIndo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : (dateInput as Date);
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case 'menunggu_pembayaran':
      return { label: 'Menunggu Pembayaran', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'diproses':
      return { label: 'Sedang Diproses', color: 'bg-sky-100 text-sky-800 border-sky-200' };
    case 'dikirim':
      return { label: 'Sedang Dikirim', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    case 'selesai':
      return { label: 'Selesai', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'dibatalkan':
      return { label: 'Dibatalkan', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    default:
      return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;

  const [data, setData] = useState<CustomerDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadCustomer() {
      if (!customerId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/customers/${encodeURIComponent(customerId)}`);
        const json = await res.json();
        if (isMounted) {
          if (res.ok && json.success && json.data) {
            setData(json.data);
          } else {
            setError(json.error || 'Gagal memuat rincian pelanggan');
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Terjadi gangguan jaringan');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCustomer();
    return () => {
      isMounted = false;
    };
  }, [customerId]);

  const cleanPhone = (data?.customer.phone || '').replace(/[^0-9]/g, '');
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}`
    : null;

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF9F43]" />
        <p className="text-xs font-heading font-bold text-slate-500">Memuat profil lengkap pelanggan...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center bg-white rounded-3xl p-8 border-2 border-[#FFE8D6] shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-heading font-black text-slate-800 mb-1">Data Pelanggan Tidak Ditemukan</h2>
        <p className="text-xs font-body text-slate-500 mb-6">{error || 'ID Pelanggan tidak valid atau telah dihapus.'}</p>
        <Link
          href="/admin/pelanggan"
          className="clay-btn-orange px-5 py-2.5 text-xs text-white font-heading font-bold inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Pelanggan</span>
        </Link>
      </div>
    );
  }

  const { customer, metrics, addresses, orders } = data;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border-2 border-[#FFE8D6] shadow-[0_10px_24px_-4px_rgba(255,159,67,0.12)]">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/pelanggan"
            className="w-10 h-10 rounded-2xl bg-[#FFF8F0] hover:bg-[#FFF2E5] border-2 border-[#FFE8D6] text-slate-700 flex items-center justify-center transition-colors shrink-0"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5 text-[#FF9F43]" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-heading font-black text-slate-900 tracking-tight">
                {customer.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-heading font-black border ${
                  customer.role === 'admin'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-sky-100 text-sky-800 border-sky-200'
                }`}
              >
                {customer.role === 'admin' && <Crown className="w-3 h-3" />}
                {customer.role.toUpperCase()}
              </span>
            </div>
            <p className="text-xs font-body text-slate-500 mt-0.5">
              Bergabung sejak {formatDateIndo(customer.createdAt)}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="clay-btn-white px-4 py-2 text-xs text-emerald-700 font-heading font-bold inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Chat WhatsApp</span>
            </a>
          )}
          <a
            href={`mailto:${customer.email}`}
            className="clay-btn-white px-4 py-2 text-xs text-slate-700 font-heading font-bold inline-flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-[#FF9F43]" />
            <span>Kirim Email</span>
          </a>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border-2 border-[#FFE8D6] shadow-sm">
          <span className="text-xs font-heading font-bold text-slate-500 block mb-1">Total Pesanan</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-heading font-black text-slate-900">{metrics.totalOrders} kali</span>
            <span className="text-[11px] font-body text-emerald-600 font-bold">{metrics.completedOrders} selesai</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border-2 border-[#FFE8D6] shadow-sm">
          <span className="text-xs font-heading font-bold text-slate-500 block mb-1">Akumulasi Belanja (LTV)</span>
          <span className="text-2xl font-heading font-black text-[#D96B00] block">
            {formatRupiah(metrics.totalSpent)}
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border-2 border-[#FFE8D6] shadow-sm">
          <span className="text-xs font-heading font-bold text-slate-500 block mb-1">Rata-rata Nilai Pesanan (AOV)</span>
          <span className="text-2xl font-heading font-black text-slate-800 block">
            {formatRupiah(metrics.totalOrders > 0 ? Math.round(metrics.totalSpent / metrics.totalOrders) : 0)}
          </span>
        </div>
      </div>

      {/* 2 Columns: Saved Addresses & Order History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Contact & Addresses (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-[#FFE8D6] shadow-sm space-y-4">
            <h3 className="text-sm font-heading font-black text-slate-900 pb-3 border-b-2 border-[#FFE8D6]">
              Informasi Kontak 👤
            </h3>
            <div className="space-y-3 text-xs font-body">
              <div>
                <span className="text-slate-400 block mb-0.5">Email</span>
                <span className="font-heading font-bold text-slate-800">{customer.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Nomor Telepon / WhatsApp</span>
                <span className="font-heading font-bold text-slate-800">{customer.phone || 'Belum diisi'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">ID Pengguna</span>
                <span className="font-mono text-[11px] text-slate-500 break-all">{customer.id}</span>
              </div>
            </div>
          </div>

          {/* Saved Addresses List */}
          <div className="bg-white rounded-3xl p-6 border-2 border-[#FFE8D6] shadow-sm space-y-4">
            <h3 className="text-sm font-heading font-black text-slate-900 pb-3 border-b-2 border-[#FFE8D6] flex items-center justify-between">
              <span>Alamat Tersimpan ({addresses.length})</span>
              <MapPin className="w-4 h-4 text-[#FF9F43]" />
            </h3>
            {addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((a) => (
                  <div key={a.id} className="p-3.5 rounded-2xl bg-[#FFF8F0] border border-[#FFE8D6] text-xs font-body space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="font-heading font-bold text-slate-900">{a.recipient_name}</strong>
                      {a.is_primary && (
                        <span className="clay-badge-orange text-[9px] px-2 py-0.5 font-bold">Utama</span>
                      )}
                    </div>
                    <p className="text-slate-500">{a.phone}</p>
                    <p className="text-slate-700 leading-relaxed">{a.full_address}</p>
                    <p className="text-[11px] text-slate-400">{a.city}, {a.province} {a.postal_code}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-body text-slate-400 py-4 text-center">Belum ada alamat tersimpan</p>
            )}
          </div>
        </div>

        {/* Right Column: Order History (8 Cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl p-6 border-2 border-[#FFE8D6] shadow-sm space-y-4">
            <h3 className="text-sm font-heading font-black text-slate-900 pb-3 border-b-2 border-[#FFE8D6] flex items-center justify-between">
              <span>Riwayat Transaksi Pesanan ({orders.length}) 📦</span>
            </h3>

            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  return (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl border-2 border-[#FFE8D6] hover:border-[#FF9F43] bg-white transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-100 gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs font-heading font-bold text-slate-800 bg-[#FFF8F0] px-2.5 py-1 rounded-lg border border-[#FFE8D6]">
                            {ord.nomorInvoice}
                          </span>
                          <span className="text-[11px] font-body text-slate-400">{ord.tanggalPesanan}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-heading font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {ord.items.map((it) => (
                          <div key={it.id} className="flex items-center justify-between text-xs font-body">
                            <div className="flex items-center gap-2.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={it.gambar}
                                alt={it.nama}
                                className="w-9 h-9 rounded-xl object-cover border border-[#FFE8D6] shrink-0"
                              />
                              <div>
                                <p className="font-heading font-bold text-slate-800 line-clamp-1">{it.nama}</p>
                                <p className="text-[11px] text-slate-400">
                                  {it.jumlah} pcs • {formatRupiah(it.harga)}
                                </p>
                              </div>
                            </div>
                            <span className="font-heading font-black text-[#D96B00]">
                              {formatRupiah(it.harga * it.jumlah)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-body text-slate-500">
                        <span>Kurir: <strong className="font-heading text-slate-800">{ord.kurir} ({ord.layananKurir})</strong></span>
                        <div className="flex items-baseline gap-1">
                          <span>Total:</span>
                          <strong className="text-sm font-heading font-black text-[#D96B00]">{formatRupiah(ord.totalBayar)}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs font-body">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50 text-slate-300" />
                <p>Pelanggan belum pernah melakukan transaksi pesanan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
