'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  Printer,
  Copy,
  Check,
  MapPin,
  Phone,
  MessageCircle,
  Truck,
  CreditCard,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Loader2,
  Calendar,
  DollarSign,
  Send,
  AlertTriangle,
  RotateCcw,
  CheckCheck,
  Building2,
  Zap,
} from 'lucide-react';
import { Order, OrderStatus, TrackingStep } from '@/types/order';
import { formatRupiah } from '@/lib/format';

interface OrderDetailDrawerProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onOrderUpdated?: (updatedOrder: Order) => void;
}

export function OrderDetailDrawer({
  isOpen,
  order,
  onClose,
  onOrderUpdated,
}: OrderDetailDrawerProps) {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(order);
  const [trackingNumberInput, setTrackingNumberInput] = useState<string>('');
  const [statusInput, setStatusInput] = useState<OrderStatus>('diproses');
  const [notesInput, setNotesInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedInvoice, setCopiedInvoice] = useState<boolean>(false);
  const [copiedResi, setCopiedResi] = useState<boolean>(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Sync state when order prop changes
  useEffect(() => {
    setCurrentOrder(order);
    if (order) {
      setTrackingNumberInput(order.nomorResi || '');
      setStatusInput(order.status);
      setNotesInput(order.catatan || '');
    }
  }, [order]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !currentOrder) return null;

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCopy = (text: string, type: 'invoice' | 'resi') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'invoice') {
      setCopiedInvoice(true);
      setTimeout(() => setCopiedInvoice(false), 2000);
    } else {
      setCopiedResi(true);
      setTimeout(() => setCopiedResi(false), 2000);
    }
  };

  // WhatsApp link generator
  const getWhatsAppUrl = (phone: string, invoice: string, recipient: string) => {
    if (!phone) return '#';
    const cleaned = phone.replace(/[^0-9]/g, '');
    let formattedPhone = cleaned;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('62')) {
      formattedPhone = '62' + formattedPhone;
    }
    const message = encodeURIComponent(
      `Halo Kak ${recipient},\n\nTerima kasih telah berbelanja di BabyKids! Kami ingin mengonfirmasi pesanan Anda dengan nomor invoice *${invoice}*.\n\nJika ada pertanyaan mengenai pesanan Anda, silakan balas pesan ini ya Kak.`
    );
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  // Submit update status / resi to API
  const handleUpdateStatus = async (
    targetStatus?: OrderStatus,
    targetResi?: string,
    targetNotes?: string
  ) => {
    if (!currentOrder) return;
    setIsSubmitting(true);

    const newStatus = targetStatus || statusInput;
    const newResi = targetResi !== undefined ? targetResi : trackingNumberInput;
    const newNotes = targetNotes !== undefined ? targetNotes : notesInput;

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: currentOrder.id,
          status: newStatus,
          trackingNumber: newResi || undefined,
          notes: newNotes || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memperbarui status pesanan');
      }

      const updated = json.data as Order;
      setCurrentOrder(updated);
      setTrackingNumberInput(updated.nomorResi || '');
      setStatusInput(updated.status);
      showToast(`Status berhasil diubah menjadi "${updated.statusLabel || updated.status}"`);

      if (onOrderUpdated) {
        onOrderUpdated(updated);
      }
    } catch (err: any) {
      console.error('Update order error:', err);
      showToast(err.message || 'Terjadi kesalahan sistem saat memperbarui status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick action shortcuts
  const handleInstantSettle = async () => {
    if (!currentOrder) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: currentOrder.id,
          status: 'diproses',
          notes: 'Pembayaran telah diverifikasi lunas melalui simulasi gateway.',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal mensimulasikan pelunasan pembayaran');
      }

      const updated = json.data as Order;
      setCurrentOrder(updated);
      setTrackingNumberInput(updated.nomorResi || '');
      setStatusInput(updated.status);
      showToast('🎉 Pembayaran pesanan berhasil disimulasikan lunas! Status pesanan berubah menjadi Diproses.');

      if (onOrderUpdated) {
        onOrderUpdated(updated);
      }
    } catch (err: any) {
      console.error('Instant settle error:', err);
      showToast(err.message || 'Terjadi kesalahan sistem saat mensimulasikan pembayaran', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessOrder = () => handleUpdateStatus('diproses');
  const handleShipOrder = () => {
    if (!trackingNumberInput.trim()) {
      showToast('Harap masukkan nomor resi kurir terlebih dahulu', 'error');
      return;
    }
    handleUpdateStatus('dikirim', trackingNumberInput.trim());
  };
  const handleCompleteOrder = () => handleUpdateStatus('selesai');
  const handleCancelOrder = () => {
    const confirmCancel = window.confirm(
      `Apakah Anda yakin ingin membatalkan pesanan ${currentOrder.nomorInvoice}?`
    );
    if (confirmCancel) {
      handleUpdateStatus('dibatalkan', undefined, 'Dibatalkan oleh penjual / sistem toko.');
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'menunggu_pembayaran':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'diproses':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'dikirim':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'selesai':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'dibatalkan':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col transform transition-transform ease-out duration-300">
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-base text-slate-800 tracking-tight">
                  {currentOrder.nomorInvoice}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(currentOrder.nomorInvoice, 'invoice')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                  title="Salin Nomor Invoice"
                >
                  {copiedInvoice ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                    currentOrder.status
                  )}`}
                >
                  {currentOrder.statusLabel || currentOrder.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Waktu Pesanan: {currentOrder.tanggalPesanan}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Cetak Label Pengiriman"
              >
                <Printer className="w-4 h-4 text-rose-500" />
                <span className="hidden sm:inline">Cetak Label</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Tutup Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toast && (
            <div
              className={`mx-6 mt-4 p-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 ${
                toast.type === 'error'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              <span>{toast.text}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Courier Action & Status Manager */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 text-white shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-rose-400" />
                  <span className="text-sm font-bold tracking-tight">Manajemen Pengiriman & Resi</span>
                </div>
                <div className="text-xs text-slate-300 font-medium bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  {currentOrder.kurir} — {currentOrder.layananKurir}
                </div>
              </div>

              {/* Resi input box */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Nomor Resi Pengiriman:</span>
                  {currentOrder.nomorResi && (
                    <button
                      type="button"
                      onClick={() => handleCopy(currentOrder.nomorResi || '', 'resi')}
                      className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-normal cursor-pointer"
                    >
                      {copiedResi ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedResi ? 'Tersalin' : 'Salin Resi'}</span>
                    </button>
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingNumberInput}
                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                    placeholder="Contoh: SC009988776655ID / JNE12345678"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateStatus(
                        currentOrder.status === 'diproses' || currentOrder.status === 'menunggu_pembayaran'
                          ? 'dikirim'
                          : undefined,
                        trackingNumberInput.trim()
                      )
                    }
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Simpan Resi</span>
                  </button>
                </div>
              </div>

              {/* Manual Status Selector */}
              <div className="pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-300 font-semibold">Status Pesanan:</span>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value as OrderStatus)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-rose-400"
                  >
                    <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
                    <option value="diproses">Sedang Diproses</option>
                    <option value="dikirim">Sedang Dikirim</option>
                    <option value="selesai">Selesai</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>
                  {statusInput !== currentOrder.status && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(statusInput)}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>Simpan Status</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Status Action Buttons */}
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-400 font-semibold w-full">
                  Aksi Cepat Status:
                </span>

                {currentOrder.status === 'menunggu_pembayaran' && (
                  <>
                    <button
                      type="button"
                      onClick={handleInstantSettle}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      )}
                      <span>⚡ Simulasi Pembayaran Lunas (Instant Settle)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleProcessOrder}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Tandai Diproses</span>
                    </button>
                  </>
                )}

                {currentOrder.status === 'diproses' && (
                  <button
                    type="button"
                    onClick={handleShipOrder}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Kirim Barang & Simpan Resi</span>
                  </button>
                )}

                {currentOrder.status === 'dikirim' && (
                  <button
                    type="button"
                    onClick={handleCompleteOrder}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Tandai Selesai</span>
                  </button>
                )}

                {currentOrder.status !== 'dibatalkan' && currentOrder.status !== 'selesai' && (
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={isSubmitting}
                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Batalkan Pesanan</span>
                  </button>
                )}
              </div>
            </div>

            {/* Customer & Shipping Destination Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Informasi Pembeli & Pengiriman</h3>
                    <p className="text-[11px] text-slate-400">Tujuan kirim paket pesanan</p>
                  </div>
                </div>

                {/* Direct WhatsApp button */}
                <a
                  href={getWhatsAppUrl(
                    currentOrder.teleponPenerima,
                    currentOrder.nomorInvoice,
                    currentOrder.namaPenerima
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chat WhatsApp</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">Nama Penerima</span>
                  <span className="font-bold text-slate-800 text-sm">{currentOrder.namaPenerima}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block mb-0.5">Nomor Telepon</span>
                  <span className="font-semibold text-slate-700 font-mono">
                    {currentOrder.teleponPenerima}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 font-medium block mb-0.5">Alamat Lengkap</span>
                  <p className="text-slate-700 font-medium leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {currentOrder.alamatLengkap}
                  </p>
                </div>
                {currentOrder.catatan && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 font-medium block mb-0.5">Catatan Pembeli</span>
                    <p className="text-amber-800 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 text-xs italic">
                      &ldquo;{currentOrder.catatan}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items Snapshot */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">
                    Rincian Produk Pesanan ({currentOrder.items?.length || 0} Barang)
                  </h3>
                  <p className="text-[11px] text-slate-400">Snapshot produk saat transaksi dibuat</p>
                </div>
              </div>

              <div className="space-y-3">
                {(currentOrder.items || []).map((item) => {
                  const itemSubtotal = (item.harga || 0) * (item.jumlah || 1);
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50/60 rounded-2xl border border-slate-100 flex items-center gap-3.5"
                    >
                      {/* Product Image */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 relative">
                        {item.gambar ? (
                          <img
                            src={item.gambar}
                            alt={item.nama}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate" title={item.nama}>
                          {item.nama}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-slate-500">
                          {item.warna && (
                            <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                              Warna: {item.warna}
                            </span>
                          )}
                          {item.ukuran && (
                            <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                              Ukuran: {item.ukuran}
                            </span>
                          )}
                          <span className="font-semibold text-slate-600">
                            {item.jumlah}x @ {formatRupiah(item.harga)}
                          </span>
                        </div>
                      </div>

                      {/* Price Subtotal */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-800">
                          {formatRupiah(itemSubtotal)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment & Cost Summary Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Rincian Pembayaran & Biaya</h3>
                  <p className="text-[11px] text-slate-400">
                    Metode: <span className="font-semibold text-slate-700">{currentOrder.metodePembayaran}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Produk</span>
                  <span className="font-medium text-slate-800">{formatRupiah(currentOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ongkos Kirim ({currentOrder.kurir})</span>
                  <span className="font-medium text-slate-800">{formatRupiah(currentOrder.ongkir)}</span>
                </div>
                {currentOrder.diskon > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Potongan Diskon Promo</span>
                    <span>-{formatRupiah(currentOrder.diskon)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Biaya Layanan Sistem</span>
                  <span className="font-medium text-slate-800">
                    {formatRupiah(currentOrder.biayaLayanan)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-800">
                  <span>Total Pembayaran</span>
                  <span className="text-rose-600 text-base">{formatRupiah(currentOrder.totalBayar)}</span>
                </div>
              </div>

              {currentOrder.status === 'menunggu_pembayaran' && (
                <div className="pt-3 border-t border-slate-100">
                  <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Zap className="w-4 h-4 fill-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Menunggu Pembayaran / Verifikasi</p>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Gunakan tombol simulasi untuk menguji respon gateway otomatis tanpa mutasi bank sungguhan.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleInstantSettle}
                      disabled={isSubmitting}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 fill-white" />
                      )}
                      <span>⚡ Simulasi Pembayaran Lunas (Instant Settle)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Live Tracking Timeline */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Riwayat Perjalanan Paket</h3>
                    <p className="text-[11px] text-slate-400">Status logistik dan tracking kurir</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {currentOrder.nomorResi || 'Resi Belum Ada'}
                </span>
              </div>

              {(!currentOrder.trackingTimeline || currentOrder.trackingTimeline.length === 0) ? (
                <div className="py-6 text-center text-xs text-slate-400 italic">
                  Belum ada log riwayat pelacakan untuk pesanan ini.
                </div>
              ) : (
                <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {currentOrder.trackingTimeline.map((step, idx) => {
                    const isLatest = idx === 0;
                    return (
                      <div key={step.id || idx} className="relative group">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                            isLatest ? 'bg-rose-500 ring-4 ring-rose-100' : 'bg-slate-400'
                          }`}
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs font-bold ${
                                isLatest ? 'text-rose-600' : 'text-slate-700'
                              }`}
                            >
                              {step.status}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {step.waktu}
                            </span>
                          </div>
                          {step.keterangan && (
                            <p className="text-xs text-slate-600 font-normal leading-relaxed">
                              {step.keterangan}
                            </p>
                          )}
                          {step.lokasi && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <MapPin className="w-3 h-3" />
                              <span>{step.lokasi}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Tutup
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Invoice / Label</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PRINTABLE SHIPPING LABEL / INVOICE MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-800">Preview Label Pengiriman (Thermal / A4)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actual Printable Area with class printable-label */}
            <div
              id="printable-shipping-label"
              className="border-2 border-dashed border-slate-400 p-5 rounded-2xl bg-white text-slate-900 text-xs space-y-4 font-sans"
            >
              {/* Toko Header */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500 text-white font-black flex items-center justify-center text-sm">
                    👶
                  </div>
                  <div>
                    <h2 className="font-black text-sm tracking-tight">BabyKids Store</h2>
                    <p className="text-[10px] text-slate-500">Jakarta Barat, DKI Jakarta</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded font-mono">
                    {currentOrder.kurir.toUpperCase()}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600">{currentOrder.layananKurir}</span>
                </div>
              </div>

              {/* Barcode & Tracking Number */}
              <div className="p-2.5 bg-slate-100 rounded-xl text-center space-y-1">
                <div className="font-mono text-base font-black tracking-widest text-slate-900">
                  {currentOrder.nomorResi || currentOrder.nomorInvoice}
                </div>
                <div className="text-[10px] font-semibold text-slate-500">
                  Invoice: {currentOrder.nomorInvoice} • {currentOrder.tanggalPesanan}
                </div>
              </div>

              {/* Sender & Recipient Box */}
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Penerima:</span>
                  <div className="font-bold text-slate-900">{currentOrder.namaPenerima}</div>
                  <div className="text-[11px] font-mono">{currentOrder.teleponPenerima}</div>
                  <p className="text-[11px] leading-tight text-slate-700">{currentOrder.alamatLengkap}</p>
                </div>
                <div className="space-y-1 border-l pl-3 border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Pengirim:</span>
                  <div className="font-bold text-slate-900">BabyKids Official</div>
                  <div className="text-[11px] font-mono">0812-9988-7766</div>
                  <p className="text-[11px] leading-tight text-slate-700">
                    Gudang Pusat BabyKids, Kebon Jeruk, Jakarta Barat, DKI Jakarta 11530
                  </p>
                </div>
              </div>

              {/* Package Content List */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Isi Paket:</span>
                <ul className="space-y-1">
                  {(currentOrder.items || []).map((it) => (
                    <li key={it.id} className="text-[11px] flex justify-between text-slate-800">
                      <span className="truncate pr-2">
                        {it.jumlah}x {it.nama} {it.warna ? `(${it.warna}${it.ukuran ? `, ${it.ukuran}` : ''})` : ''}
                      </span>
                      <span className="font-mono shrink-0">{formatRupiah((it.harga || 0) * (it.jumlah || 1))}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Total & Payment Method */}
              <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-center text-xs font-bold">
                <div>
                  <span className="text-slate-500 text-[10px] block">Metode Pembayaran:</span>
                  <span className="text-slate-900">{currentOrder.metodePembayaran} (LUNAS)</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] block">Total Transaksi:</span>
                  <span className="text-rose-600 text-sm font-black">{formatRupiah(currentOrder.totalBayar)}</span>
                </div>
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
