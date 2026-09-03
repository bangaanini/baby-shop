'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react';
import { formatRupiah } from '@/lib/format';

export interface DeleteProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedId: string, deletedName: string) => void;
  product: {
    id: string;
    name?: string;
    nama?: string;
    price?: number;
    harga?: number;
    image_url?: string;
    imageUrl?: string;
    gambar?: string;
    category?: { id?: string; name?: string; slug?: string } | null;
    kategoriLabel?: string;
  } | null;
}

export function DeleteProductDialog({
  isOpen,
  onClose,
  onSuccess,
  product,
}: DeleteProductDialogProps) {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const productName = product.name || product.nama || 'Produk Tanpa Nama';
  const productPrice = product.price ?? product.harga ?? 0;
  const productImg = product.image_url || product.imageUrl || product.gambar;
  const categoryLabel = product.category?.name || product.kategoriLabel;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Gagal menghapus produk');
      }

      onSuccess(product.id, productName);
      onClose();
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat menghapus produk.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden transform transition-all p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-black text-slate-900 mb-1">
          Hapus Produk Ini?
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Tindakan ini tidak dapat dibatalkan. Data produk dan variannya akan dihapus secara permanen dari sistem katalog.
        </p>

        {/* Product Card Preview */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left flex items-center gap-3.5 mb-5">
          {productImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={productImg}
              alt={productName}
              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-slate-200 shrink-0 flex items-center justify-center text-slate-400">
              <Trash2 className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2">
              {productName}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {categoryLabel && (
                <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {categoryLabel}
                </span>
              )}
              <span className="text-xs font-black text-rose-600">
                {formatRupiah(productPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-semibold mb-4 text-left">
            {errorMessage}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Produk</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
