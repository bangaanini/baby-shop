'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Package,
  Layers,
  Truck,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  Tag,
  Info,
  ShieldCheck,
  Save,
  Flame,
  Star,
  Clock,
  Percent,
  ExternalLink,
} from 'lucide-react';
import { ProductPhotoUploader } from '@/components/admin/ProductPhotoUploader';
import { ShippingDimensionForm, ShippingDimensions } from '@/components/admin/ShippingDimensionForm';
import { formatRupiah } from '@/lib/format';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface VariantRow {
  id?: string;
  color: string;
  size: string;
  stock: number;
  additionalPrice: number;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function EditProdukPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();

  // Loading & Error States
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [initialFetchError, setInitialFetchError] = useState<string | null>(null);

  // 1. Photos
  const [images, setImages] = useState<string[]>([]);

  // 2. Basic Info
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [material, setMaterial] = useState<string>('');
  const [suitableAge, setSuitableAge] = useState<string>('');
  const [tag, setTag] = useState<string>('');

  // Badges & Highlights
  const [isPopular, setIsPopular] = useState<boolean>(false);
  const [isNewArrival, setIsNewArrival] = useState<boolean>(false);
  const [isRecommended, setIsRecommended] = useState<boolean>(false);
  const [isPromo, setIsPromo] = useState<boolean>(false);

  // 3. Pricing & Inventory
  const [price, setPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [baseStock, setBaseStock] = useState<number | ''>(0);
  const [variants, setVariants] = useState<VariantRow[]>([]);

  // 4. Shipping & Dimensions
  const [shipping, setShipping] = useState<ShippingDimensions>({
    weightGram: 500,
    dimensionLength: 10,
    dimensionWidth: 10,
    dimensionHeight: 10,
  });

  // UI States
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Load Categories
  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(
            data.data.map((cat: any) => ({
              id: cat.id,
              name: cat.name || cat.nama,
              slug: cat.slug,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // 2. Load Existing Product Data
  useEffect(() => {
    async function loadProductData() {
      if (!productId) return;
      setLoadingInitial(true);
      setInitialFetchError(null);

      try {
        // First try admin API by id
        const res = await fetch(`/api/admin/products?id=${encodeURIComponent(productId)}`);
        const data = await res.json();

        let prod = null;
        if (res.ok && data.success && data.data) {
          prod = data.data;
        } else {
          // Fallback to public product API
          const fallbackRes = await fetch(`/api/products/${encodeURIComponent(productId)}`);
          const fallbackData = await fallbackRes.json();
          if (fallbackRes.ok && fallbackData.success && fallbackData.data) {
            prod = fallbackData.data;
          }
        }

        if (!prod) {
          throw new Error('Data produk tidak ditemukan di sistem.');
        }

        // Populate fields
        setName(prod.name || '');
        setSlug(prod.slug || '');
        setCategoryId(prod.category_id || prod.categoryId || prod.category?.id || '');
        setDescription(prod.description || '');
        setMaterial(prod.material || '');
        setSuitableAge(prod.suitable_age || prod.suitableAge || '');
        setTag(prod.tag || '');
        setPrice(prod.price !== undefined ? prod.price : '');
        setOriginalPrice(
          prod.original_price !== undefined
            ? prod.original_price
            : prod.originalPrice !== undefined
            ? prod.originalPrice
            : ''
        );
        setBaseStock(prod.stock !== undefined ? prod.stock : 0);

        // Highlight switches
        setIsPopular(Boolean(prod.is_popular ?? prod.isPopular));
        setIsNewArrival(Boolean(prod.is_new_arrival ?? prod.isNewArrival));
        setIsRecommended(Boolean(prod.is_recommended ?? prod.isRecommended));
        setIsPromo(Boolean(prod.is_promo ?? prod.isPromo));

        // Shipping Dimensions
        setShipping({
          weightGram: prod.weight_gram || prod.weightGram || 500,
          dimensionLength: prod.dimension_length || prod.dimensionLength || 10,
          dimensionWidth: prod.dimension_width || prod.dimensionWidth || 10,
          dimensionHeight: prod.dimension_height || prod.dimensionHeight || 10,
        });

        // Gallery Photos
        if (Array.isArray(prod.images) && prod.images.length > 0) {
          const sorted = [...prod.images].sort(
            (a, b) => (a.sort_order ?? a.sortOrder ?? 0) - (b.sort_order ?? b.sortOrder ?? 0)
          );
          setImages(sorted.map((img: any) => img.url));
        } else if (prod.image_url || prod.imageUrl) {
          setImages([prod.image_url || prod.imageUrl]);
        }

        // Variants
        if (Array.isArray(prod.variants) && prod.variants.length > 0) {
          setVariants(
            prod.variants.map((v: any) => ({
              id: v.id,
              color: v.color || '',
              size: v.size || '',
              stock: v.stock !== undefined ? Number(v.stock) : 0,
              additionalPrice:
                v.additional_price !== undefined
                  ? Number(v.additional_price)
                  : v.additionalPrice !== undefined
                  ? Number(v.additionalPrice)
                  : 0,
            }))
          );
        }
      } catch (err: any) {
        console.error('Failed to load product for edit:', err);
        setInitialFetchError(err.message || 'Gagal memuat informasi produk');
      } finally {
        setLoadingInitial(false);
      }
    }

    loadProductData();
  }, [productId]);

  // Variant helper functions
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { color: '', size: '', stock: 5, additionalPrice: 0 },
    ]);
  };

  const handleUpdateVariant = (index: number, field: keyof VariantRow, val: any) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculated discount percentage
  const numPrice = typeof price === 'number' ? price : 0;
  const numOriginalPrice = typeof originalPrice === 'number' ? originalPrice : 0;
  const calculatedDiscount =
    numOriginalPrice > numPrice && numPrice > 0
      ? Math.round(((numOriginalPrice - numPrice) / numOriginalPrice) * 100)
      : null;

  // Total stock calculation (if variants present)
  const totalVariantStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
  const effectiveTotalStock = variants.length > 0 ? totalVariantStock : Number(baseStock) || 0;

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (images.length === 0) {
      setErrorMessage('Wajib mengunggah minimal 1 foto produk pada Galeri Foto di atas.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Nama produk wajib diisi (minimal 2 karakter).');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Silakan pilih kategori produk.');
      return;
    }

    if (!price || Number(price) <= 0) {
      setErrorMessage('Harga jual produk wajib diisi dengan nominal valid.');
      return;
    }

    const payload = {
      id: productId,
      categoryId,
      name: name.trim(),
      slug: slug.trim() ? slugify(slug) : slugify(name),
      description: description.trim() || null,
      price: Number(price),
      originalPrice: numOriginalPrice > 0 ? numOriginalPrice : null,
      stock: effectiveTotalStock,
      material: material.trim() || null,
      suitableAge: suitableAge.trim() || null,
      imageUrl: images[0],
      images: images.map((url, idx) => ({
        url,
        sortOrder: idx,
        altText: `${name.trim()} - Foto ${idx + 1}`,
      })),
      isPopular,
      isNewArrival,
      isRecommended,
      isPromo,
      tag: tag.trim() || null,
      weightGram: shipping.weightGram,
      dimensionLength: shipping.dimensionLength,
      dimensionWidth: shipping.dimensionWidth,
      dimensionHeight: shipping.dimensionHeight,
      variants: variants.map((v) => ({
        id: v.id,
        color: v.color.trim() || null,
        size: v.size.trim() || null,
        stock: Math.max(0, Number(v.stock) || 0),
        additionalPrice: Math.max(0, Number(v.additionalPrice) || 0),
      })),
    };

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(productId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memperbarui data produk');
      }

      showToast(`Produk "${payload.name}" berhasil diperbarui!`);
      setTimeout(() => {
        router.push('/admin/produk');
      }, 1200);
    } catch (err: any) {
      console.error('Failed to update product:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat menyimpan perubahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <h3 className="text-sm font-bold text-slate-700">Memuat Data Produk...</h3>
        <p className="text-xs text-slate-400">Mohon tunggu beberapa saat</p>
      </div>
    );
  }

  if (initialFetchError) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900">Produk Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500">{initialFetchError}</p>
        </div>
        <Link
          href="/admin/produk"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Produk
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border text-xs sm:text-sm font-bold animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/produk"
            className="p-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shadow-xs"
            title="Kembali ke Daftar Produk"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Edit Produk
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 font-black text-[10px]">
                SELLER CENTER
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Perbarui rincian katalog, kelola foto Cloudflare R2, dan sesuaikan stok produk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {slug && (
            <Link
              href={`/produk/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
              title="Lihat Produk di Toko"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
              <span>Lihat Live</span>
            </Link>
          )}

          <Link
            href="/admin/produk"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
          >
            Batal
          </Link>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-700 font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-rose-900">Periksa Formulir Anda:</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CARD 1: FOTO PRODUK (PALING ATAS) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                Foto Produk & Galeri Katalog
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Foto pertama dengan tanda bintang akan menjadi Cover Utama di katalog NBusiness
              </p>
            </div>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/60">
              Wajib Minimal 1 Foto
            </span>
          </div>

          <ProductPhotoUploader
            images={images}
            onChange={setImages}
            disabled={isSubmitting}
            maxImages={8}
          />
        </div>

        {/* CARD 2: INFORMASI DASAR PRODUK */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-500" />
              Informasi Dasar Produk
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identitas utama produk seperti nama, kategori, bahan, usia, dan sorotan promo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Nama Produk */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Produk <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                placeholder="Contoh: Jumper Bayi Katun Organik Motif Dino SNI"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            {/* Kategori Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kategori Produk <span className="text-rose-500">*</span>
              </label>
              <select
                required
                disabled={isSubmitting || loadingCategories}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer"
              >
                <option value="">
                  {loadingCategories ? 'Memuat daftar kategori...' : '-- Pilih Kategori Produk --'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Slug */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>URL Slug Produk</span>
                <span className="text-[10px] text-slate-400 font-normal">Identitas URL</span>
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                placeholder="jumper-bayi-katun-organik-dino"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            {/* Bahan Produk (SNI) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Bahan Material (Standar SNI)
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                placeholder="Contoh: 100% Katun Organik Bersertifikat SNI"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            {/* Rentang Usia */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Rekomendasi Rentang Usia
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                placeholder="Contoh: 0 - 6 Bulan / 1 - 3 Tahun"
                value={suitableAge}
                onChange={(e) => setSuitableAge(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            {/* Tag / Badge Khusus */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Badge / Tag Khusus
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                placeholder="Contoh: Best Seller, Hemat, Terlaris"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            {/* Deskripsi Produk */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Deskripsi Lengkap Produk
              </label>
              <textarea
                rows={4}
                disabled={isSubmitting}
                placeholder="Jelaskan keunggulan produk bayi ini, kenyamanan bahan, panduan pencucian, dan spesifikasi lainnya..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>
          </div>

          {/* Highlight Toggles */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              Sorotan & Visibilitas Produk:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* isPopular */}
              <label
                className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  isPopular
                    ? 'bg-amber-50/80 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Populer
                </span>
              </label>

              {/* isNewArrival */}
              <label
                className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  isNewArrival
                    ? 'bg-sky-50/80 border-sky-300 text-sky-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  Baru Masuk
                </span>
              </label>

              {/* isRecommended */}
              <label
                className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  isRecommended
                    ? 'bg-rose-50/80 border-rose-300 text-rose-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isRecommended}
                  onChange={(e) => setIsRecommended(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  Rekomendasi
                </span>
              </label>

              {/* isPromo */}
              <label
                className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  isPromo
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isPromo}
                  onChange={(e) => setIsPromo(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-emerald-500" />
                  Promo Spesial
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* CARD 3: HARGA & MANAJEMEN VARIAN */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Harga & Manajemen Varian Stok
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur harga jual, diskon coret, dan variasi warna / ukuran produk
              </p>
            </div>
            {calculatedDiscount && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-black">
                <Percent className="w-3.5 h-3.5" /> Hemat {calculatedDiscount}%
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Harga Jual */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Harga Jual (Rp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  required
                  min="0"
                  disabled={isSubmitting}
                  placeholder="85000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {numPrice > 0 ? formatRupiah(numPrice) : 'Harga yang dibayar pembeli'}
              </p>
            </div>

            {/* Harga Coret */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Harga Coret / Normal (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="number"
                  min="0"
                  disabled={isSubmitting}
                  placeholder="120000"
                  value={originalPrice}
                  onChange={(e) =>
                    setOriginalPrice(e.target.value === '' ? '' : parseInt(e.target.value) || 0)
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {numOriginalPrice > 0 ? `Dicoret dari ${formatRupiah(numOriginalPrice)}` : 'Opsional untuk efek diskon'}
              </p>
            </div>

            {/* Stok Dasar (Aktif jika tidak ada varian) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Stok Utama</span>
                {variants.length > 0 && (
                  <span className="text-[10px] text-rose-500 font-bold">(Otomatis dari varian)</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  disabled={isSubmitting || variants.length > 0}
                  value={variants.length > 0 ? totalVariantStock : baseStock}
                  onChange={(e) =>
                    setBaseStock(e.target.value === '' ? '' : parseInt(e.target.value) || 0)
                  }
                  className={`w-full pl-3.5 pr-12 py-2.5 border rounded-xl text-xs font-bold transition-all ${
                    variants.length > 0
                      ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                  }`}
                  placeholder="10"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400 pointer-events-none">
                  pcs
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Total keseluruhan stok: <strong>{effectiveTotalStock} pcs</strong>
              </p>
            </div>
          </div>

          {/* Dynamic Variant Table */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-rose-500" />
                  Daftar Variasi SKU Produk ({variants.length} Varian)
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Kelola kombinasi warna, ukuran, serta ketersediaan stok tiap SKU
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddVariant}
                disabled={isSubmitting}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Varian</span>
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-1.5">
                <p className="text-xs text-slate-600 font-semibold">
                  Belum ada variasi khusus. Produk akan dijual sebagai Single SKU.
                </p>
                <p className="text-[11px] text-slate-400">
                  Klik tombol <strong className="text-rose-600">+ Tambah Varian</strong> di atas jika produk memiliki variasi warna atau ukuran.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Warna / Corak</th>
                      <th className="py-2.5 px-3">Ukuran (Size)</th>
                      <th className="py-2.5 px-3 w-28">Stok (pcs)</th>
                      <th className="py-2.5 px-3 w-36">Harga Tambahan (Rp)</th>
                      <th className="py-2.5 px-3 text-center w-16">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {variants.map((variant, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="e.g. Baby Pink"
                            value={variant.color}
                            onChange={(e) => handleUpdateVariant(idx, 'color', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="e.g. 0-6 Bulan / M"
                            value={variant.size}
                            onChange={(e) => handleUpdateVariant(idx, 'size', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={(e) =>
                              handleUpdateVariant(idx, 'stock', parseInt(e.target.value) || 0)
                            }
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={variant.additionalPrice}
                            onChange={(e) =>
                              handleUpdateVariant(
                                idx,
                                'additionalPrice',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Varian"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* CARD 4: PENGIRIMAN & DIMENSI PAKET */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <Truck className="w-5 h-5 text-sky-500" />
              Pengiriman & Dimensi Paket
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Spesifikasi berat dan ukuran paket untuk perhitungan ongkos kirim otomatis oleh kurir ekspedisi
            </p>
          </div>

          <ShippingDimensionForm
            weightGram={shipping.weightGram}
            dimensionLength={shipping.dimensionLength}
            dimensionWidth={shipping.dimensionWidth}
            dimensionHeight={shipping.dimensionHeight}
            onChange={setShipping}
            disabled={isSubmitting}
          />
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 sm:p-5 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-4 z-20">
          <div className="text-xs text-slate-500">
            Perubahan data produk akan langsung diperbarui di etalase toko setelah Anda menyimpan.
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin/produk"
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-md shadow-rose-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Perubahan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
