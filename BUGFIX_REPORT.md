# BUGFIX_REPORT.md — Phase 6 Diagnostic Findings

## 1. Problem A: Super Admin Not Working

### Exact URL / Action
- Route: `/super-admin` and `/api/auth/login`
- Action: Logging in as Super Admin and attempting to manage store deployments, backups, users, vendors, and audit controls.

### Symptoms & Reproduction
1. Accessing `/super-admin` shows a static mock dashboard with hardcoded text and non-functional buttons.
2. In `/api/auth/login/route.ts`, only a hardcoded `DEMO_ADMIN` (`admin@myshop.com` with placeholder `changeme:changeme`) with role `'owner'` exists. There is no `super_admin` role in `lib/auth.ts`.
3. No CLI seed tool (`npm run create-super-admin`) exists to create or seed a super admin.
4. No 2FA enrollment path or forced one-time password reset exists for super admin on first login.
5. Normal customers and unauthenticated users can access `/super-admin` without any role-based route guard or authorization check.

### Root Causes
- **Missing Role**: `apps/web/src/lib/auth.ts` defined `Session['role']` as `'owner' | 'staff_orders' | 'staff_products' | 'admin'`, omitting `super_admin`.
- **Missing Seed/CLI Script**: No CLI script existed to securely initialize the first super-admin account with a cryptographically generated one-time password and force password change/2FA.
- **Unprotected Routes & Missing APIs**: `/super-admin` lacked session verification guards and did not connect to backend store management, backup inspection, or role-based user management endpoints.

---

## 2. Problem B: Collections / Categories Do Not Open

### Exact URL / Action
- Route: `/collections`, `/collections/[slug]`, and `/products?category=[slug]`
- Action: Clicking category cards on the homepage Bento Grid or navigating to collection pages.

### Symptoms & Reproduction
1. Direct navigation to `/collections` or `/collections/cyberpunk-wearables` returns **404 Not Found** because no `/collections` routes were implemented.
2. On the homepage (`ClientMarketplace.tsx`), clicking a category in the Bento grid (`onClick={() => setSelectedCategory(cat.slug)}`) merely sets React state without navigating or scrolling to the product catalog showroom.
3. The main `Navbar.tsx` lacks a dedicated "Collections" navigation link or dropdown.
4. In `CatalogExplorer.tsx`, `selectedCategory` state does not synchronize if query parameters change dynamically without re-mounting.

### Root Causes
- **Missing App Router Routes**: Neither `apps/web/src/app/collections/page.tsx` nor `apps/web/src/app/collections/[slug]/page.tsx` existed in the repository.
- **Disconnected Event Handlers**: Homepage category cards were purely local state setters with no router navigation to dedicated collection pages or URL query sync.
- **Missing Fallback & Resilience**: If an unseeded or empty category is visited, there was no resilient fallback with friendly empty states.

---

## 3. Problem C: Vendor Analytics Does Not Work for Existing Vendors

### Exact URL / Action
- Route: `/vendor/dashboard` (specifically the Analytics, Overview, Products, and Payouts tabs)
- Action: Accessing vendor portal as an existing vendor from the 35 registered catalog vendors (e.g., `vendor-1`, `vendor-2`, ..., `vendor-35`).

### Symptoms & Reproduction
1. `/vendor/dashboard/page.tsx` hardcoded `VENDOR.id = 'vendor-001'` instead of using real vendor context or URL query parameters (`?vendorId=vendor-1`).
2. Products and orders displayed on the dashboard were hardcoded static mocks (`p1`–`p5` and `ord-2841`–`ord-2801`), completely disconnected from the actual 1,024-product catalog and real customer orders.
3. There was no dedicated `/api/vendor/analytics` endpoint to aggregate revenue, orders, AOV, top products, low stock, and time-series GMV from the database.
4. **Crash on Zero Data**: If a new vendor has 0 sales or an empty dataset, `Math.max(...data.map(d => d.gmv))` returns `-Infinity`, and dividing by `max` causes `NaN` or chart crashes.
5. Date range filtering (7d, 30d, 90d, 1y) was non-functional in the UI.

### Root Causes
- **Hardcoded Identifier & Mock Data**: Dashboard did not scope queries to the authenticated/selected vendor ID.
- **Missing Backend Analytics Aggregation**: No endpoint calculated vendor-specific metrics (revenue, orders, AOV, low stock items, top sellers).
- **Zero-Data Unhandled Exceptions**: SVG charts (`LineChart`, `BarChart`, `Gauge`) assumed positive non-zero datasets, failing gracefully when vendors have no historical records.

---

## 4. Security & Environment Hypotheses Checked
- **CSP & Headers**: `middleware.ts` correctly permits necessary local styles and fonts, but must ensure any charts or SVG elements are not blocked.
- **CORS & CSRF**: All mutating endpoints require valid origin headers and Zod payload validation.
- **Environment**: All secrets must be typed and validated via Zod at startup.
