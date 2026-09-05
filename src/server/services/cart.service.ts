import { eq, and, isNull } from 'drizzle-orm';
import { db } from '@/db';
import {
  cartsTable,
  cartItemsTable,
  productsTable,
  productVariantsTable,
  usersTable,
} from '@/db/schema';
import { AddToCartInput } from '@/server/validators/cart.schema';

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function estimateWeightGram(productName: string, categorySlug?: string): number {
  const lower = productName.toLowerCase();
  if (lower.includes('stroller') || lower.includes('car seat') || lower.includes('kursi')) return 5000;
  if (lower.includes('baby carrier') || lower.includes('gendongan')) return 800;
  if (lower.includes('mainan') || lower.includes('balok') || lower.includes('puzzle') || lower.includes('edukasi')) return 1000;
  if (lower.includes('botol') || lower.includes('makan') || lower.includes('alat makan') || lower.includes('feeding')) return 400;
  if (lower.includes('piyama') || lower.includes('baju') || lower.includes('jumper') || lower.includes('kaos') || lower.includes('setelan')) return 250;
  if (categorySlug === 'perlengkapan') return 1500;
  if (categorySlug === 'mainan') return 800;
  if (categorySlug === 'pakaian') return 250;
  return 500;
}

export interface FormattedCartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string;
  nama: string;
  slug: string;
  gambar: string;
  kategori: string;
  kategoriLabel: string;
  warna?: string;
  ukuran?: string;
  harga: number;
  hargaCoret?: number;
  diskonPersen?: number;
  jumlah: number;
  beratGram: number;
  stok: number;
  subtotal: number;
  totalBeratGram: number;
}

export interface CartResponse {
  cartId: string;
  userId: string | null;
  items: FormattedCartItem[];
  totalItems: number;
  subtotal: number;
  totalWeightGram: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get or create an isolated active cart for an authenticated user OR guest.
 * STRICT RULES:
 * 1. If userId is provided, the cart MUST belong to cartsTable.user_id = userId.
 * 2. If guest (userId is null/undefined), the cart MUST have cartsTable.user_id IS NULL.
 * 3. Never return a random/default cart of another user!
 */
export async function getOrCreateCart(
  userId?: string | null,
  guestCartId?: string | null
) {
  // --- Case 1: Authenticated User ---
  if (userId && userId.trim()) {
    const cleanUserId = userId.trim();

    // 1. Look for existing cart owned by this user
    let userCart = await db.query.cartsTable.findFirst({
      where: eq(cartsTable.user_id, cleanUserId),
    });

    if (userCart) {
      // If there was an anonymous guest cart in cookies with items, transfer its items to the user cart
      if (guestCartId && isValidUUID(guestCartId) && guestCartId !== userCart.id) {
        const guestCart = await db.query.cartsTable.findFirst({
          where: and(eq(cartsTable.id, guestCartId), isNull(cartsTable.user_id)),
        });

        if (guestCart) {
          const guestItems = await db.query.cartItemsTable.findMany({
            where: eq(cartItemsTable.cart_id, guestCart.id),
          });

          for (const gItem of guestItems) {
            const existingUserItem = await db.query.cartItemsTable.findFirst({
              where: gItem.variant_id
                ? and(
                    eq(cartItemsTable.cart_id, userCart.id),
                    eq(cartItemsTable.product_id, gItem.product_id),
                    eq(cartItemsTable.variant_id, gItem.variant_id)
                  )
                : and(
                    eq(cartItemsTable.cart_id, userCart.id),
                    eq(cartItemsTable.product_id, gItem.product_id),
                    isNull(cartItemsTable.variant_id)
                  ),
            });

            if (existingUserItem) {
              await db
                .update(cartItemsTable)
                .set({ quantity: existingUserItem.quantity + gItem.quantity })
                .where(eq(cartItemsTable.id, existingUserItem.id));
            } else {
              await db.insert(cartItemsTable).values({
                cart_id: userCart.id,
                product_id: gItem.product_id,
                variant_id: gItem.variant_id,
                quantity: gItem.quantity,
              });
            }
          }

          // Delete the guest cart after transferring items
          await db.delete(cartsTable).where(eq(cartsTable.id, guestCart.id));
        }
      }

      return userCart;
    }

    // 2. If user has no cart yet, check if there is an anonymous guest cart to claim
    if (guestCartId && isValidUUID(guestCartId)) {
      const guestCart = await db.query.cartsTable.findFirst({
        where: and(eq(cartsTable.id, guestCartId), isNull(cartsTable.user_id)),
      });

      if (guestCart) {
        // Claim the guest cart for this user
        const [claimedCart] = await db
          .update(cartsTable)
          .set({
            user_id: cleanUserId,
            updated_at: new Date(),
          })
          .where(eq(cartsTable.id, guestCart.id))
          .returning();
        return claimedCart;
      }
    }

    // 3. Create a fresh empty cart for this user
    const [newCart] = await db
      .insert(cartsTable)
      .values({
        user_id: cleanUserId,
      })
      .returning();
    return newCart;
  }

  // --- Case 2: Guest / Unauthenticated User ---
  if (guestCartId && isValidUUID(guestCartId)) {
    // Look ONLY for an anonymous guest cart (user_id MUST be null)
    const existingGuestCart = await db.query.cartsTable.findFirst({
      where: and(eq(cartsTable.id, guestCartId), isNull(cartsTable.user_id)),
    });

    if (existingGuestCart) {
      return existingGuestCart;
    }
  }

  // If no valid unowned guest cart was found, create a brand new guest cart
  const [createdGuestCart] = await db
    .insert(cartsTable)
    .values({
      user_id: null,
    })
    .returning();
  return createdGuestCart;
}

/**
 * Get all cart items with product and variant details, subtotal, and total weight.
 */
export async function getCartItems(
  userId?: string | null,
  guestCartId?: string | null
): Promise<CartResponse> {
  const cart = await getOrCreateCart(userId, guestCartId);

  const rawItems = await db.query.cartItemsTable.findMany({
    where: eq(cartItemsTable.cart_id, cart.id),
    with: {
      product: {
        with: {
          category: true,
        },
      },
      variant: true,
    },
  });

  const items: FormattedCartItem[] = rawItems
    .filter((item) => item.product !== null)
    .map((item) => {
      const product = item.product;
      const variant = item.variant;
      const isFlashSale = Boolean(product.is_flash_sale && product.flash_sale_price);
      const basePrice = isFlashSale ? Number(product.flash_sale_price) : product.price;
      const unitPrice = basePrice + (variant?.additional_price ?? 0);
      const availableStock = variant ? variant.stock : product.stock;

      const weight =
        product.weight_gram ||
        estimateWeightGram(product.name, product.category?.slug);

      const qty = item.quantity;

      return {
        id: item.id,
        cartId: item.cart_id,
        productId: product.id,
        variantId: variant?.id,
        nama: product.name,
        slug: product.slug,
        gambar: product.image_url,
        kategori: product.category?.slug || 'perlengkapan',
        kategoriLabel: product.category?.name || 'Perlengkapan Anak',
        warna: variant?.color || undefined,
        ukuran: variant?.size || undefined,
        harga: unitPrice,
        hargaCoret: product.original_price || (isFlashSale ? product.price : undefined),
        diskonPersen: isFlashSale
          ? Math.max(1, Math.round(((product.price - product.flash_sale_price!) / product.price) * 100))
          : product.discount_percent || undefined,
        jumlah: qty,
        beratGram: weight,
        stok: availableStock,
        subtotal: unitPrice * qty,
        totalBeratGram: weight * qty,
      };
    });

  const totalItems = items.reduce((sum, item) => sum + item.jumlah, 0);
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalWeightGram = items.reduce((sum, item) => sum + item.totalBeratGram, 0);

  return {
    cartId: cart.id,
    userId: cart.user_id,
    items,
    totalItems,
    subtotal,
    totalWeightGram,
    createdAt: cart.created_at,
    updatedAt: cart.updated_at,
  };
}

/**
 * Add a product/variant to the cart with inventory validation.
 */
export async function addToCart(
  userId: string | null | undefined,
  guestCartId: string | null | undefined,
  input: AddToCartInput
): Promise<CartResponse> {
  const { productId, variantId, quantity } = input;

  // 1. Verify product exists
  const product = await db.query.productsTable.findFirst({
    where: eq(productsTable.id, productId),
  });

  if (!product) {
    throw new Error('Produk tidak ditemukan');
  }

  // 2. If variant specified, verify variant
  let variant = null;
  if (variantId) {
    variant = await db.query.productVariantsTable.findFirst({
      where: and(
        eq(productVariantsTable.id, variantId),
        eq(productVariantsTable.product_id, productId)
      ),
    });

    if (!variant) {
      throw new Error('Varian produk tidak ditemukan atau tidak sesuai');
    }

    if (variant.stock < quantity) {
      throw new Error(`Stok varian ${variant.color || ''} ${variant.size || ''} tidak mencukupi (tersedia: ${variant.stock})`);
    }
  } else {
    if (product.stock < quantity) {
      throw new Error(`Stok produk tidak mencukupi (tersedia: ${product.stock})`);
    }
  }

  // 3. Get or create cart for this user/guest
  const cart = await getOrCreateCart(userId, guestCartId);

  // 4. Check if item already exists in cart
  const existingItem = await db.query.cartItemsTable.findFirst({
    where: variantId
      ? and(
          eq(cartItemsTable.cart_id, cart.id),
          eq(cartItemsTable.product_id, product.id),
          eq(cartItemsTable.variant_id, variantId)
        )
      : and(
          eq(cartItemsTable.cart_id, cart.id),
          eq(cartItemsTable.product_id, product.id),
          isNull(cartItemsTable.variant_id)
        ),
  });

  const maxStock = variant ? variant.stock : product.stock;

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > maxStock) {
      throw new Error(`Jumlah di keranjang melebihi stok yang tersedia (maksimal: ${maxStock})`);
    }

    await db
      .update(cartItemsTable)
      .set({ quantity: newQuantity })
      .where(eq(cartItemsTable.id, existingItem.id));
  } else {
    await db.insert(cartItemsTable).values({
      cart_id: cart.id,
      product_id: product.id,
      variant_id: variantId || null,
      quantity,
    });
  }

  // Update cart updated_at timestamp
  await db
    .update(cartsTable)
    .set({ updated_at: new Date() })
    .where(eq(cartsTable.id, cart.id));

  return getCartItems(userId, cart.id);
}

/**
 * Update the quantity of a specific cart item.
 */
export async function updateQuantity(itemId: string, quantity: number) {
  if (quantity < 1) {
    throw new Error('Kuantitas minimal adalah 1 item');
  }

  const item = await db.query.cartItemsTable.findFirst({
    where: eq(cartItemsTable.id, itemId),
    with: {
      product: true,
      variant: true,
    },
  });

  if (!item) {
    throw new Error('Item keranjang tidak ditemukan');
  }

  const maxStock = item.variant ? item.variant.stock : item.product?.stock ?? 99;

  if (quantity > maxStock) {
    throw new Error(`Kuantitas melebihi stok yang tersedia (maksimal: ${maxStock})`);
  }

  const [updated] = await db
    .update(cartItemsTable)
    .set({ quantity })
    .where(eq(cartItemsTable.id, itemId))
    .returning();

  await db
    .update(cartsTable)
    .set({ updated_at: new Date() })
    .where(eq(cartsTable.id, item.cart_id));

  return updated;
}

/**
 * Remove an item from the cart.
 */
export async function removeItem(itemId: string) {
  const item = await db.query.cartItemsTable.findFirst({
    where: eq(cartItemsTable.id, itemId),
  });

  if (!item) {
    throw new Error('Item keranjang tidak ditemukan');
  }

  await db.delete(cartItemsTable).where(eq(cartItemsTable.id, itemId));

  await db
    .update(cartsTable)
    .set({ updated_at: new Date() })
    .where(eq(cartsTable.id, item.cart_id));

  return { success: true, deletedId: itemId, cartId: item.cart_id };
}

/**
 * Clear all items in a cart (e.g. after successful checkout).
 */
export async function clearCart(cartId: string) {
  await db.delete(cartItemsTable).where(eq(cartItemsTable.cart_id, cartId));
  await db
    .update(cartsTable)
    .set({ updated_at: new Date() })
    .where(eq(cartsTable.id, cartId));
  return { success: true, cartId };
}

export const cartService = {
  getOrCreateCart,
  getCartItems,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
};
