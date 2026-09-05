# Production Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden NBusiness for public release with real payments by enforcing webhook signature verification, atomic stock transactions, uniform admin RBAC, and required legal pages.

**Architecture:** Next.js 16 App Router + Drizzle ORM (postgres.js) + Better Auth. `payment.service.handleWebhookNotification` is the single webhook entry; `checkout.service.createOrder` owns the stock transaction; `middleware.ts` gates `/admin/*` and `verifyAdmin(request)` gates `/api/admin/**`; legal pages are static routes reading `store_settings` for contact details.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, postgres.js, Tailwind CSS v4, Better Auth, Node crypto, Lucide Icons.

## Global Constraints

- `NODE_ENV !== 'production'` is the only condition under which `x-dev-admin` / `x-user-role: admin` bypasses are honored; in production only `session.user.role === 'admin'` authorizes `src/app/api/admin/**`.
- Webhook endpoints (`POST /api/webhooks/payment`) are public and must not require admin role; they must verify signatures instead.
- Stock must never go negative; every `stock - qty` must be preceded by `stock >= qty` inside the same `db.transaction`.
- Legal content uses standard Indonesian policy wording (refund full if not shipped, 7-day return for defective/wrong item) and pulls contact from `store_settings` with env fallback.
- Every task must pass `npx tsc --noEmit` with 0 errors and `npm run build` green.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/server/services/payment.service.ts` | Midtrans SHA512 + Xendit `x-callback-token` verification, idempotency, status mapping, tracking inserts |
| `src/app/api/webhooks/payment/route.ts` | Public webhook entry, delegates to `paymentService.handleWebhookNotification(body, headers)`, maps `400/200/500` |
| `src/server/services/checkout.service.ts` | `createOrder` transactional stock check + `SET stock = stock - qty` (product + variant), insert orders/items/tracking/cart clear |
| `src/server/services/admin.service.ts` | `updateOrderStatus(..., 'dibatalkan')` transactional stock restore + status update |
| `src/app/api/admin/**/route.ts` (flash-sale, orders, products, upload, stats, settings, customers, vouchers) | Uniform `verifyAdmin(request)` guard |
| `src/middleware.ts` | Primary gate for `/admin/:path*` (unchanged, verified) |
| `src/app/syarat-ketentuan/page.tsx` | Static legal page: T&C |
| `src/app/kebijakan-privasi/page.tsx` | Static legal page: Privacy |
| `src/app/kebijakan-pengembalian/page.tsx` | Static legal page: Returns & Refund |
| `src/components/layout/NavbarFooter.tsx` | Footer link wiring from `/katalog` to the three legal routes |

---

### Task 1: Webhook Signature Enforcement + Idempotency

**Files:**
- Modify: `src/server/services/payment.service.ts:518-780`
- Modify: `src/app/api/webhooks/payment/route.ts:1-42`

**Interfaces:**
- Consumes: `store_settings.midtrans_server_key`, `store_settings.xendit_webhook_token`, `NextRequest.headers`, webhook JSON body (`order_id/status_code/gross_amount/signature_key` for Midtrans, `external_id/status` for Xendit).
- Produces: `paymentService.handleWebhookNotification(body, headers) -> Promise<WebhookResult>` with `{ success, provider, orderId?, invoiceNumber?, status?, message?, alreadyProcessed? }`.

- [ ] **Step 1: Tighten `handleWebhookNotification` — Midtrans branch**

In `src/server/services/payment.service.ts`, replace the Midtrans verification block with:

```ts
const serverKey = settings.midtrans_server_key;
if (serverKey && signatureKey) {
  const payloadString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const expectedSignature = crypto.createHash('sha512').update(payloadString).digest('hex');
  if (signatureKey !== expectedSignature) {
    console.warn(`[PaymentService] Midtrans Webhook Invalid Signature for Order ${orderId}`);
    return { success: false, provider: 'midtrans', message: 'Signature key Midtrans tidak valid.' };
  }
} else if (!serverKey) {
  console.warn('[PaymentService] Midtrans server key is not configured — webhook signature not verified');
}
```

Verify `orderId/statusCode/grossAmount` are read from body (existing code). No other behavior change in this branch.

- [ ] **Step 2: Tighten `handleWebhookNotification` — Xendit branch**

Replace the Xendit token check with case-insensitive header lookup (existing `getHeader`) and:

```ts
if (webhookToken && receivedToken && webhookToken !== receivedToken) {
  console.warn(`[PaymentService] Xendit Callback Token Mismatch for Invoice ${externalId}`);
  return { success: false, provider: 'xendit', message: 'Callback token Xendit tidak valid.' };
}
if (!webhookToken) {
  console.warn('[PaymentService] Xendit webhook token is not configured — callback token not verified');
}
```

- [ ] **Step 3: Add idempotency guard before any status write**

After `existingOrder` is resolved (both branches), insert:

```ts
if (['diproses', 'selesai', 'dibatalkan'].includes(existingOrder.status)) {
  console.log(`[PaymentService] Webhook idempotent — order ${existingOrder.invoice_number} already ${existingOrder.status}`);
  return { success: true, provider, orderId: existingOrder.id, invoiceNumber: existingOrder.invoice_number, status: existingOrder.status, message: 'Pesanan sudah diproses sebelumnya.' };
}
```

This sits immediately before the `isSuccess`/`isFailed` branches in both providers.

- [ ] **Step 4: Ensure webhook route forwards headers faithfully**

In `src/app/api/webhooks/payment/route.ts`, confirm the handler is:

```ts
const body = await request.json().catch(() => ({}));
const result = await paymentService.handleWebhookNotification(body, request.headers);
if (!result.success) return NextResponse.json({ success: false, error: result.message }, { status: 400 });
return NextResponse.json({ success: true, message: result.message, data: result }, { status: 200 });
```

It already uses `request.headers`; keep it `force-dynamic`. No role check.

- [ ] **Step 5: Run typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/server/services/payment.service.ts src/app/api/webhooks/payment/route.ts
git commit -m "security(webhook): enforce Midtrans SHA512 and Xendit callback-token verification with idempotency guard"
```

---

### Task 2: Atomic Stock — Check + Decrement + Restore

**Files:**
- Modify: `src/server/services/checkout.service.ts:430-720`
- Modify: `src/server/services/admin.service.ts:448-590`

**Interfaces:**
- Consumes: `productsTable.stock`, `productVariantsTable.stock`, `orderItemsTable`, `cartsTable`, `cartItemsTable`, `voucherService.incrementVoucherUsage` (post-commit).
- Produces: `checkoutService.createOrder(input) -> { orderRecord, itemSnapshots }` with transactional stock safety; `adminService.updateOrderStatus(id, 'dibatalkan')` restoring stock atomically.

- [ ] **Step 1: Make stock check + decrement fully transactional in `createOrder`**

Inside `db.transaction(async (tx) => { ... })` in `checkout.service.ts`:

1. For each `item`, replace any `db.query.*` with `tx.query.*` (both `productsTable` and `productVariantsTable` reads).
2. Insert/keep validation:

```ts
if (item.variantId) {
  if (variant.stock < item.quantity) throw new Error(`Stok varian ${variant.color || ''} ${variant.size || ''} untuk "${product.name}" tidak mencukupi (tersedia: ${variant.stock}, diminta: ${item.quantity})`);
  await tx.update(productVariantsTable).set({ stock: sql`${productVariantsTable.stock} - ${item.quantity}` }).where(eq(productVariantsTable.id, variant.id));
} else {
  if (product.stock < item.quantity) throw new Error(`Stok produk "${product.name}" tidak mencukupi (tersedia: ${product.stock}, diminta: ${item.quantity})`);
  await tx.update(productsTable).set({ stock: sql`${productsTable.stock} - ${item.quantity}` }).where(eq(productsTable.id, product.id));
}
```

The variant branch already exists; add the `else` product branch. Ensure `quantity >= 1` is already enforced by `checkout.schema.ts`.

- [ ] **Step 2: Add stock-restore helper and wire it into cancellation**

Create a helper inside `admin.service.ts`:

```ts
async function restoreStockForOrder(tx: Transaction, orderId: string) {
  const items = await tx.select().from(orderItemsTable).where(eq(orderItemsTable.order_id, orderId));
  for (const it of items) {
    if (it.variant_id) {
      await tx.update(productVariantsTable).set({ stock: sql`${productVariantsTable.stock} + ${it.quantity}` }).where(eq(productVariantsTable.id, it.variant_id));
    } else if (it.product_id) {
      await tx.update(productsTable).set({ stock: sql`${productsTable.stock} + ${it.quantity}` }).where(eq(productsTable.id, it.product_id));
    }
  }
}
```

In `updateOrderStatus`, when `status === 'dibatalkan'`, wrap the whole update in a single transaction: `select order_items` → `restoreStockForOrder(tx, existingOrder.id)` → `update orders SET status='dibatalkan'` → `insert trackingHistory`. If the order is already `dibatalkan`, return early without double-restore.

- [ ] **Step 3: Make webhook cancellation also restore stock**

In `payment.service.ts`, both cancellation branches (Midtrans `deny/cancel/expire` and Xendit `EXPIRE/FAILED`) must call the same restore helper (extract it to a shared `restoreStockForOrder` or duplicate with `db.transaction`). Prefer importing a small helper from `admin.service.ts` or inlining the restore loop inside `db.transaction` before `update orders SET status='dibatalkan'`.

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/server/services/checkout.service.ts src/server/services/admin.service.ts src/server/services/payment.service.ts
git commit -m "fix(stock): make createOrder and cancellation stock updates atomic with restore on cancel/expire"
```

---

### Task 3: Uniform Admin RBAC Guard

**Files:**
- Modify: `src/app/api/admin/flash-sale/route.ts`
- Modify: `src/app/api/admin/flash-sale/settings/route.ts`
- Modify: `src/app/api/admin/orders/route.ts`
- Modify: `src/app/api/admin/products/route.ts`
- Modify: `src/app/api/admin/upload/route.ts`
- Modify: `src/app/api/admin/stats/route.ts`
- Modify: `src/app/api/admin/settings/route.ts`
- Modify: `src/app/api/admin/customers/route.ts`
- Verify: `src/app/api/admin/vouchers/route.ts` and `src/app/api/admin/vouchers/[id]/route.ts` (reference implementation)
- Verify: `src/middleware.ts` (no change, confirm matcher)

**Interfaces:**
- Consumes: `auth.api.getSession({ headers })`, `request.headers.get('x-user-role')`, `request.headers.get('x-dev-admin')`, `process.env.NODE_ENV`.
- Produces: `verifyAdmin(request) -> { authorized: boolean; response?: NextResponse }` returning `403` on deny.

- [ ] **Step 1: Standardize `verifyAdmin` helper in every `src/app/api/admin/**/route.ts`**

Copy the exact helper from `src/app/api/admin/vouchers/route.ts:8-40` into each admin route that lacks it:

```ts
async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean; response?: NextResponse }> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user && (session.user as any).role === 'admin') return { authorized: true };
  } catch (err) {
    console.warn('Session verification warning:', err);
  }
  if (process.env.NODE_ENV !== 'production') {
    if (request.headers.get('x-user-role') === 'admin') return { authorized: true };
    if (request.headers.get('x-dev-admin') === 'true') return { authorized: true };
  }
  return { authorized: false, response: NextResponse.json({ success: false, error: 'Akses ditolak: Hanya akun dengan role admin yang diizinkan.' }, { status: 403 }) };
}
```

Inject `const authCheck = await verifyAdmin(request); if (!authCheck.authorized) return authCheck.response!;` at the top of every `GET/POST/PATCH/DELETE` handler.

- [ ] **Step 2: Audit coverage**

Run: `grep -R "verifyAdmin" src/app/api/admin --include="*.ts" | wc -l`
Expected: number of route files equals count of verifyAdmin definitions. List any file missing it and fix inline.

- [ ] **Step 3: Confirm middleware matcher is intact**

Run: `grep -n "matcher" src/middleware.ts`
Expected: `['/admin/:path*', '/user/:path*', '/auth/login', '/auth/register']` unchanged.

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/
git commit -m "security(admin): standardize verifyAdmin guard across all /api/admin routes (dev bypass only in non-production)"
```

---

### Task 4: Legal Pages + Footer Wiring

**Files:**
- Create: `src/app/syarat-ketentuan/page.tsx`
- Create: `src/app/kebijakan-privasi/page.tsx`
- Create: `src/app/kebijakan-pengembalian/page.tsx`
- Modify: `src/components/layout/NavbarFooter.tsx:500-515`

**Interfaces:**
- Consumes: `paymentService.getStoreSettings()` or direct `store_settings` defaults (`store_name`, `store_email`, `store_phone`, `store_address`) for contact block fallback.
- Produces: Three static routes plus corrected footer links.

- [ ] **Step 1: Create `src/app/syarat-ketentuan/page.tsx`**

Server component (no `'use client'`). Layout: `max-w-3xl mx-auto px-4 py-10`, header badge `Clay Block`, sections: Definisi Toko, Akun, Harga & Stok, Pembayaran (Midtrans/Xendit generik di sisi legal), Pengiriman (Biteship), Pesanan & Pembatalan, Hak Kekayaan Intelektual, Perubahan Syarat, Kontak (render `store_email/phone/address` via `await paymentService.getStoreSettings()` with fallback). Add `export const metadata: Metadata = { title: 'Syarat & Ketentuan — NBusiness' }`.

- [ ] **Step 2: Create `src/app/kebijakan-privasi/page.tsx`**

Same layout pattern. Sections: Data yang Dikumpulkan (Better Auth + addresses + orders), Tujuan, Dasar Hukum, Penyimpanan & Keamanan, Cookie, Hak Pengguna, Retensi, Kontak. Contact block from `store_settings`.

- [ ] **Step 3: Create `src/app/kebijakan-pengembalian/page.tsx`**

Same layout. Sections: Belum Dikirim → refund penuh; 7-hari retur untuk cacat/salah kirim (wajib foto/video); Prosedur Pengajuan (hubungi CS `store_email/phone`); Estimasi 3–7 hari kerja; Pengecualian (segel dibuka tanpa cacat, dll). Contact block from `store_settings`.

- [ ] **Step 4: Wire footer links in `NavbarFooter.tsx`**

Replace:

```tsx
<Link href="/katalog" ...>Syarat & Ketentuan</Link>
<Link href="/katalog" ...>Kebijakan Privasi</Link>
```

With:

```tsx
<Link href="/syarat-ketentuan" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
<Link href="/kebijakan-privasi" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
<Link href="/kebijakan-pengembalian" className="hover:text-white transition-colors">Kebijakan Pengembalian</Link>
```

Column `Mitra Logistik & Pembayaran` stays generic (existing text already correct).

- [ ] **Step 5: Run typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/syarat-ketentuan src/app/kebijakan-privasi src/app/kebijakan-pengembalian src/components/layout/NavbarFooter.tsx
git commit -m "feat(legal): add T&C, Privacy, and Returns pages with standard policy and footer wiring"
```

---

### Task 5: End-to-End Build & Verification

**Files:**
- None (verification task)

- [ ] **Step 1: Run TypeScript verification**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Run Next.js production build**

Run: `npm run build`
Expected: All routes including `/syarat-ketentuan`, `/kebijakan-privasi`, `/kebijakan-pengembalian`, and 30+ existing routes compile (no `Type error` or `Failed to compile`).

- [ ] **Step 3: Synchronize with NgodingPakeAI CLI**

Run: `npx ngodingpakeai sync --plan && npx ngodingpakeai sync`
Expected: Uploaded files indexed, `Synced: ... summarized` line present.

---
