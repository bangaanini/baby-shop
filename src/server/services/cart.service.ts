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
  variantId: string | null;
  nama: string;
  slug: string;
  gambar: string;
  kategoriLabel: string;
  warna: string;
  ukuran: string;
  harga: number;
  hargaCoret?: number;
  diskonPersen?: number;
  jumlah: number;
  stok: number;
  beratGram: number;
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
 * Get or create an active cart for a user ID, cart ID, or guest session.
 */
export async function getOrCreateCart(userIdOrSession?: string) {
  if (userIdOrSession && isValidUUID(userIdOrSession)) {
    // 1. Try finding cart by cart ID or user ID
    const existingCart = await db.query.cartsTable.findFirst({
      where: (carts, { or, eq }) =>
        or(eq(carts.id, userIdOrSession), eq(carts.user_id, userIdOrSession)),
    });

    if (existingCart) {
      return existingCart;
    }

    // 2. Check if userIdOrSession belongs to an existing user
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userIdOrSession),
    });

    if (user) {
      const [newCart] = await db
        .insert(cartsTable)
        .values({
          user_id: user.id,
        })
        .returning();
      return newCart;
    }

    // 3. Create guest cart with this session UUID as its ID
    const [newGuestCart] = await db
      .insert(cartsTable)
      .values({
        id: userIdOrSession,
        user_id: null,
      })
      .returning();
    return newGuestCart;
  }

  // If userIdOrSession is an email address
  if (userIdOrSession && userIdOrSession.includes('@')) {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, userIdOrSession),
    });
    if (user) {
      const userCart = await db.query.cartsTable.findFirst({
        where: eq(cartsTable.user_id, user.id),
      });
      if (userCart) return userCart;

      const [newCart] = await db
        .insert(cartsTable)
        .values({
          user_id: user.id,
        })
        .returning();
      return newCart;
    }
  }

  // Look for any existing cart in the system (e.g. demo buyer cart)
  const defaultCart = await db.query.cartsTable.findFirst({
    orderBy: (carts, { desc }) => [desc(carts.updated_at)],
  });

  if (defaultCart) {
    return defaultCart;
  }

  // Otherwise create a new cart
  const [createdCart] = await db.insert(cartsTable).values({}).returning();
  return createdCart;
}

/**
 * Get all cart items with product and variant details, subtotal, and total weight.
 */
export async function getCartItems(userIdOrSession?: string): Promise<CartResponse> {
  const cart = await getOrCreateCart(userIdOrSession);

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
      const weightGram = estimateWeightGram(product.name, product.category?.slug);
      const itemSubtotal = unitPrice * item.quantity;
      const itemTotalWeightGram = weightGram * item.quantity;
      const hargaCoret = isFlashSale ? product.price : (product.original_price ?? undefined);
      const diskonPersen = isFlashSale
        ? Math.round(((product.price - Number(product.flash_sale_price)) / product.price) * 100)
        : (product.discount_percent ?? undefined);

      return {
        id: item.id,
        cartId: item.cart_id,
        productId: product.id,
        variantId: item.variant_id,
        nama: product.name,
        slug: product.slug,
        gambar: product.image_url,
        kategoriLabel: product.category?.name ?? 'Perlengkapan Anak',
        warna: variant?.color ?? '',
        ukuran: variant?.size ?? '',
        harga: unitPrice,
        hargaCoret,
        diskonPersen,
        jumlah: item.quantity,
        stok: availableStock,
        beratGram: weightGram,
        subtotal: itemSubtotal,
        totalBeratGram: itemTotalWeightGram,
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
 * Add a product or variant to the cart with stock validation and upsert logic.
 */
export async function addToCart(
  userIdOrSession: string | undefined,
  payload: AddToCartInput
): Promise<CartResponse> {
  const { productId, variantId, quantity } = payload;

  // 1. Find product by UUID or slug
  let product = null;
  if (isValidUUID(productId)) {
    product = await db.query.productsTable.findFirst({
      where: eq(productsTable.id, productId),
    });
  } else {
    product = await db.query.productsTable.findFirst({
      where: eq(productsTable.slug, productId),
    });
  }

  if (!product) {
    throw new Error('Produk tidak ditemukan');
  }

  // 2. Validate variant if specified
  let variant = null;
  if (variantId) {
    if (isValidUUID(variantId)) {
      variant = await db.query.productVariantsTable.findFirst({
        where: and(
          eq(productVariantsTable.id, variantId),
          eq(productVariantsTable.product_id, product.id)
        ),
      });
    }

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

  // 3. Get or create cart
  const cart = await getOrCreateCart(userIdOrSession);

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
      throw new Error(`Jumlah barang di keranjang (${newQuantity}) melebihi stok yang tersedia (${maxStock})`);
    }

    await db
      .update(cartItemsTable)
      .set({ quantity: newQuantity })
      .where(eq(cartItemsTable.id, existingItem.id));
  } else {
    await db.insert(cartItemsTable).values({
      cart_id: cart.id,
      product_id: product.id,
      variant_id: variant?.id ?? null,
      quantity,
    });
  }

  // Update cart updated_at
  await db
    .update(cartsTable)
    .set({ updated_at: new Date() })
    .where(eq(cartsTable.id, cart.id));

  return getCartItems(cart.id);
}

/**
 * Update the quantity of a cart item with stock check.
 */
export async function updateQuantity(itemId: string, quantity: number) {
  if (quantity < 1) {
    throw new Error('Kuantitas minimal 1');
  }

  if (!isValidUUID(itemId)) {
    throw new Error('ID item keranjang tidak valid');
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

  const maxStock = item.variant ? item.variant.stock : item.product.stock;

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

  return {
    ...updated,
    maxStock,
  };
}

/**
 * Remove an item from the cart.
 */
export async function removeItem(itemId: string) {
  if (!isValidUUID(itemId)) {
    throw new Error('ID item keranjang tidak valid');
  }

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

  return {
    success: true,
    itemId,
    cartId: item.cart_id,
  };
}

/**
 * Clear all items in a cart.
 */
export async function clearCart(cartId: string) {
  if (!isValidUUID(cartId)) {
    throw new Error('ID keranjang tidak valid');
  }

  await db.delete(cartItemsTable).where(eq(cartItemsTable.cart_id, cartId));

  await db
    .update(cartsTable)
    .set({ updated_at: new Date() })
    .where(eq(cartsTable.id, cartId));

  return {
    success: true,
    cartId,
  };
}

export const cartService = {
  getOrCreateCart,
  getCart: getCartItems,
  getCartItems,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
};
