# API_INVENTORY.md — Third-Party API Inventory

> Every external service used by UnifiedCommerce. Each client store should have its own accounts for all services listed here.

## Format

| Field | Description |
|-------|-------------|
| Purpose | What this API is used for |
| Account Owner | Who owns the account (client / freelancer) |
| Scopes | Permissions granted |
| Keys Location | Where keys are stored |
| Test vs Live | Current environment |
| Rotation Date | Last key rotation |
| Cost/Limits | Pricing / rate limits |
| Fallback | What happens if this service fails |

---

## 1. Razorpay — Payment Processing

| Field | Value |
|-------|-------|
| **Purpose** | Accept UPI, card, netbanking, wallet payments; process refunds |
| **Account Owner** | **CLIENT** — each store has its own Razorpay account. Money goes directly to client's bank. |
| **Scopes** | Create orders, capture payments, issue refunds, receive webhooks |
| **Keys Location** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` in `.env.local` (never in code) |
| **Frontend** | `RAZORPAY_KEY_ID` only (publishable). Secret key never in browser. |
| **Test vs Live** | Test keys during development. Live keys on production. |
| **Rotation Date** | Set when onboarding. Rotate if compromised. |
| **Cost** | 2% per transaction. No monthly fee. |
| **Rate Limits** | Generous — no hard limit for normal store volumes |
| **Fallback** | COD (Cash on Delivery) available as backup payment method |
| **Official Docs** | https://razorpay.com/docs |
| **Dashboard** | https://dashboard.razorpay.com |

---

## 2. Unsplash — Product Placeholder Images

| Field | Value |
|-------|-------|
| **Purpose** | Demo/placeholder product images only (not production) |
| **Account Owner** | Demo only — no account needed for direct links |
| **Scopes** | Public image access |
| **Keys Location** | No keys — uses public CDN URLs |
| **Test vs Live** | Demo use only |
| **Cost** | Free for demo |
| **Fallback** | Use local images in `public/images/` |
| **Note** | In production, all product images are uploaded by shopkeeper and served from hosting provider |

---

## 3. WhatsApp (wa.me) — Customer Notifications

| Field | Value |
|-------|-------|
| **Purpose** | Order alerts to shopkeeper, status updates to customers |
| **Account Owner** | No account needed — uses deep-link (wa.me) |
| **Scopes** | Opens WhatsApp app with pre-filled message |
| **Keys Location** | None — phone number from `store.config.ts` |
| **Test vs Live** | Always live |
| **Cost** | Free |
| **Limits** | None (user-initiated opens) |
| **Fallback** | SMS or email (not currently implemented) |
| **Business API** | Not used. WhatsApp Business API requires Meta approval and is a paid service. |

---

## 4. Google Maps — Store Location (Contact Page)

| Field | Value |
|-------|-------|
| **Purpose** | Show store location on contact page |
| **Account Owner** | No API key needed — uses public maps.google.com URL |
| **Scopes** | Public map embed |
| **Keys Location** | None — plain URL in `store.config.ts` |
| **Cost** | Free (no API key = no embed API) |
| **Fallback** | Plain text address |

---

## 5. Next.js / Vercel Analytics (Optional)

| Field | Value |
|-------|-------|
| **Purpose** | Page performance monitoring |
| **Account Owner** | Freelancer (or client if they prefer) |
| **Scopes** | Web vitals, page views |
| **Keys Location** | `NEXT_PUBLIC_ANALYTICS_ID` in `.env.local` |
| **Cost** | Free tier available |
| **Status** | Not currently enabled |

---

## 6. Sentry — Error Monitoring (Optional)

| Field | Value |
|-------|-------|
| **Purpose** | Capture and alert on server-side errors |
| **Account Owner** | Freelancer (monitor all clients) OR per-client account |
| **Scopes** | Error reporting only |
| **Keys Location** | `SENTRY_DSN` in `.env.local` |
| **Cost** | Free tier: 5k errors/month |
| **Status** | Not currently enabled |

---

## Key Rotation Schedule

| Key | Rotation Trigger | Rotation Method |
|-----|-----------------|-----------------|
| Razorpay Key Secret | If compromised, or annually | Razorpay dashboard → Regenerate key |
| ENCRYPTION_KEY | If compromised | Must re-encrypt all stored data |
| Session secret | Quarterly | Restart app with new value |

---

## What Is NOT Used

| Service | Why Not Used |
|---------|-------------|
| Shared/cracked API keys | Never. Each client uses official, own-account keys. |
| OpenAI (production) | AI description is a demo stub. No real API call. |
| Firebase | Not used — own auth system. |
| Stripe | Not used — Razorpay is primary for India. |
| SMS/OTP providers | Not currently active. COD OTP is feature-flagged off. |

---

> ⚠️ This inventory must be updated whenever a new third-party service is added.
> The freelancer is responsible for ensuring every service is in official, client-owned accounts before going live.
