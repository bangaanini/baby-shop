'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  User,
  Phone,
  Home,
  Building,
  Building2,
  Tag,
  Check,
  AlertCircle,
  Loader2,
  Navigation,
} from 'lucide-react';

export interface AddressFormData {
  id?: string;
  recipientName: string;
  phone: string;
  label: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  fullAddress: string;
  isPrimary: boolean;
  // Indonesian aliases
  namaPenerima?: string;
  telepon?: string;
  labelAlamat?: string;
  provinsi?: string;
  kotaKabupaten?: string;
  kecamatan?: string;
  kodePos?: string;
  alamatLengkap?: string;
  isUtama?: boolean;
}

export interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedAddress: any, isEdit: boolean) => void;
  initialData?: AddressFormData | null;
  userId?: string;
}

const PROVINCE_OPTIONS = [
  'DKI Jakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur',
  'Banten',
  'Bali',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Kepulauan Riau',
  'Jambi',
  'Sumatera Selatan',
  'Bangka Belitung',
  'Bengkulu',
  'Lampung',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Sulawesi Utara',
  'Sulawesi Tengah',
  'Sulawesi Selatan',
  'Sulawesi Tenggara',
  'Gorontalo',
  'Sulawesi Barat',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Maluku',
  'Maluku Utara',
  'Papua',
  'Papua Barat',
];

const POPULAR_CITIES = [
  { city: 'Jakarta Selatan', province: 'DKI Jakarta', postalCode: '12160' },
  { city: 'Jakarta Barat', province: 'DKI Jakarta', postalCode: '11470' },
  { city: 'Jakarta Pusat', province: 'DKI Jakarta', postalCode: '10110' },
  { city: 'Jakarta Timur', province: 'DKI Jakarta', postalCode: '13330' },
  { city: 'Jakarta Utara', province: 'DKI Jakarta', postalCode: '14240' },
  { city: 'Bandung', province: 'Jawa Barat', postalCode: '40115' },
  { city: 'Bekasi', province: 'Jawa Barat', postalCode: '17141' },
  { city: 'Depok', province: 'Jawa Barat', postalCode: '16424' },
  { city: 'Bogor', province: 'Jawa Barat', postalCode: '16124' },
  { city: 'Tangerang', province: 'Banten', postalCode: '15111' },
  { city: 'Tangerang Selatan', province: 'Banten', postalCode: '15414' },
  { city: 'Surabaya', province: 'Jawa Timur', postalCode: '60189' },
  { city: 'Semarang', province: 'Jawa Tengah', postalCode: '50134' },
  { city: 'Yogyakarta', province: 'DI Yogyakarta', postalCode: '55224' },
  { city: 'Solo (Surakarta)', province: 'Jawa Tengah', postalCode: '57126' },
  { city: 'Malang', province: 'Jawa Timur', postalCode: '65111' },
  { city: 'Medan', province: 'Sumatera Utara', postalCode: '20111' },
  { city: 'Palembang', province: 'Sumatera Selatan', postalCode: '30121' },
  { city: 'Makassar', province: 'Sulawesi Selatan', postalCode: '90111' },
  { city: 'Denpasar', province: 'Bali', postalCode: '80111' },
];

export function AddressModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  userId,
}: AddressModalProps) {
  const isEdit = Boolean(initialData?.id);

  // Form State
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [label, setLabel] = useState('Rumah');
  const [customLabel, setCustomLabel] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  // Validation and Submission State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Synchronize initial data when modal opens or initialData changes
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setRecipientName(initialData.recipientName || initialData.namaPenerima || '');
      setPhone(initialData.phone || initialData.telepon || '');

      const currentLabel = initialData.label || initialData.labelAlamat || 'Rumah';
      if (['Rumah', 'Kantor', 'Apartemen'].includes(currentLabel)) {
        setLabel(currentLabel);
        setCustomLabel('');
      } else {
        setLabel('Lainnya');
        setCustomLabel(currentLabel);
      }

      setProvince(initialData.province || initialData.provinsi || '');
      setCity(initialData.city || initialData.kotaKabupaten || '');
      setDistrict(initialData.district || initialData.kecamatan || '');
      setPostalCode(initialData.postalCode || initialData.kodePos || '');
      setFullAddress(initialData.fullAddress || initialData.alamatLengkap || '');
      setIsPrimary(Boolean(initialData.isPrimary ?? initialData.isUtama ?? false));
    } else {
      // Default blank values for new address
      setRecipientName('');
      setPhone('');
      setLabel('Rumah');
      setCustomLabel('');
      setProvince('DKI Jakarta');
      setCity('Jakarta Selatan');
      setDistrict('Kebayoran Baru');
      setPostalCode('12160');
      setFullAddress('');
      setIsPrimary(false);
    }
    setErrors({});
    setApiError(null);
  }, [isOpen, initialData]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  // Validate form fields
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!recipientName.trim()) {
      newErrors.recipientName = 'Nama penerima wajib diisi';
    } else if (recipientName.trim().length < 2) {
      newErrors.recipientName = 'Nama penerima minimal 2 karakter';
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    } else if (cleanPhone.length < 8) {
      newErrors.phone = 'Nomor telepon minimal 8 digit angka';
    }

    if (label === 'Lainnya' && !customLabel.trim()) {
      newErrors.customLabel = 'Tentukan nama label alamat Anda';
    }

    if (!province.trim()) {
      newErrors.province = 'Provinsi wajib diisi';
    }

    if (!city.trim()) {
      newErrors.city = 'Kota/Kabupaten wajib diisi';
    }

    if (!postalCode.trim()) {
      newErrors.postalCode = 'Kode pos wajib diisi';
    } else if (postalCode.trim().length < 3) {
      newErrors.postalCode = 'Kode pos minimal 3 digit';
    }

    if (!fullAddress.trim()) {
      newErrors.fullAddress = 'Alamat lengkap wajib diisi';
    } else if (fullAddress.trim().length < 5) {
      newErrors.fullAddress = 'Alamat lengkap minimal 5 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    const resolvedLabel = label === 'Lainnya' ? customLabel.trim() : label;

    const payload = {
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      label: resolvedLabel,
      province: province.trim(),
      city: city.trim(),
      district: district.trim() || null,
      postalCode: postalCode.trim(),
      fullAddress: fullAddress.trim(),
      isPrimary,
      userId: userId || undefined,
    };

    try {
      const endpoint = isEdit
        ? `/api/user/addresses/${initialData?.id}`
        : '/api/user/addresses';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan alamat');
      }

      onSuccess(data.data, isEdit);
      onClose();
    } catch (err: any) {
      console.error('Error saving address:', err);
      setApiError(err.message || 'Terjadi kesalahan sistem saat menyimpan alamat');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50/50 via-pink-50/30 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800">
                {isEdit ? 'Ubah Alamat Pengiriman' : 'Tambah Alamat Baru'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pastikan informasi alamat lengkap agar kurir tepat mengantarkan pesanan Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {apiError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Section 1: Label Alamat */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Label Alamat
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'Rumah', icon: Home, label: 'Rumah' },
                { id: 'Kantor', icon: Building, label: 'Kantor' },
                { id: 'Apartemen', icon: Building2, label: 'Apartemen' },
                { id: 'Lainnya', icon: Tag, label: 'Lainnya' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = label === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setLabel(item.id);
                      if (errors.customLabel) {
                        setErrors((prev) => ({ ...prev, customLabel: '' }));
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {label === 'Lainnya' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => {
                    setCustomLabel(e.target.value);
                    if (errors.customLabel) {
                      setErrors((prev) => ({ ...prev, customLabel: '' }));
                    }
                  }}
                  placeholder="Contoh: Rumah Mertua, Kosan, Gudang"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.customLabel
                      ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-rose-200 focus:border-rose-500'
                  }`}
                />
                {errors.customLabel && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">
                    {errors.customLabel}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Informasi Penerima */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Penerima <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => {
                    setRecipientName(e.target.value);
                    if (errors.recipientName) {
                      setErrors((prev) => ({ ...prev, recipientName: '' }));
                    }
                  }}
                  placeholder="Nama lengkap penerima"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.recipientName
                      ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-rose-200 focus:border-rose-500'
                  }`}
                />
              </div>
              {errors.recipientName && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">
                  {errors.recipientName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nomor HP / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) {
                      setErrors((prev) => ({ ...prev, phone: '' }));
                    }
                  }}
                  placeholder="Contoh: 081234567890"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                    errors.phone
                      ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                      : 'border-slate-200 focus:ring-rose-200 focus:border-rose-500'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Wilayah & Kota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Provinsi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="province-list"
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value);
                  if (errors.province) {
                    setErrors((prev) => ({ ...prev, province: '' }));
                  }
                }}
                placeholder="Pilih atau ketik provinsi"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                  errors.province
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-rose-200 focus:border-rose-500'
                }`}
              />
              <datalist id="province-list">
                {PROVINCE_OPTIONS.map((prov) => (
                  <option key={prov} value={prov} />
                ))}
              </datalist>
              {errors.province && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">
                  {errors.province}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kota / Kabupaten <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="city-list"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errors.city) {
                    setErrors((prev) => ({ ...prev, city: '' }));
                  }
                  // Auto-fill province & postal if matched
                  const match = POPULAR_CITIES.find(
                    (c) => c.city.toLowerCase() === e.target.value.toLowerCase()
                  );
                  if (match) {
                    if (!province) setProvince(match.province);
                    if (!postalCode) setPostalCode(match.postalCode);
                  }
                }}
                placeholder="Contoh: Jakarta Selatan, Surabaya"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                  errors.city
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-rose-200 focus:border-rose-500'
                }`}
              />
              <datalist id="city-list">
                {POPULAR_CITIES.map((c) => (
                  <option key={c.city} value={c.city}>
                    {c.province}
                  </option>
                ))}
              </datalist>
              {errors.city && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">
                  {errors.city}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kecamatan
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Contoh: Kebayoran Baru, Sukomanunggal"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-200 focus:border-rose-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kode Pos <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength={10}
                value={postalCode}
                onChange={(e) => {
                  setPostalCode(e.target.value);
                  if (errors.postalCode) {
                    setErrors((prev) => ({ ...prev, postalCode: '' }));
                  }
                }}
                placeholder="Contoh: 12160"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                  errors.postalCode
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-rose-200 focus:border-rose-500'
                }`}
              />
              {errors.postalCode && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">
                  {errors.postalCode}
                </p>
              )}
            </div>
          </div>

          {/* Section 4: Alamat Lengkap & Patokan */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Alamat Lengkap & Patokan <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {fullAddress.length}/500 karakter
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={fullAddress}
              onChange={(e) => {
                setFullAddress(e.target.value);
                if (errors.fullAddress) {
                  setErrors((prev) => ({ ...prev, fullAddress: '' }));
                }
              }}
              placeholder="Contoh: Jl. Melati Indah No. 42, RT 03 / RW 07 (Pagar hitam, samping Apotek Sehat Sejahtera)"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all resize-none ${
                errors.fullAddress
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-rose-200 focus:border-rose-500'
              }`}
            />
            {errors.fullAddress ? (
              <p className="text-[11px] text-rose-500 font-medium mt-1">
                {errors.fullAddress}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Tuliskan nama jalan, nomor bangunan, dan patokan spesifik agar kurir dapat menemukan lokasi Anda dengan cepat.
              </p>
            )}
          </div>

          {/* Section 5: Checkbox Jadikan Alamat Utama */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50/50 hover:bg-rose-50 border border-rose-100/80 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 transition-colors"
              />
              <div className="flex-1">
                <span className="text-xs font-bold text-slate-800 block">
                  Jadikan Alamat Utama
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Alamat ini akan otomatis terpilih sebagai alamat pengiriman default saat Anda checkout belanja.
                </span>
              </div>
            </label>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 border border-slate-200 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 active:scale-98 shadow-md shadow-rose-200 transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Alamat</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
