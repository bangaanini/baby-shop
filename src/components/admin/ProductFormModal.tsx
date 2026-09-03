'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers,
  Tag,
  DollarSign,
  Package,
  Info,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';

export interface ProductVariantItem {
  id?: string;
  color: string;
  size: string;
  stock: number;
  additionalPrice: number;
}

export interface ProductImageItem {
  id?: string;
  url: string;
  altText: string;
  sortOrder: number;
}

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: any, isEdit: boolean) => void;
  initialData?: any | null;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: ProductFormModalProps) {
  const isEdit = Boolean(initialData && (initialData.id || initialData.slug));

  // Form State
  const [categoryId, setCategoryId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(0);
  const [material, setMaterial] = useState<string>('');
  const [suitableAge, setSuitableAge] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [tag, setTag] = useState<string>('');
  const [isPopular, setIsPopular] = useState<boolean>(false);
  const [isNewArrival, setIsNewArrival] = useState<boolean>(false);
  const [isRecommended, setIsRecommended] = useState<boolean>(false);
  const [isPromo, setIsPromo] = useState<boolean>(false);

  // Dynamic Lists
  const [variants, setVariants] = useState<ProductVariantItem[]>([]);
  const [images, setImages] = useState<ProductImageItem[]>([]);

  // Category and UI State
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imgPreviewError, setImgPreviewError] = useState<boolean>(false);

  // Fetch categories on mount or when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchCategories() {
      setLoadingCategories(true);
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data)) {
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
        if (isMounted) setLoadingCategories(false);
      }
    }

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Reset or Populate form when initialData or isOpen changes
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);
    setImgPreviewError(false);

    if (initialData) {
      setCategoryId(
        initialData.category_id ||
          initialData.categoryId ||
          initialData.category?.id ||
          initialData.kategori ||
          ''
      );
      setName(initialData.name || initialData.nama || '');
      setSlug(initialData.slug || '');
      setDescription(initialData.description || initialData.deskripsi || '');
      setPrice(
        initialData.price !== undefined
          ? initialData.price
          : initialData.harga !== undefined
          ? initialData.harga
          : ''
      );
      setOriginalPrice(
        initialData.original_price !== undefined && initialData.original_price !== null
          ? initialData.original_price
          : initialData.originalPrice !== undefined && initialData.originalPrice !== null
          ? initialData.originalPrice
          : initialData.hargaCoret !== undefined && initialData.hargaCoret !== null
          ? initialData.hargaCoret
          : ''
      );
      setStock(
        initialData.stock !== undefined
          ? initialData.stock
          : initialData.stok !== undefined
          ? initialData.stok
          : 0
      );
      setMaterial(initialData.material || initialData.bahan || '');
      setSuitableAge(
        initialData.suitable_age ||
          initialData.suitableAge ||
          initialData.usiaCocok ||
          ''
      );
      setImageUrl(
        initialData.image_url ||
          initialData.imageUrl ||
          initialData.gambar ||
          ''
      );
      setTag(initialData.tag || '');
      setIsPopular(Boolean(initialData.is_popular ?? initialData.isPopular ?? initialData.isPopuler));
      setIsNewArrival(Boolean(initialData.is_new_arrival ?? initialData.isNewArrival ?? initialData.isTerbaru));
      setIsRecommended(Boolean(initialData.is_recommended ?? initialData.isRecommended ?? initialData.isRekomendasi));
      setIsPromo(Boolean(initialData.is_promo ?? initialData.isPromo));

      // Populate variants
      const rawVariants = initialData.variants || initialData.varian || [];
      if (Array.isArray(rawVariants) && rawVariants.length > 0) {
        setVariants(
          rawVariants.map((v: any) => ({
            id: v.id,
            color: v.color || v.warna || '',
            size: v.size || v.ukuran || '',
            stock: v.stock !== undefined ? Number(v.stock) : Number(v.stok || 0),
            additionalPrice:
              v.additional_price !== undefined
                ? Number(v.additional_price)
                : v.additionalPrice !== undefined
                ? Number(v.additionalPrice)
                : Number(v.hargaTambahan || 0),
          }))
        );
      } else {
        setVariants([]);
      }

      // Populate gallery images
      const rawImages = initialData.images || initialData.galeri || [];
      if (Array.isArray(rawImages) && rawImages.length > 0) {
        setImages(
          rawImages.map((img: any, idx: number) => ({
            id: img.id,
            url: typeof img === 'string' ? img : img.url || img.imageUrl || '',
            altText: typeof img === 'object' ? img.alt_text || img.altText || '' : '',
            sortOrder: typeof img === 'object' && img.sort_order !== undefined ? img.sort_order : idx,
          }))
        );
      } else {
        setImages([]);
      }
    } else {
      // Clean defaults for new product
      setCategoryId('');
      setName('');
      setSlug('');
      setDescription('');
      setPrice('');
      setOriginalPrice('');
      setStock(0);
      setMaterial('');
      setSuitableAge('');
      setImageUrl('');
      setTag('');
      setIsPopular(false);
      setIsNewArrival(true); // Default new arrival for fresh product
      setIsRecommended(false);
      setIsPromo(false);
      setVariants([]);
      setImages([]);
    }
  }, [isOpen, initialData]);

  // Variant Helpers
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { color: '', size: '', stock: 10, additionalPrice: 0 },
    ]);
  };

  const updateVariant = (index: number, field: keyof ProductVariantItem, value: any) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Gallery Image Helpers
  const addGalleryImage = () => {
    setImages((prev) => [
      ...prev,
      { url: '', altText: name || 'Foto Galeri Produk', sortOrder: prev.length },
    ]);
  };

  const updateGalleryImage = (index: number, field: keyof ProductImageItem, value: any) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeGalleryImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate variant total stock
  const variantTotalStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validation
    if (!categoryId) {
      setErrorMessage('Kategori wajib dipilih.');
      return;
    }
    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Nama produk minimal 2 karakter.');
      return;
    }
    if (price === '' || Number(price) < 0) {
      setErrorMessage('Harga produk harus diisi dengan angka positif.');
      return;
    }
    if (!imageUrl.trim()) {
      setErrorMessage('URL Foto Produk utama wajib diisi.');
      return;
    }

    // Prepare payload
    const payload: Record<string, any> = {
      categoryId,
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      price: Number(price),
      originalPrice: originalPrice !== '' && Number(originalPrice) > 0 ? Number(originalPrice) : null,
      stock: variants.length > 0 ? variantTotalStock : (stock === '' ? 0 : Number(stock)),
      material: material.trim() || undefined,
      suitableAge: suitableAge.trim() || undefined,
      imageUrl: imageUrl.trim(),
      tag: tag.trim() || undefined,
      isPopular,
      isNewArrival,
      isRecommended,
      isPromo,
      variants: variants
        .filter((v) => v.color?.trim() || v.size?.trim())
        .map((v) => ({
          id: v.id,
          color: v.color?.trim() || undefined,
          size: v.size?.trim() || undefined,
          stock: Number(v.stock) || 0,
          additionalPrice: Number(v.additionalPrice) || 0,
        })),
      images: images
        .filter((img) => img.url?.trim())
        .map((img, idx) => ({
          id: img.id,
          url: img.url.trim(),
          altText: img.altText?.trim() || name.trim() || 'Foto Produk',
          sortOrder: Number(img.sortOrder) || idx,
        })),
    };

    setIsSubmitting(true);

    try {
      let res: Response;
      if (isEdit) {
        const productId = initialData.id || initialData.slug;
        res = await fetch(`/api/admin/products?id=${encodeURIComponent(productId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || result.message || 'Gagal menyimpan data produk');
      }

      onSuccess(result.data, isEdit);
      onClose();
    } catch (err: any) {
      console.error('Product save error:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat menyimpan produk');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              {isEdit ? <Layers className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {isEdit ? 'Edit Data Produk' : 'Tambah Produk Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEdit
                  ? 'Perbarui informasi inventori, harga, varian, dan galeri produk'
                  : 'Lengkapi formulir untuk mempublikasikan produk baru ke katalog'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-700 font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Informasi Dasar */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Package className="w-3.5 h-3.5" />
              Informasi Utama Produk
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Kategori Produk <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={loadingCategories || isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer"
                  required
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag / Badge */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Tag / Badge Label <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Terlaris #1, Diskon 50%, Best Seller"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>
            </div>

            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Nama Produk <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Setelan Piyama Bayi Katun Organik SNI"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                required
              />
            </div>

            {/* Product Slug (Optional override) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Slug URL <span className="text-slate-400 font-normal">(Otomatis jika dikosongkan)</span>
              </label>
              <input
                type="text"
                placeholder="setelan-piyama-bayi-katun"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Deskripsi Lengkap Produk</label>
              <textarea
                rows={4}
                placeholder="Jelaskan keunggulan produk, detail bahan, petunjuk pencucian, dan kenyamanan untuk bayi..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-y"
              />
            </div>
          </div>

          {/* Section 2: Harga & Stok */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5" />
              Harga & Stok Inventori
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Selling Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Harga Jual (Rp) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    placeholder="85000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    required
                  />
                </div>
                {price !== '' && Number(price) > 0 && (
                  <p className="text-[10px] text-emerald-600 font-bold">{formatRupiah(Number(price))}</p>
                )}
              </div>

              {/* Original Price / Harga Coret */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Harga Coret / Normal <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    placeholder="120000"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  />
                </div>
                {originalPrice !== '' && Number(originalPrice) > Number(price) && (
                  <p className="text-[10px] text-rose-600 font-bold">
                    Diskon{' '}
                    {Math.round(
                      ((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100
                    )}
                    %
                  </p>
                )}
              </div>

              {/* Physical Stock */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Stok Fisik Utama <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="50"
                  value={variants.length > 0 ? variantTotalStock : stock}
                  onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={variants.length > 0 || isSubmitting}
                  className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold transition-all ${
                    variants.length > 0
                      ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                  }`}
                  required
                />
                {variants.length > 0 && (
                  <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Otomatis dihitung dari akumulasi varian ({variantTotalStock} pcs)
                  </p>
                )}
              </div>
            </div>

            {/* Material & Suitable Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Bahan / Material <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 100% Organic Cotton SNI, Food Grade Silicone"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Rentang Usia Cocok <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 0 - 6 Bulan, 1 - 3 Tahun"
                  value={suitableAge}
                  onChange={(e) => setSuitableAge(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Foto Produk & Galeri */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" />
              Foto Utama & Galeri Tambahan
            </h3>

            {/* Primary Image URL & Live Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  URL Foto Produk Utama <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImgPreviewError(false);
                  }}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                  required
                />
                <p className="text-[11px] text-slate-400">
                  Gunakan direct image URL (Unsplash, Cloudinary, dsb) rasio 1:1 atau vertikal.
                </p>
              </div>

              {/* Preview Box */}
              <div className="sm:col-span-1">
                <span className="text-xs font-bold text-slate-700 block mb-1.5">Pratinjau</span>
                <div className="w-24 h-24 sm:w-full sm:h-24 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center relative">
                  {imageUrl && !imgPreviewError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt="Pratinjau Utama"
                      className="w-full h-full object-cover"
                      onError={() => setImgPreviewError(true)}
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <span className="text-[10px] block leading-tight">
                        {imgPreviewError ? 'Gagal memuat' : 'Belum ada'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery Images Manager */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Galeri Foto Tambahan</h4>
                  <p className="text-[11px] text-slate-500">
                    Tambahkan beberapa sudut foto produk untuk slider katalog
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addGalleryImage}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-rose-500" />
                  <span>Tambah Foto</span>
                </button>
              </div>

              {images.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400 italic">
                  Belum ada foto galeri tambahan. Klik tombol di atas untuk menambah.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3"
                    >
                      {/* Thumbnail Preview */}
                      <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                        {img.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img.url}
                            alt="Galeri"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                        )}
                      </div>

                      {/* URL Input */}
                      <div className="flex-1 w-full sm:w-auto">
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={img.url}
                          onChange={(e) => updateGalleryImage(idx, 'url', e.target.value)}
                          disabled={isSubmitting}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-rose-400"
                        />
                      </div>

                      {/* Alt text */}
                      <div className="w-full sm:w-44">
                        <input
                          type="text"
                          placeholder="Alt text / deskripsi foto"
                          value={img.altText}
                          onChange={(e) => updateGalleryImage(idx, 'altText', e.target.value)}
                          disabled={isSubmitting}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-400"
                        />
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        disabled={isSubmitting}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Dynamic Variants Manager */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" />
                  Varian Produk (Warna & Ukuran)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Kelola kombinasi warna, ukuran, stok individu, dan penyesuaian harga khusus
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                disabled={isSubmitting}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Varian</span>
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                Produk ini tidak memiliki varian khusus (Single SKU). Stok akan menggunakan nilai stok utama.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-2 px-3">Warna</th>
                        <th className="py-2 px-3">Ukuran</th>
                        <th className="py-2 px-3 w-28">Stok Varian</th>
                        <th className="py-2 px-3 w-36">Harga Tambahan (Rp)</th>
                        <th className="py-2 px-2 text-center w-12">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {variants.map((v, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              placeholder="Biru Pastel"
                              value={v.color}
                              onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                              disabled={isSubmitting}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-rose-400"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              placeholder="S (0-6 Bulan)"
                              value={v.size}
                              onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                              disabled={isSubmitting}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-rose-400"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              value={v.stock}
                              onChange={(e) =>
                                updateVariant(idx, 'stock', Math.max(0, parseInt(e.target.value) || 0))
                              }
                              disabled={isSubmitting}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-400 text-center"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              step="500"
                              placeholder="0"
                              value={v.additionalPrice}
                              onChange={(e) =>
                                updateVariant(
                                  idx,
                                  'additionalPrice',
                                  Math.max(0, parseInt(e.target.value) || 0)
                                )
                              }
                              disabled={isSubmitting}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-400"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeVariant(idx)}
                              disabled={isSubmitting}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Highlight & Showcase Flags */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5" />
              Penempatan Banner & Rekomendasi
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-rose-500 rounded border-slate-300 focus:ring-rose-400 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Produk Populer</span>
                  <span className="text-[10px] text-slate-500 block">Tampil di Terlaris</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-rose-500 rounded border-slate-300 focus:ring-rose-400 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Koleksi Baru</span>
                  <span className="text-[10px] text-slate-500 block">Tampil di Terbaru</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isRecommended}
                  onChange={(e) => setIsRecommended(e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-rose-500 rounded border-slate-300 focus:ring-rose-400 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Rekomendasi</span>
                  <span className="text-[10px] text-slate-500 block">Highlight Beranda</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPromo}
                  onChange={(e) => setIsPromo(e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-rose-500 rounded border-slate-300 focus:ring-rose-400 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Flash Promo</span>
                  <span className="text-[10px] text-slate-500 block">Tab Diskon Khusus</span>
                </div>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Produk...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{isEdit ? 'Simpan Perubahan' : 'Terbitkan Produk'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
