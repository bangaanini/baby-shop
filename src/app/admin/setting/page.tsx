'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
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
  RotateCcw,
  Sparkles,
  Search,
  Globe,
  Loader2,
} from 'lucide-react';
import { ProfileSettingsTab, StoreProfileData, AnnouncementData } from '@/components/admin/settings/ProfileSettingsTab';
import { WarehouseSettingsTab, OriginWarehouseData } from '@/components/admin/settings/WarehouseSettingsTab';
import {
  CouriersSettingsTab,
  CourierSettingsData,
  BiteshipInfoData,
  ShippingCalculationResult,
} from '@/components/admin/settings/CouriersSettingsTab';
import { PaymentSettingsTab, PaymentSettingsData } from '@/components/admin/settings/PaymentSettingsTab';
import { SeoSettingsTab } from '@/components/admin/settings/SeoSettingsTab';
import { StorageSettingsTab, R2StorageInfoData } from '@/components/admin/settings/StorageSettingsTab';

type SettingsTab = 'profil' | 'alamat' | 'ekspedisi' | 'payment' | 'seo' | 'storage';

const DEFAULT_PROFILE: StoreProfileData = {
  storeName: 'NBusiness',
  tagline: 'Marketplace & Toko Kebutuhan Anak Terpercaya',
  customerServiceEmail: 'halo@nbusiness.id',
  whatsappNumber: '+62 812-3456-7890',
  operationalHours: 'Senin - Minggu, 08:00 - 21:00 WIB',
  storeDescription:
    'Pusat belanja perlengkapan bayi, pakaian anak modis, dan mainan edukasi terstandar SNI dengan pengiriman cepat ke seluruh Indonesia.',
};

const DEFAULT_WAREHOUSE: OriginWarehouseData = {
  warehouseName: 'Gudang Utama NBusiness Jakarta',
  province: 'DKI Jakarta',
  city: 'Jakarta Selatan',
  district: 'Kebayoran Baru',
  postalCode: '12160',
  fullAddress:
    'Jl. Senopati Raya No. 45, RT.05/RW.02, Kel. Selong, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12160',
};

const DEFAULT_COURIERS: CourierSettingsData = {
  sicepat: true,
  jne: true,
  jnt: true,
  anteraja: true,
  cargo: true,
};

const DEFAULT_PAYMENTS: PaymentSettingsData = {
  qris: true,
  bcaVa: true,
  mandiriVa: true,
  briVa: true,
  gopay: true,
};

const DEFAULT_ANNOUNCEMENT: AnnouncementData = {
  enabled: true,
  text: '\uD83C\uDF89 Gratis Ongkir s/d Rp 20.000 ke Seluruh Indonesia Belanja Min. Rp 100.000!',
  link: '',
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
  },
  {
    id: 'sample-2',
    name: 'Botol Susu Anti-Kolik & Dot',
    weightGram: 500,
    length: 15,
    width: 15,
    height: 10,
    badge: '500 gr (Standar)',
  },
  {
    id: 'sample-3',
    name: 'Paket Perlengkapan Bayi Standar (1.5 kg)',
    weightGram: 1500,
    length: 20,
    width: 15,
    height: 10,
    badge: '1.500 gr (Sedang)',
  },
  {
    id: 'sample-4',
    name: 'Mainan Montessori Balok Kayu',
    weightGram: 2500,
    length: 30,
    width: 20,
    height: 15,
    badge: '2.500 gr (Padat)',
  },
  {
    id: 'sample-5',
    name: 'Stroller Lipat Travel Baby Orbit (Barang Besar)',
    weightGram: 6500,
    length: 60,
    width: 40,
    height: 25,
    badge: '6.500 gr (Volumetrik 10 kg)',
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

const STORAGE_KEY = 'nbusiness_seller_settings_v2';

function AdminSettingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab') as SettingsTab | null;
  const activeTab: SettingsTab =
    tabParam && ['profil', 'alamat', 'ekspedisi', 'payment', 'seo', 'storage'].includes(tabParam)
      ? tabParam
      : 'profil';

  const handleTabChange = (tabKey: SettingsTab) => {
    router.push(`/admin/setting?tab=${tabKey}`);
  };

  // State Profile, Warehouse, Couriers, Payments
  const [profile, setProfile] = useState<StoreProfileData>(DEFAULT_PROFILE);
  const [announcement, setAnnouncement] = useState<AnnouncementData>(DEFAULT_ANNOUNCEMENT);
  const [warehouse, setWarehouse] = useState<OriginWarehouseData>(DEFAULT_WAREHOUSE);
  const [couriers, setCouriers] = useState<CourierSettingsData>(DEFAULT_COURIERS);
  const [payments, setPayments] = useState<PaymentSettingsData>(DEFAULT_PAYMENTS);

  // State Payment Gateway (Midtrans, Xendit, Simulator)
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

  // State SEO & Metadata
  const [metaTitle, setMetaTitle] = useState<string>(
    'NBusiness — Toko Kebutuhan Anak & Perlengkapan Terlengkap'
  );
  const [metaDescription, setMetaDescription] = useState<string>(
    'Beli perlengkapan bayi, baju anak modis, dan mainan edukatif terpercaya dengan pengiriman cepat ke seluruh Indonesia di NBusiness.'
  );
  const [keywords, setKeywords] = useState<string>(
    'nbusiness, toko anak, perlengkapan bayi, baju anak, mainan edukasi, belanja anak online'
  );
  const [googleVerification, setGoogleVerification] = useState<string>('');
  const [ogImage, setOgImage] = useState<string>('');

  const [currentOrigin, setCurrentOrigin] = useState<string>('');
  const [isTestingGateway, setIsTestingGateway] = useState<boolean>(false);
  const [gatewayTestResult, setGatewayTestResult] = useState<{
    success: boolean;
    message: string;
    provider: string;
  } | null>(null);

  // Storage info from server
  const [r2Info, setR2Info] = useState<R2StorageInfoData>({
    isConfigured: false,
    bucketName: 'baby-shop-products',
    publicUrl: 'https://pub-xxxxxx.r2.dev',
    accountId: 'Belum Dikonfigurasi',
    region: 'auto (Global Edge)',
    protocol: 'S3 API Protocol v4',
    maxUploadSize: '5 MB per file',
  });

  // Biteship info from server
  const [biteshipInfo, setBiteshipInfo] = useState<BiteshipInfoData>({
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

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCourierBadgeStyle = (courierCode: string) => {
    const code = (courierCode || '').toLowerCase();
    if (code.includes('sicepat')) {
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', pillBg: 'bg-red-600', logo: 'SiCepat' };
    }
    if (code.includes('jne')) {
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', pillBg: 'bg-blue-700', logo: 'JNE' };
    }
    if (code.includes('jnt') || code.includes('j&t')) {
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', pillBg: 'bg-rose-600', logo: 'J&T' };
    }
    if (code.includes('anteraja')) {
      return { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200', pillBg: 'bg-fuchsia-600', logo: 'Anteraja' };
    }
    return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', pillBg: 'bg-slate-700', logo: courierCode.toUpperCase() };
  };

  // Load Settings from API
  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
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
              storeDescription: data.store.description || prev.storeDescription,
            }));
            // Announcement bar
            if (data.store.announcement) {
              setAnnouncement({
                enabled: data.store.announcement.enabled ?? true,
                text: data.store.announcement.text ?? DEFAULT_ANNOUNCEMENT.text,
                link: data.store.announcement.link ?? '',
              });
            } else if (
              typeof data.store.headerAnnouncementEnabled !== 'undefined' ||
              typeof data.store.header_announcement_enabled !== 'undefined'
            ) {
              setAnnouncement({
                enabled: data.store.headerAnnouncementEnabled ?? data.store.header_announcement_enabled ?? true,
                text: data.store.headerAnnouncementText ?? data.store.header_announcement_text ?? DEFAULT_ANNOUNCEMENT.text,
                link: data.store.headerAnnouncementLink ?? data.store.header_announcement_link ?? '',
              });
            }
            setWarehouse((prev) => ({
              ...prev,
              city: data.store.city || prev.city,
              postalCode: data.store.postalCode || prev.postalCode,
              fullAddress: data.store.address || prev.fullAddress,
            }));
          }

          if (data.r2) setR2Info(data.r2);
          if (data.biteship) setBiteshipInfo(data.biteship);

          if (data.paymentGateway) {
            setActivePaymentGateway(data.paymentGateway.activeProvider || 'midtrans');
            if (data.paymentGateway.midtrans) {
              setMidtransIsProduction(Boolean(data.paymentGateway.midtrans.isProduction));
              setMidtransMerchantId(data.paymentGateway.midtrans.merchantId || '');
            }
            if (data.paymentGateway.xendit) {
              setXenditIsProduction(Boolean(data.paymentGateway.xendit.isProduction));
            }
          }

          if (data.seo) {
            setMetaTitle(data.seo.metaTitle || 'NBusiness — Toko Kebutuhan Anak & Perlengkapan Terlengkap');
            setMetaDescription(data.seo.metaDescription || '');
            setKeywords(data.seo.keywords || '');
            setGoogleVerification(data.seo.googleVerification || '');
            setOgImage(data.seo.ogImage || '');
          }

          if (Array.isArray(data.enabledPaymentMethods)) {
            const arr = data.enabledPaymentMethods;
            setPayments({
              qris: arr.includes('pay-qris') || arr.includes('qris'),
              bcaVa: arr.includes('pay-bca-va') || arr.includes('bca_va'),
              mandiriVa: arr.includes('pay-mandiri-va') || arr.includes('mandiri_va'),
              briVa: arr.includes('pay-bri-va') || arr.includes('bri_va'),
              gopay: arr.includes('pay-gopay') || arr.includes('gopay'),
            });
          }

          if (Array.isArray(data.enabledCouriers)) {
            const arr = data.enabledCouriers;
            setCouriers({
              sicepat: arr.includes('sicepat'),
              jne: arr.includes('jne'),
              jnt: arr.includes('jnt'),
              anteraja: arr.includes('anteraja'),
              cargo: arr.includes('cargo'),
            });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Save Settings to API & LocalStorage
  const handleSaveSettings = async () => {
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
        announcement,
        seo: {
          metaTitle,
          metaDescription,
          keywords,
          googleVerification,
          ogImage,
        },
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
        header_announcement_enabled: announcement.enabled,
        header_announcement_text: announcement.text,
        header_announcement_link: announcement.link || null,
      };

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
      triggerToast('🎉 Pengaturan toko, SEO Google & payment gateway berhasil disimpan!');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      triggerToast(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
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

  const handleApplyQuickDestination = (dest: { city: string; postalCode: string }) => {
    setTestCity(dest.city);
    setTestPostalCode(dest.postalCode);
  };

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
      const res = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationCity: testCity,
          destinationPostalCode: testPostalCode,
          items: [
            {
              name: testItemName,
              weightGram: testWeightGram,
              dimensionLength: testLengthCm,
              dimensionWidth: testWidthCm,
              dimensionHeight: testHeightCm,
              quantity: 1,
            },
          ],
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success && json.data) {
        setTestResult(json.data);
      } else {
        setTestError(json.error || 'Gagal menghitung tarif pengiriman');
      }
    } catch (err: any) {
      console.error('Error in shipping test:', err);
      setTestError(err.message || 'Terjadi kesalahan koneksi saat uji tarif');
    } finally {
      setIsTestingRates(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/20 px-2.5 py-1 rounded-full inline-block mb-2">
              Panel Pengaturan Seller
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
              Pengaturan Toko & Operasional NBusiness ⚙️
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Kelola profil brand, lokasi gudang logistik, ekspedisi pengiriman, gateway pembayaran, konfigurasi SEO Google Search, dan storage.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
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

      {/* Category Tab Segmented Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        {[
          { key: 'profil', label: 'Profil Toko', icon: Store },
          { key: 'alamat', label: 'Alamat Gudang', icon: MapPin },
          { key: 'ekspedisi', label: 'Ekspedisi & Kurir', icon: Truck },
          { key: 'payment', label: 'Payment Gateway', icon: CreditCard },
          { key: 'seo', label: 'SEO & Google Search', icon: Search, badge: 'Google Snippet' },
          { key: 'storage', label: 'Cloud Storage', icon: Cloud },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key as SettingsTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-rose-500 text-white shadow-sm scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT SECTIONS */}
      {activeTab === 'profil' && (
        <ProfileSettingsTab
          profile={profile}
          setProfile={setProfile}
          announcement={announcement}
          setAnnouncement={setAnnouncement}
          onChange={() => setHasUnsavedChanges(true)}
        />
      )}

      {activeTab === 'alamat' && (
        <WarehouseSettingsTab
          warehouse={warehouse}
          setWarehouse={setWarehouse}
          onChange={() => setHasUnsavedChanges(true)}
        />
      )}

      {activeTab === 'ekspedisi' && (
        <CouriersSettingsTab
          couriers={couriers}
          setCouriers={setCouriers}
          biteshipInfo={biteshipInfo}
          testCity={testCity}
          setTestCity={setTestCity}
          testPostalCode={testPostalCode}
          setTestPostalCode={setTestPostalCode}
          testWeightGram={testWeightGram}
          setTestWeightGram={setTestWeightGram}
          testLengthCm={testLengthCm}
          setTestLengthCm={setTestLengthCm}
          testWidthCm={testWidthCm}
          setTestWidthCm={setTestWidthCm}
          testHeightCm={testHeightCm}
          setTestHeightCm={setTestHeightCm}
          testItemName={testItemName}
          setTestItemName={setTestItemName}
          testSelectedPresetId={testSelectedPresetId}
          handleApplyPreset={handleApplyPreset}
          handleApplyQuickDestination={handleApplyQuickDestination}
          isTestingRates={isTestingRates}
          testError={testError}
          testResult={testResult}
          handleRunShippingTest={handleRunShippingTest}
          sampleProducts={SAMPLE_PRODUCTS}
          quickDestinations={QUICK_DESTINATIONS}
          formatRupiah={formatRupiah}
          getCourierBadgeStyle={getCourierBadgeStyle}
          onChange={() => setHasUnsavedChanges(true)}
        />
      )}

      {activeTab === 'payment' && (
        <PaymentSettingsTab
          payments={payments}
          setPayments={setPayments}
          activePaymentGateway={activePaymentGateway}
          setActivePaymentGateway={setActivePaymentGateway}
          midtransServerKey={midtransServerKey}
          setMidtransServerKey={setMidtransServerKey}
          midtransClientKey={midtransClientKey}
          setMidtransClientKey={setMidtransClientKey}
          midtransMerchantId={midtransMerchantId}
          setMidtransMerchantId={setMidtransMerchantId}
          midtransIsProduction={midtransIsProduction}
          setMidtransIsProduction={setMidtransIsProduction}
          showMidtransServerKey={showMidtransServerKey}
          setShowMidtransServerKey={setShowMidtransServerKey}
          xenditSecretKey={xenditSecretKey}
          setXenditSecretKey={setXenditSecretKey}
          xenditPublicKey={xenditPublicKey}
          setXenditPublicKey={setXenditPublicKey}
          xenditWebhookToken={xenditWebhookToken}
          setXenditWebhookToken={setXenditWebhookToken}
          xenditIsProduction={xenditIsProduction}
          setXenditIsProduction={setXenditIsProduction}
          showXenditSecretKey={showXenditSecretKey}
          setShowXenditSecretKey={setShowXenditSecretKey}
          showXenditWebhookToken={showXenditWebhookToken}
          setShowXenditWebhookToken={setShowXenditWebhookToken}
          currentOrigin={currentOrigin}
          copyToClipboard={copyToClipboard}
          copiedKey={copiedKey}
          handleTestGatewayConnection={handleTestGatewayConnection}
          isTestingGateway={isTestingGateway}
          gatewayTestResult={gatewayTestResult}
          onChange={() => setHasUnsavedChanges(true)}
        />
      )}

      {activeTab === 'seo' && (
        <SeoSettingsTab
          metaTitle={metaTitle}
          setMetaTitle={setMetaTitle}
          metaDescription={metaDescription}
          setMetaDescription={setMetaDescription}
          keywords={keywords}
          setKeywords={setKeywords}
          googleVerification={googleVerification}
          setGoogleVerification={setGoogleVerification}
          ogImage={ogImage}
          setOgImage={setOgImage}
          onChange={() => setHasUnsavedChanges(true)}
        />
      )}

      {activeTab === 'storage' && (
        <StorageSettingsTab
          r2Info={r2Info}
          copyToClipboard={copyToClipboard}
          copiedKey={copiedKey}
        />
      )}
    </div>
  );
}

export default function AdminSettingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          <span className="text-xs font-semibold">Memuat Pengaturan Toko NBusiness...</span>
        </div>
      }
    >
      <AdminSettingContent />
    </Suspense>
  );
}
