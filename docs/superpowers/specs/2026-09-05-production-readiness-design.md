# Production Readiness: Payment Webhook Security, Atomic Stock, Admin RBAC, and Legal Pages

**Date:** 2026-09-05  
**Product:** NBusiness (Baby & Kids eCommerce)  
**Status:** Approved  

Decisions: Q1=2 (keep `x-dev-admin`/`x-user-role` bypass in non-production, admin guard only matters in production), Q2=1 (standard Indonesian refund/return policy content).

---

## 1. Executive Summary

Four blocking fixes before public release with real payments:

1. **Webhook signature enforcement** — Midtrans SHA512 and Xendit callback-token verification with idempotency guard. Webhooks remain public; dev bypass never applies to them.
2. **Atomic stock transactions** — stock check + decrement inside a single `db.transaction` for `createOrder`; stock restore inside a single transaction for cancellation (manual admin or webhook-driven deny/expire).
3. **Uniform admin RBAC** — `src/middleware.ts` remains the primary gate for `/admin/*`; every `src/app/api/admin/**` handler standardizes on `verifyAdmin(request)` as seen in `src/app/api/admin/vouchers/route.ts`, honoring `x-dev-admin`/`x-user-role` only when `NODE_ENV !== 'production'`.
4. **Legal pages + footer wiring** — `/syarat-ketentuan`, `/kebijakan-privasi`, `/kebijakan-pengembalian` with standard Indonesian shop policy, styled to match Claymorphism, footer links fixed from `/katalog`.

---

## 2. System Context

- Better Auth sessions (`src/server/auth.ts`, `src/db/schema/auth.ts`, `src/db/schema/users.ts` with `role` column).
- `src/app/api/webhooks/payment/route.ts` delegates to `paymentService.handleWebhookNotification(body, headers)`.
- `src/server/services/checkout.service.ts` `createOrder` already runs inside `db.transaction(async tx => ...)`.
- `src/server/services/admin.service.ts` `updateOrderStatus` and `payment.service.handleWebhookNotification` both transition order status.

---

## 3. Design

### 3.1 Webhook Security — `payment.service.ts` + `webhooks/payment/route.ts`

**Midtrans:**
- Body fields: `order_id`, `status_code`, `gross_amount`, `signature_key`, `transaction_status`.
- If `settings.midtrans_server_key` is set and `signature_key` is present, compute `SHA512(order_id + status_code + gross_amount + serverKey)` and compare to `signature_key` (hex digest via `crypto.createHash('sha512')`). Mismatch → `400 { success:false, provider:'midtrans', message:'Signature key Midtrans tidak valid.' }` with `console.warn` including `order_id`.
- If `midtrans_server_key` is empty, proceed but emit `console.warn` so an unset env is visible.
- Lookup order via `invoice_number` or `id` (UUID check).

**Xendit:**
- Fields: `external_id`/`data.id`, `status` (`PAID`/`SETTLED`/`EXPIRED` etc.), headers include `x-callback-token` (case-insensitive).
- If `settings.xendit_webhook_token` is set, compare header value to stored token. Mismatch → `400 { provider:'xendit' }`.
- Lookup order via `external_id` with UUID fallback.

**Idempotency + status mapping:**
- If `existingOrder.status` is already `diproses`/`selesai`/`dibatalkan`, do not overwrite; log and return `200 { alreadyProcessed:true }` (consistent with existing handling).
- `capture`/`settlement`/`PAID`/`SETTLED` → `diproses` + tracking insert.
- `deny`/`cancel`/`expire`/`EXPIRE`/`FAILED` → `dibatalkan` + tracking insert.
- Other statuses → `200` without state change.

**Route:**
- `src/app/api/webhooks/payment/route.ts` stays `force-dynamic`, no role check (public). Returns `400`/`200`/`500` per `result.success`.

### 3.2 Atomic Stock — `checkout.service.ts` and `admin.service.ts`

**`createOrder` (inside one `db.transaction`):**
1. For each `item` in input: `tx.query.productsTable.findFirst` and, if `variantId` is set, `tx.query.productVariantsTable.findFirst` (all inside `tx`, not plain `db`).
2. Validate: variant path → `variant.stock >= item.quantity`; product path → `product.stock >= item.quantity`. If insufficient → throw with message `Stok varian ... tidak mencukupi (tersedia: X, diminta: Y)` / `Stok produk ... tidak mencukupi (...)` so the transaction rolls back (order not created, stock untouched).
3. On success: atomically `UPDATE ... SET stock = stock - quantity` via `sql` expression, still inside `tx`. Varian branch already does this; non-variant branch is added to match.
4. Then insert `orders`, `order_items`, `trackingHistory`, clear `cart_items` — all inside the same `tx`.
5. After commit: increment voucher usage and create payment transaction (existing logic, unchanged).

**Cancellation restore — single transaction in `updateOrderStatus` (`status==='dibatalkan'`):**
- Before updating `orders.status`, select `order_items` for the order, then for each item restore stock inside the same transaction: `variant_id ? productVariantsTable.stock + quantity : productsTable.stock + quantity`.
- Webhook-driven cancellation (Midtrans deny/cancel/expire, Xendit EXPIRE/FAILED) reuses the same restore helper/path so payment timeouts also return stock.

**Validation:** `quantity >= 1` enforced via `checkout.schema.ts`; stock never goes negative because the `stock >= qty` guard blocks it.

### 3.3 RBAC — `middleware.ts` + `api/admin/**` guard

**Middleware (unchanged primary gate):**
- Matcher: `['/admin/:path*', '/user/:path*', '/auth/login', '/auth/register']`.
- `/admin/:path*` → `getSessionCookie` → `getSessionData` → `role !== 'admin'` → redirect `/auth/unauthorized`.

**API guard (`src/app/api/admin/**`):**
- Introduce/standardize `verifyAdmin(request)` with contract:
  ```ts
  async function verifyAdmin(request: NextRequest):
    Promise<{ authorized: boolean; response?: NextResponse }>
  ```
  Steps: `auth.api.getSession({ headers: request.headers })` and `session.user.role === 'admin'` → authorized; else if `NODE_ENV !== 'production'` and (`x-user-role === 'admin'` or `x-dev-admin === 'true'`) → authorized (Q1=2); else → `403`.
- Apply uniformly across `src/app/api/admin/flash-sale/**`, `orders/**`, `products/**`, `upload/**`, `stats/**`, `settings/**`, `customers/**`, `vouchers/**`. No guard on public/webhook routes.

### 3.4 Legal Pages + Footer

**New static routes:**
- `src/app/syarat-ketentuan/page.tsx`
- `src/app/kebijakan-privasi/page.tsx`
- `src/app/kebijakan-pengembalian/page.tsx`

**Content (Q2=1, standard Indonesian):**
- T&C: store identity from `store_settings.store_name/store_email/store_phone/store_address`, account rules, pricing & stock caveat, payments via Midtrans/Xendit, shipping via Biteship, order lifecycle, cancellation & refund summary with link to return policy.
- Privacy: what we collect (auth + addresses + orders), purpose, storage, user rights, cookies, contact.
- Returns: not-yet-shipped = full refund; 7-day return for defective/wrong item with photo/video proof; contact from `store_settings`; 3–7 working days estimate.

**Styling:** `max-w-3xl mx-auto`, `rounded-3xl border-2 border-[#FFE8D6] bg-white`, `font-heading`/`font-body` consistent with Claymorphism. Fetch `store_email/phone/address` from `store_settings` (fallback defaults).

**Footer wiring — `src/components/layout/NavbarFooter.tsx`:**
- Change links currently pointing to `/katalog`:
  - `Syarat & Ketentuan → /syarat-ketentuan`
  - `Kebijakan Privasi → /kebijakan-privasi`
  - Add/link `Kebijakan Pengembalian → /kebijakan-pengembalian`
- `Mitra Logistik & Pembayaran` column stays generic (no explicit gateway brand names on storefront).

---

## 4. File & Route Map

- Modify: `src/server/services/payment.service.ts`
- Modify: `src/app/api/webhooks/payment/route.ts` (minimal — ensure headers forwarded correctly)
- Modify: `src/server/services/checkout.service.ts`
- Modify: `src/server/services/admin.service.ts`
- Modify/audit: `src/app/api/admin/**/route.ts` (uniform `verifyAdmin`)
- Keep: `src/middleware.ts`
- Create: `src/app/syarat-ketentuan/page.tsx`, `src/app/kebijakan-privasi/page.tsx`, `src/app/kebijakan-pengembalian/page.tsx`
- Modify: `src/components/layout/NavbarFooter.tsx`
- Schema: no new tables (stock via existing `products.stock` / `product_variants.stock`); existing `store_settings` already present

---

## 5. Telemetry & Audit

- `console.warn` on signature mismatch with order/invoice identifier.
- `console.log` on idempotent webhook (already-processed order).
- `console.warn` when webhook server key / callback token is unset.
- Tracking history entries are the durable audit trail: `Pembayaran Berhasil Diverifikasi Otomatis`, `Pembayaran Dibatalkan / Kedaluwarsa`, plus cancellation restock tracking where applicable.

---

## 6. Verification Plan

1. `npx tsc --noEmit` (0 errors).
2. `npm run build` (all routes including 3 new legal pages compile).
3. `npx ngodingpakeai sync --plan && npx ngodingpakeai sync` (indexed + synced).
4. Manual checkout + webhook simulation:
   - Sandbox Midtrans/Xendit settings filled in `/admin/setting`, place order, simulate valid webhook with correct signature → order becomes `diproses`.
   - Simulate invalid signature → `400`, order stays `menunggu_pembayaran`.
   - Race: two concurrent checkouts for last stock item → exactly one succeeds.
   - Cancel order via `/admin/pesanan` → stock restored; verify `product.stock` / `productVariants.stock`.
