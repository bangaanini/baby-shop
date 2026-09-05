'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Crown,
  ShoppingBag,
  Wallet,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Loader2,
  RefreshCw,
} from 'lucide-react';

type Customer = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  phone: string | null;
  role: string;
  createdAt: string | Date;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
};

type Metrics = {
  totalCustomers: number;
  activeCustomers: number;
  totalRevenue: number;
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateIndo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput as Date;
  if (isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function waLink(phone: string | null): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '62' + digits.slice(1);
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

export default function AdminPelangganPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ totalCustomers: 0, activeCustomers: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('q', debouncedSearch);
      if (filter !== 'all') params.set('filter', filter);
      const qs = params.toString();
      const url = qs ? `/api/admin/customers?${qs}` : '/api/admin/customers';
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Gagal memuat data pelanggan');
      setCustomers(json.data.customers as Customer[]);
      setMetrics(json.data.metrics as Metrics);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Gagal memuat data pelanggan';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const emptyMessage = useMemo(() => {
    if (debouncedSearch || filter !== 'all') return 'Tidak ada pelanggan yang cocok dengan filter.';
    return 'Belum ada pelanggan terdaftar';
  }, [debouncedSearch, filter]);

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF9F43] to-[#EE8A2B] flex items-center justify-center shadow-md border-2 border-[#FFE8D6] text-white">
              <Users className="w-5 h-5" />
            </span>
            Pelanggan
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-body">
            Direktori pelanggan & ringkasan nilai belanja — Seller Center
          </p>
        </div>
        <button
          type="button"
          onClick={fetchCustomers}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-[#FFE8D6] shadow-sm text-xs font-heading font-bold text-slate-700 hover:bg-[#FFF8F0] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Muat ulang
        </button>
      </div>

      {/* Metric Tiles — Clay Block */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border-2 border-[#FFE8D6] bg-white shadow-md p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-heading font-bold uppercase tracking-wider">
            <span className="w-8 h-8 rounded-xl bg-[#87CEEB]/20 border border-[#87CEEB]/30 flex items-center justify-center text-[#2A7DA0]">
              <Users className="w-4 h-4" />
            </span>
            Total Pelanggan
          </div>
          <p className="font-heading font-black text-3xl text-slate-900">{metrics.totalCustomers}</p>
          <p className="text-xs text-slate-400 font-body">Terdaftar di toko</p>
        </div>
        <div className="rounded-3xl border-2 border-[#FFE8D6] bg-white shadow-md p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-heading font-bold uppercase tracking-wider">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <ShoppingBag className="w-4 h-4" />
            </span>
            Pelanggan Aktif Bertransaksi
          </div>
          <p className="font-heading font-black text-3xl text-slate-900">{metrics.activeCustomers}</p>
          <p className="text-xs text-slate-400 font-body">Pernah belanja ({'>'}0 pesanan)</p>
        </div>
        <div className="rounded-3xl border-2 border-[#FFE8D6] bg-white shadow-md p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-heading font-bold uppercase tracking-wider">
            <span className="w-8 h-8 rounded-xl bg-[#FF9F43]/15 border border-[#FF9F43]/25 flex items-center justify-center text-[#D96B00]">
              <Wallet className="w-4 h-4" />
            </span>
            Total Nilai Belanja Pelanggan
          </div>
          <p className="font-heading font-black text-xl sm:text-2xl text-[#D96B00] break-words">
            {formatRupiah(metrics.totalRevenue)}
          </p>
          <p className="text-xs text-slate-400 font-body">Akumulasi total_amount pesanan</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-3xl border-2 border-[#FFE8D6] bg-white shadow-md p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex-1 relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau no. HP..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-slate-200 bg-[#FFF8F0]/50 text-sm font-body placeholder:text-slate-400 focus:outline-none focus:border-[#FF9F43] focus:ring-2 focus:ring-[#FF9F43]/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(
            [
              ['all', 'Semua'],
              ['active', 'Pernah Belanja'],
              ['inactive', 'Belum Pernah Belanja'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-full text-xs font-heading font-bold border-2 transition-all cursor-pointer ${
                filter === value
                  ? 'bg-[#FF9F43] text-white border-[#FF9F43] shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#FFE8D6] hover:bg-[#FFF8F0]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      <div className="rounded-3xl border-2 border-[#FFE8D6] bg-white shadow-md overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-2xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-48 bg-slate-100 rounded" />
                </div>
                <div className="h-6 w-20 bg-slate-100 rounded-full hidden sm:block" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-sm font-body text-rose-600 font-semibold">{error}</p>
            <button
              type="button"
              onClick={fetchCustomers}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-heading font-bold hover:bg-rose-100 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Coba lagi
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FFF8F0] border-2 border-[#FFE8D6] flex items-center justify-center text-[#FF9F43] mb-4">
              <Users className="w-8 h-8" />
            </div>
            <p className="font-heading font-black text-slate-700">{emptyMessage}</p>
            <p className="text-xs text-slate-400 mt-1 font-body">Coba ubah kata kunci atau filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FFF8F0] border-b-2 border-[#FFE8D6] text-[11px] font-heading font-black uppercase tracking-wider text-slate-500">
                    <th className="text-left px-4 py-3">Pelanggan</th>
                    <th className="text-left px-4 py-3">Kontak</th>
                    <th className="text-center px-4 py-3">Role</th>
                    <th className="text-center px-4 py-3">Pesanan</th>
                    <th className="text-right px-4 py-3">Total Belanja</th>
                    <th className="text-left px-4 py-3">Bergabung</th>
                    <th className="text-right px-4 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => {
                    const link = waLink(c.phone);
                    return (
                      <tr key={c.id} className="hover:bg-[#FFF8F0]/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-[180px]">
                            {c.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={c.image}
                                alt={c.name}
                                className="w-10 h-10 rounded-2xl object-cover border-2 border-[#FFE8D6] shadow-sm shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF9F43] to-[#87CEEB] text-white flex items-center justify-center font-heading font-black text-xs border-2 border-white shadow-sm shrink-0">
                                {getInitials(c.name)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-heading font-bold text-slate-900 truncate max-w-[180px]">{c.name}</p>
                              <p className="text-xs text-slate-400 font-body flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDateIndo(c.createdAt as string)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1 min-w-[200px]">
                            <a
                              href={`mailto:${c.email}`}
                              className="flex items-center gap-1.5 text-xs font-body text-slate-700 hover:text-[#D96B00] truncate"
                            >
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{c.email}</span>
                            </a>
                            {c.phone ? (
                              link ? (
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-body text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  {c.phone}
                                </a>
                              ) : (
                                <span className="flex items-center gap-1.5 text-xs font-body text-slate-600">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  {c.phone}
                                </span>
                              )
                            ) : (
                              <span className="text-xs text-slate-400 font-body">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-heading font-black border ${
                              c.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-sky-100 text-sky-800 border-sky-200'
                            }`}
                          >
                            {c.role === 'admin' && <Crown className="w-3 h-3" />}
                            {c.role === 'admin' ? 'admin' : 'buyer'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full bg-slate-900 text-white text-xs font-heading font-black">
                            {c.totalOrders}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-heading font-black text-[#D96B00] whitespace-nowrap">
                            {formatRupiah(c.totalSpent)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-body text-slate-600">
                          {formatDateIndo(c.createdAt as string)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/pelanggan/${c.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border-2 border-slate-200 text-xs font-heading font-bold text-slate-700 hover:bg-[#FFF8F0] hover:border-[#FFE8D6] transition-colors"
                          >
                            Detail
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {customers.map((c) => {
                const link = waLink(c.phone);
                return (
                  <div key={c.id} className="p-4 flex gap-3">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-11 h-11 rounded-2xl object-cover border-2 border-[#FFE8D6] shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF9F43] to-[#87CEEB] text-white flex items-center justify-center font-heading font-black text-xs border-2 border-white shadow-sm shrink-0">
                        {getInitials(c.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-heading font-bold text-slate-900 truncate">{c.name}</p>
                        <span
                          className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-heading font-black border ${
                            c.role === 'admin'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-sky-100 text-sky-800 border-sky-200'
                          }`}
                        >
                          {c.role === 'admin' && <Crown className="w-3 h-3" />}
                          {c.role}
                        </span>
                      </div>
                      <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-xs text-slate-600 font-body truncate">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </a>
                      {c.phone &&
                        (link ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-body text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full"
                          >
                            <MessageCircle className="w-3 h-3" />
                            {c.phone}
                          </a>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-slate-600 font-body">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {c.phone}
                          </span>
                        ))}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="inline-flex items-center gap-1 text-xs font-body text-slate-500">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          {c.totalOrders} pesanan
                        </span>
                        <span className="text-xs font-heading font-black text-[#D96B00]">{formatRupiah(c.totalSpent)}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-body flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Bergabung {formatDateIndo(c.createdAt as string)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <p className="text-[11px] text-slate-400 font-body text-center">
        Menampilkan {customers.length} pelanggan • Data diperbarui dari pesanan (total_amount).
      </p>
    </div>
  );
}
