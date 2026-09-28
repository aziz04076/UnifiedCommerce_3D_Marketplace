# CLIENT_ONBOARDING.md — Shopkeeper Handover Checklist

## Before Handover

### Technical Setup (Freelancer does this)
- [ ] Domain registered in **client's name**
- [ ] Razorpay account created in **client's name** (or help them create it)
- [ ] Razorpay live keys added to `.env.local`
- [ ] Store config (`store.config.ts`) filled with client's real details
- [ ] At least 5 real products added
- [ ] Test payment successful (use Razorpay test mode first)
- [ ] Webhook configured in Razorpay dashboard
- [ ] Logo uploaded to `public/logo.png`
- [ ] All policy pages reviewed by client

### Before Going Live
- [ ] Switch Razorpay from test → live keys
- [ ] Run Lighthouse on mobile — score ≥ 90
- [ ] Test order flow end-to-end: browse → cart → pay → order appears in admin
- [ ] Test WhatsApp link from admin orders page
- [ ] Test order tracking at `/track`

---

## Handover Session (Do This with Client in Person)

### 1. Show Admin Panel (`/shop-admin`)
Walk through every section. Let the client tap through themselves.

### 2. Demo: Add a Product
Client does it themselves — photo from phone, name, price, save. Time it. Should be < 60 seconds.

### 3. Demo: Process an Order
Show orders page, Accept → Pack → Ship flow, WhatsApp button.

### 4. Give Them This Information (Print it out)

```
Store Admin URL:  https://yourdomain.com/shop-admin
Live Store URL:   https://yourdomain.com

Admin Email:    admin@clientshop.com
Admin Password: (give separately — not written here)

Razorpay Dashboard: https://dashboard.razorpay.com
(Payments go directly to your bank account registered in Razorpay)

Your Developer Contact:
Name: [Your Name]
WhatsApp: [Your Number]
Email: [Your Email]
```

### 5. Explain These Important Points (in Hindi if needed)
- Razorpay mein jo bank account diya hai, usi mein paisa aata hai
- Har payment ka receipt Razorpay dashboard mein milta hai
- Admin password kisi ko mat batao — staff ke liye alag account banao
- Agar koi problem ho, developer ko WhatsApp karo

---

## Client's Responsibilities After Handover
- Keep their Razorpay account active and bank details updated
- Review orders at least twice daily
- Update product stock when items run out
- Contact developer for any technical issues

---

## Maintenance Plan (Optional Paid Service)

Offer clients a monthly maintenance package:
- Monthly software updates
- Weekly backup checks
- Priority support response (2 hours)
- Monthly performance report

See `docs/client-agreement-template.md` for pricing template.
