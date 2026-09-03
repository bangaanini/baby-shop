'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Filter,
  ArrowUpDown,
  ShoppingBag,
  Star,
  Layers,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Tag,
  Package,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { ProductFormModal } from './ProductFormModal';
import { DeleteProductDialog } from './DeleteProductDialog';

export interface AdminProductRow {
  id: string;
  category_id?: string;
  categoryId?: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  original_price?: number | null;
  originalPrice?: number | null;
  discount_percent?: number | null;
  sold_count?: number;
  rating?: string | number;
  review_count?: number;
  stock: number;
  material?: string | null;
  suitable_age?: string | null;
  image_url: string;
  is_popular?: boolean;
  is_new_arrival?: boolean;
  is_recommended?: boolean;
  is_promo?: boolean;
  tag?: string | null;
  category?: {
    id?: string;
    name?: string;
    slug?: string;
  } | null;
  variants?: Array<{
    id?: string;
    color?: string | null;
    size?: string | null;
    stock?: number;
    additional_price?: number;
  }>;
  images?: Array<{
    id?: string;
    url: string;
    alt_text?: string | null;
    sort_order?: number;
  }>;
}

export function ProductTable() {
  // State
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Pagination state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [selectedSort, setSelectedSort] = useState<string>('terbaru');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const limit = 15;

  // Modal States
  const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductRow | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deletingProduct, setDeletingProduct] = useState<AdminProductRow | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch Categories
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data)) {
          setCategories(
            data.data.map((c: any) => ({
              id: c.id,
              name: c.name || c.nama,
              slug: c.slug,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load categories in ProductTable:', err);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (selectedCategory && selectedCategory !== 'semua') {
        params.set('categoryId', selectedCategory);
      }
      if (selectedSort) params.set('sort', selectedSort);
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengambil daftar produk dari server');
      }

      setProducts(data.data || []);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCount(data.pagination.total || 0);
      }
    } catch (err: any) {
      console.error('Error fetching admin products:', err);
      setError(err.message || 'Terjadi kesalahan saat memuat katalog produk');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedSort, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (product: AdminProductRow) => {
    setEditingProduct(product);
    setFormModalOpen(true);
  };

  const handleOpenDeleteDialog = (product: AdminProductRow) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleFormSuccess = (productData: any, isEdit: boolean) => {
    showToast(
      isEdit
        ? `Produk "${productData.name}" berhasil diperbarui!`
        : `Produk "${productData.name}" berhasil ditambahkan!`
    );
    loadProducts();
  };

  const handleDeleteSuccess = (_deletedId: string, deletedName: string) => {
    showToast(`Produk "${deletedName}" telah berhasil dihapus.`);
    loadProducts();
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border text-xs sm:text-sm font-bold animate-in slide-in-from-bottom-5 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Action & Filter Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-500" />
              Katalog & Inventori Produk
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola daftar produk, stok varian, diskon harga, dan pantau performa penjualan produk
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadProducts}
              disabled={loading}
              title="Segarkan Data"
              className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk Baru</span>
            </button>
          </div>
        </div>

        {/* Search, Category Filter, and Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari nama produk, bahan, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all appearance-none cursor-pointer"
            >
              <option value="semua">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all appearance-none cursor-pointer"
            >
              <option value="terbaru">Terbaru Diinput</option>
              <option value="terpopuler">Penjualan Terbanyak</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="harga-asc">Harga: Terendah</option>
              <option value="harga-desc">Harga: Tertinggi</option>
              <option value="rekomendasi">Rekomendasi Utama</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Memuat katalog produk...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-xs font-semibold text-rose-600">{error}</p>
            <button
              onClick={loadProducts}
              className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">Tidak ada produk yang cocok</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Coba ubah kata kunci pencarian atau bersihkan filter kategori Anda.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Produk Pertama</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16">Foto</th>
                  <th className="py-3.5 px-4">Nama Produk & Slug</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Harga & Promo</th>
                  <th className="py-3.5 px-4">Stok & Varian</th>
                  <th className="py-3.5 px-4">Performa</th>
                  <th className="py-3.5 px-4 text-center w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {products.map((prod) => {
                  const hasDiscount = prod.original_price && prod.original_price > prod.price;
                  const discountPercent = hasDiscount
                    ? Math.round(((prod.original_price! - prod.price) / prod.original_price!) * 100)
                    : null;
                  const variantCount = prod.variants?.length || 0;
                  const categoryName = prod.category?.name || 'Tanpa Kategori';

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Thumbnail Image */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {prod.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={prod.image_url}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                      </td>

                      {/* Product Name & Slug & Badges */}
                      <td className="py-3 px-4">
                        <div className="space-y-1 max-w-xs">
                          <h4 className="font-bold text-slate-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
                            {prod.name}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] text-slate-400">
                              /{prod.slug}
                            </span>
                            {prod.tag && (
                              <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.2 rounded border border-rose-200">
                                {prod.tag}
                              </span>
                            )}
                            {prod.is_popular && (
                              <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.2 rounded border border-amber-200">
                                Populer
                              </span>
                            )}
                            {prod.is_recommended && (
                              <span className="text-[9px] bg-sky-50 text-sky-700 font-bold px-1.5 py-0.2 rounded border border-sky-200">
                                Rekomendasi
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {categoryName}
                        </span>
                      </td>

                      {/* Price & Original Price */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="font-black text-rose-600">
                            {formatRupiah(prod.price)}
                          </div>
                          {hasDiscount && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 line-through">
                                {formatRupiah(prod.original_price!)}
                              </span>
                              <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1 py-0.2 rounded">
                                -{discountPercent}%
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stock & Variant count */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                prod.stock > 10
                                  ? 'bg-emerald-500'
                                  : prod.stock > 0
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            <span className="font-bold text-slate-800">
                              {prod.stock} pcs
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Layers className="w-3 h-3 text-slate-400" />
                            {variantCount > 0 ? `${variantCount} varian` : 'Single SKU'}
                          </span>
                        </div>
                      </td>

                      {/* Sales & Rating */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-700">
                            Terjual: <strong className="text-slate-900">{prod.sold_count || 0}</strong>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                            <span>{Number(prod.rating || 5).toFixed(1)}</span>
                            <span className="text-slate-400 font-normal text-[10px]">
                              ({prod.review_count || 0})
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Live view button */}
                          <Link
                            href={`/produk/${prod.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Lihat Halaman Produk Live"
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(prod)}
                            title="Edit Data Produk"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteDialog(prod)}
                            title="Hapus Produk"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && products.length > 0 && (
          <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <div>
              Menampilkan {products.length} dari total <strong>{totalCount}</strong> produk
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>

              <span className="px-3 py-1.5 font-bold text-slate-800 bg-white border border-slate-200 rounded-xl">
                Halaman {page} / {totalPages || 1}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Modal (Create / Edit) */}
      <ProductFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={handleFormSuccess}
        initialData={editingProduct}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteProductDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingProduct(null);
        }}
        onSuccess={handleDeleteSuccess}
        product={deletingProduct}
      />
    </div>
  );
}
