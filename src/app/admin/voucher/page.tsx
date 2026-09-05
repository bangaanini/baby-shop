'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Ticket,
  Plus,
  Search,
  Trash2,
  Edit3,
  RefreshCw,
  Copy,
  Check,
  Percent,
  Truck,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  Layers,
  ArrowUpDown,
  Filter,
  Eye,
  Info,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';

export interface VoucherItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: 'fixed' | 'percentage' | 'shipping';
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  start_date: string | Date;
  end_date: string | Date | null;
  is_active: boolean;
  created_at: string | Date;
  updated_at: string | Date;
}

interface VoucherFormData {
  code: string;
  name: string;
  description: string;
  discountType: 'fixed' | 'percentage' | 'shipping';
  discountValue: number | '';
  maxDiscountAmount: number | '';
  minOrderAmount: number | '';
  usageLimit: number | '';
  startDate: string;
  endDate: string;
  noEndDate: boolean;
  isActive: boolean;
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

function formatDateIndo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'Selamanya';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return 'Invalid Date';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

const INITIAL_FORM: VoucherFormData = {
  code: '',
  name: '',
  description: '',
  discountType: 'fixed',
  discountValue: '',
  maxDiscountAmount: '',
  minOrderAmount: 0,
  usageLimit: '',
  startDate: dateToDatetimeLocal(new Date()),
  endDate: '',
  noEndDate: true,
  isActive: true,
};

export default function AdminVoucherPage() {
  // Main Data States
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'fixed' | 'percentage' | 'shipping'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
  const [formData, setFormData] = useState<VoucherFormData>(INITIAL_FORM);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingVoucher, setDeletingVoucher] = useState<VoucherItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Instant Toggle Status State
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Copied Code State
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Fetch Vouchers
  const fetchVouchers = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch('/api/admin/vouchers');
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memuat data voucher');
      }

      setVouchers(json.data || []);
    } catch (err: any) {
      showToast(err.message || 'Gagal mengambil data voucher', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // Copy Code Handler
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingVoucherId(null);
    setFormData({
      ...INITIAL_FORM,
      startDate: dateToDatetimeLocal(new Date()),
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (voucher: VoucherItem) => {
    setEditingVoucherId(voucher.id);
    setFormData({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description || '',
      discountType: voucher.discount_type,
      discountValue: voucher.discount_value,
      maxDiscountAmount: voucher.max_discount_amount ?? '',
      minOrderAmount: voucher.min_order_amount,
      usageLimit: voucher.usage_limit ?? '',
      startDate: dateToDatetimeLocal(voucher.start_date),
      endDate: voucher.end_date ? dateToDatetimeLocal(voucher.end_date) : '',
      noEndDate: !voucher.end_date,
      isActive: voucher.is_active,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Instant Toggle Status Handler
  const handleToggleStatus = async (voucher: VoucherItem) => {
    const newStatus = !voucher.is_active;
    setTogglingId(voucher.id);

    // Optimistic update
    setVouchers((prev) =>
      prev.map((v) => (v.id === voucher.id ? { ...v, is_active: newStatus } : v))
    );

    try {
      const res = await fetch(`/api/admin/vouchers/${voucher.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal mengubah status voucher');
      }

      showToast(`Status voucher ${voucher.code} berhasil diubah ke ${newStatus ? 'Aktif' : 'Nonaktif'}.`);
    } catch (err: any) {
      // Rollback
      setVouchers((prev) =>
        prev.map((v) => (v.id === voucher.id ? { ...v, is_active: voucher.is_active } : v))
      );
      showToast(err.message || 'Gagal mengubah status voucher', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Save (Create / Update) Voucher Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic Validation
    if (!formData.code.trim()) {
      setFormError('Kode voucher tidak boleh kosong');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Nama promo tidak boleh kosong');
      return;
    }
    if (formData.discountValue === '' || Number(formData.discountValue) <= 0) {
      setFormError('Nilai diskon harus lebih dari 0');
      return;
    }
    if (formData.discountType === 'percentage' && Number(formData.discountValue) > 100) {
      setFormError('Diskon persentase tidak boleh lebih dari 100%');
      return;
    }

    const payload: any = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      maxDiscountAmount:
        formData.discountType === 'percentage' && formData.maxDiscountAmount !== ''
          ? Number(formData.maxDiscountAmount)
          : null,
      minOrderAmount: formData.minOrderAmount === '' ? 0 : Number(formData.minOrderAmount),
      usageLimit: formData.usageLimit === '' ? null : Number(formData.usageLimit),
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
      endDate: !formData.noEndDate && formData.endDate ? new Date(formData.endDate).toISOString() : null,
      isActive: formData.isActive,
    };

    setFormSubmitting(true);
    try {
      let res: Response;
      if (editingVoucherId) {
        res = await fetch(`/api/admin/vouchers/${editingVoucherId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/vouchers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menyimpan voucher');
      }

      showToast(
        editingVoucherId
          ? `Voucher "${payload.code}" berhasil diperbarui!`
          : `Voucher "${payload.code}" berhasil dibuat!`
      );

      setIsModalOpen(false);
      fetchVouchers(true);
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Voucher
  const handleDeleteConfirm = async () => {
    if (!deletingVoucher) return;

    setDeleteSubmitting(true);
    try {
      const res = await fetch(`/api/admin/vouchers/${deletingVoucher.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghapus voucher');
      }

      showToast(`Voucher "${deletingVoucher.code}" berhasil dihapus.`);
      setVouchers((prev) => prev.filter((v) => v.id !== deletingVoucher.id));
      setDeletingVoucher(null);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus voucher', 'error');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Filtered & Searched Vouchers
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      // Type filter
      if (typeFilter !== 'all' && v.discount_type !== typeFilter) {
        return false;
      }
      // Status filter
      if (statusFilter === 'active' && !v.is_active) {
        return false;
      }
      if (statusFilter === 'inactive' && v.is_active) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const codeMatch = v.code.toLowerCase().includes(q);
        const nameMatch = v.name.toLowerCase().includes(q);
        const descMatch = v.description?.toLowerCase().includes(q);
        return codeMatch || nameMatch || descMatch;
      }
      return true;
    });
  }, [vouchers, typeFilter, statusFilter, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = vouchers.length;
    const now = new Date().getTime();
    const active = vouchers.filter((v) => {
      if (!v.is_active) return false;
      if (v.end_date && new Date(v.end_date).getTime() < now) return false;
      if (v.usage_limit && v.used_count >= v.usage_limit) return false;
      return true;
    }).length;

    const totalUsed = vouchers.reduce((acc, v) => acc + (v.used_count || 0), 0);
    const totalLimit = vouchers.reduce((acc, v) => acc + (v.usage_limit || 0), 0);

    return { total, active, totalUsed, totalLimit };
  }, [vouchers]);

  // Helper for discount display
  const getDiscountLabel = (voucher: VoucherItem | VoucherFormData) => {
    const type = 'discount_type' in voucher ? voucher.discount_type : voucher.discountType;
    const value = 'discount_value' in voucher ? voucher.discount_value : voucher.discountValue;
    const maxVal = 'max_discount_amount' in voucher ? voucher.max_discount_amount : voucher.maxDiscountAmount;

    const numValue = Number(value) || 0;
    if (type === 'fixed') {
      return `Potongan ${formatRupiah(numValue)}`;
    }
    if (type === 'percentage') {
      const maxText = maxVal ? ` (Maks. ${formatRupiah(Number(maxVal))})` : '';
      return `Diskon ${numValue}%${maxText}`;
    }
    if (type === 'shipping') {
      return `Subsidi Ongkir ${formatRupiah(numValue)}`;
    }
    return `Diskon ${numValue}`;
  };

  const getDiscountBadge = (type: 'fixed' | 'percentage' | 'shipping') => {
    switch (type) {
      case 'fixed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-heading font-black bg-orange-100 text-orange-700 border border-orange-200">
            <DollarSign className="w-3.5 h-3.5" />
            Potongan Tetap
          </span>
        );
      case 'percentage':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-heading font-black bg-amber-100 text-amber-800 border border-amber-200">
            <Percent className="w-3.5 h-3.5" />
            Persentase
          </span>
        );
      case 'shipping':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-heading font-black bg-sky-100 text-sky-800 border border-sky-200">
            <Truck className="w-3.5 h-3.5" />
            Gratis Ongkir
          </span>
        );
    }
  };

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

      {/* Header Banner & Title */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#FF9F43]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 bottom-0 w-64 h-64 bg-[#87CEEB]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-black tracking-wide bg-[#FF9F43]/20 text-[#FF9F43] border border-[#FF9F43]/30">
                <Ticket className="w-3.5 h-3.5" />
                SELLER CENTER VOUCHER
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" />
                PROMOSI & DISKON
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white flex items-center gap-2">
              Pusat Pengelolaan Voucher Promo 🎟️
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-body max-w-2xl">
              Tingkatkan konversi penjualan toko dengan membuat kode kupon diskon nominal, persentase, dan gratis ongkir yang fleksibel.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchVouchers(true)}
              disabled={loading || refreshing}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white rounded-2xl text-xs font-heading font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#FF9F43]' : ''}`} />
              <span>Segarkan</span>
            </button>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="clay-btn-orange text-white px-5 py-2.5 rounded-2xl text-xs font-heading font-black shadow-md hover:scale-102 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Voucher Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Metric 1: Total Voucher */}
        <div className="clay-card p-6 bg-white rounded-3xl border-2 border-[#FFE8D6] shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Voucher
            </span>
            <div className="text-3xl font-heading font-black text-slate-800">
              {loading ? (
                <div className="h-9 w-20 bg-slate-100 rounded-xl animate-pulse" />
              ) : (
                `${metrics.total} Kupon`
              )}
            </div>
            <span className="text-xs text-slate-500 font-body font-medium mt-1 block">
              Semua promo terdaftar
            </span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-[#FFF2E5] border border-[#FFDFC2] text-[#FF9F43] flex items-center justify-center shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Voucher Aktif */}
        <div className="clay-card p-6 bg-white rounded-3xl border-2 border-[#FFE8D6] shadow-md flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400 block">
                Voucher Aktif
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-3xl font-heading font-black text-emerald-600">
              {loading ? (
                <div className="h-9 w-20 bg-slate-100 rounded-xl animate-pulse" />
              ) : (
                `${metrics.active} Aktif`
              )}
            </div>
            <span className="text-xs text-slate-500 font-body font-medium mt-1 block">
              Dapat dipakai oleh pembeli saat ini
            </span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Total Penggunaan Kuota */}
        <div className="clay-card p-6 bg-white rounded-3xl border-2 border-[#FFE8D6] shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Penggunaan
            </span>
            <div className="text-3xl font-heading font-black text-[#FF9F43]">
              {loading ? (
                <div className="h-9 w-24 bg-slate-100 rounded-xl animate-pulse" />
              ) : (
                `${metrics.totalUsed} Klaim`
              )}
            </div>
            <span className="text-xs text-slate-500 font-body font-medium mt-1 block">
              {metrics.totalLimit > 0 ? `Dari batas kuota ${metrics.totalLimit}` : 'Dari kuota voucher aktif'}
            </span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-[#F0F9FD] border border-[#DDF2FC] text-[#2E86AB] flex items-center justify-center shadow-xs">
            <Ticket className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action Bar (Search, Filters, Create Button) */}
      <div className="clay-card p-4 sm:p-5 bg-white rounded-3xl border-2 border-[#FFE8D6] shadow-md space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode kupon, nama promo, deskripsi..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border-2 border-slate-200 focus:border-[#FF9F43] rounded-2xl text-xs font-body font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-heading font-bold">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  typeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Semua Tipe
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('fixed')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  typeFilter === 'fixed'
                    ? 'bg-orange-500 text-white shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Nominal (Rp)
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('percentage')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  typeFilter === 'percentage'
                    ? 'bg-amber-500 text-white shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Persen (%)
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('shipping')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  typeFilter === 'shipping'
                    ? 'bg-sky-500 text-white shadow-xs font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Ongkir
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border-2 border-slate-200 text-xs font-heading font-bold text-slate-700 rounded-2xl outline-none focus:border-[#FF9F43] cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="active">Hanya Aktif</option>
              <option value="inactive">Hanya Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vouchers Table & Card List */}
      <div className="clay-card bg-white rounded-3xl border-2 border-[#FFE8D6] shadow-md overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="w-8 h-8 text-[#FF9F43] animate-spin" />
            <p className="text-sm font-heading font-bold text-slate-600">Memuat daftar voucher promo...</p>
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FFF2E5] border-2 border-[#FFDFC2] text-[#FF9F43] flex items-center justify-center mx-auto shadow-xs">
              <Ticket className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-heading font-black text-slate-800">
                {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Tidak ada voucher yang cocok'
                  : 'Belum ada Voucher Promo'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-body max-w-md mx-auto">
                {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Coba ubah kata kunci pencarian atau reset filter untuk menemukan voucher lainnya.'
                  : 'Buat voucher promo pertama Anda untuk menarik pembeli dan meningkatkan penjualan.'}
              </p>
            </div>
            {!(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="clay-btn-orange text-white px-5 py-2.5 rounded-2xl text-xs font-heading font-black shadow-md hover:scale-102 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Voucher Pertama</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-heading font-black uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-5">Kode Voucher</th>
                  <th className="py-4 px-5">Nama & Deskripsi Promo</th>
                  <th className="py-4 px-5">Tipe & Nilai Diskon</th>
                  <th className="py-4 px-5">Min. Belanja</th>
                  <th className="py-4 px-5">Masa Berlaku</th>
                  <th className="py-4 px-5">Kuota Terpakai</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-body">
                {filteredVouchers.map((voucher) => {
                  const now = new Date().getTime();
                  const isExpired = voucher.end_date && new Date(voucher.end_date).getTime() < now;
                  const isNotStarted = new Date(voucher.start_date).getTime() > now;
                  const usagePercent =
                    voucher.usage_limit && voucher.usage_limit > 0
                      ? Math.min(100, Math.round((voucher.used_count / voucher.usage_limit) * 100))
                      : null;

                  return (
                    <tr
                      key={voucher.id}
                      className="hover:bg-amber-50/30 transition-colors group"
                    >
                      {/* 1. Kode Voucher (Clay Pill with Copy Button) */}
                      <td className="py-4 px-5">
                        <div className="inline-flex items-center gap-2 bg-[#FFF2E5] border border-[#FFDFC2] px-3 py-1.5 rounded-2xl shadow-2xs group-hover:border-[#FF9F43] transition-colors">
                          <span className="font-heading font-black text-xs text-[#D46B08] tracking-wider">
                            {voucher.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(voucher.code)}
                            className="text-slate-400 hover:text-[#FF9F43] p-0.5 rounded transition-colors cursor-pointer"
                            title="Salin kode voucher"
                          >
                            {copiedCode === voucher.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* 2. Nama & Deskripsi */}
                      <td className="py-4 px-5 max-w-xs">
                        <div className="font-heading font-black text-slate-800 text-sm truncate">
                          {voucher.name}
                        </div>
                        {voucher.description ? (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {voucher.description}
                          </p>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Tanpa deskripsi</span>
                        )}
                      </td>

                      {/* 3. Tipe & Nilai Diskon */}
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <div>{getDiscountBadge(voucher.discount_type)}</div>
                          <div className="font-heading font-black text-slate-800 text-xs">
                            {getDiscountLabel(voucher)}
                          </div>
                        </div>
                      </td>

                      {/* 4. Minimal Belanja */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {voucher.min_order_amount > 0 ? (
                          <div className="font-heading font-bold text-slate-800">
                            {formatRupiah(voucher.min_order_amount)}
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                            Tanpa Minimal
                          </span>
                        )}
                      </td>

                      {/* 5. Masa Berlaku */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-[11px] text-slate-600 font-medium">
                            {formatDateIndo(voucher.start_date)}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            s/d <span className="font-semibold text-slate-700">{formatDateIndo(voucher.end_date)}</span>
                          </div>
                          {isExpired ? (
                            <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black border border-rose-200">
                              Kadaluarsa
                            </span>
                          ) : isNotStarted ? (
                            <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black border border-amber-200">
                              Belum Mulai
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* 6. Kuota Terpakai with Progress */}
                      <td className="py-4 px-5">
                        <div className="space-y-1.5 w-32">
                          <div className="flex items-center justify-between text-[11px] font-heading font-bold text-slate-700">
                            <span>{voucher.used_count} Terpakai</span>
                            {voucher.usage_limit && (
                              <span className="text-slate-400">/ {voucher.usage_limit}</span>
                            )}
                          </div>
                          {usagePercent !== null ? (
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/80">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  usagePercent >= 100
                                    ? 'bg-rose-500'
                                    : usagePercent >= 75
                                    ? 'bg-amber-500'
                                    : 'bg-[#FF9F43]'
                                }`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium italic block">
                              Tak terbatas
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 7. Status Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(voucher)}
                          disabled={togglingId === voucher.id}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            voucher.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                          } ${togglingId === voucher.id ? 'opacity-50' : ''}`}
                          title={`Klik untuk ${voucher.is_active ? 'menonaktifkan' : 'mengaktifkan'}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              voucher.is_active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <div className="text-[10px] font-heading font-bold mt-1 text-slate-500">
                          {voucher.is_active ? 'Aktif' : 'Nonaktif'}
                        </div>
                      </td>

                      {/* 8. Aksi (Edit & Hapus) */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(voucher)}
                            className="p-2 text-slate-500 hover:text-[#FF9F43] hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                            title="Edit Voucher"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingVoucher(voucher)}
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title="Hapus Voucher"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* ========================================================================= */}
      {/* CREATE / EDIT VOUCHER MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border-2 border-[#FFE8D6] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 via-white to-sky-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF9F43] text-white flex items-center justify-center shadow-md">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-heading font-black text-slate-900">
                    {editingVoucherId ? 'Edit Voucher Promo' : 'Buat Voucher Promo Baru'}
                  </h2>
                  <p className="text-xs text-slate-500 font-body">
                    {editingVoucherId
                      ? 'Perbarui pengaturan diskon dan masa berlaku voucher'
                      : 'Isi detail kupon promo diskon untuk pembeli'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
              {formError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                {/* Form Column (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Row 1: Code & Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-heading font-black text-slate-700 uppercase tracking-wider mb-1.5">
                        Kode Voucher <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''),
                          })
                        }
                        placeholder="Contoh: HEMAT2026"
                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-[#FF9F43] focus:bg-white rounded-2xl text-xs font-heading font-black text-slate-800 placeholder:text-slate-400 uppercase tracking-wider outline-none transition-all"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Otomatis huruf besar & tanpa spasi
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-heading font-black text-slate-700 uppercase tracking-wider mb-1.5">
                        Nama Promo <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Contoh: Diskon Gajian Spesial"
                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-[#FF9F43] focus:bg-white rounded-2xl text-xs font-body font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-heading font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      Deskripsi Promo (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Contoh: Dapatkan potongan spesial khusus produk popok dan pakaian bayi minggu ini."
                      className="w-full px-4 py-2 bg-slate-50 border-2 border-slate-200 focus:border-[#FF9F43] focus:bg-white rounded-2xl text-xs font-body text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                    />
                  </div>

                  {/* Row 2: Discount Type Selector */}
                  <div>
                    <label className="block text-xs font-heading font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      Tipe Diskon <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                        className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                          formData.discountType === 'fixed'
                            ? 'bg-orange-50/60 border-orange-400 text-orange-950 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <DollarSign className={`w-4 h-4 ${formData.discountType === 'fixed' ? 'text-orange-600' : 'text-slate-400'}`} />
                          {formData.discountType === 'fixed' && <Check className="w-3.5 h-3.5 text-orange-600" />}
                        </div>
                        <span className="text-xs font-heading font-bold">Nominal (Rp)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                        className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                          formData.discountType === 'percentage'
                            ? 'bg-amber-50/60 border-amber-400 text-amber-950 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Percent className={`w-4 h-4 ${formData.discountType === 'percentage' ? 'text-amber-600' : 'text-slate-400'}`} />
                          {formData.discountType === 'percentage' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                        </div>
                        <span className="text-xs font-heading font-bold">Persen (%)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, discountType: 'shipping' })}
                        className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                          formData.discountType === 'shipping'
                            ? 'bg-sky-50/60 border-sky-400 text-sky-950 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Truck className={`w-4 h-4 ${formData.discountType === 'shipping' ? 'text-sky-600' : 'text-slate-400'}`} />
                          {formData.discountType === 'shipping' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                        </div>
                        <span className="text-xs font-heading font-bold">Ongkos Kirim</span>
                      </button>
                    </div>
                  </div>

                  {/* Row 3: Discount Value & Max Discount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-heading font-black text-slate-700 uppercase tracking-wider mb-1.5">
                        {formData.discountType === 'percentage'
                          ? 'Persentase Diskon (%)'
                          : 'Nilai Potongan (Rp)'}{' '}
                        <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min={1}
                          max={formData.discountType === 'percentage' ? 100 : undefined}
                          value={formData.discountValue}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              discountValue: e.target.value === '' ? '' : Number(e.target.value),
                            })
                          }
                          placeholder={formData.discountType === 'percentage' ? 'Contoh: 15' : 'Contoh: 25000'}
                          className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-[#FF9F43] focus:bg-white rounded-2xl text-xs font-heading font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          {formData.discountType === 'percentage' ? '%' : 'Rp'}
                        </span>
                      </div>
                    </div>

                    {formData.discountType === 'percentage' ? (
                      <div>
                        <label className="block text-xs font-heading font-black text-slate-700 uppercase tracking-wider mb-1.5">
                          Maksimal Potongan (Rp)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={formData.maxDiscountAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxDiscountAmount: e.target.value === '' ? '' : Number(e.target.value),
                            })
                          }
                          placeholder="Kosongkan jika tanpa batas"
                          className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-[#FF9F43] focus:bg-white rounded-2xl text-xs font-heading font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Batas maksimal diskon persen
                        </span>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-heading font-black text-slate-700 uppercase tracking-wider mb-1.5">
                          Minimal Belanja (Rp)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={formData.minOrderAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              minOrderAmount: e.target.value === '' ? '' : Number(e.target.value),
                            })
                          }
                          placeholder="0 jika tanpa minimal"
                          className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-[#FF9F43] focus:bg-white rounded-2xl text-xs font-heading font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>

                  {formData.discountType === 'percentage' && (
                    <div>
                      <label className="block text-xs font-heading font-black text-slate-700 uppercase tracking-wider mb-1.5">
                        Minimal Belanja (Rp)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.minOrderAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minOrderAmount: e.target.value === '' ? '' : Number(e.target.value),
                          })
                        }
                        placeholder="0 jika tanpa minimal"
                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-[#FF9F43] focus:bg-white rounded-2xl text-xs font-heading font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                      />
                    </div>
                  )}

                  {/* Row 4: Quota Usage Limit */}
                  <div>
                    <label className="block text-xs font-heading font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      Batas Kuota Penggunaan Voucher
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.usageLimit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          usageLimit: e.target.value === '' ? '' : Number(e.target.value),
                        })
                      }
                      placeholder="Kosongkan jika kuota tidak terbatas"
                      className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 focus:border-[#FF9F43] focus:bg-white rounded-2xl text-xs font-heading font-bold text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Total maksimal berapa kali kupon ini dapat digunakan oleh semua pembeli
                    </span>
                  </div>

                  {/* Row 5: Validity Period */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <label className="block text-xs font-heading font-black text-slate-700 uppercase tracking-wider">
                      Masa Berlaku Voucher
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">
                          Mulai Berlaku
                        </span>
                        <input
                          type="datetime-local"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-body font-semibold text-slate-800 outline-none focus:border-[#FF9F43]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-600">Berakhir Pada</span>
                          <label className="inline-flex items-center gap-1.5 text-[10px] font-heading font-bold text-slate-500 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.noEndDate}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  noEndDate: e.target.checked,
                                  endDate: e.target.checked ? '' : formData.endDate,
                                })
                              }
                              className="rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                            />
                            <span>Selamanya</span>
                          </label>
                        </div>
                        <input
                          type="datetime-local"
                          disabled={formData.noEndDate}
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-body font-semibold text-slate-800 outline-none focus:border-[#FF9F43] ${
                            formData.noEndDate ? 'opacity-40 cursor-not-allowed' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Toggle Active Status */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-xs font-heading font-black text-slate-800 block">
                        Status Voucher Aktif
                      </span>
                      <p className="text-[11px] text-slate-500 font-body">
                        Voucher langsung dapat digunakan oleh pembeli di keranjang & checkout
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          formData.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Live Preview Column (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-heading font-black text-slate-700 uppercase tracking-wider">
                    <Eye className="w-3.5 h-3.5 text-[#FF9F43]" />
                    <span>Live Preview Tiket Kupon</span>
                  </div>

                  {/* Claymorphic Voucher Ticket Preview */}
                  <div className="clay-card p-6 bg-gradient-to-br from-amber-500 via-[#FF9F43] to-[#EE8A2B] text-white rounded-3xl border-2 border-[#FFD4B2] shadow-xl relative overflow-hidden space-y-4">
                    <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

                    {/* Top Row */}
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-[10px] font-heading font-black tracking-wider border border-white/30 uppercase">
                        {formData.discountType === 'shipping'
                          ? 'Kupon Ongkir'
                          : formData.discountType === 'percentage'
                          ? 'Kupon Persen'
                          : 'Kupon Nominal'}
                      </span>
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-amber-200" />
                        <span className="text-[11px] font-heading font-bold text-amber-100">
                          {formData.isActive ? 'AKTIF' : 'NONAKTIF'}
                        </span>
                      </div>
                    </div>

                    {/* Discount Headline */}
                    <div className="space-y-1 pt-1">
                      <div className="text-2xl font-heading font-black tracking-tight">
                        {getDiscountLabel(formData)}
                      </div>
                      <div className="text-sm font-heading font-bold text-amber-50">
                        {formData.name || 'Nama Promo'}
                      </div>
                      {formData.description && (
                        <p className="text-xs text-amber-100/90 font-body line-clamp-2">
                          {formData.description}
                        </p>
                      )}
                    </div>

                    {/* Dashed Separator */}
                    <div className="border-t-2 border-dashed border-white/30 my-3" />

                    {/* Bottom Voucher Code & Details */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between bg-black/20 backdrop-blur-xs p-3 rounded-2xl border border-white/20">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-amber-200 font-bold block">
                            Kode Kupon
                          </span>
                          <span className="text-sm font-heading font-black tracking-widest text-white">
                            {formData.code || 'KODEPROMO'}
                          </span>
                        </div>
                        <div className="px-2.5 py-1 bg-white text-[#D46B08] rounded-xl text-[10px] font-heading font-black shadow-xs">
                          PAKAI
                        </div>
                      </div>

                      <div className="text-[11px] text-amber-100 font-medium space-y-0.5">
                        <div>
                          • Min. Belanja:{' '}
                          <span className="font-bold text-white">
                            {formData.minOrderAmount && Number(formData.minOrderAmount) > 0
                              ? formatRupiah(Number(formData.minOrderAmount))
                              : 'Tanpa Minimal'}
                          </span>
                        </div>
                        <div>
                          • Berlaku:{' '}
                          <span className="font-bold text-white">
                            {formData.noEndDate ? 'Selamanya' : formatDateIndo(formData.endDate)}
                          </span>
                        </div>
                        {formData.usageLimit && (
                          <div>
                            • Kuota:{' '}
                            <span className="font-bold text-white">
                              {formData.usageLimit} Penggunaan
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 font-body flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Voucher ini akan otomatis divalidasi sistem saat pembeli memasukkan kode di halaman keranjang maupun checkout pesanan.
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 text-xs font-heading font-bold text-slate-600 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="clay-btn-orange text-white px-6 py-2.5 rounded-2xl text-xs font-heading font-black shadow-md hover:scale-102 active:scale-98 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingVoucherId ? 'Simpan Perubahan' : 'Buat Voucher Sekarang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border-2 border-rose-200 shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-heading font-black text-slate-900">
                Hapus Voucher Promo?
              </h3>
              <p className="text-xs text-slate-500 font-body">
                Apakah Anda yakin ingin menghapus voucher{' '}
                <span className="font-heading font-black text-rose-600">
                  {deletingVoucher.code}
                </span>
                ? Tindakan ini tidak dapat dibatalkan dan kupon tidak akan bisa dipakai lagi oleh pembeli.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingVoucher(null)}
                disabled={deleteSubmitting}
                className="flex-1 py-2.5 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 text-xs font-heading font-bold text-slate-600 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteSubmitting}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-heading font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {deleteSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Hapus Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
