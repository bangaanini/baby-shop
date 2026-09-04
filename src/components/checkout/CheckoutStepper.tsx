'use client';

import React, { useState, useEffect } from 'react';
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
  Loader2,
  Scale,
  ExternalLink,
} from 'lucide-react';
import {
  MOCK_INITIAL_CART,
  MOCK_SAVED_ADDRESSES,
  MOCK_COURIERS,
  MOCK_PAYMENT_METHODS,
} from '@/data/mock-checkout';
import { CartItem, ShippingAddress, CourierService, PaymentMethod, ShippingRateOption } from '@/types/checkout';
import { formatRupiah } from '@/lib/format';

function getCourierIconText(code: string): string {
  const lower = (code || '').toLowerCase().trim();
  if (lower.includes('sicepat')) return '⚡ SiCepat';
  if (lower.includes('jne')) return '📦 JNE';
  if (lower.includes('jnt') || lower.includes('j&t')) return '🚀 J&T';
  if (lower.includes('anteraja')) return '⚡ Anteraja';
  if (lower.includes('pos')) return '📮 POS';
  if (lower.includes('tiki')) return '🚚 TIKI';
  if (lower.includes('ninja')) return '🥷 Ninja';
  if (lower.includes('lion')) return '🦁 Lion';
  if (lower.includes('wahana')) return '🚛 Wahana';
  return '🚚 ' + (code ? code.toUpperCase() : 'Kurir');
}

function loadMidtransSnapScript(clientKey?: string, isProduction?: boolean): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if ((window as any).snap) {
      resolve(true);
      return;
    }

    const scriptId = 'midtrans-snap-script';
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existingScript) {
      if ((window as any).snap) {
        resolve(true);
      } else {
        existingScript.addEventListener('load', () => resolve(true));
        existingScript.addEventListener('error', () => resolve(false));
      }
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    if (clientKey) {
      script.setAttribute('data-client-key', clientKey);
    }
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Midtrans Snap JS SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

interface PaymentTransactionState {
  provider: 'midtrans' | 'xendit' | 'simulator';
  token?: string;
  snapToken?: string;
  redirectUrl?: string;
  invoiceUrl?: string;
  clientKey?: string;
  isProduction?: boolean;
  isSimulator: boolean;
  message?: string;
}

const FALLBACK_COURIER_OPTIONS: ShippingRateOption[] = MOCK_COURIERS.map((m) => ({
  id: m.id,
  courierCode: m.kodeKurir,
  courierName: m.namaKurir,
  serviceCode: m.layanan.split(' ')[0] || 'REG',
  serviceName: m.layanan,
  cost: m.ongkir,
  price: m.ongkir,
  etd: m.estimasiHari,
  description: '',
  isAvailable: true,
  isLiveRate: false,
  iconText: m.iconText,
}));

type Step = 1 | 2 | 3 | 4;

export function CheckoutStepper() {
  const router = useRouter();

  // Current active step
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Cart & items state
  const [items, setItems] = useState<CartItem[]>(MOCK_INITIAL_CART);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  // Voucher state
  const [voucherApplied, setVoucherApplied] = useState(true);
  const [voucherCode, setVoucherCode] = useState('ANAKHEMAT');

  // Calculation & submission states
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // User selections
  const [addresses, setAddresses] = useState<ShippingAddress[]>(MOCK_SAVED_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(MOCK_SAVED_ADDRESSES[0].id);
  const [availableCouriers, setAvailableCouriers] = useState<ShippingRateOption[]>(FALLBACK_COURIER_OPTIONS);
  const [selectedCourierId, setSelectedCourierId] = useState<string>(FALLBACK_COURIER_OPTIONS[0].id);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [shippingWeights, setShippingWeights] = useState<{
    chargeableWeightKg: number;
    totalWeightGram: number;
    totalVolumeWeightGram: number;
    isLiveRate: boolean;
  }>({
    chargeableWeightKg: 1,
    totalWeightGram: 500,
    totalVolumeWeightGram: 500,
    isLiveRate: false,
  });
  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
  const [activeGateway, setActiveGateway] = useState<'midtrans' | 'xendit' | 'simulator'>('midtrans');
  const [midtransClientKey, setMidtransClientKey] = useState<string>('');
  const [isMidtransProduction, setIsMidtransProduction] = useState<boolean>(false);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState<boolean>(false);
  const [paymentTx, setPaymentTx] = useState<PaymentTransactionState | null>(null);

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
  const selectedCourier =
    availableCouriers.find((c) => c.id === selectedCourierId) ||
    availableCouriers[0] ||
    FALLBACK_COURIER_OPTIONS[0];
  const selectedPayment = paymentMethods.find((p) => p.id === selectedPaymentId) || paymentMethods[0] || MOCK_PAYMENT_METHODS[0];

  // Fallback initial computations
  const fallbackSubtotal = items.reduce((sum, item) => sum + item.harga * item.jumlah, 0);
  const fallbackTotalBeratGram = items.reduce((sum, item) => sum + (item.beratGram || 500) * item.jumlah, 0);
  const fallbackTotalBeratKg = Math.max(1, Math.ceil(fallbackTotalBeratGram / 1000));
  const fallbackOngkir = (selectedCourier?.price || selectedCourier?.cost || 20000);
  const fallbackDiskonVoucher = voucherApplied ? 20000 : 0;
  const fallbackBiayaLayanan = 1000;
  const fallbackTotalBayar = Math.max(0, fallbackSubtotal + fallbackOngkir + fallbackBiayaLayanan - fallbackDiskonVoucher);

  const [calcSummary, setCalcSummary] = useState({
    subtotal: fallbackSubtotal,
    totalBeratGram: fallbackTotalBeratGram,
    totalBeratKg: fallbackTotalBeratKg,
    ongkir: fallbackOngkir,
    diskonVoucher: fallbackDiskonVoucher,
    biayaLayanan: fallbackBiayaLayanan,
    totalBayar: fallbackTotalBayar,
  });

  // 1. Fetch live cart items from GET /api/cart on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchCart() {
      try {
        setIsLoadingCart(true);
        const res = await fetch('/api/cart');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            if (json.data.cartId) {
              setCartId(json.data.cartId);
            }
            if (Array.isArray(json.data.items) && json.data.items.length > 0) {
              const mapped: CartItem[] = json.data.items.map((item: any) => ({
                id: item.id,
                cartId: item.cartId,
                productId: item.productId,
                variantId: item.variantId,
                nama: item.nama,
                slug: item.slug,
                gambar: item.gambar,
                kategoriLabel: item.kategoriLabel || 'Perlengkapan Anak',
                warna: item.warna || '',
                ukuran: item.ukuran || '',
                harga: item.harga,
                hargaCoret: item.hargaCoret,
                diskonPersen: item.diskonPersen,
                jumlah: item.jumlah,
                beratGram: item.beratGram || 500,
                stok: item.stok || 99,
                subtotal: item.subtotal,
                totalBeratGram: item.totalBeratGram,
              }));
              if (isMounted) setItems(mapped);
              return;
            }
          }
        }
        if (isMounted) setItems(MOCK_INITIAL_CART);
      } catch (error) {
        console.error('Failed to load cart for checkout:', error);
        if (isMounted) setItems(MOCK_INITIAL_CART);
      } finally {
        if (isMounted) setIsLoadingCart(false);
      }
    }

    fetchCart();
    return () => {
      isMounted = false;
    };
  }, []);

  // 1b. Fetch active payment methods & gateway settings from GET /api/payment/methods
  useEffect(() => {
    let isMounted = true;
    async function fetchPaymentMethods() {
      try {
        setIsLoadingPaymentMethods(true);
        const res = await fetch('/api/payment/methods');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            if (json.data.activeGateway) {
              setActiveGateway(json.data.activeGateway.toLowerCase());
            }
            if (json.data.clientKey) {
              setMidtransClientKey(json.data.clientKey);
            }
            if (typeof json.data.isProduction === 'boolean') {
              setIsMidtransProduction(json.data.isProduction);
            }
            if (Array.isArray(json.data.methods) && json.data.methods.length > 0) {
              setPaymentMethods(json.data.methods);
              setSelectedPaymentId((prevId) => {
                const exists = json.data.methods.some((m: PaymentMethod) => m.id === prevId);
                return exists ? prevId : json.data.methods[0].id;
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch active payment methods:', err);
      } finally {
        if (isMounted) {
          setIsLoadingPaymentMethods(false);
        }
      }
    }

    fetchPaymentMethods();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch live shipping rates dynamically whenever selected address or items change
  useEffect(() => {
    let isMounted = true;

    async function fetchShippingRates() {
      if (!selectedAddress || !items || items.length === 0) return;

      setIsLoadingRates(true);
      try {
        const res = await fetch('/api/shipping/rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destinationPostalCode: selectedAddress.kodePos,
            destinationCity: selectedAddress.kotaKabupaten,
            destinationProvince: selectedAddress.provinsi,
            destinationDistrict: selectedAddress.kecamatan,
            items: items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId || null,
              quantity: i.jumlah,
            })),
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const { rates, totalWeightGram, totalVolumeWeightGram, chargeableWeightKg, isLiveBiteship } = json.data;

            if (isMounted) {
              setShippingWeights({
                chargeableWeightKg: chargeableWeightKg || 1,
                totalWeightGram: totalWeightGram || 0,
                totalVolumeWeightGram: totalVolumeWeightGram || 0,
                isLiveRate: Boolean(isLiveBiteship),
              });

              if (Array.isArray(rates) && rates.length > 0) {
                const mappedRates: ShippingRateOption[] = rates.map((r: any) => {
                  const uniqueId = `${r.courierCode}-${r.serviceCode}`.toLowerCase();
                  const priceVal = Number(r.cost ?? r.price ?? 0);
                  return {
                    id: uniqueId,
                    courierCode: r.courierCode,
                    courierName: r.courierName || r.courierCode,
                    serviceCode: r.serviceCode || 'REG',
                    serviceName: r.serviceName || r.serviceCode || 'REG',
                    cost: priceVal,
                    price: priceVal,
                    etd: r.etd || '1 - 3 Hari',
                    description: r.description || '',
                    isAvailable: r.isAvailable !== false,
                    isLiveRate: Boolean(isLiveBiteship || r.isLiveRate),
                    iconText: getCourierIconText(r.courierCode),
                  };
                });

                setAvailableCouriers(mappedRates);

                // Maintain or auto-select a valid courier option
                setSelectedCourierId((prevId) => {
                  const exists = mappedRates.some((c) => c.id === prevId);
                  return exists ? prevId : mappedRates[0].id;
                });
                return;
              }
            }
          }
        }

        // Fallback
        if (isMounted) {
          setAvailableCouriers(FALLBACK_COURIER_OPTIONS);
        }
      } catch (err) {
        console.error('Failed to fetch live shipping rates:', err);
        if (isMounted) {
          setAvailableCouriers(FALLBACK_COURIER_OPTIONS);
        }
      } finally {
        if (isMounted) {
          setIsLoadingRates(false);
        }
      }
    }

    fetchShippingRates();

    return () => {
      isMounted = false;
    };
  }, [
    selectedAddress?.id,
    selectedAddress?.kodePos,
    selectedAddress?.kotaKabupaten,
    selectedAddress?.provinsi,
    selectedAddress?.kecamatan,
    items,
  ]);

  // 3. Whenever items, courier, address, or voucher changes, call POST /api/checkout/calculate
  useEffect(() => {
    let isMounted = true;
    async function runCalculation() {
      if (!items || items.length === 0) return;
      setIsCalculating(true);
      try {
        const res = await fetch('/api/checkout/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId || null,
              quantity: i.jumlah,
            })),
            courierCode: selectedCourier.courierCode,
            courierService: selectedCourier.serviceCode,
            destinationPostalCode: selectedAddress.kodePos,
            destinationCity: selectedAddress.kotaKabupaten,
            destinationProvince: selectedAddress.provinsi,
            destinationDistrict: selectedAddress.kecamatan,
            voucherCode: voucherApplied ? (voucherCode || 'ANAKHEMAT') : undefined,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            if (isMounted) {
              setCalcSummary({
                subtotal: json.data.subtotalProduk,
                totalBeratGram: json.data.totalBeratGram || json.data.totalWeightGram || 500,
                totalBeratKg: json.data.chargeableWeightKg || json.data.totalBeratKg || 1,
                ongkir: json.data.ongkir,
                diskonVoucher: json.data.diskonVoucher,
                biayaLayanan: json.data.biayaLayanan,
                totalBayar: json.data.totalBayar,
              });
            }
            return;
          }
        }

        // Fallback calculation for mock items or offline
        const sub = items.reduce((sum, item) => sum + item.harga * item.jumlah, 0);
        const weight = shippingWeights.totalWeightGram || items.reduce((sum, item) => sum + (item.beratGram || 500) * item.jumlah, 0);
        const weightKg = shippingWeights.chargeableWeightKg || Math.max(1, Math.ceil(weight / 1000));
        const ongk = selectedCourier.price ?? selectedCourier.cost ?? 20000;
        const disc = voucherApplied ? 20000 : 0;
        const fee = 1000;
        const total = Math.max(0, sub + ongk + fee - disc);
        if (isMounted) {
          setCalcSummary({
            subtotal: sub,
            totalBeratGram: weight,
            totalBeratKg: weightKg,
            ongkir: ongk,
            diskonVoucher: disc,
            biayaLayanan: fee,
            totalBayar: total,
          });
        }
      } catch (error) {
        console.error('Failed to calculate order:', error);
        const sub = items.reduce((sum, item) => sum + item.harga * item.jumlah, 0);
        const weight = shippingWeights.totalWeightGram || items.reduce((sum, item) => sum + (item.beratGram || 500) * item.jumlah, 0);
        const weightKg = shippingWeights.chargeableWeightKg || Math.max(1, Math.ceil(weight / 1000));
        const ongk = selectedCourier.price ?? selectedCourier.cost ?? 20000;
        const disc = voucherApplied ? 20000 : 0;
        const fee = 1000;
        const total = Math.max(0, sub + ongk + fee - disc);
        if (isMounted) {
          setCalcSummary({
            subtotal: sub,
            totalBeratGram: weight,
            totalBeratKg: weightKg,
            ongkir: ongk,
            diskonVoucher: disc,
            biayaLayanan: fee,
            totalBayar: total,
          });
        }
      } finally {
        if (isMounted) setIsCalculating(false);
      }
    }

    runCalculation();
    return () => {
      isMounted = false;
    };
  }, [
    items,
    selectedCourier.id,
    selectedCourier.courierCode,
    selectedCourier.serviceCode,
    selectedCourier.price,
    selectedCourier.cost,
    selectedAddress.id,
    selectedAddress.kodePos,
    selectedAddress.kotaKabupaten,
    selectedAddress.provinsi,
    selectedAddress.kecamatan,
    voucherApplied,
    voucherCode,
    shippingWeights.chargeableWeightKg,
  ]);

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

  const handlePlaceOrder = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    const fullShippingAddress = `${selectedAddress.alamatLengkap}, ${
      selectedAddress.kecamatan ? selectedAddress.kecamatan + ', ' : ''
    }${selectedAddress.kotaKabupaten}, ${selectedAddress.provinsi} ${selectedAddress.kodePos}`;

    const orderPayload = {
      recipientName: selectedAddress.namaPenerima,
      recipientPhone: selectedAddress.telepon,
      shippingAddress: fullShippingAddress,
      courierCode: selectedCourier.courierCode || selectedCourier.kodeKurir,
      courierService: selectedCourier.serviceName || selectedCourier.serviceCode || selectedCourier.layanan,
      destinationPostalCode: selectedAddress.kodePos,
      destinationCity: selectedAddress.kotaKabupaten,
      destinationProvince: selectedAddress.provinsi,
      destinationDistrict: selectedAddress.kecamatan,
      paymentMethod: selectedPayment.nama,
      notes: buyerNotes || undefined,
      voucherCode: voucherApplied ? (voucherCode || 'ANAKHEMAT') : undefined,
      cartId: cartId || undefined,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId || null,
        quantity: i.jumlah,
      })),
    };

    try {
      const res = await fetch('/api/checkout/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        const createdInvoice = json.data.invoiceNumber || json.data.orderId;
        setOrderCode(createdInvoice);
        setIsOrderPlaced(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const tx = json.data.paymentTransaction;
        if (tx) {
          setPaymentTx(tx);

          if (tx.provider === 'midtrans' && (tx.snapToken || tx.token)) {
            const snapToken = tx.snapToken || tx.token;
            const clientKey = tx.clientKey || midtransClientKey;
            const isProd = tx.isProduction ?? isMidtransProduction;
            handleOpenMidtransSnap(snapToken, clientKey, isProd);
          } else if (tx.provider === 'xendit' && (tx.invoiceUrl || tx.redirectUrl)) {
            const invoiceUrl = tx.invoiceUrl || tx.redirectUrl;
            window.open(invoiceUrl, '_blank');
          }
        }
        return;
      }

      // If backend returns an error message
      const errText =
        json.error || 'Terjadi kendala saat memproses pesanan Anda. Silakan periksa kembali data Anda.';
      setErrorMessage(errText);
    } catch (error: any) {
      console.error('Error placing order:', error);
      setErrorMessage(error?.message || 'Gagal terhubung ke server pembayaran. Silakan periksa koneksi internet Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenMidtransSnap = async (token?: string, cKey?: string, isProd?: boolean) => {
    const sToken = token || paymentTx?.snapToken || paymentTx?.token;
    if (!sToken) return;
    const clientKey = cKey || paymentTx?.clientKey || midtransClientKey;
    const isProduction = isProd ?? paymentTx?.isProduction ?? isMidtransProduction;
    const loaded = await loadMidtransSnapScript(clientKey, isProduction);
    if (loaded && (window as any).snap && typeof (window as any).snap.pay === 'function') {
      (window as any).snap.pay(sToken, {
        onSuccess: function (result: any) {
          console.log('[Midtrans Snap] Pembayaran Berhasil:', result);
          router.push(`/user/pesanan?invoice=${orderCode}&payment_status=success`);
        },
        onPending: function (result: any) {
          console.log('[Midtrans Snap] Menunggu Pembayaran:', result);
        },
        onError: function (result: any) {
          console.error('[Midtrans Snap] Pembayaran Gagal:', result);
          setErrorMessage('Pembayaran gagal atau dibatalkan. Silakan coba kembali.');
        },
        onClose: function () {
          console.log('[Midtrans Snap] Popup Snap ditutup.');
        },
      });
    }
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
            Terima kasih telah berbelanja di NBusiness. Pesanan Anda akan segera kami kemas dan kirimkan ke tujuan setelah pembayaran diverifikasi.
          </p>

          {/* Payment Gateway Actions if pending */}
          {paymentTx && (
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-rose-50/70 to-purple-50/70 border border-rose-100 max-w-md mx-auto text-left shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700">Gateway Pembayaran:</span>
                {paymentTx.provider === 'midtrans' && (
                  <span className="text-xs font-bold text-blue-700 bg-blue-100/90 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-blue-200">
                    <span>🔵</span> Midtrans Snap
                  </span>
                )}
                {paymentTx.provider === 'xendit' && (
                  <span className="text-xs font-bold text-purple-700 bg-purple-100/90 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-purple-200">
                    <span>🟣</span> Xendit Invoice
                  </span>
                )}
                {(paymentTx.isSimulator || paymentTx.provider === 'simulator') && (
                  <span className="text-xs font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                    <span>🟡</span> Simulator
                  </span>
                )}
              </div>

              {paymentTx.provider === 'midtrans' && (paymentTx.snapToken || paymentTx.token) && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleOpenMidtransSnap()}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                  >
                    <span>Buka Popup Pembayaran Midtrans Snap</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[11px] text-slate-500 text-center">
                    Klik tombol di atas jika jendela pembayaran Midtrans tidak muncul otomatis.
                  </p>
                </div>
              )}

              {paymentTx.provider === 'xendit' && (paymentTx.invoiceUrl || paymentTx.redirectUrl) && (
                <div className="space-y-2">
                  <a
                    href={paymentTx.invoiceUrl || paymentTx.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                  >
                    <span>Buka Halaman Pembayaran Xendit</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <p className="text-[11px] text-slate-500 text-center">
                    Anda akan dialihkan ke halaman tagihan resmi Xendit XenInvoice.
                  </p>
                </div>
              )}

              {(paymentTx.isSimulator || paymentTx.provider === 'simulator') && (
                <div className="space-y-2">
                  <Link
                    href={paymentTx.redirectUrl || `/user/pesanan?invoice=${orderCode}&simulated=true`}
                    className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                  >
                    <span>Simulasikan Pembayaran Berhasil</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <p className="text-[11px] text-slate-500 text-center">
                    Mode simulasi aktif untuk menyelesaikan pembayaran secara instan tanpa gateway nyata.
                  </p>
                </div>
              )}
            </div>
          )}

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
                <strong className="text-rose-600 font-bold text-sm">{formatRupiah(calcSummary.totalBayar)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Kurir Pengiriman:</span>
                <strong className="text-slate-800">{selectedCourier.courierName} - {selectedCourier.serviceName}</strong>
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
                onClick={() => setCurrentStep(s.step as Step)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${
                  isCurrent
                    ? 'text-rose-600 font-bold bg-rose-50/50'
                    : isDone
                    ? 'text-emerald-600 font-medium'
                    : 'text-slate-400 font-normal hover:text-slate-600'
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
          {/* Error Banner if any */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span className="flex-1">{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-600 font-bold text-sm"
              >
                ×
              </button>
            </div>
          )}

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
                <form
                  onSubmit={handleAddNewAddress}
                  className="mb-6 p-4 sm:p-5 bg-rose-50/40 rounded-2xl border border-rose-100 space-y-3"
                >
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tambah Alamat Baru</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nama Penerima</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Sarah Azhari"
                        value={newAddressForm.namaPenerima}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, namaPenerima: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nomor WhatsApp / Telepon</label>
                      <input
                        type="tel"
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

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-xs"
                    >
                      Simpan Alamat
                    </button>
                  </div>
                </form>
              )}

              {/* Daftar Alamat Tersimpan */}
              <div className="space-y-3 mb-6">
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
                          <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {addr.labelAlamat}
                          </span>
                          {addr.isUtama && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                              Utama
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{addr.telepon}</p>
                        <p className="text-xs text-slate-600 leading-relaxed pt-1">{addr.alamatLengkap}</p>
                        <p className="text-[11px] text-slate-400">
                          {addr.kecamatan ? addr.kecamatan + ', ' : ''}{addr.kotaKabupaten}, {addr.provinsi} {addr.kodePos}
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

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2"
                >
                  <span>Pilih Jasa Pengiriman</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PILIH JASA KURIR & PENGIRIMAN */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
              <div className="pb-4 border-b border-slate-100 mb-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-rose-500" />
                    <span>Langkah 2: Pilihan Kurir & Ongkir Otomatis</span>
                  </h2>
                  {shippingWeights.isLiveRate && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      🟢 Live Rate Aktif
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Kirim ke: <strong className="text-slate-700">{selectedAddress.kotaKabupaten}, {selectedAddress.provinsi}</strong>
                </p>

                {/* Dimensional cargo weight badge */}
                <div className="mt-3 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-medium">
                    <Scale className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Berat Aktual: <strong>{(shippingWeights.totalWeightGram / 1000).toFixed(1)} kg</strong> • Berat Volumetrik: <strong>{(shippingWeights.totalVolumeWeightGram / 1000).toFixed(1)} kg</strong> — Dihitung: <strong className="text-rose-600 font-extrabold">{shippingWeights.chargeableWeightKg.toFixed(1)} kg</strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-700/80 font-medium italic">
                    (Standar cargo: volumetrik / 6000)
                  </span>
                </div>
              </div>

              {/* Loading Indicator or Dynamic Courier List */}
              {isLoadingRates ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                  <p className="text-xs font-semibold">Mengambil tarif ongkir live real-time...</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {availableCouriers.map((courier) => {
                    const isSelected = courier.id === selectedCourierId;
                    const displayPrice = courier.price ?? courier.cost ?? 0;

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
                          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200/50">
                            {courier.iconText || courier.courierCode.toUpperCase()}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-slate-800">
                                {courier.courierName} - {courier.serviceCode || courier.serviceName}
                              </span>
                              {courier.serviceName && courier.serviceName !== courier.serviceCode && (
                                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                                  {courier.serviceName}
                                </span>
                              )}
                              {courier.isLiveRate && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <span>🟢</span>
                                  <span>Live Rate</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>Estimasi sampai: <strong>{courier.etd}</strong></span>
                              {courier.description ? (
                                <span className="text-slate-400 text-[11px] hidden sm:inline">• {courier.description}</span>
                              ) : null}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex items-center gap-3 shrink-0">
                          <div>
                            <span className="text-sm font-bold text-slate-800 block">
                              {formatRupiah(displayPrice)}
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
              )}

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
                  <span>Lanjut ke Pembayaran</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: METODE PEMBAYARAN */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
              <div className="pb-4 border-b border-slate-100 mb-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-rose-500" />
                      <span>Langkah 3: Pilih Metode Pembayaran Terverifikasi</span>
                    </h2>
                    <p className="text-xs text-slate-500">Semua transaksi diamankan dengan enkripsi SSL 256-bit standar perbankan</p>
                  </div>

                  <div>
                    {activeGateway === 'midtrans' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <span>🔵 Midtrans Snap</span>
                        <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                          {isMidtransProduction ? 'Production' : 'Sandbox'}
                        </span>
                      </span>
                    )}
                    {activeGateway === 'xendit' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <span>🟣 Xendit</span>
                        <span className="text-[10px] font-semibold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                          XenInvoice
                        </span>
                      </span>
                    )}
                    {activeGateway === 'simulator' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <span>🟡 Simulator</span>
                        <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                          Lokal
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {isLoadingPaymentMethods && (
                  <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-2xl border border-slate-100">
                    <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
                    <span>Memuat metode pembayaran aktif...</span>
                  </div>
                )}

                {!isLoadingPaymentMethods && paymentMethods.map((pay) => {
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
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-800">{pay.nama}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {pay.kategori.replace('_', ' ')}
                            </span>
                            {/* Provider Badge */}
                            {activeGateway === 'midtrans' && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span>🔵</span>
                                <span>Midtrans Snap</span>
                              </span>
                            )}
                            {activeGateway === 'xendit' && (
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span>🟣</span>
                                <span>Xendit</span>
                              </span>
                            )}
                            {activeGateway === 'simulator' && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span>🟡</span>
                                <span>Simulator</span>
                              </span>
                            )}
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
                    <p>Kurir: <strong>{selectedCourier.courierName} - {selectedCourier.serviceName}</strong></p>
                    <p>Estimasi: <strong>{selectedCourier.etd}</strong></p>
                    <p>Metode Bayar: <strong>{selectedPayment.nama}</strong></p>
                  </div>
                </div>
              </div>

              {/* Daftar Barang yang Dibeli */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Barang yang Dibeli ({items.reduce((s, i) => s + i.jumlah, 0)} Item):
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {items.map((item) => (
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
                            {item.jumlah} x {formatRupiah(item.harga)} {item.warna || item.ukuran ? `(${[item.warna, item.ukuran].filter(Boolean).join(', ')})` : ''}
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
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="px-8 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-75 disabled:cursor-not-allowed text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses Pesanan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Bayar Sekarang ({formatRupiah(calcSummary.totalBayar)})</span>
                    </>
                  )}
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
                <span className="font-semibold text-slate-800">{formatRupiah(calcSummary.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkos Kirim ({calcSummary.totalBeratKg} kg)</span>
                <span className="font-semibold text-slate-800">{formatRupiah(calcSummary.ongkir)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Diskon Promo Hemat</span>
                <span>-{formatRupiah(calcSummary.diskonVoucher)}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Layanan</span>
                <span className="text-slate-800">{formatRupiah(calcSummary.biayaLayanan)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mb-6">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-medium">Total Tagihan:</span>
                <span className="text-xl font-black text-rose-600">{formatRupiah(calcSummary.totalBayar)}</span>
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
                disabled={isSubmitting}
                onClick={handlePlaceOrder}
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-75 disabled:cursor-not-allowed text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses Pesanan...</span>
                  </>
                ) : (
                  <>
                    <span>Bayar Sekarang</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
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
