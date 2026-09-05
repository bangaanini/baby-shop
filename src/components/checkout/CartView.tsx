'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag, Loader2, Sparkles } from 'lucide-react';
import { CartItem } from '@/types/checkout';
import { formatRupiah } from '@/lib/format';

export function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [voucherCode, setVoucherCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchCart() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/cart');
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && json.data) {
            const rawItems = json.data.items || [];
            const mappedItems: CartItem[] = rawItems.map((item: any) => ({
              id: item.id,
              produkId: item.productId,
              nama: item.productName || item.nama || 'Produk Bayi & Anak',
              slug: item.productSlug || item.slug || 'detail',
              gambar: item.productImage || item.gambar || '/images/placeholder.jpg',
              harga: Number(item.harga) || 0,
              jumlah: Number(item.jumlah) || 1,
              warna: item.warna || undefined,
              ukuran: item.ukuran || undefined,
              beratGram: Number(item.beratGram) || 500,
              stok: Number(item.stok) || 99,
            }));
            setItems(mappedItems);
            return;
          }
        }
        if (isMounted) {
          setItems([]);
        }
      } catch (error) {
        console.error('Failed to load cart from /api/cart:', error);
        if (isMounted) {
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchCart();

    const handleCartSync = () => {
      fetchCart();
    };
    window.addEventListener('cart-updated', handleCartSync);

    return () => {
      isMounted = false;
      window.removeEventListener('cart-updated', handleCartSync);
    };
  }, []);

  const handleUpdateQty = async (id: string, delta: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newQty = item.jumlah + delta;
    if (newQty < 1) {
      handleRemoveItem(id);
      return;
    }

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, jumlah: newQty } : i))
    );

    setIsUpdating((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      });

      if (!res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, jumlah: item.jumlah } : i))
        );
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
        }
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, jumlah: item.jumlah } : i))
      );
    } finally {
      setIsUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRemoveItem = async (id: string) => {
    setIsUpdating((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setItems((prev) => prev.filter((item) => item.id !== id));
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('cart-updated'));
          }
          return;
        }
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch (error) {
      console.error('Failed to delete cart item:', error);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } finally {
      setIsUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleApplyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    const normalized = voucherCode.trim().toUpperCase();
    setIsValidatingVoucher(true);
    try {
      const subtotal = items.reduce((sum, item) => sum + item.harga * item.jumlah, 0);
      const res = await fetch(`/api/vouchers/validate?code=${encodeURIComponent(normalized)}&subtotal=${subtotal}`);
      const json = await res.json();
      if (json.success && json.data?.isValid) {
        setDiscountApplied(json.data.discountAmount);
        setVoucherMessage({ type: 'success', text: json.data.message || `Voucher berhasil! Hemat ${formatRupiah(json.data.discountAmount)}` });
      } else {
        setDiscountApplied(0);
        setVoucherMessage({ type: 'error', text: json.data?.message || json.error || 'Kode voucher tidak valid atau sudah tidak berlaku' });
      }
    } catch {
      setDiscountApplied(0);
      setVoucherMessage({ type: 'error', text: 'Gagal memvalidasi voucher. Coba lagi.' });
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setDiscountApplied(0);
    setVoucherCode('');
    setVoucherMessage(null);
  };

  const subtotal = items.reduce((sum, item) => sum + item.harga * item.jumlah, 0);
  const totalBeratKg = (items.reduce((sum, item) => sum + item.beratGram * item.jumlah, 0) / 1000).toFixed(1);
  const grandTotal = Math.max(0, subtotal - discountApplied);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center bg-white rounded-3xl p-8 border-2 border-[#FFE8D6] shadow-[0_12px_28px_-4px_rgba(255,159,67,0.12)]">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFF2E5] text-[#FF9F43] mb-4 animate-spin">
          <Loader2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-heading font-black text-slate-800 mb-1">Memuat Keranjang Belanja...</h2>
        <p className="text-slate-500 font-body text-xs">Menyiapkan daftar barang pilihan terbaik untuk si kecil.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-[#FFE8D6] shadow-[0_12px_28px_-4px_rgba(255,159,67,0.12),inset_0_2px_4px_rgba(255,255,255,0.95)]">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#FF9F43] to-[#87CEEB] text-white flex items-center justify-center mb-5 text-3xl border-2 border-white shadow-[0_8px_20px_rgba(255,159,67,0.3)]">
            🛍️
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-800 mb-2">
            Keranjang Belanja Masih Kosong
          </h2>
          <p className="text-xs sm:text-sm font-body font-medium text-slate-500 max-w-md mx-auto mb-8">
            Wah, keranjang Anda belum terisi apapun. Yuk jelajahi koleksi perlengkapan bayi, baju modis, dan mainan edukasi di NBusiness!
          </p>
          <Link
            href="/katalog"
            className="clay-btn-orange px-6 py-3.5 text-sm text-white inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Mulai Belanja Sekarang</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Cart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FFE8D6] shadow-[0_10px_24px_-4px_rgba(255,159,67,0.12),inset_0_2px_4px_rgba(255,255,255,0.95)] flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-800 tracking-tight">
            Keranjang Belanja ({items.length}) 🛒
          </h1>
          <p className="text-xs sm:text-sm font-body font-medium text-slate-500 mt-0.5">
            Periksa kembali pesanan Anda sebelum lanjut ke opsi kurir pengiriman
          </p>
        </div>
        <Link
          href="/katalog"
          className="text-xs font-heading font-bold text-[#D96B00] hover:text-[#FF9F43] hidden sm:flex items-center gap-1 bg-[#FFF2E5] px-3.5 py-2 rounded-xl border border-[#FFD4B2]"
        >
          <span>+ Tambah Barang Lain</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Items List (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-[#FFE8D6] hover:border-[#FF9F43] shadow-[0_8px_20px_-4px_rgba(255,159,67,0.1),inset_0_2px_4px_rgba(255,255,255,0.9)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.gambar}
                  alt={item.nama}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-[#FFF8F0] border-2 border-[#FFE8D6] shrink-0"
                />
                <div>
                  <Link
                    href={`/produk/${item.slug}`}
                    className="text-sm sm:text-base font-heading font-bold text-slate-800 hover:text-[#D96B00] transition-colors line-clamp-1 mb-1"
                  >
                    {item.nama}
                  </Link>

                  {/* Variant info */}
                  {(item.warna || item.ukuran) && (
                    <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#D96B00] mb-2">
                      <span className="clay-badge-orange text-[10px] px-2 py-0.5">
                        {item.warna && `Warna: ${item.warna}`}
                        {item.warna && item.ukuran && ' • '}
                        {item.ukuran && `Ukuran: ${item.ukuran}`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-baseline gap-2">
                    <span className="text-base sm:text-lg font-heading font-black text-[#D96B00]">
                      {formatRupiah(item.harga)}
                    </span>
                    <span className="text-xs font-body font-medium text-slate-400">
                      / pcs ({item.beratGram}gr)
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity controls & Delete */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#FFE8D6]">
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={isUpdating[item.id]}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-xl hover:bg-rose-50 cursor-pointer"
                  title="Hapus dari keranjang"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center border-2 border-[#FFE8D6] bg-white rounded-2xl p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item.id, -1)}
                    disabled={isUpdating[item.id]}
                    className="w-7 h-7 rounded-xl bg-[#FFF8F0] hover:bg-[#FFF2E5] text-slate-700 flex items-center justify-center transition-colors cursor-pointer font-bold"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-3 text-xs font-heading font-black text-slate-800 min-w-8 text-center">
                    {item.jumlah}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item.id, 1)}
                    disabled={item.jumlah >= item.stok || isUpdating[item.id]}
                    className="w-7 h-7 rounded-xl bg-[#FFF8F0] hover:bg-[#FFF2E5] text-slate-700 flex items-center justify-center transition-colors cursor-pointer font-bold disabled:opacity-40"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary & Checkout Button (1 Col) */}
        <div className="space-y-4">
          {/* Voucher Box - Clay Block */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#FFE8D6] shadow-[0_8px_20px_-4px_rgba(255,159,67,0.1),inset_0_2px_4px_rgba(255,255,255,0.95)]">
            <h3 className="text-xs font-heading font-extrabold uppercase tracking-wider text-[#D96B00] mb-2.5 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#FF9F43]" />
              <span>Gunakan Voucher Toko</span>
            </h3>
            <form onSubmit={handleApplyVoucher} className="flex gap-2">
              <input
                type="text"
                placeholder="Kode voucher"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                disabled={isValidatingVoucher}
                className="flex-1 px-3.5 py-2.5 text-xs font-heading font-bold rounded-xl border-2 border-[#FFE8D6] focus:outline-none focus:border-[#FF9F43] uppercase bg-[#FFF8F0] disabled:opacity-60"
              />
              {discountApplied > 0 ? (
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="px-4 py-2 text-xs font-heading font-bold rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hapus
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isValidatingVoucher || !voucherCode.trim()}
                  className="clay-btn-orange px-4 py-2 text-xs text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5 min-w-[72px]"
                >
                  {isValidatingVoucher ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {isValidatingVoucher ? 'Memeriksa...' : 'Pakai'}
                </button>
              )}
            </form>
            {voucherMessage && (
              <p className={`text-xs mt-2 font-heading font-bold ${voucherMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {voucherMessage.text}
              </p>
            )}
          </div>

          {/* Price Summary - Clay Block */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#FFE8D6] shadow-[0_10px_24px_-4px_rgba(255,159,67,0.12),inset_0_2px_4px_rgba(255,255,255,0.95)]">
            <h3 className="text-base font-heading font-black text-slate-800 pb-3.5 border-b-2 border-[#FFE8D6] mb-4">
              Ringkasan Belanja 🧾
            </h3>

            <div className="space-y-2.5 text-xs font-body font-semibold text-slate-600 mb-5">
              <div className="flex justify-between">
                <span>Total Harga ({items.reduce((s, i) => s + i.jumlah, 0)} barang)</span>
                <span className="font-heading font-bold text-slate-800">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimasi Berat Paket</span>
                <span className="font-heading font-bold text-[#0E678E]">{totalBeratKg} kg</span>
              </div>
              {discountApplied > 0 && (
                <div className="flex justify-between text-emerald-600 font-heading font-bold">
                  <span>Diskon Voucher Hemat</span>
                  <span>-{formatRupiah(discountApplied)}</span>
                </div>
              )}
            </div>

            <div className="pt-3.5 border-t-2 border-[#FFE8D6] mb-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-body font-medium text-slate-500 block">Total Pembayaran:</span>
                  <span className="text-2xl font-heading font-black text-[#D96B00]">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
                <span className="text-[10px] font-body text-slate-400">(Belum ongkir)</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full clay-btn-orange py-4 px-4 text-sm text-white flex items-center justify-center gap-2 hover:scale-[1.02] shadow-lg"
            >
              <span>Lanjut ke Pengiriman & Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="mt-4 pt-4 border-t-2 border-[#FFE8D6] flex items-center gap-2 text-xs font-heading font-bold text-emerald-700 justify-center">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>Transaksi 100% Aman & Terpercaya</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
