# DEPLOYMENT.md — Deploy a New Store

This guide covers deploying a new UnifiedCommerce store instance for a shopkeeper client.

## Prerequisites

- Node.js 18+, npm 9+
- A Razorpay account (client's own account)
- A domain name (or free subdomain)
- SSL certificate (Let's Encrypt via your hosting provider)

---

## 1. Clone the template

```bash
git clone https://github.com/yourname/unified-commerce-template.git my-client-store
cd my-client-store
npm install
```

---

## 2. Configure the store

Edit `apps/web/store.config.ts`:

```typescript
const config = {
  storeName: 'Client Shop Name',
  phone: '+91-9876543210',
  whatsapp: '919876543210',
  email: 'hello@clientshop.com',
  address: 'Full address',
  theme: 'fashion', // 'fashion' | 'food' | 'electronics' | 'general'
  // ... rest of config
};
```

---

## 3. Set environment variables

Copy `.env.example` to `.env.local`:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in the client's own Razorpay keys (from their Razorpay dashboard):

```
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=XXXXXXXXXXXXXXXXXXXX
ENCRYPTION_KEY=<64 hex chars — generate fresh per client>
```

**Generate encryption key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> ⚠️ Never reuse encryption keys between clients. Never commit `.env.local`.

---

## 4. Build and start (production)

```bash
cd apps/web
npm run build
npm start
```

Or use the Docker Compose method:

```bash
docker compose up -d
```

---

## 5. Configure Razorpay webhook

In the client's Razorpay dashboard → Webhooks → Add new webhook:
- URL: `https://yourdomain.com/api/payment/webhook`
- Secret: same as `RAZORPAY_WEBHOOK_SECRET`
- Events: `payment.captured`, `payment.failed`, `refund.processed`

---

## 6. Custom domain + SSL

Point the client's domain DNS to your server IP, then:

```bash
# Using Caddy (recommended):
caddy reverse-proxy --from yourdomain.com --to localhost:3000
```

Or use your hosting provider's SSL tool (Vercel, Railway, etc. handle this automatically).

---

## 7. Test the deployment

- [ ] Visit the store homepage — loads correctly
- [ ] Make a test payment with Razorpay test key `rzp_test_...`
- [ ] Check order tracking at `/track`
- [ ] Open `/shop-admin` on mobile — big buttons visible
- [ ] Complete setup wizard at `/shop-admin/setup-wizard`
- [ ] Verify security headers: `curl -I https://yourdomain.com | grep -i security`

---

## Docker Compose (one-command deploy)

See `docker-compose.yml` in project root.

---

## Updating an existing store

```bash
git pull origin main
npm install
cd apps/web && npm run build && npm start
```

> Always test on staging before updating production.
