import { z } from 'zod';

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const DeliveryAreaSchema = z.object({
  name: z.string().min(1),
  pincode: z.string().min(5).max(10),
  deliveryFee: z.number().min(0),
  minOrder: z.number().min(0),
  etaDays: z.number().min(1),
});

const StoreConfigSchema = z.object({
  storeName: z.string().min(1, 'storeName is required'),
  storeTagline: z.string().default(''),
  logoUrl: z.string().default('/logo.png'),
  faviconUrl: z.string().default('/favicon.ico'),

  phone: z.string().min(10, 'phone is required'),
  whatsapp: z.string().regex(/^\d+$/, 'whatsapp must be digits only'),
  email: z.string().email('invalid email'),
  address: z.string().min(1, 'address is required'),
  googleMapsUrl: z.string().url().optional().or(z.literal('')),

  gstin: z.string().optional().default(''),
  invoicePrefix: z.string().default('INV'),
  currency: z.string().default('INR'),
  currencySymbol: z.string().default('₹'),

  theme: z.enum(['fashion', 'food', 'electronics', 'general']).default('general'),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#2563eb'),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#f59e0b'),
  fontFamily: z.string().default('Inter, sans-serif'),
  darkMode: z.boolean().default(true),

  language: z.enum(['en', 'hi']).default('en'),
  timezone: z.string().default('Asia/Kolkata'),

  deliveryAreas: z.array(DeliveryAreaSchema).default([]),
  defaultDeliveryFee: z.number().min(0).default(50),
  freeDeliveryAbove: z.number().min(0).default(999),

  payments: z.object({
    razorpay: z.object({
      enabled: z.boolean(),
      keyId: z.string(),
      keySecret: z.string(),
      webhookSecret: z.string(),
    }),
    cod: z.object({
      enabled: z.boolean(),
      maxOrderAmount: z.number().min(0),
      requirePhoneOtp: z.boolean(),
    }),
  }),

  policies: z.object({
    returnDays: z.number().min(0),
    returnPolicy: z.string(),
    shippingPolicy: z.string(),
    privacyPolicy: z.string(),
    termsOfService: z.string(),
    cancellationPolicy: z.string(),
  }),

  features: z.object({
    mode: z.enum(['lite', 'pro']),
    ai: z.boolean(),
    threeDee: z.boolean(),
    multiVendor: z.boolean(),
    wishlist: z.boolean(),
    reviews: z.boolean(),
    orderTracking: z.boolean(),
    whatsappNotifications: z.boolean(),
    staffAccounts: z.boolean(),
    bulkImport: z.boolean(),
    guestCheckout: z.boolean(),
  }),

  social: z.object({
    instagram: z.string().optional().default(''),
    facebook: z.string().optional().default(''),
    twitter: z.string().optional().default(''),
  }),
});

export type StoreConfig = z.infer<typeof StoreConfigSchema>;
export type DeliveryArea = z.infer<typeof DeliveryAreaSchema>;

// ── Singleton loader ─────────────────────────────────────────────────────────

let _cached: StoreConfig | null = null;

export function getStoreConfig(): StoreConfig {
  if (_cached) return _cached;

  // Dynamic require so this works in Node (server) only
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const raw = require('../../store.config').default;
  const result = StoreConfigSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues.map((i) => `  • ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid store.config.ts:\n${issues}`);
  }

  _cached = result.data;
  return _cached;
}

/** Returns the delivery fee for a given pincode, or the default fee. */
export function getDeliveryFee(pincode: string): number {
  const cfg = getStoreConfig();
  if (cfg.freeDeliveryAbove > 0) return 0; // caller handles the free-above threshold
  const area = cfg.deliveryAreas.find((a) => a.pincode === pincode);
  return area?.deliveryFee ?? cfg.defaultDeliveryFee;
}
