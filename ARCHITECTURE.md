# 🏗️ UnifiedCommerce System Architecture

Welcome to the architectural specification for **UnifiedCommerce**, a modern, high-performance e-commerce platform and white-label "Online Store in a Box" engineered for local merchants, multi-vendor marketplaces, and freelance deployments.

---

## 1. High-Level Architectural Diagram

```mermaid
graph TD
    subgraph Clients["1. Client Layer"]
        Customer["🛍️ Customer Storefront<br/>(Mobile & Desktop Web)"]
        Shopkeeper["🏪 Shopkeeper Admin<br/>(Mobile-First / Dukandar)"]
        Vendor["📈 Vendor Portal<br/>(Analytics & Logistics)"]
        SuperAdmin["🛡️ Super Admin Control Panel<br/>(Multi-Store Telemetry)"]
    end

    subgraph Edge["2. Edge & Security Boundary"]
        MW["🛡️ Edge Middleware<br/>(Rate Limiting, CSP, CORS, Security Headers)"]
    end

    subgraph AppLayer["3. Application Core (Next.js 14 App Router)"]
        Pages["📄 SSR / SSG Page Components<br/>(Tailwind CSS, Zero-Jank Rendering)"]
        APIs["⚡ Route Handlers<br/>(/api/payment, /api/auth, /api/vendor, /api/health)"]
        AuthModule["🔐 Auth & Session Engine<br/>(Scrypt, RFC 6238 TOTP, Lockout Shield)"]
        CryptoModule["🔑 Crypto Engine<br/>(AES-256-GCM, Safe Ephemeral Fallback)"]
    end

    subgraph ServiceLayer["4. Core Services & Domain Logic"]
        OrderMachine["📦 Order State Machine<br/>(New → Accepted → Packed → Shipped → Delivered)"]
        AnalyticsEngine["📊 Analytics Engine<br/>(IST Scoped Time-Series, Zero-Division Guard)"]
        IdempotencyService["🔁 In-Memory / Redis Idempotency Store"]
        AWBService["🚚 AWB Generator & Carrier Simulator"]
    end

    subgraph Persistence["5. Persistence & Data Tier"]
        DB["🗄️ In-Memory / Relational DB<br/>(1,024+ SKU Catalog, Vendors, Categories)"]
        AdminStore["👤 Admin Identity Store<br/>(Hashed Credentials, Encrypted 2FA Secrets)"]
    end

    subgraph External["6. External Gateways & Integrations"]
        Razorpay["💳 Razorpay Payment Gateway<br/>(UPI, Cards, NetBanking, HMAC Webhooks)"]
        WhatsApp["💬 WhatsApp API / wa.me Links"]
        Logistics["🚛 Carrier Logistics Webhooks"]
    end

    Customer --> MW
    Shopkeeper --> MW
    Vendor --> MW
    SuperAdmin --> MW

    MW --> Pages
    MW --> APIs

    APIs --> AuthModule
    APIs --> CryptoModule
    APIs --> OrderMachine
    APIs --> AnalyticsEngine
    APIs --> IdempotencyService
    APIs --> AWBService

    OrderMachine --> DB
    AnalyticsEngine --> DB
    AuthModule --> AdminStore

    APIs --> Razorpay
    APIs --> WhatsApp
    AWBService --> Logistics
```

---

## 2. Monorepo Organization (Turborepo)

UnifiedCommerce is organized as a modular monorepo using **Turborepo** and npm workspaces:

```text
UnifiedCommerce/
├── apps/
│   └── web/                                # Next.js 14 App Router application
│       ├── store.config.ts                 # White-label store configuration
│       ├── src/
│       │   ├── app/                        # Next.js App Router (Pages & APIs)
│       │   │   ├── (storefront)/           # Customer pages: /, /products, /collections, /cart, /checkout
│       │   │   ├── shop-admin/             # Mobile-first Dukandar shopkeeper admin
│       │   │   ├── vendor/                 # Vendor dashboard & real-time analytics
│       │   │   ├── super-admin/            # Super administrator control panel
│       │   │   └── api/                    # REST route handlers
│       │   ├── components/                 # React UI widgets (Razorpay, Cart, BentoGrid)
│       │   ├── lib/                        # Business logic, crypto, auth, store config, env validator
│       │   ├── themes/                     # Dynamic industry themes (fashion, food, electronics, general)
│       │   └── middleware.ts               # Security headers, rate limiting, and CORS
├── packages/
│   ├── database/                           # 1,024+ SKU catalog, categories, mock database & generator
│   ├── types/                              # Core TypeScript shared domain interfaces
│   └── ui/                                 # Reusable UI component library (Navbar, Footer, Badges)
├── scripts/                                # Production CLI operations & automation
│   ├── setup-store.js                      # Interactive store setup wizard (`npm run setup`)
│   ├── check-env.js                        # Pre-flight environment audit (`npm run check:env`)
│   ├── verify-razorpay.js                  # Safe read-only Razorpay gateway ping (`npm run verify:razorpay`)
│   ├── rotate-encryption-key.js            # 256-bit AES key rotation (`npm run rotate-key`)
│   ├── smoke-test.js                       # 23-route latency and crash test (`npm run smoke`)
│   └── create-super-admin.js               # CLI administrator seed (`npm run create-super-admin`)
├── tests/
│   └── e2e/                                # Playwright automated E2E test specs
├── ARCHITECTURE.md                         # This architecture specification
├── FEATURE_STATUS.md                       # Role × Feature status and fallback matrix
├── GO_LIVE_CHECKLIST.md                    # Client handover and deployment checklist
└── BUGFIX_REPORT.md                        # Root cause diagnosis and repair report
```

---

## 3. Security & Cryptographic Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Super Admin
    participant Gateway as Edge Middleware
    participant Route as /api/auth/login
    participant AdminStore as admin-users-store
    participant Crypto as Crypto Engine

    Admin->>Gateway: POST /api/auth/login { email, password }
    Gateway->>Gateway: Enforce Rate Limit (10 req / 15 min)
    Gateway->>Route: Forward Request
    Route->>AdminStore: Lookup Admin by Email
    AdminStore-->>Route: Admin Record (Password Hash, Salt)
    Route->>Crypto: verifyPassword (scrypt, timingSafeEqual)
    Crypto-->>Route: Valid Match
    Route->>Route: Clear Failed Attempts
    Route-->>Admin: Issue Session Cookie (HttpOnly, SameSite=Lax, Secure)
    Note over Admin,Route: If first login: Enforce Password Reset & TOTP 2FA Setup
```

### Security Measures:
1. **Zero Fake Keys Policy**:
   - The application strictly refuses to generate or hardcode third-party API keys (Razorpay, Stripe, etc.).
   - Only local cryptographic secrets (`ENCRYPTION_KEY`, session secrets) are script-generated.
   - Missing payment credentials trigger an automatic, graceful fallback to **Cash on Delivery (COD)** without application errors.
2. **Content Security Policy (CSP)**:
   - Whitelists only necessary origins: `'self'`, `https://checkout.razorpay.com`, `https://api.razorpay.com`.
   - `frame-ancestors 'none'` prevents clickjacking attacks.
   - Strict `Permissions-Policy` and `X-Content-Type-Options: nosniff`.
3. **Password Security**:
   - Scrypt-based password hashing with individual 16-byte random salts.
   - Timing-safe buffer equality comparisons to prevent side-channel timing attacks.
4. **Account Lockout Protection**:
   - Automatically locks accounts for 15 minutes after 5 consecutive failed authentication attempts.

---

## 4. Payment & Checkout Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Customer
    participant Checkout as /checkout
    participant API as /api/payment/create-order
    participant Recalc as Server Pricing Engine
    participant RZP as Razorpay API
    participant WH as /api/payment/webhook

    Buyer->>Checkout: Click Place Order
    Checkout->>API: POST { cartItems, deliveryPincode, idempotencyKey }
    API->>API: Check Idempotency Store (Prevent double billing)
    API->>Recalc: Recalculate Subtotal + Pincode Delivery Fee
    Note over Recalc: Never trust client-side prices
    alt Razorpay Configured
        API->>RZP: POST /v1/orders (paise amount)
        RZP-->>API: { id: "order_xyz", amount: 129900 }
        API-->>Checkout: Return Razorpay Order ID + Key ID
        Checkout->>Buyer: Open Razorpay UPI/Cards Modal
        Buyer->>RZP: Authorize Payment
        RZP->>WH: POST /api/payment/webhook (HMAC Signature)
        WH->>WH: Verify timingSafeEqual HMAC-SHA256
        WH->>WH: Mark Order as Paid (Idempotent Event Log)
    else COD Only Mode
        API-->>Checkout: Confirm COD Order (Under max limit)
        Checkout->>Buyer: Redirect to Order Confirmation
    end
```

---

## 5. Performance Budget & Rendering Strategy

- **Zero Cursor / Hover Animations**: All decorative, laggy cursor animations and excessive 3D canvas listeners have been replaced with GPU-accelerated Tailwind transitions for snappy interactions on low-spec mobile devices.
- **SSG & ISR**: Product collections, detail pages, and static trust pages are pre-rendered into static HTML (`next build` generates 106+ pages).
- **Latency**: API route response time averages **14ms** across core endpoints.
- **Lighthouse Budget**: Mobile score ≥ 90 on 4G throttling.

---

## 6. Operational Runbook

```bash
# 1. Initialize store identity & local crypto keys
npm run setup

# 2. Audit environment variables & configurations
npm run check:env

# 3. Verify Razorpay credentials (read-only safe ping)
npm run verify:razorpay

# 4. Seed initial Super Administrator account
npm run create-super-admin

# 5. Build and verify production bundle
npm run build

# 6. Execute automated route smoke test
npm run smoke

# 7. Run Playwright E2E browser tests
npx playwright test
```
