'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Plus,
  ArrowLeft,
  ArrowRight,
  Copy,
  Clock,
  Sparkles,
  AlertCircle,
  QrCode,
  Building2,
} from 'lucide-react';
import {
  MOCK_INITIAL_CART,
  MOCK_SAVED_ADDRESSES,
  MOCK_COURIERS,
  MOCK_PAYMENT_METHODS,
} from '@/data/mock-checkout';
import { ShippingAddress, CourierService, PaymentMethod } from '@/types/checkout';
import { formatRupiah } from '@/lib/format';

type Step = 1 | 2 | 3 | 4;

export function CheckoutStepper() {
  const router = useRouter();

  // Current active step
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // User selections
  const [addresses, setAddresses] = useState<ShippingAddress[]>(MOCK_SAVED_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(MOCK_SAVED_ADDRESSES[0].id);
  const [selectedCourierId, setSelectedCourierId] = useState<string>(MOCK_COURIERS[0].id);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(MOCK_PAYMENT_METHODS[0].id);
  const [buyerNotes, setBuyerNotes] = useState<string>('Tolong periksa jahitan & kemasan aman berlapis bubble wrap ya.');

  // New Address Form Modal / Inline
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    namaPenerima: '',
    telepon: '',
    labelAlamat: 'Rumah',
    alamatLengkap: '',
    provinsi: 'DKI Jakarta',
    kotaKabupaten: 'Jakarta Selatan',
    kecamatan: '',
    kodePos: '',
  });

  // Order state after placement
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Selected Objects
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];
  const selectedCourier = MOCK_COURIERS.find((c) => c.id === selectedCourierId) || MOCK_COURIERS[0];
  const selectedPayment = MOCK_PAYMENT_METHODS.find((p) => p.id === selectedPaymentId) || MOCK_PAYMENT_METHODS[0];

  // Price Computations
  const subtotal = MOCK_INITIAL_CART.reduce((sum, item) => sum + item.harga * item.jumlah, 0);
  const totalBeratGram = MOCK_INITIAL_CART.reduce((sum, item) => sum + item.beratGram * item.jumlah, 0);
  const totalBeratKg = Math.ceil(totalBeratGram / 1000);
  const ongkirFinal = selectedCourier.ongkir * Math.max(1, totalBeratKg);
  const diskonVoucher = 20000; // Promo Hemat
  const biayaLayanan = 1000;
  const totalBayar = subtotal + ongkirFinal + biayaLayanan - diskonVoucher;

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressForm.namaPenerima || !newAddressForm.alamatLengkap) return;

    const newAddr: ShippingAddress = {
      id: `addr-${Date.now()}`,
      namaPenerima: newAddressForm.namaPenerima,
      telepon: newAddressForm.telepon,
      labelAlamat: newAddressForm.labelAlamat,
      alamatLengkap: newAddressForm.alamatLengkap,
      kecamatan: newAddressForm.kecamatan,
      kotaKabupaten: newAddressForm.kotaKabupaten,
      provinsi: newAddressForm.provinsi,
      kodePos: newAddressForm.kodePos,
      isUtama: false,
    };

    setAddresses([newAddr, ...addresses]);
    setSelectedAddressId(newAddr.id);
    setShowAddAddress(false);
  };

  const handlePlaceOrder = () => {
    const generatedCode = `BK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderCode(generatedCode);
    setIsOrderPlaced(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(orderCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // SUCCESS / ORDER COMPLETED SCREEN
  if (isOrderPlaced) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-rose-100 shadow-lg text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🎉
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
            Pesanan Berhasil Dibuat!
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Terima kasih telah berbelanja di BabyKids. Pesanan Anda akan segera kami kemas dan kirimkan ke tujuan.
          </p>

          {/* Kode Pesanan Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 max-w-md mx-auto mb-8 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Nomor Invoice Pesanan:</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isCopied ? 'Tersalin!' : 'Salin Nomor'}</span>
              </button>
            </div>
            <div className="text-lg font-black text-slate-800 font-mono tracking-wide">
              {orderCode}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Metode Pembayaran:</span>
                <strong className="text-slate-800">{selectedPayment.nama}</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Pembayaran:</span>
                <strong className="text-rose-600 font-bold text-sm">{formatRupiah(totalBayar)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Kurir Pengiriman:</span>
                <strong className="text-slate-800">{selectedCourier.namaKurir} ({selectedCourier.layanan})</strong>
              </div>
              <div className="flex justify-between">
                <span>Penerima:</span>
                <strong className="text-slate-800">{selectedAddress.namaPenerima}</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/user/pesanan"
              className="w-full sm:w-auto px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Pantau Status Pesanan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/katalog"
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-2xl transition-colors"
            >
              Belanja Produk Lainnya
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Stepper Header Tabs */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-rose-100 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/keranjang"
            className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Keranjang</span>
          </Link>
          <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">
            Langkah {currentStep} dari 4
          </span>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
          {[
            { step: 1, label: 'Alamat Kirim', icon: MapPin },
            { step: 2, label: 'Pilihan Kurir', icon: Truck },
            { step: 3, label: 'Pembayaran', icon: CreditCard },
            { step: 4, label: 'Periksa & Bayar', icon: CheckCircle2 },
          ].map((s) => {
            const Icon = s.icon;
            const isDone = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => isDone && setCurrentStep(s.step as Step)}
                disabled={!isDone && !isCurrent}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${
                  isCurrent
                    ? 'bg-rose-50 text-rose-600 font-bold'
                    : isDone
                    ? 'text-slate-700 hover:bg-slate-50 cursor-pointer font-medium'
                    : 'text-slate-300 opacity-60'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-transform ${
                    isCurrent
                      ? 'bg-rose-500 text-white scale-110 shadow-xs'
                      : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-[11px] sm:text-xs leading-tight hidden xs:inline">
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Step Content + Sticky Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Step Specific Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: PILIH ALAMAT PENGIRIMAN */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-500" />
                    <span>Langkah 1: Alamat Pengiriman ke Seluruh Indonesia</span>
                  </h2>
                  <p className="text-xs text-slate-500">Pilih alamat tujuan atau tambahkan alamat baru</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Alamat Baru</span>
                </button>
              </div>

              {/* Form Tambah Alamat Baru */}
              {showAddAddress && (
                <form onSubmit={handleAddNewAddress} className="mb-6 p-5 bg-rose-50/40 rounded-2xl border border-rose-200 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700">Form Alamat Pengiriman Baru</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nama Penerima</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Bunda Sarah"
                        value={newAddressForm.namaPenerima}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, namaPenerima: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nomor Telepon / WhatsApp</label>
                      <input
                        type="text"
                        required
                        placeholder="0812-xxxx-xxxx"
                        value={newAddressForm.telepon}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, telepon: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Alamat Lengkap & Patokan</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Nama jalan, nomor rumah, RT/RW, komplek / patokan warna pagar"
                      value={newAddressForm.alamatLengkap}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, alamatLengkap: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Provinsi</label>
                      <input
                        type="text"
                        value={newAddressForm.provinsi}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, provinsi: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Kota/Kab</label>
                      <input
                        type="text"
                        value={newAddressForm.kotaKabupaten}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, kotaKabupaten: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Kecamatan</label>
                      <input
                        type="text"
                        placeholder="Kecamatan"
                        value={newAddressForm.kecamatan}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, kecamatan: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Kode Pos</label>
                      <input
                        type="text"
                        placeholder="12345"
                        value={newAddressForm.kodePos}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, kodePos: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Simpan Alamat
                    </button>
                  </div>
                </form>
              )}

              {/* Daftar Alamat Tersimpan */}
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const isSelected = addr.id === selectedAddressId;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-4 ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/20 shadow-xs'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800">{addr.namaPenerima}</span>
                          <span className="text-xs text-slate-500 font-mono">({addr.telepon})</span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md">
                            {addr.labelAlamat}
                          </span>
                          {addr.isUtama && (
                            <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-md">
                              Alamat Utama
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {addr.alamatLengkap}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {addr.kecamatan}, {addr.kotaKabupaten}, {addr.provinsi} {addr.kodePos}
                        </p>
                      </div>

                      <div className="mt-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2"
                >
                  <span>Lanjut Pilih Kurir Pengiriman</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PILIH KURIR & ONGKIR OTOMATIS */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
              <div className="pb-4 border-b border-slate-100 mb-5">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-rose-500" />
                  <span>Langkah 2: Pilih Jasa Kurir & Ongkir Otomatis</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Kirim ke: <strong className="text-slate-700">{selectedAddress.kotaKabupaten}, {selectedAddress.provinsi}</strong> (Berat: {totalBeratKg} kg)
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {MOCK_COURIERS.map((courier) => {
                  const isSelected = courier.id === selectedCourierId;
                  const calculatedCost = courier.ongkir * Math.max(1, totalBeratKg);

                  return (
                    <div
                      key={courier.id}
                      onClick={() => setSelectedCourierId(courier.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/20 shadow-xs'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center">
                          {courier.iconText}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-800">{courier.namaKurir}</span>
                            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                              {courier.layanan}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Estimasi sampai: <strong>{courier.estimasiHari}</strong></span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div>
                          <span className="text-sm font-bold text-slate-800 block">
                            {formatRupiah(calculatedCost)}
                          </span>
                          <span className="text-[10px] text-slate-400">Ongkir Otomatis</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Catatan untuk Penjual / Kurir */}
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Catatan Pengiriman (Opsional):
                </label>
                <input
                  type="text"
                  value={buyerNotes}
                  onChange={(e) => setBuyerNotes(e.target.value)}
                  placeholder="Contoh: Titipkan ke satpam jika tidak ada orang di rumah"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-2xl transition-colors"
                >
                  Kembali ke Alamat
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2"
                >
                  <span>Lanjut ke Metode Pembayaran</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PILIH METODE PEMBAYARAN */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
              <div className="pb-4 border-b border-slate-100 mb-5">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-rose-500" />
                  <span>Langkah 3: Pilih Metode Pembayaran Terpercaya</span>
                </h2>
                <p className="text-xs text-slate-500">Semua transaksi diproses secara instan & otomatis 24 jam</p>
              </div>

              <div className="space-y-3 mb-6">
                {MOCK_PAYMENT_METHODS.map((pay) => {
                  const isSelected = pay.id === selectedPaymentId;

                  return (
                    <div
                      key={pay.id}
                      onClick={() => setSelectedPaymentId(pay.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-4 ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/20 shadow-xs'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{pay.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-800">{pay.nama}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {pay.kategori.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {pay.deskripsi}
                          </p>
                          {pay.nomorAkun && (
                            <div className="mt-2 text-xs font-mono font-bold text-rose-700 bg-rose-50/80 px-2.5 py-1 rounded-lg inline-block border border-rose-100">
                              VA: {pay.nomorAkun}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-2xl transition-colors"
                >
                  Kembali ke Kurir
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2"
                >
                  <span>Lanjut Periksa Pesanan</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PERIKSA KEMBALI PESANAN & SELESAIKAN PEMBAYARAN */}
          {currentStep === 4 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Langkah 4: Periksa Kembali Detail Pesanan Sebelum Bayar</span>
                </h2>
                <p className="text-xs text-slate-500">Pastikan alamat, kurir, daftar barang, dan metode bayar sudah benar</p>
              </div>

              {/* Rincian Alamat & Kurir Terpilih */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" /> Alamat Tujuan
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-[11px] text-rose-600 font-bold hover:underline"
                    >
                      Ubah
                    </button>
                  </div>
                  <strong className="text-xs text-slate-800 block">{selectedAddress.namaPenerima} ({selectedAddress.telepon})</strong>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedAddress.alamatLengkap}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{selectedAddress.kotaKabupaten}, {selectedAddress.provinsi}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-sky-500" /> Jasa Kirim & Bayar
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-[11px] text-rose-600 font-bold hover:underline"
                    >
                      Ubah
                    </button>
                  </div>
                  <div className="text-xs text-slate-800 space-y-1">
                    <p>Kurir: <strong>{selectedCourier.namaKurir} - {selectedCourier.layanan}</strong></p>
                    <p>Estimasi: <strong>{selectedCourier.estimasiHari}</strong></p>
                    <p>Metode Bayar: <strong>{selectedPayment.nama}</strong></p>
                  </div>
                </div>
              </div>

              {/* Daftar Barang yang Dibeli */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Barang yang Dibeli ({MOCK_INITIAL_CART.reduce((s, i) => s + i.jumlah, 0)} Item):
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {MOCK_INITIAL_CART.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-4 bg-white">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.gambar}
                          alt={item.nama}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.nama}</h4>
                          <span className="text-[11px] text-slate-400">
                            {item.jumlah} x {formatRupiah(item.harga)} ({item.warna}, {item.ukuran})
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-800 whitespace-nowrap">
                        {formatRupiah(item.harga * item.jumlah)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-2xl transition-colors"
                >
                  Kembali ke Pembayaran
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="px-8 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Bayar Sekarang ({formatRupiah(totalBayar)})</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Summary Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs sticky top-24">
            <h3 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100 mb-4">
              Ringkasan Pesanan
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600 mb-5">
              <div className="flex justify-between">
                <span>Total Harga Barang</span>
                <span className="font-semibold text-slate-800">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkos Kirim ({totalBeratKg} kg)</span>
                <span className="font-semibold text-slate-800">{formatRupiah(ongkirFinal)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Diskon Promo Hemat</span>
                <span>-{formatRupiah(diskonVoucher)}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Layanan</span>
                <span className="text-slate-800">{formatRupiah(biayaLayanan)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mb-6">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-medium">Total Tagihan:</span>
                <span className="text-xl font-black text-rose-600">{formatRupiah(totalBayar)}</span>
              </div>
            </div>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((Math.min(4, currentStep + 1) as Step))}
                className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Langkah Selanjutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Bayar Sekarang</span>
                <Sparkles className="w-4 h-4" />
              </button>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Garansi 100% Pengembalian Dana</span>
              </div>
              <p>Paket aman bergaransi dengan asuransi pengiriman ke seluruh Indonesia.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
