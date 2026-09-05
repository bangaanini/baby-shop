'use client';

import { Product } from '@/types/product';

const WISHLIST_STORAGE_KEY = 'nbusiness_wishlist_items';

/**
 * Mendapatkan seluruh daftar produk yang difavoritkan dari localStorage
 */
export function getWishlistProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read wishlist from localStorage:', err);
    return [];
  }
}

/**
 * Mengecek apakah produk tertentu ada di wishlist
 */
export function isProductInWishlist(productId: string): boolean {
  if (typeof window === 'undefined' || !productId) return false;
  try {
    const list = getWishlistProducts();
    return list.some((item) => item.id === productId || item.slug === productId);
  } catch {
    return false;
  }
}

/**
 * Menambahkan atau menghapus produk dari wishlist (toggle)
 * Mengembalikan `true` jika produk baru ditambahkan, `false` jika dihapus
 */
export function toggleProductWishlist(product: Product): boolean {
  if (typeof window === 'undefined' || !product?.id) return false;
  try {
    const current = getWishlistProducts();
    const exists = current.some((item) => item.id === product.id || item.slug === product.slug);

    let updated: Product[];
    let added = false;

    if (exists) {
      updated = current.filter((item) => item.id !== product.id && item.slug !== product.slug);
      added = false;
    } else {
      updated = [product, ...current];
      added = true;
    }

    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));

    // Dispatch global event for live synchronization across components
    window.dispatchEvent(
      new CustomEvent('wishlist-updated', {
        detail: { product, added, count: updated.length },
      })
    );

    return added;
  } catch (err) {
    console.error('Failed to update wishlist in localStorage:', err);
    return false;
  }
}

/**
 * Menghapus produk dari wishlist berdasarkan ID
 */
export function removeFromWishlist(productId: string): Product[] {
  if (typeof window === 'undefined' || !productId) return [];
  try {
    const current = getWishlistProducts();
    const updated = current.filter((item) => item.id !== productId && item.slug !== productId);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));

    window.dispatchEvent(
      new CustomEvent('wishlist-updated', {
        detail: { removedId: productId, count: updated.length },
      })
    );

    return updated;
  } catch (err) {
    console.error('Failed to remove from wishlist:', err);
    return [];
  }
}
