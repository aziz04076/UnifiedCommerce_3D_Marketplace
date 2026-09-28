# Usability Test Script — 10 Tasks for Non-Technical Shopkeeper

## Instructions for Test Facilitator

**Before the test:**
- Set up the store on a real phone (not emulator)
- Use a phone similar to what the shopkeeper uses daily (mid-range Android preferred)
- Do NOT help the shopkeeper during tasks — observe only
- Note: time taken, where they get confused, what they say

**During the test:**
- Say: "Please use this store as if it's your own. I won't help you — just try your best."
- Record which tasks succeed, which fail, and any confusion points

---

## Task 1 — Browse the Store

**Hindi:** "Phone pe store kholo aur koi ek product dhundho."
**English:** Open the store on your phone and find any one product.

**URL:** `https://yourdomain.com`
**Pass criteria:** Reaches a product detail page within 2 minutes
**Time limit:** 3 minutes

---

## Task 2 — Add to Cart and Checkout

**Hindi:** "Koi bhi product cart mein dalo aur checkout tak jao."
**English:** Add any product to cart and reach the checkout page.

**Pass criteria:** Reaches checkout page
**Time limit:** 3 minutes

---

## Task 3 — Log in to Admin Panel

**Hindi:** "Admin panel mein login karo: [URL/shop-admin] — email aur password diya gaya hai."
**English:** Log in to the admin panel using provided credentials.

**URL:** `https://yourdomain.com/shop-admin`
**Pass criteria:** Successfully logs in and sees the dashboard
**Time limit:** 2 minutes

---

## Task 4 — Find and Accept a New Order

**Hindi:** "Ek naya order hai. Use dhundho aur accept karo."
**English:** Find the new order and accept it.

**URL:** `/shop-admin/orders`
**Pass criteria:** Changes order status from "New" to "Accepted"
**Time limit:** 2 minutes

---

## Task 5 — Add a New Product (< 60 seconds)

**Hindi:** "Ek naya product dalo — photo khecho, naam aur price likho, save karo."
**English:** Add a new product: take a photo, enter name and price, save.

**URL:** `/shop-admin/products/add`
**Pass criteria:** Completes product save with at least name and price
**Time limit:** 2 minutes (target < 60 seconds)

---

## Task 6 — WhatsApp a Customer

**Hindi:** "Orders page mein jao aur kisi customer ko WhatsApp karo."
**English:** Go to orders page and send a WhatsApp message to a customer.

**Pass criteria:** WhatsApp opens with pre-filled message
**Time limit:** 1 minute

---

## Task 7 — Check Stock Levels

**Hindi:** "Products mein dekho — kaunse items ka stock kam hai?"
**English:** Check which products are low on stock.

**URL:** `/shop-admin/products`
**Pass criteria:** Identifies at least one low-stock or out-of-stock item
**Time limit:** 2 minutes

---

## Task 8 — Navigate to Setup Wizard

**Hindi:** "Store ka naam ya theme change karna hai — kahan se karein?"
**English:** You want to change the store name or theme — where do you go?

**Pass criteria:** Reaches `/shop-admin/setup-wizard`
**Time limit:** 2 minutes

---

## Task 9 — Track an Order (Customer view, No Login)

**Hindi:** "Customer hoke apna order track karo. Order ID: ORD-001, Phone: 9876543210."
**English:** As a customer, track your order. Use Order ID: ORD-001, Phone: 9876543210.

**URL:** `https://yourdomain.com/track`
**Pass criteria:** Sees order status and timeline
**Time limit:** 2 minutes

---

## Task 10 — Contact the Store

**Hindi:** "Store ka WhatsApp number kahan milega?"
**English:** Where can you find the store's WhatsApp number?

**Pass criteria:** Reaches `/contact` page and finds WhatsApp button
**Time limit:** 1 minute

---

## Scoring

| Tasks Completed | Result |
|----------------|--------|
| 10/10 | ✅ Excellent — ready for client |
| 8–9/10 | ⚠️ Good — fix failing tasks |
| < 8/10 | ❌ Not ready — redesign confusing flows |

## Notes Section (Fill During Test)

| Task | Time Taken | Pass/Fail | Confusion Points |
|------|------------|-----------|-----------------|
| 1 — Browse | | | |
| 2 — Cart/Checkout | | | |
| 3 — Admin Login | | | |
| 4 — Accept Order | | | |
| 5 — Add Product | | | |
| 6 — WhatsApp | | | |
| 7 — Stock Check | | | |
| 8 — Setup Wizard | | | |
| 9 — Order Tracking | | | |
| 10 — Contact | | | |

**Overall notes:**

**What to fix before handover:**
