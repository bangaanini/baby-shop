'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Edit3,
  Trash2,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Home,
  Building,
  Building2,
  Tag,
  Check,
  Phone,
  User,
  AlertTriangle,
  X,
  Sparkles,
} from 'lucide-react';
import { AddressModal, AddressFormData } from '@/components/user/AddressModal';

export interface UserAddressItem {
  id: string;
  userId?: string;
  recipientName: string;
  phone: string;
  label: string | null;
  fullAddress: string;
  province: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;
  isPrimary: boolean;
  // Indonesian aliases
  namaPenerima?: string;
  telepon?: string;
  labelAlamat?: string;
  alamatLengkap?: string;
  provinsi?: string;
  kotaKabupaten?: string;
  kecamatan?: string;
  kodePos?: string;
  isUtama?: boolean;
}

export interface AddressesTabProps {
  initialAddresses?: UserAddressItem[];
  userId?: string;
  onAddressesUpdated?: (addresses: UserAddressItem[]) => void;
}

export function AddressesTab({
  initialAddresses,
  userId,
  onAddressesUpdated,
}: AddressesTabProps) {
  const [addresses, setAddresses] = useState<UserAddressItem[]>(
    initialAddresses || []
  );
  const [isLoading, setIsLoading] = useState(!initialAddresses);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressFormData | null>(
    null
  );

  // Delete Confirm Dialog State
  const [deleteTarget, setDeleteTarget] = useState<UserAddressItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action Loading State (e.g. setting primary)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Normalize address structure from backend/mock
  const normalizeAddress = (raw: any): UserAddressItem => {
    return {
      id: String(raw.id),
      userId: raw.userId || userId,
      recipientName: raw.recipientName || raw.namaPenerima || 'Penerima',
      phone: raw.phone || raw.telepon || '',
      label: raw.label || raw.labelAlamat || 'Rumah',
      fullAddress: raw.fullAddress || raw.alamatLengkap || '',
      province: raw.province || raw.provinsi || '',
      city: raw.city || raw.kotaKabupaten || '',
      district: raw.district || raw.kecamatan || '',
      postalCode: raw.postalCode || raw.kodePos || '',
      isPrimary: Boolean(raw.isPrimary ?? raw.isUtama ?? false),
      namaPenerima: raw.recipientName || raw.namaPenerima || 'Penerima',
      telepon: raw.phone || raw.telepon || '',
      labelAlamat: raw.label || raw.labelAlamat || 'Rumah',
      alamatLengkap: raw.fullAddress || raw.alamatLengkap || '',
      provinsi: raw.province || raw.provinsi || '',
      kotaKabupaten: raw.city || raw.kotaKabupaten || '',
      kecamatan: raw.district || raw.kecamatan || '',
      kodePos: raw.postalCode || raw.kodePos || '',
      isUtama: Boolean(raw.isPrimary ?? raw.isUtama ?? false),
    };
  };

  // Fetch addresses from API
  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const url = userId
        ? `/api/user/addresses?userId=${encodeURIComponent(userId)}`
        : '/api/user/addresses';
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        const normalized = data.data.map(normalizeAddress);
        setAddresses(normalized);
        onAddressesUpdated?.(normalized);
      } else {
        setAddresses([]);
        onAddressesUpdated?.([]);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialAddresses && initialAddresses.length > 0) {
      setAddresses(initialAddresses.map(normalizeAddress));
      setIsLoading(false);
    } else {
      fetchAddresses();
    }
  }, [initialAddresses]);

  // Filter addresses by search query
  const filteredAddresses = useMemo(() => {
    if (!searchQuery.trim()) return addresses;
    const q = searchQuery.toLowerCase().trim();
    return addresses.filter((item) => {
      const recipient = (item.recipientName || item.namaPenerima || '').toLowerCase();
      const labelText = (item.label || item.labelAlamat || '').toLowerCase();
      const addressText = (item.fullAddress || item.alamatLengkap || '').toLowerCase();
      const cityText = (item.city || item.kotaKabupaten || '').toLowerCase();
      const districtText = (item.district || item.kecamatan || '').toLowerCase();
      const provinceText = (item.province || item.provinsi || '').toLowerCase();
      const phoneText = (item.phone || item.telepon || '').toLowerCase();
      const postalText = (item.postalCode || item.kodePos || '').toLowerCase();

      return (
        recipient.includes(q) ||
        labelText.includes(q) ||
        addressText.includes(q) ||
        cityText.includes(q) ||
        districtText.includes(q) ||
        provinceText.includes(q) ||
        phoneText.includes(q) ||
        postalText.includes(q)
      );
    });
  }, [addresses, searchQuery]);

  // Handle setting address as Primary
  const handleSetPrimary = async (address: UserAddressItem) => {
    if (address.isPrimary) return;

    try {
      setActionLoadingId(address.id);
      const res = await fetch(`/api/user/addresses/${address.id}/primary`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengubah alamat utama');
      }

      // Update local state
      const updated = addresses.map((item) => ({
        ...item,
        isPrimary: item.id === address.id,
        isUtama: item.id === address.id,
      }));

      // Sort primary to the top
      updated.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

      setAddresses(updated);
      onAddressesUpdated?.(updated);
      showToast('Alamat utama berhasil diperbarui!');
    } catch (err: any) {
      console.error('Error setting primary address:', err);
      showToast(err.message || 'Gagal mengubah alamat utama', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Delete Address
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/user/addresses/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghapus alamat');
      }

      const remaining = addresses.filter((item) => item.id !== deleteTarget.id);

      // If the deleted one was primary and there are remaining addresses, mark the first one as primary
      if (deleteTarget.isPrimary && remaining.length > 0) {
        remaining[0].isPrimary = true;
        remaining[0].isUtama = true;
      }

      setAddresses(remaining);
      onAddressesUpdated?.(remaining);
      showToast('Alamat berhasil dihapus');
      setDeleteTarget(null);
    } catch (err: any) {
      console.error('Error deleting address:', err);
      showToast(err.message || 'Gagal menghapus alamat', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Modal Save Success (Create or Update)
  const handleModalSuccess = (savedAddress: any, isEdit: boolean) => {
    const normalized = normalizeAddress(savedAddress);

    if (isEdit) {
      let updatedList = addresses.map((item) =>
        item.id === normalized.id ? normalized : item
      );

      // If updated address was marked as primary, unmark other addresses
      if (normalized.isPrimary) {
        updatedList = updatedList.map((item) =>
          item.id === normalized.id
            ? normalized
            : { ...item, isPrimary: false, isUtama: false }
        );
      }

      // Sort so primary is top
      updatedList.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
      setAddresses(updatedList);
      onAddressesUpdated?.(updatedList);
      showToast('Alamat berhasil diperbarui!');
    } else {
      let updatedList = [...addresses];

      if (normalized.isPrimary || updatedList.length === 0) {
        normalized.isPrimary = true;
        normalized.isUtama = true;
        updatedList = updatedList.map((item) => ({
          ...item,
          isPrimary: false,
          isUtama: false,
        }));
        updatedList.unshift(normalized);
      } else {
        updatedList.push(normalized);
      }

      setAddresses(updatedList);
      onAddressesUpdated?.(updatedList);
      showToast('Alamat baru berhasil ditambahkan!');
    }
  };

  // Helper for Label Icon
  const getLabelIcon = (labelStr?: string | null) => {
    const l = (labelStr || '').toLowerCase();
    if (l.includes('kantor') || l.includes('office')) return Building;
    if (l.includes('apartemen') || l.includes('apt') || l.includes('tower')) return Building2;
    if (l.includes('rumah') || l.includes('home')) return Home;
    return Tag;
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border text-xs sm:text-sm font-semibold transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-700 shadow-rose-950/20'
              : 'bg-rose-900 text-white border-rose-700 shadow-rose-950/20'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-800">
              Daftar Alamat Pengiriman
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
              {addresses.length} Alamat
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola daftar alamat pengiriman pesanan Anda untuk memudahkan proses checkout belanja.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingAddress(null);
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-98 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Alamat Baru</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama penerima, label, kota, atau alamat..."
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-200 focus:border-rose-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              title="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-20 h-5 bg-slate-200 rounded-md" />
                <div className="w-24 h-5 bg-slate-200 rounded-full" />
              </div>
              <div className="w-48 h-5 bg-slate-200 rounded-md" />
              <div className="w-full max-w-md h-4 bg-slate-200 rounded-md" />
              <div className="w-64 h-4 bg-slate-200 rounded-md" />
              <div className="flex gap-2 pt-2">
                <div className="w-24 h-8 bg-slate-200 rounded-xl" />
                <div className="w-24 h-8 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAddresses.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 sm:p-12 border border-slate-100 shadow-xs text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-4 shadow-inner">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-800 mb-1">
            {searchQuery
              ? 'Alamat tidak ditemukan'
              : 'Belum Ada Alamat Pengiriman'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
            {searchQuery
              ? `Tidak ada alamat yang cocok dengan kata kunci "${searchQuery}". Silakan periksa kembali ejaan atau gunakan kata kunci lain.`
              : 'Tambahkan alamat pengiriman utama Anda agar proses pemesanan dan estimasi ongkir otomatis terisi.'}
          </p>

          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Hapus Filter Pencarian
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingAddress(null);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-98 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Alamat Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        /* Address Cards List */
        <div className="space-y-4">
          {filteredAddresses.map((addr) => {
            const isPrim = Boolean(addr.isPrimary || addr.isUtama);
            const LabelIcon = getLabelIcon(addr.label || addr.labelAlamat);
            const labelName = addr.label || addr.labelAlamat || 'Rumah';
            const recipient = addr.recipientName || addr.namaPenerima || 'Penerima';
            const phoneStr = addr.phone || addr.telepon || '-';
            const fullAddr = addr.fullAddress || addr.alamatLengkap || '-';
            const districtStr = addr.district || addr.kecamatan || '';
            const cityStr = addr.city || addr.kotaKabupaten || '';
            const provinceStr = addr.province || addr.provinsi || '';
            const postalStr = addr.postalCode || addr.kodePos || '';

            const areaParts = [districtStr, cityStr, provinceStr, postalStr].filter(
              Boolean
            );
            const areaString = areaParts.join(', ');

            return (
              <div
                key={addr.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-200 hover:shadow-md ${
                  isPrim
                    ? 'border-rose-300 ring-2 ring-rose-500/10 shadow-xs bg-gradient-to-r from-rose-50/20 via-white to-white'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left content: details */}
                  <div className="space-y-2 flex-1">
                    {/* Header line: label & badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                        <LabelIcon className="w-3 h-3 text-slate-500" />
                        <span>{labelName}</span>
                      </span>

                      {isPrim && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-bold shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Alamat Utama</span>
                        </span>
                      )}
                    </div>

                    {/* Recipient info */}
                    <div className="pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-slate-800">
                          {recipient}
                        </span>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{phoneStr}</span>
                        </span>
                      </div>
                    </div>

                    {/* Full address */}
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                      {fullAddr}
                    </p>

                    {/* District & City */}
                    {areaString && (
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{areaString}</span>
                      </p>
                    )}
                  </div>

                  {/* Right content: Actions */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                    <div className="flex items-center gap-2">
                      {/* Ubah Alamat Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddress({
                            id: addr.id,
                            recipientName: recipient,
                            phone: phoneStr,
                            label: labelName,
                            province: provinceStr,
                            city: cityStr,
                            district: districtStr,
                            postalCode: postalStr,
                            fullAddress: fullAddr,
                            isPrimary: isPrim,
                          });
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Ubah Alamat"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Ubah</span>
                      </button>

                      {/* Hapus Alamat Button */}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(addr)}
                        className="p-1.5 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                        title="Hapus Alamat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Jadikan Alamat Utama Button */}
                    {!isPrim && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(addr)}
                        disabled={actionLoadingId === addr.id}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoadingId === addr.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                        )}
                        <span>Jadikan Utama</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        onSuccess={handleModalSuccess}
        initialData={editingAddress}
        userId={userId}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              setDeleteTarget(null);
            }
          }}
        >
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 animate-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">
                  Hapus Alamat Pengiriman?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-800">
                {deleteTarget.recipientName || deleteTarget.namaPenerima} ({deleteTarget.label || deleteTarget.labelAlamat || 'Alamat'})
              </p>
              <p className="text-slate-500 line-clamp-2">
                {deleteTarget.fullAddress || deleteTarget.alamatLengkap}
              </p>
            </div>

            {deleteTarget.isPrimary && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Alamat ini adalah <strong>Alamat Utama</strong>. Menghapusnya akan secara otomatis memindahkan status utama ke alamat Anda berikutnya.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Alamat</span>
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
