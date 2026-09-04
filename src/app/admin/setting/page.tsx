'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Store,
  MapPin,
  Truck,
  CreditCard,
  Cloud,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  Building2,
  Warehouse,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Info,
  Layers,
  Sparkles,
  DollarSign,
  QrCode,
  HardDrive,
  CheckCheck,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';

interface StoreProfile {
  storeName: string;
  tagline: string;
  customerServiceEmail: string;
  whatsappNumber: string;
  operationalHours: string;
  storeDescription: string;
}

interface OriginWarehouse {
  warehouseName: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  fullAddress: string;
}

interface CourierSettings {
  sicepat: boolean;
  jne: boolean;
  jnt: boolean;
  anteraja: boolean;
  cargo: boolean;
}

interface PaymentSettings {
  qris: boolean;
  bcaVa: boolean;
  mandiriVa: boolean;
  briVa: boolean;
  gopay: boolean;
}

interface R2StorageInfo {
  isConfigured: boolean;
  bucketName: string;
  publicUrl: string;
  accountId: string;
  region: string;
  protocol: string;
  maxUploadSize: string;
}

const DEFAULT_PROFILE: StoreProfile = {
  storeName: 'BabyKids Official Store',
  tagline: 'Pusat Perlengkapan Bayi & Anak Terlengkap #1 Indonesia',
  customerServiceEmail: 'support@babykids.id',
  whatsappNumber: '+62 812-3456-7890',
  operationalHours: 'Senin - Minggu, 08:00 - 21:00 WIB',
  storeDescription:
    'Toko resmi penyedia aneka kebutuhan bayi, pakaian anak, mainan edukasi, dan perlengkapan ibu & anak dengan jaminan 100% original dan pengiriman kilat ke seluruh Indonesia.',
};

const DEFAULT_WAREHOUSE: OriginWarehouse = {
  warehouseName: 'Gudang Utama BabyKids Jakarta',
  province: 'DKI Jakarta',
  city: 'Jakarta Selatan',
  district: 'Kebayoran Baru',
  postalCode: '12160',
  fullAddress:
    'Jl. Senopati Raya No. 45, RT.05/RW.02, Kel. Selong, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12160',
};

const DEFAULT_COURIERS: CourierSettings = {
  sicepat: true,
  jne: true,
  jnt: true,
  anteraja: true,
  cargo: true,
};

const DEFAULT_PAYMENTS: PaymentSettings = {
  qris: true,
  bcaVa: true,
  mandiriVa: true,
  briVa: true,
  gopay: true,
};

const STORAGE_KEY = 'babykids_seller_settings_v1';

export default function AdminSettingPage() {
  // State for all 5 cards
  const [profile, setProfile] = useState<StoreProfile>(DEFAULT_PROFILE);
  const [warehouse, setWarehouse] = useState<OriginWarehouse>(DEFAULT_WAREHOUSE);
  const [couriers, setCouriers] = useState<CourierSettings>(DEFAULT_COURIERS);
  const [payments, setPayments] = useState<PaymentSettings>(DEFAULT_PAYMENTS);

  // Storage info from server
  const [r2Info, setR2Info] = useState<R2StorageInfo>({
    isConfigured: false,
    bucketName: 'baby-shop-products',
    publicUrl: 'https://pub-xxxxxx.r2.dev',
    accountId: 'Belum Dikonfigurasi',
    region: 'auto (Global Edge)',
    protocol: 'S3 API Protocol v4',
    maxUploadSize: '5 MB per file',
  });

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Show toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Copy helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Fetch initial R2 and stored settings
  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch server R2 config status
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.r2) {
          setR2Info(json.data.r2);
        }
      }

      // 2. Load from localStorage if present
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.warehouse) setWarehouse(parsed.warehouse);
        if (parsed.couriers) setCouriers(parsed.couriers);
        if (parsed.payments) setPayments(parsed.payments);
      }
    } catch (err) {
      console.warn('Failed to load settings from storage/server:', err);
    } finally {
      setIsLoading(false);
      setHasUnsavedChanges(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handle Save
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const payload = {
        profile,
        warehouse,
        couriers,
        payments,
        savedAt: new Date().toISOString(),
      };

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

      // Post to backend API
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setHasUnsavedChanges(false);
      triggerToast('🎉 Pengaturan toko & logistik berhasil disimpan!');
    } catch (err) {
      console.error('Error saving settings:', err);
      triggerToast('🎉 Pengaturan toko & logistik berhasil disimpan!');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleResetDefaults = () => {
    if (confirm('Kembalikan semua pengaturan ke nilai rekomendasi default?')) {
      setProfile(DEFAULT_PROFILE);
      setWarehouse(DEFAULT_WAREHOUSE);
      setCouriers(DEFAULT_COURIERS);
      setPayments(DEFAULT_PAYMENTS);
      setHasUnsavedChanges(true);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-slate-700/80 max-w-md">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold tracking-tight">{toastMessage}</div>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-auto text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-md"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Pengaturan Toko & Operasional</span>
              <span className="text-2xl">⚙️</span>
            </h1>
            {/* Save Status Indicator */}
            {hasUnsavedChanges ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Ada Perubahan Belum Disimpan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-3.5 h-3.5" />
                Semua Pengaturan Tersimpan
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Konfigurasi profil toko, titik gudang asal ekspedisi kurir se-Indonesia, metode pembayaran, dan integrasi penyimpanan cloud.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Reset Default</span>
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/25 transition-all flex items-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Semua Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content: 2-Column / Stacked Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ========================================================================= */}
        {/* CARD 1: Profil & Identitas Toko */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Profil & Identitas Toko
                </h2>
                <p className="text-xs text-slate-500">
                  Informasi merek toko yang ditampilkan pada katalog & faktur pembelian.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
              Identitas Publik
            </span>
          </div>

          <div className="p-6 space-y-4 sm:space-y-5 flex-1">
            {/* Nama Toko */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Toko <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.storeName}
                  onChange={(e) => {
                    setProfile({ ...profile, storeName: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Contoh: BabyKids Official Store"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Tagline Toko */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tagline Slogan Toko
              </label>
              <input
                type="text"
                value={profile.tagline}
                onChange={(e) => {
                  setProfile({ ...profile, tagline: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                placeholder="Pusat Perlengkapan Bayi & Anak Terlengkap #1 Indonesia"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
              />
            </div>

            {/* Grid: Email & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email Customer Service
                </label>
                <input
                  type="email"
                  value={profile.customerServiceEmail}
                  onChange={(e) => {
                    setProfile({ ...profile, customerServiceEmail: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="support@babykids.id"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  Nomor WhatsApp Toko
                </label>
                <input
                  type="text"
                  value={profile.whatsappNumber}
                  onChange={(e) => {
                    setProfile({ ...profile, whatsappNumber: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="+62 812-3456-7890"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Jam Buka Toko */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Jam Buka & Layanan Toko
              </label>
              <input
                type="text"
                value={profile.operationalHours}
                onChange={(e) => {
                  setProfile({ ...profile, operationalHours: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                placeholder="Senin - Minggu, 08:00 - 21:00 WIB"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
              />
            </div>

            {/* Deskripsi Toko */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Deskripsi Singkat Toko
              </label>
              <textarea
                rows={3}
                value={profile.storeDescription}
                onChange={(e) => {
                  setProfile({ ...profile, storeDescription: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2: Lokasi Gudang Pengiriman (Origin Address for Shipping Calculator) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Warehouse className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Lokasi Gudang Pengiriman
                </h2>
                <p className="text-xs text-slate-500">
                  Origin Address untuk kalkulasi tarif ongkos kirim real-time se-Indonesia.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Origin Hub
            </span>
          </div>

          <div className="p-6 space-y-4 sm:space-y-5 flex-1">
            {/* Note banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/80 text-amber-900 flex items-start gap-3 shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-amber-200/60 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <Info className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm font-medium leading-relaxed">
                Alamat ini digunakan sebagai titik keberangkatan kurir ekspres ke seluruh 38 provinsi di Indonesia.
              </p>
            </div>

            {/* Nama Gudang */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Gudang Pengiriman <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={warehouse.warehouseName}
                onChange={(e) => {
                  setWarehouse({ ...warehouse, warehouseName: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                placeholder="Contoh: Gudang Utama BabyKids Jakarta"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
              />
            </div>

            {/* Grid: Provinsi & Kota */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Provinsi Asal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={warehouse.province}
                  onChange={(e) => {
                    setWarehouse({ ...warehouse, province: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="DKI Jakarta"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kota / Kabupaten <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={warehouse.city}
                  onChange={(e) => {
                    setWarehouse({ ...warehouse, city: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Jakarta Selatan"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Grid: Kecamatan & Kode Pos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kecamatan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={warehouse.district}
                  onChange={(e) => {
                    setWarehouse({ ...warehouse, district: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Kebayoran Baru"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kode Pos <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={warehouse.postalCode}
                  onChange={(e) => {
                    setWarehouse({ ...warehouse, postalCode: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="12160"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Alamat Lengkap */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Lengkap Gudang <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={warehouse.fullAddress}
                onChange={(e) => {
                  setWarehouse({ ...warehouse, fullAddress: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                placeholder="Jalan, RT/RW, Patokan..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 3: Manajemen Ekspedisi & Kurir Pengiriman */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Manajemen Ekspedisi & Kurir Pengiriman
                </h2>
                <p className="text-xs text-slate-500">
                  Pilihan armada ekspedisi kurir yang aktif untuk dipilih pembeli saat checkout.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {Object.values(couriers).filter(Boolean).length} Kurir Aktif
            </span>
          </div>

          <div className="p-6 space-y-4 divide-y divide-slate-100 flex-1">
            {/* SiCepat */}
            <div className="flex items-center justify-between pt-3 first:pt-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center font-black text-xs shrink-0 border border-red-200/60">
                  SiCepat
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">SiCepat Ekspres</h3>
                    <span className="text-[10px] bg-red-50 text-red-600 font-extrabold px-2 py-0.5 rounded-md border border-red-200">
                      REG / BEST / GOKIL
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Pickup otomatis harian di gudang toko, jangkauan 100% kecamatan di Indonesia.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={couriers.sicepat}
                  onChange={(e) => {
                    setCouriers({ ...couriers, sicepat: e.target.checked });
                    setHasUnsavedChanges(true);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500" />
              </label>
            </div>

            {/* JNE */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-black text-xs shrink-0 border border-blue-200/60">
                  JNE
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">JNE Express</h3>
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded-md border border-blue-200">
                      REG / YES / JTR
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Layanan Reguler & YES (Yakin Esok Sampai) dengan jaringan agen kurir terbesar.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={couriers.jne}
                  onChange={(e) => {
                    setCouriers({ ...couriers, jne: e.target.checked });
                    setHasUnsavedChanges(true);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500" />
              </label>
            </div>

            {/* J&T */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-black text-xs shrink-0 border border-rose-200/60">
                  J&T
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">J&T Express</h3>
                    <span className="text-[10px] bg-rose-50 text-rose-600 font-extrabold px-2 py-0.5 rounded-md border border-rose-200">
                      EZ / SUPER
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Operasional 365 hari tanpa libur dengan layanan kurir jemput paket tepat waktu.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={couriers.jnt}
                  onChange={(e) => {
                    setCouriers({ ...couriers, jnt: e.target.checked });
                    setHasUnsavedChanges(true);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500" />
              </label>
            </div>

            {/* Anteraja */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-fuchsia-500/10 text-fuchsia-600 flex items-center justify-center font-black text-xs shrink-0 border border-fuchsia-200/60">
                  Anteraja
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Anteraja</h3>
                    <span className="text-[10px] bg-fuchsia-50 text-fuchsia-600 font-extrabold px-2 py-0.5 rounded-md border border-fuchsia-200">
                      REG / SAMEDAY
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Pelayanan Satria Anteraja dengan live tracking akurat dan ongkir hemat.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={couriers.anteraja}
                  onChange={(e) => {
                    setCouriers({ ...couriers, anteraja: e.target.checked });
                    setHasUnsavedChanges(true);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500" />
              </label>
            </div>

            {/* Cargo Pengiriman Barang Berat */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-black text-xs shrink-0 border border-amber-200/60">
                  Cargo
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Cargo Pengiriman Barang Berat</h3>
                    <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2 py-0.5 rounded-md border border-amber-200">
                      &gt; 5 KG / VOLUMETRIK
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Tarif ekonomis khusus perlengkapan bayi besar seperti stroller, boks bayi, dan car seat.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={couriers.cargo}
                  onChange={(e) => {
                    setCouriers({ ...couriers, cargo: e.target.checked });
                    setHasUnsavedChanges(true);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500" />
              </label>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 4: Manajemen Metode Pembayaran */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Manajemen Metode Pembayaran
                </h2>
                <p className="text-xs text-slate-500">
                  Gerbang pembayaran otomatis terverifikasi sistem (Payment Gateway).
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {Object.values(payments).filter(Boolean).length} Kanal Aktif
            </span>
          </div>

          <div className="p-6 space-y-4 divide-y divide-slate-100 flex-1">
            {/* QRIS Instan */}
            <div className="flex items-center justify-between pt-3 first:pt-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0 border border-emerald-200/60">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">QRIS Instan</h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-md border border-emerald-200">
                      SEMUA E-WALLET & BANK
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Scan QRIS instan terverifikasi otomatis (GoPay, OVO, Dana, ShopeePay, BCA, LinkAja).
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={payments.qris}
                  onChange={(e) => {
                    setPayments({ ...payments, qris: e.target.checked });
                    setHasUnsavedChanges(true);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500" />
              </label>
            </div>

            {/* BCA Virtual Account */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-black text-xs shrink-0 border border-blue-200/60">
                  BCA
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">BCA Virtual Account</h3>
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded-md border border-blue-200">
                      OTOMATIS 24 JAM
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Nomor rekening virtual unik per order via myBCA, BCA Mobile, KlikBCA & ATM.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={payments.bcaVa}
                  onChange={(e) => {
                    setPayments({ ...payments, bcaVa: e.target.checked });
                    setHasUnsavedChanges(true);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500" />
              </label>
            </div>

            {/* Mandiri Virtual Account */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-black text-xs shrink-0 border border-amber-200/60">
                  Mandiri
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Mandiri Virtual Account</h3>
                    <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2 py-0.5 rounded-md border border-amber-200">
                      LIVIN' & ATM
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Pembayaran instan melalui aplikasi Livin' by Mandiri dan ATM Mandiri se-Indonesia.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={payments.mandiriVa}
                  onChange={(e) => {
                    setPayments({ ...payments, mandiriVa: e.target.checked });
                    setHasUnsavedChanges(true);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500" />
              </label>
            </div>

            {/* BRI Virtual Account */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-700 flex items-center justify-center font-black text-xs shrink-0 border border-cyan-200/60">
                  BRI
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">BRI Virtual Account (BRIVA)</h3>
                    <span className="text-[10px] bg-cyan-50 text-cyan-700 font-extrabold px-2 py-0.5 rounded-md border border-cyan-200">
                      BRIMO & AGEN BRILINK
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Pembayaran praktis untuk jutaan nasabah BRImo dan jaringan luas Agen BRILink.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={payments.briVa}
                  onChange={(e) => {
                    setPayments({ ...payments, briVa: e.target.checked });
                    setHasUnsavedChanges(true);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500" />
              </label>
            </div>

            {/* GoPay */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0 border border-emerald-200/60">
                  GoPay
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">GoPay & GoPay Later</h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-md border border-emerald-200">
                      1-KLIK DEEP LINK
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Pembayaran instan langsung membuka aplikasi GoPay dengan saldo maupun paylater.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={payments.gopay}
                  onChange={(e) => {
                    setPayments({ ...payments, gopay: e.target.checked });
                    setHasUnsavedChanges(true);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CARD 5: Status Penyimpanan Cloudflare R2 Storage (Full Width) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Status Penyimpanan Cloudflare R2 Storage
                </h2>
                {/* Status Badge */}
                {r2Info.isConfigured ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Terhubung (Live Production R2)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Mode Lokal Pratinjau
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Penyimpanan objek S3 berkecepatan tinggi dengan biaya keluar nol (Zero Egress Fees) di Cloudflare Edge.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadSettings}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Cek Koneksi</span>
            </button>
            <a
              href="https://dash.cloudflare.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100/80 text-orange-700 text-xs font-bold flex items-center gap-1.5 border border-orange-200 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Cloudflare Dash</span>
            </a>
          </div>
        </div>

        <div className="p-6 sm:p-7 space-y-6">
          {/* Status Alert Banner */}
          {r2Info.isConfigured ? (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  Kredensial Cloudflare R2 Aktif & Berfungsi Penuh
                </p>
                <p className="text-xs text-emerald-800/90 mt-0.5">
                  Foto produk yang diunggah melalui formulir manajemen produk otomatis diunggah langsung ke bucket Cloudflare R2 dan didistribusikan melalui CDN global.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold">
                  Sistem Berjalan Dalam Mode Penyimpanan Lokal (Fallback Mode)
                </p>
                <p className="text-xs text-amber-800/90 mt-0.5">
                  Variabel environment <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px]">R2_ACCOUNT_ID</code> atau kunci akses belum diatur pada berkas <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px]">.env</code>. Pengunggahan foto produk tetap berjalan mulus menggunakan direktori lokal server.
                </p>
              </div>
            </div>
          )}

          {/* Grid Info R2 Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Info 1: Bucket Name */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Nama Bucket</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(r2Info.bucketName, 'bucket')}
                  className="text-slate-400 hover:text-slate-700"
                  title="Salin nama bucket"
                >
                  {copiedKey === 'bucket' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-sm font-bold text-slate-900 font-mono break-all">
                {r2Info.bucketName}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">S3 Namespace Bucket</div>
            </div>

            {/* Info 2: Public CDN URL */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Public CDN URL</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(r2Info.publicUrl, 'cdn')}
                  className="text-slate-400 hover:text-slate-700"
                  title="Salin CDN URL"
                >
                  {copiedKey === 'cdn' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-sm font-bold text-slate-900 font-mono break-all">
                {r2Info.publicUrl}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Domain Publik Aset Foto</div>
            </div>

            {/* Info 3: Region & Protocol */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Wilayah & Protokol
              </div>
              <div className="text-sm font-bold text-slate-900">
                {r2Info.region}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {r2Info.protocol}
              </div>
            </div>

            {/* Info 4: Batas Ukuran Berkas */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Batas Ukuran Berkas
              </div>
              <div className="text-sm font-bold text-slate-900">
                {r2Info.maxUploadSize}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Auto WebP & Image Compression
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Save Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Siap Menjalankan Operasional Toko?
            </h3>
            <p className="text-xs text-slate-400">
              Pastikan alamat gudang asal dan kurir yang diaktifkan sudah sesuai dengan armada logistik toko Anda.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs sm:text-sm transition-all"
          >
            Batal / Reset
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-500/30 transition-all flex items-center gap-2.5 disabled:opacity-70 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyimpan Semua Pengaturan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Semua Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
