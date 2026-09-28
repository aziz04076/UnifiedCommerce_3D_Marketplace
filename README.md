# 🛍️ UnifiedCommerce — 3D Marketplace & "Online Store in a Box"

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-000?style=flat&logo=turborepo)](https://turbo.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/E2E-Playwright-2ea44f?style=flat&logo=playwright)](https://playwright.dev/)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-90%2B-orange?style=flat&logo=lighthouse)](https://developers.google.com/web/tools/lighthouse)

**UnifiedCommerce** is an enterprise-grade e-commerce marketplace and turnkey white-label **"Online Store in a Box"** template. It is engineered for local merchants, multi-vendor platforms, and freelancers deploying bespoke, lightning-fast digital storefronts for small business clients (clothing, bakeries, electronics, jewelry, stationery, and local services).

---

## 🌟 Key Highlights

- **⚡ Blazing Fast (14ms Average API Latency)**: Zero sluggish cursor/hover lag, mobile-first SSR, and 106+ pre-rendered static routes.
- **🏪 Shopkeeper Admin (Mobile-First Dukandar Panel)**: Bilingual (Hindi/English), 60-second product addition, camera capture, AI descriptions, and 1-click WhatsApp customer alerts.
- **🛍️ Complete Customer Journey**: Bento grid discovery, 35 curated collections, dynamic search & filtering, honest pricing with zero surprise charges, and guest order tracking.
- **📈 Vendor Analytics Portal**: IST timezone sales aggregation, AOV calculation, vendor switching, date filters (`7d`, `30d`, `90d`, `1y`), and zero-division math protections.
- **🛡️ Bank-Grade Security & 2FA**: Scrypt password hashing with individual salts, RFC 6238 TOTP two-factor authentication, account lockout protection, and strict Content Security Policy (CSP).
- **🔒 Safe Secrets Management**: **Zero Fake Keys Policy**. The platform never guesses or hardcodes third-party API keys. Automatic, graceful fallback to Cash on Delivery (COD) when payment keys are absent.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js ≥ 18.0.0
- npm ≥ 9.0.0

### 2. Installation
```bash
git clone https://github.com/aziz04076/UnifiedCommerce_3D_Marketplace.git
cd UnifiedCommerce_3D_Marketplace
npm install
```

### 3. Store Configuration & Local Key Generation
Run the interactive setup wizard to configure store branding, generate local 256-bit AES cryptographic keys, and set payment options safely:
```bash
npm run setup
```

### 4. Verify Your Environment
Run the automated pre-flight audit to verify your `.env.local` configuration and detect any issues:
```bash
npm run check:env
```

### 5. Seed Super Administrator
Create your master administrative account with a cryptographically secure password:
```bash
npm run create-super-admin
```

### 6. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Operational CLI Commands

| Command | Description |
| :--- | :--- |
| `npm run setup` | Interactive store setup wizard for non-technical shopkeepers |
| `npm run check:env` | Pre-flight environment variable audit with secret masking |
| `npm run verify:razorpay` | Safe, read-only Razorpay gateway verification (no charge created) |
| `npm run rotate-key` | Rotates the 256-bit AES encryption key with dry-run support |
| `npm run smoke` | Pre-flight smoke test verifying 23 routes against HTTP 500 errors |
| `npm run create-super-admin` | Seeds or resets the Super Admin identity |
| `npm run build` | Full monorepo production build via Turborepo |
| `npx playwright test` | End-to-end browser test suite (Super Admin, Collections, Analytics) |

---

## 🧭 Application Routes

### Customer Storefront
- **Home**: [`/`](http://localhost:3000/)
- **Catalog Explorer**: [`/products`](http://localhost:3000/products)
- **Collections Directory**: [`/collections`](http://localhost:3000/collections)
- **Cart**: [`/cart`](http://localhost:3000/cart)
- **Checkout & Address Book**: [`/checkout`](http://localhost:3000/checkout)
- **Order Tracking**: [`/track`](http://localhost:3000/track)

### Shopkeeper Admin
- **Dashboard**: [`/shop-admin`](http://localhost:3000/shop-admin)
- **Order State Machine**: [`/shop-admin/orders`](http://localhost:3000/shop-admin/orders)
- **Catalog Management**: [`/shop-admin/products`](http://localhost:3000/shop-admin/products)
- **Quick Product Add**: [`/shop-admin/products/add`](http://localhost:3000/shop-admin/products/add)
- **Staff Accounts**: [`/shop-admin/staff`](http://localhost:3000/shop-admin/staff)
- **Setup Wizard**: [`/shop-admin/setup-wizard`](http://localhost:3000/shop-admin/setup-wizard)

### Vendor Portal
- **Vendor Overview**: [`/vendor`](http://localhost:3000/vendor)
- **Vendor Real-Time Analytics**: [`/vendor/dashboard`](http://localhost:3000/vendor/dashboard)

### Super Admin Control Panel
- **Login Portal**: [`/super-admin/login`](http://localhost:3000/super-admin/login)
- **Telemetry & Backups**: [`/super-admin`](http://localhost:3000/super-admin)

---

## 🏛️ Architecture & Documentation

- [**System Architecture (`ARCHITECTURE.md`)**](./ARCHITECTURE.md): Full 6-tier visual architecture, data flows, and sequence diagrams.
- [**Feature Matrix (`FEATURE_STATUS.md`)**](./FEATURE_STATUS.md): Role × Feature inventory and offline fallback behaviors.
- [**Go-Live Checklist (`GO_LIVE_CHECKLIST.md`)**](./GO_LIVE_CHECKLIST.md): Step-by-step production launch runbook for freelancers.
- [**Bugfix Report (`BUGFIX_REPORT.md`)**](./BUGFIX_REPORT.md): Root-cause diagnoses and resolutions for Super Admin, Collections, and Analytics.
- [**Security Policy (`SECURITY.md`)**](./SECURITY.md): Threat model, CSRF, rate limits, and encryption specifications.

---

## 📄 License
Private & Proprietary — Built with UnifiedCommerce. All rights reserved.
