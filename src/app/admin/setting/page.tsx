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
  Search,
  Calculator,
  Radio,
  Scale,
  Box,
  Package,
  Sliders,
  ChevronRight,
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  Key,
  Zap,
  Globe,
  Activity,
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

interface BiteshipConfigInfo {
  isConfigured: boolean;
  origin: {
    postalCode: string;
    city: string;
    province: string;
  };
  apiKeyMasked: string;
}

interface ShippingRateOption {
  courierCode: string;
  courierName: string;
  serviceCode: string;
  serviceName: string;
  cost: number;
  etd: string;
  description?: string;
  isAvailable?: boolean;
}

interface ShippingCalculationResult {
  rates: ShippingRateOption[];
  totalWeightGram: number;
  totalVolumeWeightGram: number;
  chargeableWeightKg: number;
  isLiveBiteship: boolean;
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

const SAMPLE_PRODUCTS = [
  {
    id: 'sample-1',
    name: 'Pakaian & Kaos Kaki Bayi (Ringan)',
    weightGram: 300,
    length: 15,
    width: 10,
    height: 5,
    badge: '300 gr (Kecil)',
    description: 'Baju katun jumper & kaos kaki lembut bayi',
  },
  {
    id: 'sample-2',
    name: 'Botol Susu Anti-Kolik & Dot',
    weightGram: 500,
    length: 15,
    width: 15,
    height: 10,
    badge: '500 gr (Standar)',
    description: 'Botol susu silicone anti-kolik 240ml',
  },
  {
    id: 'sample-3',
    name: 'Paket Perlengkapan Bayi Standar (1.5 kg)',
    weightGram: 1500,
    length: 20,
    width: 15,
    height: 10,
    badge: '1.500 gr (Sedang)',
    description: 'Setelan piyama, selimut, dan perlengkapan mandi',
  },
  {
    id: 'sample-4',
    name: 'Mainan Montessori Balok Kayu',
    weightGram: 2500,
    length: 30,
    width: 20,
    height: 15,
    badge: '2.500 gr (Padat)',
    description: 'Balok kayu natural 50 pcs dalam wadah kotak kayu',
  },
  {
    id: 'sample-5',
    name: 'Stroller Lipat Travel Baby Orbit (Barang Besar)',
    weightGram: 6500,
    length: 60,
    width: 40,
    height: 25,
    badge: '6.500 gr (Volumetrik 10 kg)',
    description: 'Kereta dorong lipat kanopi kabin-pesawat',
  },
];

const QUICK_DESTINATIONS = [
  { city: 'Surabaya', postalCode: '60189', province: 'Jawa Timur', label: 'Surabaya (60189)' },
  { city: 'Bandung', postalCode: '40115', province: 'Jawa Barat', label: 'Bandung (40115)' },
  { city: 'Semarang', postalCode: '50134', province: 'Jawa Tengah', label: 'Semarang (50134)' },
  { city: 'Medan', postalCode: '20111', province: 'Sumatera Utara', label: 'Medan (20111)' },
  { city: 'Makassar', postalCode: '90111', province: 'Sulawesi Selatan', label: 'Makassar (90111)' },
  { city: 'Denpasar', postalCode: '80111', province: 'Bali', label: 'Denpasar (80111)' },
  { city: 'Jakarta Barat', postalCode: '11470', province: 'DKI Jakarta', label: 'Jakarta (11470)' },
];

const STORAGE_KEY = 'babykids_seller_settings_v1';

export default function AdminSettingPage() {
  // State for store profile, warehouse, couriers, payments
  const [profile, setProfile] = useState<StoreProfile>(DEFAULT_PROFILE);
  const [warehouse, setWarehouse] = useState<OriginWarehouse>(DEFAULT_WAREHOUSE);
  const [couriers, setCouriers] = useState<CourierSettings>(DEFAULT_COURIERS);
  const [payments, setPayments] = useState<PaymentSettings>(DEFAULT_PAYMENTS);

  // Payment Gateway State (Midtrans, Xendit, Simulator)
  const [activePaymentGateway, setActivePaymentGateway] = useState<'midtrans' | 'xendit' | 'simulator'>('midtrans');
  const [midtransServerKey, setMidtransServerKey] = useState<string>('');
  const [midtransClientKey, setMidtransClientKey] = useState<string>('');
  const [midtransMerchantId, setMidtransMerchantId] = useState<string>('');
  const [midtransIsProduction, setMidtransIsProduction] = useState<boolean>(false);
  const [showMidtransServerKey, setShowMidtransServerKey] = useState<boolean>(false);

  const [xenditSecretKey, setXenditSecretKey] = useState<string>('');
  const [xenditPublicKey, setXenditPublicKey] = useState<string>('');
  const [xenditWebhookToken, setXenditWebhookToken] = useState<string>('');
  const [xenditIsProduction, setXenditIsProduction] = useState<boolean>(false);
  const [showXenditSecretKey, setShowXenditSecretKey] = useState<boolean>(false);
  const [showXenditWebhookToken, setShowXenditWebhookToken] = useState<boolean>(false);

  const [currentOrigin, setCurrentOrigin] = useState<string>('');
  const [isTestingGateway, setIsTestingGateway] = useState<boolean>(false);
  const [gatewayTestResult, setGatewayTestResult] = useState<{
    success: boolean;
    message: string;
    provider: string;
  } | null>(null);

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

  // Biteship info from server
  const [biteshipInfo, setBiteshipInfo] = useState<BiteshipConfigInfo>({
    isConfigured: false,
    origin: {
      postalCode: '12160',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
    },
    apiKeyMasked: 'Belum Dikonfigurasi',
  });

  // Biteship Live Rates Tester State
  const [testCity, setTestCity] = useState<string>('Surabaya');
  const [testPostalCode, setTestPostalCode] = useState<string>('60189');
  const [testWeightGram, setTestWeightGram] = useState<number>(1500);
  const [testLengthCm, setTestLengthCm] = useState<number>(20);
  const [testWidthCm, setTestWidthCm] = useState<number>(15);
  const [testHeightCm, setTestHeightCm] = useState<number>(10);
  const [testItemName, setTestItemName] = useState<string>('Paket Perlengkapan Bayi Standar');
  const [testSelectedPresetId, setTestSelectedPresetId] = useState<string>('sample-3');
  const [testCouriers, setTestCouriers] = useState<{ [key: string]: boolean }>({
    sicepat: true,
    jne: true,
    jnt: true,
    anteraja: true,
  });

  const [isTestingRates, setIsTestingRates] = useState<boolean>(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<ShippingCalculationResult | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Setup current origin for webhook copying
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentOrigin(window.location.origin);
    }
  }, []);

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

  // Format currency helper
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get courier styling
  const getCourierBadgeStyle = (courierCode: string) => {
    const code = (courierCode || '').toLowerCase();
    if (code.includes('sicepat')) {
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        pillBg: 'bg-red-600',
        logo: 'SiCepat',
      };
    }
    if (code.includes('jne')) {
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        pillBg: 'bg-blue-700',
        logo: 'JNE',
      };
    }
    if (code.includes('jnt') || code.includes('j&t')) {
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        pillBg: 'bg-rose-600',
        logo: 'J&T',
      };
    }
    if (code.includes('anteraja')) {
      return {
        bg: 'bg-fuchsia-50',
        text: 'text-fuchsia-700',
        border: 'border-fuchsia-200',
        pillBg: 'bg-fuchsia-600',
        logo: 'Anteraja',
      };
    }
    return {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      pillBg: 'bg-slate-700',
      logo: courierCode.toUpperCase(),
    };
  };

  // Fetch initial settings, R2, and Biteship from API
  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch server config status
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const json = await res.json();
        const data = json?.data;
        if (data) {
          if (data.store) {
            setProfile((prev) => ({
              ...prev,
              storeName: data.store.storeName || prev.storeName,
              tagline: data.store.tagline || prev.tagline,
              customerServiceEmail: data.store.email || prev.customerServiceEmail,
              whatsappNumber: data.store.phone || prev.whatsappNumber,
            }));
            setWarehouse((prev) => ({
              ...prev,
              fullAddress: data.store.address || prev.fullAddress,
              city: data.store.city || prev.city,
              postalCode: data.store.postalCode || prev.postalCode,
            }));
          }
          if (data.settings) {
            if (data.settings.active_payment_gateway) {
              setActivePaymentGateway(data.settings.active_payment_gateway as 'midtrans' | 'xendit' | 'simulator');
            }
            if (data.settings.midtrans_server_key !== undefined) {
              setMidtransServerKey(data.settings.midtrans_server_key || '');
            }
            if (data.settings.midtrans_client_key !== undefined) {
              setMidtransClientKey(data.settings.midtrans_client_key || '');
            }
            if (data.settings.midtrans_merchant_id !== undefined) {
              setMidtransMerchantId(data.settings.midtrans_merchant_id || '');
            }
            if (data.settings.midtrans_is_production !== undefined) {
              setMidtransIsProduction(Boolean(data.settings.midtrans_is_production));
            }
            if (data.settings.xendit_secret_key !== undefined) {
              setXenditSecretKey(data.settings.xendit_secret_key || '');
            }
            if (data.settings.xendit_public_key !== undefined) {
              setXenditPublicKey(data.settings.xendit_public_key || '');
            }
            if (data.settings.xendit_webhook_token !== undefined) {
              setXenditWebhookToken(data.settings.xendit_webhook_token || '');
            }
            if (data.settings.xendit_is_production !== undefined) {
              setXenditIsProduction(Boolean(data.settings.xendit_is_production));
            }
            if (Array.isArray(data.settings.enabled_payment_methods)) {
              const methods = data.settings.enabled_payment_methods;
              setPayments({
                qris: methods.includes('pay-qris'),
                bcaVa: methods.includes('pay-bca-va'),
                mandiriVa: methods.includes('pay-mandiri-va'),
                briVa: methods.includes('pay-bri-va'),
                gopay: methods.includes('pay-gopay'),
              });
            }
            if (Array.isArray(data.settings.enabled_couriers)) {
              const couriersArr = data.settings.enabled_couriers;
              setCouriers({
                sicepat: couriersArr.includes('sicepat'),
                jne: couriersArr.includes('jne'),
                jnt: couriersArr.includes('jnt'),
                anteraja: couriersArr.includes('anteraja'),
                cargo: couriersArr.includes('cargo'),
              });
            }
          }
          if (data.r2) {
            setR2Info(data.r2);
          }
          if (data.biteship) {
            setBiteshipInfo(data.biteship);
          }
        }
      }

      // 2. Load from localStorage if present for local overrides
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) setProfile((prev) => ({ ...prev, ...parsed.profile }));
        if (parsed.warehouse) setWarehouse((prev) => ({ ...prev, ...parsed.warehouse }));
        if (parsed.couriers) setCouriers((prev) => ({ ...prev, ...parsed.couriers }));
        if (parsed.payments) setPayments((prev) => ({ ...prev, ...parsed.payments }));
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
      const enabledMethodsArray = [
        payments.qris && 'pay-qris',
        payments.bcaVa && 'pay-bca-va',
        payments.mandiriVa && 'pay-mandiri-va',
        payments.briVa && 'pay-bri-va',
        payments.gopay && 'pay-gopay',
      ].filter(Boolean) as string[];

      const enabledCouriersArray = [
        couriers.sicepat && 'sicepat',
        couriers.jne && 'jne',
        couriers.jnt && 'jnt',
        couriers.anteraja && 'anteraja',
        couriers.cargo && 'cargo',
      ].filter(Boolean) as string[];

      const payload = {
        profile,
        warehouse,
        couriers,
        payments,
        active_payment_gateway: activePaymentGateway,
        midtrans_server_key: midtransServerKey,
        midtrans_client_key: midtransClientKey,
        midtrans_merchant_id: midtransMerchantId,
        midtrans_is_production: midtransIsProduction,
        xendit_secret_key: xenditSecretKey,
        xendit_public_key: xenditPublicKey,
        xendit_webhook_token: xenditWebhookToken,
        xendit_is_production: xenditIsProduction,
        enabled_payment_methods: enabledMethodsArray,
        enabled_couriers: enabledCouriersArray,
        savedAt: new Date().toISOString(),
      };

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

      // Post to backend API
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resJson = await res.json().catch(() => ({}));
      if (!res.ok || resJson.success === false) {
        throw new Error(resJson.error || 'Gagal menyimpan pengaturan');
      }

      setHasUnsavedChanges(false);
      triggerToast('Pengaturan toko, logistik & payment gateway berhasil disimpan!');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      triggerToast(err.message || 'Gagal menyimpan pengaturan');
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
      setActivePaymentGateway('midtrans');
      setMidtransIsProduction(false);
      setXenditIsProduction(false);
      setHasUnsavedChanges(true);
    }
  };

  // Test Gateway Connection
  const handleTestGatewayConnection = async () => {
    setIsTestingGateway(true);
    setGatewayTestResult(null);
    try {
      const credentials: any = {};
      if (activePaymentGateway === 'midtrans') {
        if (midtransServerKey) credentials.midtrans_server_key = midtransServerKey;
        credentials.midtrans_is_production = midtransIsProduction;
      } else if (activePaymentGateway === 'xendit') {
        if (xenditSecretKey) credentials.xendit_secret_key = xenditSecretKey;
        credentials.xendit_is_production = xenditIsProduction;
      }

      const res = await fetch('/api/admin/settings/test-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: activePaymentGateway,
          credentials,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success) {
        setGatewayTestResult({
          success: true,
          message: json.message || 'Koneksi ke gateway pembayaran berhasil diverifikasi!',
          provider: activePaymentGateway,
        });
        triggerToast(`Uji Koneksi ${activePaymentGateway.toUpperCase()}: Sukses terhubung!`);
      } else {
        setGatewayTestResult({
          success: false,
          message: json.message || 'Gagal menghubungkan ke gateway pembayaran.',
          provider: activePaymentGateway,
        });
        triggerToast(`Uji Koneksi ${activePaymentGateway.toUpperCase()}: Gagal (${json.message || 'Cek kredensial'})`);
      }
    } catch (err: any) {
      setGatewayTestResult({
        success: false,
        message: err.message || 'Terjadi kesalahan saat menghubungi API uji koneksi gateway.',
        provider: activePaymentGateway,
      });
      triggerToast('Terjadi kesalahan saat menghubungi server pengujian.');
    } finally {
      setIsTestingGateway(false);
    }
  };

  // Preset sample product change
  const handleApplyPreset = (presetId: string) => {
    setTestSelectedPresetId(presetId);
    const found = SAMPLE_PRODUCTS.find((p) => p.id === presetId);
    if (found) {
      setTestItemName(found.name);
      setTestWeightGram(found.weightGram);
      setTestLengthCm(found.length);
      setTestWidthCm(found.width);
      setTestHeightCm(found.height);
    }
  };

  // Quick destination select
  const handleApplyQuickDestination = (dest: { city: string; postalCode: string }) => {
    setTestCity(dest.city);
    setTestPostalCode(dest.postalCode);
  };

  // Run live shipping rates test
  const handleRunShippingTest = async () => {
    if (!testCity.trim() && !testPostalCode.trim()) {
      setTestError('Mohon isi minimal Kota / Kabupaten atau Kode Pos tujuan pengiriman');
      return;
    }
    if (testWeightGram <= 0) {
      setTestError('Berat paket harus lebih dari 0 gram');
      return;
    }

    setIsTestingRates(true);
    setTestError(null);

    try {
      const activeCouriers = Object.entries(testCouriers)
        .filter(([, active]) => active)
        .map(([code]) => code);

      const payload = {
        destinationCity: testCity.trim() || undefined,
        destinationPostalCode: testPostalCode.trim() || undefined,
        items: [
          {
            productId: 'biteship-tester-item',
            name: testItemName.trim() || 'Paket Uji Coba Produk Bayi',
            weightGram: Number(testWeightGram) || 500,
            dimensionLength: Number(testLengthCm) || 10,
            dimensionWidth: Number(testWidthCm) || 10,
            dimensionHeight: Number(testHeightCm) || 10,
            quantity: 1,
          },
        ],
        courierCodes: activeCouriers.length > 0 ? activeCouriers : undefined,
      };

      const res = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghitung tarif kurir pengiriman');
      }

      setTestResult(json.data);
      triggerToast('✨ Berhasil mendapatkan tarif kurir pengiriman real-time!');
    } catch (err: any) {
      setTestError(err.message || 'Terjadi kesalahan saat menghubungi API tarif pengiriman');
      setTestResult(null);
    } finally {
      setIsTestingRates(false);
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
            Konfigurasi profil toko, titik gudang asal ekspedisi kurir se-Indonesia, metode pembayaran, simulasi tarif Biteship API, dan integrasi penyimpanan cloud.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
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

      {/* Main Content: 2-Column Grid */}
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

            {/* Slogan / Tagline */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Slogan / Tagline Toko
              </label>
              <input
                type="text"
                value={profile.tagline}
                onChange={(e) => {
                  setProfile({ ...profile, tagline: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                placeholder="Pusat Perlengkapan Bayi & Anak Terlengkap"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
              />
            </div>

            {/* CS Email & WA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Layanan Pelanggan <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={profile.customerServiceEmail}
                    onChange={(e) => {
                      setProfile({ ...profile, customerServiceEmail: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="support@babykids.id"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nomor WhatsApp CS <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={profile.whatsappNumber}
                    onChange={(e) => {
                      setProfile({ ...profile, whatsappNumber: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="+62 812-3456-7890"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Jam Operasional */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Jam Operasional Toko
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={profile.operationalHours}
                  onChange={(e) => {
                    setProfile({ ...profile, operationalHours: e.target.value });
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Senin - Minggu, 08:00 - 21:00 WIB"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Deskripsi Toko */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Deskripsi Profil Toko
              </label>
              <textarea
                rows={3}
                value={profile.storeDescription}
                onChange={(e) => {
                  setProfile({ ...profile, storeDescription: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                placeholder="Tuliskan deskripsi singkat mengenai toko Anda..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2: Lokasi Titik Gudang Pengiriman (Warehouse Origin) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Warehouse className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Lokasi Titik Gudang Pengiriman
                </h2>
                <p className="text-xs text-slate-500">
                  Alamat asal pengiriman paket (Origin) untuk kalkulasi tarif ekspedisi & kurir.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Titik Origin Kurir
            </span>
          </div>

          <div className="p-6 space-y-4 sm:space-y-5 flex-1">
            {/* Nama Gudang */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Gudang / Cabang <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={warehouse.warehouseName}
                onChange={(e) => {
                  setWarehouse({ ...warehouse, warehouseName: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                placeholder="Gudang Utama BabyKids Jakarta"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
              />
            </div>

            {/* Provinsi & Kota */}
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
                  Kota / Kabupaten Asal <span className="text-rose-500">*</span>
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

            {/* Kecamatan & Kode Pos */}
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
                placeholder="Tuliskan nama jalan, gedung, nomor ruko, RT/RW, dan patokan..."
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
        {/* CARD 4: Integrasi Payment Gateway (Midtrans & Xendit) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          {/* Card Header */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Integrasi Payment Gateway (Midtrans & Xendit)
                </h2>
                <p className="text-xs text-slate-500">
                  Gerbang pembayaran otomatis terverifikasi sistem (Multi-Provider).
                </p>
              </div>
            </div>
            {/* Active Provider Badge */}
            <div>
              {activePaymentGateway === 'midtrans' && (
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Midtrans ({midtransIsProduction ? 'Prod' : 'Sandbox'})
                </span>
              )}
              {activePaymentGateway === 'xendit' && (
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  Xendit ({xenditIsProduction ? 'Prod' : 'Sandbox'})
                </span>
              )}
              {activePaymentGateway === 'simulator' && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Mode Simulator Lokal
                </span>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6 flex-1">
            {/* SUB-SECTION 1: Pilihan Provider Pembayaran Aktif (Radio Cards) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  1. Pilihan Provider Pembayaran Aktif <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Pilih 1 engine aktif</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 🔵 Midtrans Payment Gateway */}
                <div
                  onClick={() => {
                    setActivePaymentGateway('midtrans');
                    setHasUnsavedChanges(true);
                  }}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    activePaymentGateway === 'midtrans'
                      ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          activePaymentGateway === 'midtrans'
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {activePaymentGateway === 'midtrans' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">Midtrans</h4>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200">
                          Snap API
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Snap popup, QRIS, GoPay, dan Virtual Account BCA/Mandiri/BRI.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 🟣 Xendit Payment Gateway */}
                <div
                  onClick={() => {
                    setActivePaymentGateway('xendit');
                    setHasUnsavedChanges(true);
                  }}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    activePaymentGateway === 'xendit'
                      ? 'border-purple-500 bg-purple-50/40 ring-2 ring-purple-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          activePaymentGateway === 'xendit'
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {activePaymentGateway === 'xendit' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">Xendit</h4>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-200">
                          XenInvoice
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Hosted invoice page, QRIS, E-Wallet, dan VA Bank terintegrasi.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 🟡 Mode Simulator Internal */}
                <div
                  onClick={() => {
                    setActivePaymentGateway('simulator');
                    setHasUnsavedChanges(true);
                  }}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    activePaymentGateway === 'simulator'
                      ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          activePaymentGateway === 'simulator'
                            ? 'border-amber-600 bg-amber-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {activePaymentGateway === 'simulator' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">Simulator</h4>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 border border-amber-200">
                          Offline
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Uji coba alur transaksi otomatis tanpa memerlukan kredensial luar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SUB-SECTION 2: Formulir Kredensial Sesuai Provider */}
            {/* Panel Kredensial Midtrans */}
            {(activePaymentGateway === 'midtrans' || activePaymentGateway === 'simulator') && (
              <div className="p-5 rounded-2xl bg-blue-50/30 border border-blue-100/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      M
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      Konfigurasi Kredensial Midtrans (Snap API)
                    </span>
                  </div>
                  <a
                    href="https://dashboard.midtrans.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 w-fit"
                  >
                    <span>Buka Portal Midtrans</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Mode Environment Midtrans */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Mode Environment Midtrans
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-w-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setMidtransIsProduction(false);
                        setHasUnsavedChanges(true);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        !midtransIsProduction
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>🧪 Sandbox (Testing)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMidtransIsProduction(true);
                        setHasUnsavedChanges(true);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        midtransIsProduction
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>🚀 Production (Live)</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    {midtransIsProduction
                      ? 'Endpoint Live: https://app.midtrans.com/snap/v1/transactions'
                      : 'Endpoint Sandbox: https://app.sandbox.midtrans.com/snap/v1/transactions'}
                  </p>
                </div>

                {/* Midtrans Server Key */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>
                      Server Key <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Rahasia Backend</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type={showMidtransServerKey ? 'text' : 'password'}
                      value={midtransServerKey}
                      onChange={(e) => {
                        setMidtransServerKey(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="SB-Mid-server-xxxxxxxxxxxx"
                      className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMidtransServerKey(!showMidtransServerKey)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showMidtransServerKey ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showMidtransServerKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Midtrans Client Key & Merchant ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Client Key</span>
                      <span className="text-[10px] text-slate-400 font-normal">Frontend Snap JS</span>
                    </label>
                    <input
                      type="text"
                      value={midtransClientKey}
                      onChange={(e) => {
                        setMidtransClientKey(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="SB-Mid-client-xxxxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Merchant ID
                    </label>
                    <input
                      type="text"
                      value={midtransMerchantId}
                      onChange={(e) => {
                        setMidtransMerchantId(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="G123456789"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Panel Kredensial Xendit */}
            {(activePaymentGateway === 'xendit' || activePaymentGateway === 'simulator') && (
              <div className="p-5 rounded-2xl bg-purple-50/30 border border-purple-100/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                      X
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      Konfigurasi Kredensial Xendit (XenInvoice API)
                    </span>
                  </div>
                  <a
                    href="https://dashboard.xendit.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 w-fit"
                  >
                    <span>Buka Portal Xendit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Mode Environment Xendit */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Mode Environment Xendit
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-w-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setXenditIsProduction(false);
                        setHasUnsavedChanges(true);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        !xenditIsProduction
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>🧪 Sandbox (Testing)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setXenditIsProduction(true);
                        setHasUnsavedChanges(true);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        xenditIsProduction
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>🚀 Production (Live)</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Endpoint API XenInvoice: https://api.xendit.co/v2/invoices
                  </p>
                </div>

                {/* Xendit Secret API Key */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>
                      Secret API Key <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Rahasia Backend</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showXenditSecretKey ? 'text' : 'password'}
                      value={xenditSecretKey}
                      onChange={(e) => {
                        setXenditSecretKey(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="xnd_development_xxxxxxxxxxxx"
                      className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowXenditSecretKey(!showXenditSecretKey)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showXenditSecretKey ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showXenditSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Xendit Public Key & Webhook Verification Token */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Public Key
                    </label>
                    <input
                      type="text"
                      value={xenditPublicKey}
                      onChange={(e) => {
                        setXenditPublicKey(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="xnd_public_development_xxxxxxxx"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Webhook Token</span>
                      <span className="text-[10px] text-slate-400 font-normal">x-callback-token</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showXenditWebhookToken ? 'text' : 'password'}
                        value={xenditWebhookToken}
                        onChange={(e) => {
                          setXenditWebhookToken(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="Callback verification token"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowXenditWebhookToken(!showXenditWebhookToken)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showXenditWebhookToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Mode Simulator */}
            {activePaymentGateway === 'simulator' && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">
                    Mode Simulator Internal Aktif (Offline Testing)
                  </p>
                  <p className="text-xs text-amber-800/90 mt-0.5">
                    Transaksi checkout otomatis disimulasikan sukses tanpa menghubungi API luar. Pelanggan dapat memilih metode pembayaran dan memverifikasi pelunasan instan.
                  </p>
                </div>
              </div>
            )}

            {/* SUB-SECTION 3: Webhook URL Notification Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                  <span>URL Webhook Notifikasi Pembayaran (Callback URL)</span>
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">Endpoint POST</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${currentOrigin || 'https://domain-toko.com'}/api/webhooks/payment`}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 select-all"
                />
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `${currentOrigin || 'https://domain-toko.com'}/api/webhooks/payment`,
                      'webhook'
                    )
                  }
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-2xs"
                >
                  {copiedKey === 'webhook' ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Salin URL ini dan masukkan ke Dashboard Midtrans (<strong>Settings &gt; Configuration &gt; Payment Notification URL</strong>) atau Dashboard Xendit (<strong>Settings &gt; Callbacks &gt; Invoices</strong>).
              </p>
            </div>

            {/* SUB-SECTION 4: Checklist / Switch Metode Pembayaran yang Diaktifkan */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Metode Pembayaran yang Diaktifkan
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Pilihan kanal pembayaran yang dapat dipilih pembeli di halaman checkout.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                  {Object.values(payments).filter(Boolean).length} Kanal Aktif
                </span>
              </div>

              <div className="space-y-3 divide-y divide-slate-100">
                {/* 1. pay-qris: QRIS Instan */}
                <div className="flex items-center justify-between pt-3 first:pt-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0 border border-emerald-200/60">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">QRIS Instan</h4>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-md border border-emerald-200">
                          SEMUA E-WALLET & BANK
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Scan QRIS instan otomatis (GoPay, OVO, Dana, ShopeePay, BCA, LinkAja).
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-3">
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

                {/* 2. pay-bca-va: BCA Virtual Account */}
                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-black text-xs shrink-0 border border-blue-200/60">
                      BCA
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">BCA Virtual Account</h4>
                        <span className="text-[9px] bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded-md border border-blue-200">
                          OTOMATIS 24 JAM
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Konfirmasi pembayaran real-time melalui myBCA, BCA mobile, dan ATM BCA.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-3">
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

                {/* 3. pay-mandiri-va: Mandiri Virtual Account */}
                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0 border border-indigo-200/60">
                      Mandiri
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">Mandiri Virtual Account</h4>
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-md border border-indigo-200">
                          LIVIN' BY MANDIRI
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Nomor VA khusus nasabah Mandiri dengan deteksi pelunasan instan.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-3">
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

                {/* 4. pay-bri-va: BRI Virtual Account (BRIVA) */}
                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-700 flex items-center justify-center font-black text-xs shrink-0 border border-cyan-200/60">
                      BRI
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">BRI Virtual Account (BRIVA)</h4>
                        <span className="text-[9px] bg-cyan-50 text-cyan-700 font-extrabold px-2 py-0.5 rounded-md border border-cyan-200">
                          BRIMO & AGEN BRILINK
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Pembayaran praktis nasabah BRImo dan jaringan luas Agen BRILink.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-3">
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

                {/* 5. pay-gopay: GoPay & GoPay Later */}
                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0 border border-emerald-200/60">
                      GoPay
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">GoPay & GoPay Later</h4>
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-md border border-emerald-200">
                          1-KLIK DEEP LINK
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Pembayaran instan langsung membuka aplikasi GoPay dengan saldo/paylater.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-3">
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

            {/* SUB-SECTION 5: Gateway Test Result Alert */}
            {gatewayTestResult && (
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 transition-all animate-in fade-in ${
                  gatewayTestResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                    gatewayTestResult.success
                      ? 'bg-emerald-200 text-emerald-800'
                      : 'bg-rose-200 text-rose-800'
                  }`}
                >
                  {gatewayTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-bold">
                    Hasil Uji Koneksi Gateway ({gatewayTestResult.provider.toUpperCase()}):{' '}
                    {gatewayTestResult.success ? 'Berhasil Terhubung' : 'Gagal Terhubung'}
                  </p>
                  <p className="mt-0.5 opacity-90">{gatewayTestResult.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setGatewayTestResult(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* SUB-SECTION 6: Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleTestGatewayConnection}
                disabled={isTestingGateway}
                className="px-5 py-2.5 rounded-xl border border-indigo-200 hover:bg-indigo-50/70 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {isTestingGateway ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Menguji Koneksi Gateway...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-indigo-600" />
                    <span>Uji Koneksi Gateway</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
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
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CARD 5: Uji Cek Tarif Kurir Live (Biteship API Tester) - Full Width */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Tester Header */}
        <div className="p-6 sm:p-7 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/20 shrink-0">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Uji Cek Tarif Kurir Live (Biteship API Tester)
                </h2>
                {/* Live Biteship vs Fallback Indicator */}
                {biteshipInfo.isConfigured ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    🟢 Live Biteship API Terhubung
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    🟡 Smart Fallback Multi-Kurir Aktif
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Simulasikan kalkulasi tarif pengiriman real-time dari Gudang Asal ({warehouse.city || 'Jakarta Selatan'}) ke seluruh kota & kecamatan tujuan di Indonesia.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-3.5 py-2 rounded-xl flex items-center gap-2 font-medium">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>
                Asal: <strong>{warehouse.city || 'Jakarta Selatan'} ({warehouse.postalCode || '12160'})</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7 space-y-7">
          {/* Section 1: Tester Form Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Destination Location (5 cols) */}
            <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    1. Tujuan Pengiriman Paket
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Tujuan Domestik</span>
                </div>

                {/* Quick Destination Chips */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Pilihan Cepat Kota Tujuan:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_DESTINATIONS.map((dest) => {
                      const isSelected = testCity === dest.city;
                      return (
                        <button
                          key={dest.city}
                          type="button"
                          onClick={() => handleApplyQuickDestination(dest)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {dest.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Inputs for City and Postal Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kota / Kabupaten <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={testCity}
                      onChange={(e) => setTestCity(e.target.value)}
                      placeholder="Surabaya"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kode Pos Tujuan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={testPostalCode}
                      onChange={(e) => setTestPostalCode(e.target.value)}
                      placeholder="60189"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Kurir Checkboxes */}
              <div className="pt-3 border-t border-slate-200/80">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Ekspedisi yang Disimulasikan:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'sicepat', label: 'SiCepat' },
                    { key: 'jne', label: 'JNE' },
                    { key: 'jnt', label: 'J&T' },
                    { key: 'anteraja', label: 'Anteraja' },
                  ].map((c) => (
                    <label
                      key={c.key}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer select-none ${
                        testCouriers[c.key]
                          ? 'bg-rose-50 border-rose-300 text-rose-700'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!testCouriers[c.key]}
                        onChange={(e) =>
                          setTestCouriers({ ...testCouriers, [c.key]: e.target.checked })
                        }
                        className="rounded text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Sample Product Presets & Package Dimensions (7 cols) */}
            <div className="lg:col-span-7 space-y-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-rose-500" />
                    2. Pilihan Produk Contoh & Dimensi Paket
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Aktual vs Volumetrik</span>
                </div>

                {/* Preset Dropdown Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Gunakan Contoh Produk Katalog Bayi:
                  </label>
                  <select
                    value={testSelectedPresetId}
                    onChange={(e) => handleApplyPreset(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition-all cursor-pointer"
                  >
                    {SAMPLE_PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.badge}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name of Product */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Paket / Deskripsi
                  </label>
                  <input
                    type="text"
                    value={testItemName}
                    onChange={(e) => setTestItemName(e.target.value)}
                    placeholder="Nama paket contoh..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>

                {/* Weight and Dimensions in Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Berat (Gram)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={testWeightGram}
                      onChange={(e) => setTestWeightGram(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Panjang (cm)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={testLengthCm}
                      onChange={(e) => setTestLengthCm(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Lebar (cm)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={testWidthCm}
                      onChange={(e) => setTestWidthCm(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Tinggi (cm)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={testHeightCm}
                      onChange={(e) => setTestHeightCm(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Action Run Button */}
              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500">
                  Volumetrik: <strong>{(((testLengthCm * testWidthCm * testHeightCm) / 6000) * 1000).toFixed(0)} gram</strong>
                </div>
                <button
                  type="button"
                  onClick={handleRunShippingTest}
                  disabled={isTestingRates}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-500/25 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isTestingRates ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menghitung Tarif Real-Time...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Cek Tarif Pengiriman Real-Time</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Error Notification */}
          {testError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold">Kalkulasi Tarif Pengiriman Gagal</h4>
                <p className="text-xs text-rose-700 mt-0.5">{testError}</p>
              </div>
            </div>
          )}

          {/* Section 3: Chargeable Weight Calculation Metric Cards */}
          {testResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-3 duration-300">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Scale className="w-4 h-4 text-rose-500" />
                  <span>Analisis Berat & Tarif Ekspedisi ({testResult.rates.length} Opsi Layanan Ditemukan)</span>
                </h3>
                <span
                  className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                    testResult.isLiveBiteship
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {testResult.isLiveBiteship
                    ? '🟢 Sumber: Live Biteship API'
                    : '🟡 Sumber: Smart Fallback Engine'}
                </span>
              </div>

              {/* Metric Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Metric 1: Berat Aktual */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Berat Aktual Paket
                  </div>
                  <div className="text-base sm:text-lg font-black text-slate-900">
                    {testResult.totalWeightGram.toLocaleString('id-ID')} gram
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {(testResult.totalWeightGram / 1000).toFixed(2)} kg (Berat Fisik Timbangan)
                  </div>
                </div>

                {/* Metric 2: Berat Volumetrik */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Berat Volumetrik
                  </div>
                  <div className="text-base sm:text-lg font-black text-slate-900">
                    {testResult.totalVolumeWeightGram.toLocaleString('id-ID')} gram
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Rumus: ({testLengthCm}×{testWidthCm}×{testHeightCm}) / 6.000 kg
                  </div>
                </div>

                {/* Metric 3: Chargeable Weight (Ditagih Kurir) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-200 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                    Berat Ditagih (Chargeable)
                  </div>
                  <div className="text-base sm:text-lg font-black text-rose-600">
                    {testResult.chargeableWeightKg} Kilogram
                  </div>
                  <div className="text-[11px] text-rose-700/80 font-medium">
                    Max(Aktual, Volumetrik) dibulatkan ke atas
                  </div>
                </div>
              </div>

              {/* Rates Results Table / List */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-extrabold text-slate-600">
                      <th className="py-3 px-4">Ekspedisi Kurir</th>
                      <th className="py-3 px-4">Layanan & Tipe</th>
                      <th className="py-3 px-4">Estimasi Sampai (ETD)</th>
                      <th className="py-3 px-4">Biaya Ongkir</th>
                      <th className="py-3 px-4 text-center">Status Tarif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-xs sm:text-sm">
                    {testResult.rates.map((rate, idx) => {
                      const badgeStyle = getCourierBadgeStyle(rate.courierCode);
                      return (
                        <tr
                          key={`${rate.courierCode}-${rate.serviceCode}-${idx}`}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Courier Name & Logo */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-xs font-black text-white ${badgeStyle.pillBg}`}
                              >
                                {badgeStyle.logo}
                              </span>
                              <div>
                                <div className="font-bold text-slate-900">{rate.courierName}</div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  {rate.courierCode.toLowerCase()}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Service */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900">{rate.serviceName}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                                {rate.serviceCode}
                              </span>
                            </div>
                            {rate.description && (
                              <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                {rate.description}
                              </div>
                            )}
                          </td>

                          {/* ETD */}
                          <td className="py-3.5 px-4">
                            <div className="inline-flex items-center gap-1 text-slate-700 font-semibold text-xs">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{rate.etd}</span>
                            </div>
                          </td>

                          {/* Cost */}
                          <td className="py-3.5 px-4">
                            <div className="text-sm sm:text-base font-black text-rose-600">
                              {formatRupiah(rate.cost)}
                            </div>
                          </td>

                          {/* Live vs Fallback Badge */}
                          <td className="py-3.5 px-4 text-center">
                            {testResult.isLiveBiteship ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                🟢 Live Biteship
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                🟡 Smart Fallback
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Initial State Placeholder when not tested yet */}
          {!testResult && !isTestingRates && !testError && (
            <div className="p-8 rounded-2xl bg-slate-50/60 border-2 border-dashed border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-sm font-bold text-slate-900">
                  Siap Melakukan Pengujian Tarif Kurir
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Pilih kota tujuan dan produk contoh di atas, lalu klik tombol{' '}
                  <strong className="text-rose-600">"Cek Tarif Pengiriman Real-Time"</strong> untuk memvalidasi integrasi kurir Biteship & modul kalkulasi logistik.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunShippingTest}
                className="mt-2 px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Mulai Simulasi Cek Tarif Sekarang</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CARD 6: Status Penyimpanan Cloudflare R2 Storage (Full Width) */}
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
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Cek Koneksi</span>
            </button>
            <a
              href="https://dash.cloudflare.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100/80 text-orange-700 text-xs font-bold flex items-center gap-1.5 border border-orange-200 transition-all cursor-pointer"
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
                <span>R2 Bucket Name</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(r2Info.bucketName, 'bucket')}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="Salin Nama Bucket"
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
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
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
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
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
