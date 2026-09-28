# UnifiedCommerce — Bank-Grade Security Architecture (SECURITY.md)

This document outlines the threat model, implemented defensive controls, data protection standards, and compliance posture for UnifiedCommerce.

---

## 1. Threat Model & Asset Classification

### High-Value Assets
1. **Payment Transactions & Monetary Integrity**: Preventing client-side price tampering, double-charging on retries, and unauthorized capture.
2. **Personally Identifiable Information (PII)**: Customer physical addresses, phone numbers, email addresses, and tax identifiers (GSTIN).
3. **Vendor & Admin Accounts**: Protecting merchant store settings, bank/crypto payout parameters, and order fulfillment states.
4. **Platform Availability & Reputation**: Mitigating brute force, checkout velocity abuse, and inventory exhaustion attacks.

### Threat Actors & Vectors Mitigated
- **Price Tampering Bots**: Clients attempting to alter item prices or tax amounts via intercepted HTTP requests.
- **Payment Double-Billing**: Duplicate charges caused by network timeouts, browser reloads, or automated retry loops.
- **Replay & Forgery Attacks on Webhooks**: Untrusted HTTP posts masquerading as Stripe or Razorpay notifications.
- **Database Compromise**: Attackers gaining raw access to database backups (mitigated via AES-256-GCM field-level encryption).
- **Credential Stuffing & Brute Force**: Automated dictionary attacks on authentication endpoints.

---

## 2. Payment Security Architecture (PCI-DSS SAQ-A)

### Zero Raw Card Storage
UnifiedCommerce achieves **PCI-DSS SAQ-A** compliance:
- Raw credit/debit card numbers (PAN, CVV, expiry) **never touch our application servers or database**.
- Card entry is handled exclusively via hosted Stripe / Razorpay Elements in sandboxed iframes.
- The server only receives transient tokens (`clientSecret`, `paymentMethodId`).

### Server-Side Price Verification (Zero Client Trust)
- **Problem**: In malicious attacks, clients alter JavaScript variables or HTTP payloads to checkout high-ticket hardware (e.g., ₹249,900) for ₹1.
- **Defensive Control**: The `/api/checkout/create-intent` endpoint **discards client-submitted totals**. It queries the verified database catalog, recalculates the subtotal, validates coupon applicability, computes statutory 18% GST and shipping fees, and compares the result.
- **Enforcement**: If `abs(serverTotal - clientTotal) > ₹1.00`, the transaction is immediately rejected with `400 PRICE_TAMPERING_DETECTED`.

### Idempotency Key Handling
- All payment creation endpoints accept an `Idempotency-Key` HTTP header (UUIDv4).
- The system checks an in-memory TTL cache before executing any payment logic. If the key was already processed within 24 hours, the cached order is returned without contacting the payment gateway or charging the card a second time.

### Webhook Signature Verification
- Incoming payment webhooks at `/api/webhooks/payment` require an HMAC-SHA256 signature header (`x-unified-signature` or `stripe-signature`).
- Verification uses `crypto.timingSafeEqual` to eliminate timing-attack vulnerabilities. Unsigned or mismatched payloads are rejected with `401 Unauthorized`.

### Immutable Payment State Transitions
Every payment lifecycle transition is immutably recorded in the payment audit ledger:
$$\text{INITIATED} \longrightarrow \text{REQUIRES\_ACTION (3DS)} \longrightarrow \text{AUTHORIZED} \longrightarrow \text{CAPTURED} \longrightarrow \text{REFUNDED}$$
Each audit record captures: `orderId`, `amount`, `currency`, `provider`, `transactionRef`, `idempotencyKey`, `verifiedPriceMatch: true`, `clientIp`, and `timestamp`.

---

## 3. Data Protection & Cryptography

### Field-Level PII Encryption at Rest (AES-256-GCM)
Even if database storage is compromised, sensitive personal records cannot be read in plaintext:
- Customer phone numbers and street addresses are encrypted at rest using **AES-256-GCM** (Galois/Counter Mode).
- Each record receives a unique 96-bit Initialization Vector (IV) and a 128-bit authentication tag (`iv:authTag:cipherHex`).
- Decryption occurs only at the application boundary for verified order fulfillment.

### Role-Based Access Control (RBAC)
- **Roles**: `CUSTOMER`, `VENDOR`, `DELIVERY_PARTNER`, `ADMIN`, `SUPER_ADMIN`.
- Authorization is verified at the API route handler, not merely by hiding UI buttons. Customer tokens attempting to mutate vendor listings or payout records are rejected with `403 Forbidden`.

### GDPR Compliance & Data Rights
- **Right to Data Portability (Article 20)**: Implemented via `/api/user/export-data` returning a complete, portable JSON archive of user profile, saved addresses, order history, and consent telemetry.
- **Right to Erasure (Article 17)**: Implemented via `/api/user/delete-account` requiring explicit pass-phrase confirmation (`"DELETE MY DATA PERMANENTLY"`).

---

## 4. API & Application Security (OWASP Top 10)

| Vulnerability | Mitigation Strategy Implemented |
|---|---|
| **A01: Broken Access Control** | Server-side role checks, order ownership verification, strict CORS without wildcard `*`. |
| **A02: Cryptographic Failures** | TLS 1.3 enforced, HSTS preload header, AES-256-GCM field encryption, timing-safe HMAC checks. |
| **A03: Injection** | Strict Zod input schema validation on all POST/PUT routes, parameterized database queries. |
| **A04: Insecure Design** | Idempotency keys, zero-client price trust, velocity fraud shields, immutable audit logging. |
| **A05: Security Misconfiguration** | Next.js HTTP security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`). |
| **A06: Vulnerable Dependencies** | Automated audit checks (`npm audit`), clean build dependencies. |
| **A07: Identification & Auth Failures** | Short-lived access tokens, 3D Secure / SCA step-up authentication on high-value orders (>₹100,000). |
| **A08: Software & Data Integrity** | HMAC-SHA256 signed payment provider webhooks, immutable transaction logs. |
| **A09: Security Logging & Monitoring** | Audit trail endpoint (`/api/security/audit-trail`), payment transition logs. |
| **A10: Server-Side Request Forgery** | Whitelisted remote image origins (`images.unsplash.com` only), no user-supplied outbound fetch URLs. |

---

## 5. Fraud & Velocity Shield

The checkout pipeline evaluates transactions against algorithmic risk triggers:
- **Velocity Tracker**: Flags or blocks IPs submitting more than 5 checkouts within a 15-minute window.
- **Value Step-Up**: Orders exceeding ₹100,000 trigger mandatory **SCA / 3D-Secure** verification before capture.
- **Cross-Border Discrepancy**: Billing country vs. shipping country mismatches increment the risk score.

---

## 6. Phase 5 & 5B: White-Label Freelance Template Hardening

### Multi-Client Isolation & Anti-Hacking Model
1. **Isolated Deployment Strategy**:
   - Each client store runs on its own isolated environment (separate process, database, and encryption keys).
   - Zero risk of cross-tenant data leakage or noisy-neighbor interference.
2. **Strict Origin & Deny-by-Default API Gate**:
   - CORS middleware permits only configured storefront origins (`NEXT_PUBLIC_SITE_URL`).
   - Every mutating endpoint strictly checks payload schemas against Zod models.
   - Non-whitelisted request attributes (e.g., `role: owner`, `isAdmin: true`, price overrides) are stripped before reaching domain logic.
3. **Sliding-Window Rate Limiting**:
   - Authentication routes (`/api/auth/login`, `/api/auth/2fa`): max 10 requests per 15-minute window per IP.
   - Order creation (`/api/payment/create-order`): max 5 requests per minute per IP.
   - Global API gateway: 120 requests per minute per IP.
4. **Account Takeover Protection**:
   - 5 consecutive failed login attempts trigger an automatic 15-minute account lockout.
   - Optional TOTP 2FA (RFC 6238) supported for owner & admin roles.
   - Centralized session revocation (`DELETE /api/auth/sessions?sessionId=all`).
5. **Magic Bytes Content-Type Verification**:
   - File uploads are validated via binary header signature inspection (JPEG: `FF D8 FF`, PNG: `89 50 4E 47`, WebP: `52 49 46 46`, GIF: `47 49 46 38`).
   - Disguised binaries and scripts are rejected before touching storage.

---

## 7. Security Pipeline & Scan Results

| Security Check | Tooling / Implementation | Pass Criteria | Status |
|---|---|---|---|
| **Secret Leak Detection** | Gitleaks (`.gitleaks.toml`) + pre-commit hook | Zero API keys or private certificates in git history | ✅ PASSED |
| **Dependency Vulnerability Audit** | `npm audit` | Zero critical or high severity vulnerabilities | ✅ PASSED |
| **Static Code Analysis (SAST)** | Strict TypeScript compiler + Zod validation | ESLint clean, strict null checks, zero unchecked inputs | ✅ PASSED |
| **Dynamic API Abuse Simulation** | Playwright Attack Suite (`tests/e2e/security.spec.ts`) | Price tampering blocked, brute force tripped (429), fake webhooks rejected | ✅ PASSED |
| **HTTP Security Headers** | Next.js Edge Middleware (`middleware.ts`) | HSTS, CSP, X-Frame-Options DENY, X-Content-Type nosniff | ✅ ENFORCED |
| **Public Vulnerability Disclosure** | `/.well-known/security.txt` | Standardized RFC 9116 reporting channel | ✅ PUBLISHED |

---

## 8. What Is Covered vs. What Is Not

### What IS Covered & Enforced
- ✅ Zero raw credit card storage on application servers (PCI-DSS SAQ-A compliance).
- ✅ Server-side price recalculation from authoritative catalog (tamper-proof).
- ✅ Cryptographic verification of payment provider webhooks (HMAC-SHA256 with `timingSafeEqual`).
- ✅ Webhook replay prevention via processed transaction tracking.
- ✅ Per-IP sliding-window rate limiting on all authentication & transaction endpoints.
- ✅ Account lockout following repeated failed credentials.
- ✅ AES-256-GCM encryption for stored PII records at rest.
- ✅ Secure session cookies (`HttpOnly`, `SameSite=Lax`, `Secure` in production).
- ✅ Truthful customer trust architecture — no fake countdown timers, fake badges, or fake review counts.

### What Is NOT Covered (Client Responsibility Before Production Launch)
- ⚠️ Custom Domain SSL/TLS Certificate renewal (handled by hosting provider / reverse proxy like Caddy).
- ⚠️ Database server network isolation (PostgreSQL/MySQL instance must not be exposed to the public internet).
- ⚠️ Third-party penetration testing and SOC 2 audits for high-volume fiat processing.
- ⚠️ Client-specific legal compliance (local GST registration, privacy policy review by client counsel).

---

## 9. Incident Response Checklist (P1–P4)

In the event of an anomalous security alert or suspected breach:
1. **Immediate Session Termination**: Invoke `DELETE /api/auth/sessions?sessionId=all` to flush all active cookies.
2. **Rotate Payment Credentials**: Revoke and regenerate Razorpay API Keys & Webhook Secrets in the merchant dashboard; update `.env.local`.
3. **Audit Trail Review**: Inspect `/shop-admin` audit logs and server access logs for anomalous client IPs.
4. **Key Rotation**: Rotate `ENCRYPTION_KEY` using the migration script if storage compromise is suspected.
5. **Client Notification**: Contact store owner via phone call or registered emergency contact channel within 60 minutes.
