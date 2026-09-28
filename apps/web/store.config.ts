import type { StoreConfig } from './src/lib/store-config';

/**
 * Central configuration for this store instance.
 * Edit this file to customise your store before going live.
 * All values are validated at startup — missing required fields throw an error.
 */
const config: StoreConfig = {
  // ── Identity ──────────────────────────────────────────────────────────────
  storeName: 'My Shop',
  storeTagline: 'Quality products, delivered fast.',
  logoUrl: '/logo.png',          // place your logo in public/
  faviconUrl: '/favicon.ico',

  // ── Contact ───────────────────────────────────────────────────────────────
  phone: '+91-9999999999',
  whatsapp: '919999999999',      // digits only, no + or spaces
  email: 'hello@myshop.com',
  address: '123 Market Street, City, State - 000000',
  googleMapsUrl: 'https://maps.google.com/?q=My+Shop',

  // ── Business ──────────────────────────────────────────────────────────────
  gstin: '',                     // optional — leave empty if not registered
  invoicePrefix: 'INV',          // invoices will be INV-0001, INV-0002 …
  currency: 'INR',
  currencySymbol: '₹',

  // ── Branding ──────────────────────────────────────────────────────────────
  theme: 'general',              // 'fashion' | 'food' | 'electronics' | 'general'
  primaryColor: '#2563eb',       // hex
  accentColor: '#f59e0b',        // hex
  fontFamily: 'Inter, sans-serif',
  darkMode: true,

  // ── Locale ────────────────────────────────────────────────────────────────
  language: 'en',               // 'en' | 'hi'
  timezone: 'Asia/Kolkata',

  // ── Delivery ──────────────────────────────────────────────────────────────
  deliveryAreas: [
    { name: 'City Centre',  pincode: '000001', deliveryFee: 0,   minOrder: 0,   etaDays: 1 },
    { name: 'Suburbs',      pincode: '000002', deliveryFee: 40,  minOrder: 200, etaDays: 2 },
    { name: 'Outskirts',    pincode: '000003', deliveryFee: 80,  minOrder: 500, etaDays: 3 },
  ],
  defaultDeliveryFee: 50,
  freeDeliveryAbove: 999,       // set to 0 to disable free delivery

  // ── Payments ──────────────────────────────────────────────────────────────
  payments: {
    razorpay: {
      enabled: true,
      // These are TEST keys — replace with live keys per client
      keyId: process.env.RAZORPAY_KEY_ID ?? '',
      keySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? '',
    },
    cod: {
      enabled: true,
      maxOrderAmount: 5000,      // COD not offered above this amount
      requirePhoneOtp: false,    // enable after setting up SMS provider
    },
  },

  // ── Policies (shown to customers) ─────────────────────────────────────────
  policies: {
    returnDays: 7,
    returnPolicy: 'Items can be returned within 7 days of delivery in original condition.',
    shippingPolicy: 'Orders are dispatched within 1–2 business days.',
    privacyPolicy: 'We collect only the information needed to process your order.',
    termsOfService: 'By placing an order you agree to our terms and conditions.',
    cancellationPolicy: 'Orders can be cancelled before dispatch. After dispatch, initiate a return.',
  },

  // ── Feature Flags ─────────────────────────────────────────────────────────
  features: {
    mode: 'lite',               // 'lite' (default, fast) | 'pro' (3D, AI)
    ai: false,
    threeDee: false,
    multiVendor: false,
    wishlist: true,
    reviews: true,
    orderTracking: true,
    whatsappNotifications: true,
    staffAccounts: true,
    bulkImport: true,
    guestCheckout: true,
  },

  // ── Social ────────────────────────────────────────────────────────────────
  social: {
    instagram: '',
    facebook: '',
    twitter: '',
  },
};

export default config;
