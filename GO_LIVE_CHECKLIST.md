# 🚀 UnifiedCommerce — Go-Live Launch Checklist

This checklist must be completed before handing off a deployed store to a client or switching to production mode (`NODE_ENV=production`).

---

## 1. Store Identity & Branding
- [ ] **Store Name & Tagline**: Set in `apps/web/store.config.ts`.
- [ ] **Contact Information**: Phone number, WhatsApp support number, and support email verified in `store.config.ts`.
- [ ] **Physical Address**: Registered business or shop address updated.
- [ ] **Theme & Palette**: Selected appropriate industry theme (`fashion`, `food`, `electronics`, `general`) and primary brand color.
- [ ] **Logo & Favicon**: Placed `public/logo.png` and `public/favicon.ico`.

---

## 2. Cryptographic Secrets & Environment
- [ ] **Run Pre-flight Audit**: Execute `npm run check:env` and ensure 0 errors.
- [ ] **Encryption Key**: 64-hex AES-256 key generated via `npm run setup` (NEVER commit `.env.local`).
- [ ] **Session & Cookie Security**: Ensure HTTPS is enforced on production reverse proxy (Cloudflare, Vercel, Nginx). Cookies use `SameSite=Lax` and `HttpOnly`.
- [ ] **Key Rotation Schedule**: Familiar with `npm run rotate-key -- --dry-run` for semi-annual key rotation.

---

## 3. Payments & Checkout
- [ ] **Razorpay Account**: Client account activated at [dashboard.razorpay.com](https://dashboard.razorpay.com).
- [ ] **API Keys Tested**: Run `npm run verify:razorpay` to confirm read access and active processing status.
- [ ] **Webhook Configured**: Configured endpoint `https://your-domain.com/api/payment/webhook` with `RAZORPAY_WEBHOOK_SECRET` in Razorpay dashboard.
- [ ] **Cash on Delivery (COD)**: Configured max order limit (default: ₹5,000) in `store.config.ts`.
- [ ] **Delivery Areas**: Verified pincodes, delivery fees, and minimum order rules in `store.config.ts`.

---

## 4. Administration & Access Control
- [ ] **Super Admin Initialized**: Executed `npm run create-super-admin` with secure administrator email.
- [ ] **Password & 2FA Activated**: Super Admin has logged in at `/super-admin/login`, changed initial password, and scanned TOTP QR code into Google Authenticator or 1Password.
- [ ] **Shopkeeper Admin Account**: Owner account created at `/shop-admin`.
- [ ] **Staff Accounts**: Role-based access configured (`orders_only` or `products_only`) for store attendants.

---

## 5. Security Hardening & Edge Verification
- [ ] **CSP Headers**: Content-Security-Policy checked in production headers (scripts allowed from self + Razorpay checkout).
- [ ] **CORS Rules**: Only authorized client domains allowed for mutating POST/PUT requests.
- [ ] **Rate Limiting**: Middleware limits in place (10 req/15min for auth routes, 5 req/min for order creation).
- [ ] **No Leaks**: Ran GitLeaks scan or verified `.gitleaks.toml` rules.

---

## 6. Performance Budget
- [ ] **Production Build**: Verified with `npm run build` with zero TypeScript or route compilation errors.
- [ ] **Animations Disabled**: Smooth instant UI without heavy cursor/hover animations.
- [ ] **Mobile Performance**: Lighthouse Mobile score ≥ 90 on 4G emulation.

---

## 7. Client Signoff & Handover
- [ ] **Test Order Placed**: Placed end-to-end test order with Razorpay test mode or COD.
- [ ] **Invoice Generated**: Downloaded invoice at `/api/invoices/[orderId]`.
- [ ] **WhatsApp Alert Received**: Verified WhatsApp click-to-chat notification.
- [ ] **Client Agreement**: Client signed freelance maintenance / SLA agreement.
