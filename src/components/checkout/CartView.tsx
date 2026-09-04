'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag, Loader2 } from 'lucide-react';
import { MOCK_INITIAL_CART } from '@/data/mock-checkout';
import { CartItem } from '@/types/checkout';
import { formatRupiah } from '@/lib/format';

export function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [voucherCode, setVoucherCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchCart() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/cart');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const mapped: CartItem[] = (json.data.items || []).map((item: any) => ({
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
        if (isMounted) setItems([]);
      } catch (error) {
        console.error('Failed to load cart from /api/cart:', error);
        if (isMounted) setItems([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchCart();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateQty = async (id: string, delta: number) => {
    const currentItem = items.find((i) => i.id === id);
    if (!currentItem) return;
    const newQty = Math.max(1, Math.min(currentItem.stok, currentItem.jumlah + delta));
    if (newQty === currentItem.jumlah) return;

    setIsUpdating((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, jumlah: newQty } : item))
          );
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('cart-updated'));
          }
          return;
        }
      }
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, jumlah: newQty } : item))
      );
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, jumlah: newQty } : item))
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

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    const normalized = voucherCode.trim().toUpperCase();
    if (['ANAKHEMAT', 'BABY20', 'HEMAT20', 'PROMO20', 'DISKON20', 'NEWBORN'].includes(normalized)) {
      setDiscountApplied(20000);
      setVoucherMessage({ type: 'success', text: 'Voucher berhasil digunakan! Hemat Rp 20.000' });
    } else {
      setDiscountApplied(0);
      setVoucherMessage({ type: 'error', text: 'Kode voucher tidak valid atau sudah kadaluarsa (Coba kode: ANAKHEMAT)' });
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.harga * item.jumlah, 0);
  const totalBeratKg = (items.reduce((sum, item) => sum + item.beratGram * item.jumlah, 0) / 1000).toFixed(1);
  const grandTotal = Math.max(0, subtotal - discountApplied);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center bg-white rounded-3xl p-8 border border-slate-100 shadow-xs">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-50 text-rose-500 mb-4 animate-spin">
          <Loader2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-1">Memuat Keranjang Belanja...</h2>
        <p className="text-slate-500 text-xs">Menyiapkan daftar barang pilihan terbaik untuk si kecil.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center bg-white rounded-3xl p-8 border border-slate-100 shadow-xs">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Keranjang Belanja Masih Kosong</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
          Yuk lihat-lihat koleksi perlengkapan bayi, baju modis anak, dan mainan edukatif terbaik untuk si kecil.
        </p>
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-2xl shadow-md transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Mulai Belanja Sekarang</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
          Keranjang Belanja ({items.reduce((sum, i) => sum + i.jumlah, 0)} Barang)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">Periksa barang pilihan Anda sebelum melanjutkan ke pembayaran</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Product Thumbnail & Details */}
              <div className="flex items-center gap-4 flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.gambar}
                  alt={item.nama}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md uppercase">
                    {item.kategoriLabel}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 line-clamp-2 mt-1">
                    {item.nama}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>Varian: <strong className="text-slate-700">{item.warna}</strong></span>
                    <span>•</span>
                    <span>Ukuran: <strong className="text-slate-700">{item.ukuran}</strong></span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-base font-bold text-rose-600">
                      {formatRupiah(item.harga)}
                    </span>
                    {item.hargaCoret && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatRupiah(item.hargaCoret)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Delete */}
              <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors p-1"
                  title="Hapus barang"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Hapus</span>
                </button>

                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item.id, -1)}
                    disabled={item.jumlah <= 1}
                    className="p-1.5 sm:p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-slate-800 min-w-8 text-center bg-white">
                    {item.jumlah}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item.id, 1)}
                    disabled={item.jumlah >= item.stok}
                    className="p-1.5 sm:p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary & Checkout Button */}
        <div className="space-y-4">
          {/* Voucher Box */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-rose-500" />
              <span>Gunakan Voucher Toko</span>
            </h3>
            <form onSubmit={handleApplyVoucher} className="flex gap-2">
              <input
                type="text"
                placeholder="Kode voucher (misal: ANAKHEMAT)"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Terapkan
              </button>
            </form>
            {voucherMessage && (
              <p className={`text-xs mt-2 font-medium ${voucherMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {voucherMessage.text}
              </p>
            )}
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100 mb-3">
              Ringkasan Belanja
            </h3>

            <div className="space-y-2 text-xs text-slate-600 mb-4">
              <div className="flex justify-between">
                <span>Total Harga ({items.reduce((s, i) => s + i.jumlah, 0)} barang)</span>
                <span className="font-semibold text-slate-800">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimasi Total Berat</span>
                <span>{totalBeratKg} kg</span>
              </div>
              {discountApplied > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Diskon Promo Hemat</span>
                  <span>-{formatRupiah(discountApplied)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 mb-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Total Pembayaran</span>
                  <span className="text-xl font-black text-rose-600">{formatRupiah(grandTotal)}</span>
                </div>
                <span className="text-[10px] text-slate-400">(Belum termasuk ongkir)</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3.5 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <span>Lanjut ke Pengiriman & Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Transaksi 100% Aman & Terpercaya</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
