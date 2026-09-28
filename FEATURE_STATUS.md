# 📋 UnifiedCommerce — Complete Feature Audit & Status Matrix

This document provides a comprehensive audit of all platform capabilities across all user roles, detailing current operational status, route and component paths, and resilient fallback behaviors when external dependencies (Redis, OpenAI, Razorpay, etc.) are absent.

**Audit Timestamp**: September 2026  
**Stack**: Next.js 14.2.5 (App Router), TypeScript, Tailwind CSS, Turbo, Scrypt, Web Crypto.

---

## 1. Role × Feature Status Matrix

| Role | Feature / Capability | Route / Path | Status | Dependency & Fallback Behavior |
| :--- | :--- | :--- | :---: | :--- |
| **Customer** | Homepage Bento & Hero Showcase | `/` | **WORKING** | Pure SSR + client hydration; zero 3D overhead. |
| **Customer** | Product Catalog & Search | `/products` | **WORKING** | In-memory 1,024+ SKU database fallback if DB is offline. |
| **Customer** | Marketplace Collections / Categories | `/collections`, `/collections/[slug]` | **WORKING** | 35 pre-generated categories; resilient `FolderX` card fallback on empty. |
| **Customer** | Product Detail & Specifications | `/products/[slug]` | **WORKING** | Server rendered; instant loading with full trust badges. |
| **Customer** | Shopping Cart & Quantity Controls | `/cart` | **WORKING** | LocalStorage + React Context; instant updates without server wait. |
| **Customer** | Checkout & Address Management | `/checkout` | **WORKING** | Validates Indian pincodes, phone numbers; zero surprise fees. |
| **Customer** | Razorpay Online Payment | `/api/payment/create-order` | **NOT CONFIGURED** | Needs real keys from Razorpay dashboard; safely falls back to COD. |
| **Customer** | Cash on Delivery (COD) Checkout | `/checkout`, `/api/payment/create-order` | **WORKING** | In-process idempotency check; enforces max order limit (₹5,000). |
| **Customer** | Guest Order Tracking | `/track` | **WORKING** | Lookup by Order ID + Phone; deep links to WhatsApp support. |
| **Customer** | Order Invoice Print / Download | `/api/invoices/[orderId]` | **WORKING** | Generates clean printable HTML invoice with GSTIN & business details. |
| **Customer** | Policy & Trust Pages | `/about`, `/contact`, `/privacy`, `/terms` | **WORKING** | Static pre-rendered pages with honest, transparent shop terms. |
| **Shopkeeper** | Mobile-First Shopkeeper Dashboard | `/shop-admin` | **WORKING** | Bilingual (Hindi/English), quick action cards, WhatsApp dev support link. |
| **Shopkeeper** | Real-Time Order Management | `/shop-admin/orders` | **WORKING** | Order state machine (New → Accept → Pack → Ship → Deliver) + 1-click WhatsApp alerts. |
| **Shopkeeper** | Product Catalog & Quick Add | `/shop-admin/products`, `/shop-admin/products/add` | **WORKING** | 60-second product addition, camera upload, AI auto-description generator. |
| **Shopkeeper** | Bulk Catalog Import (CSV/Excel) | `/shop-admin/products` | **WORKING** | Client-side CSV parser with sample template download. |
| **Shopkeeper** | Role-Based Staff Management | `/shop-admin/staff` | **WORKING** | Granular roles (`orders_only`, `products_only`, `owner`). |
| **Shopkeeper** | Interactive Store Setup Wizard | `/shop-admin/setup-wizard` | **WORKING** | 8-step visual walkthrough for non-technical shop owners. |
| **Vendor** | Vendor Dashboard Overview | `/vendor/dashboard` | **WORKING** | Dynamic vendor switcher (`vendor-1` to `vendor-5`, `vendor-empty`); zero-data protected. |
| **Vendor** | Real-Time Analytics & GMV Timeseries | `/api/vendor/analytics`, `/vendor/dashboard` | **WORKING** | Scoped by vendor ID, IST timezone aggregation, date filters (7d/30d/90d/1y). |
| **Vendor** | Escrow & Dual-Rail Payout Ledger | `/vendor/dashboard` | **WORKING** | Real-time available balance vs escrow buffer; NEFT & USDC tracking. |
| **Vendor** | AirWaybill (AWB) & Logistics Simulator | `/vendor/dashboard` | **WORKING** | Instant AWB generation with printable label and carrier webhook simulator. |
| **Vendor** | AI Listing & Price Intelligence | `/vendor/dashboard` | **WORKING** | Rule-based heuristic fallback when OpenAI API key is unset. |
| **Super Admin** | Seed Admin CLI Utility | `scripts/create-super-admin.js` | **WORKING** | Interactive terminal tool; generates 18-char random password and scrypt hash. |
| **Super Admin** | Secure Super Admin Login | `/super-admin/login` | **WORKING** | Scrypt hash verification, lockout after 5 failed attempts, timing-safe compare. |
| **Super Admin** | Mandatory First-Login 2FA Setup | `/api/auth/setup-admin` | **WORKING** | RFC 6238 TOTP QR code generation + min 12-char password enforcement. |
| **Super Admin** | Master Control Panel | `/super-admin` | **WORKING** | Multi-store health monitoring, DB backups, audit logs, gateway refund trigger. |
| **Security** | Rate Limiter Middleware | `apps/web/src/middleware.ts` | **WORKING** | In-memory sliding window fallback; protects auth, order creation, and webhooks. |
| **Security** | Content Security Policy & Headers | `apps/web/src/middleware.ts` | **WORKING** | Strict CSP (whitelists self + Razorpay checkout), HSTS, no-sniff, clickjacking DENY. |
| **Security** | AES-256 Data-at-Rest Encryption | `apps/web/src/lib/encryption.ts` | **WORKING** | Uses 64-hex `ENCRYPTION_KEY`; safe ephemeral fallback in dev mode. |
| **Security** | Environment Validator | `apps/web/src/lib/env-validator.ts` | **WORKING** | Strict Zod validation; detects placeholders, warns in dev, hard errors in prod. |
| **Ops / CI** | Pre-Flight Environment Audit | `scripts/check-env.js` | **WORKING** | Masks secrets, validates formats, detects mixed test/live credentials. |
| **Ops / CI** | Read-Only Payment Gateway Ping | `scripts/verify-razorpay.js` | **WORKING** | Validates Razorpay API credentials without charging real cards. |
| **Ops / CI** | Encryption Key Rotation Utility | `scripts/rotate-encryption-key.js` | **WORKING** | Supports `--dry-run`, automated backups, and re-encrypts stored TOTP secrets. |
| **Ops / CI** | Production Smoke Test | `scripts/smoke-test.js` | **WORKING** | Verifies 23 critical routes for HTTP 200/307 and logs average latencies. |

---

## 2. Dependency Resilience & Fallback Specifications

### Razorpay API (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`)
- **When Configured**: Customer can pay via UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards, and NetBanking.
- **When Unconfigured or Blank**: Online payment option is cleanly hidden in checkout; store operates smoothly with **Cash on Delivery (COD)**. No crash, no 500 error.
- **Verification**: Run `npm run verify:razorpay`.

### Cryptographic Key (`ENCRYPTION_KEY`)
- **When Configured (64 Hex Characters)**: Uses standard AES-256-GCM authenticated encryption for sensitive database and TOTP secrets.
- **In Dev Mode without Key**: Emits a yellow warning at server startup and uses an ephemeral, non-persisted test key so development is never blocked.
- **In Production Mode without Key**: Startup throws a hard error with explicit generation command (`npm run setup`).

### Redis Cache & Queue
- **When Redis is Connected**: Uses distributed sliding window rate limiting and distributed session store.
- **When Redis is Offline**: Transparently falls back to in-memory sliding window rate limiter and in-process job queue (`job-queue.ts`).

### AI Features (OpenAI / Claude)
- **When API Key is Set**: Provides dynamic copywriting and image analysis.
- **When API Key is Unset**: Uses deterministic heuristic copy templates and statistical price recommendations without error.

---

## 3. Summary of Resolved Issues in Phase 6
1. **Super Admin**: Fixed completely. Created seed CLI script, scrypt authentication, 2FA QR code generator, and full multi-tab control panel with telemetry and DB backup downloads.
2. **Collections & Categories**: Fixed completely. Added `/collections` directory and `/collections/[slug]` category view with static generation, category badges, empty states, and navbar/bento grid links.
3. **Vendor Analytics**: Fixed completely. Created idempotent analytics migration engine, dynamic `/api/vendor/analytics` endpoint, vendor selector dropdown, date range pills (`7d`, `30d`, `90d`, `1y`), and zero-data division-by-zero protection.
4. **Safe Secret Management**: Fixed completely. Replaced all random/fake API key risks with guided setup (`npm run setup`), pre-flight checks (`npm run check:env`), read-only Razorpay verification (`npm run verify:razorpay`), key rotation (`npm run rotate-key`), and `GO_LIVE_CHECKLIST.md`.
