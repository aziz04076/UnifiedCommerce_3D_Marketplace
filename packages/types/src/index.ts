import { z } from 'zod';

/* ─────────────────────────────────────────────────────────────
   Core Domain Zod Schemas
───────────────────────────────────────────────────────────── */

export const UserRoleSchema = z.enum([
  'CUSTOMER',
  'VENDOR',
  'DELIVERY_PARTNER',
  'ADMIN',
  'SUPER_ADMIN',
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  avatarUrl: z.string().optional(),
  phone: z.string().optional(),
  is2FAEnabled: z.boolean().default(false),
  createdAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const VendorBadgeSchema = z.enum([
  'Top Seller',
  'Eco Innovator',
  'Verified Maker',
  'Rising Star',
]);

export const VendorMetricsSchema = z.object({
  gmv: z.number(),
  completionRate: z.number(),
  avgDeliveryDays: z.number(),
});

export const VendorSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  tagline: z.string(),
  description: z.string(),
  logo: z.string(),
  banner: z.string(),
  rating: z.number(),
  reviewCount: z.number(),
  totalProducts: z.number(),
  commissionRate: z.number(), // e.g. 0.08 = 8%
  isVerified: z.boolean(),
  kycStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']),
  location: z.string(),
  badge: VendorBadgeSchema,
  metrics: VendorMetricsSchema,
});
export type Vendor = z.infer<typeof VendorSchema>;

export const ProductCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  icon: z.string(),
  image: z.string(),
  accentColor: z.string(),
  subcategories: z.array(z.string()).optional(),
});
export type ProductCategory = z.infer<typeof ProductCategorySchema>;

export const Product3DConfigSchema = z.object({
  geometry: z.enum(['polyhedron', 'torus', 'sphere', 'cylinder', 'crystal', 'drone']),
  wireframeColor: z.string().optional(),
  glowColor: z.string(),
  metalness: z.number(),
  roughness: z.number(),
  modelUrl: z.string().optional(),
});
export type Product3DConfig = z.infer<typeof Product3DConfigSchema>;

export const ProductAiInsightsSchema = z.object({
  demandScore: z.number(),
  sentimentSummary: z.string(),
  frequentlyBoughtWith: z.array(z.string()).optional(),
});

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  headline: z.string(),
  description: z.string(),
  price: z.number(),
  originalPrice: z.number().optional(),
  currency: z.string().default('USD'),
  category: z.string(),
  subcategory: z.string(),
  tags: z.array(z.string()),
  vendorId: z.string(),
  vendorName: z.string(),
  vendorAvatar: z.string(),
  rating: z.number(),
  reviewCount: z.number(),
  stock: z.number(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  badge: z.string().optional(),
  images: z.array(z.string()),
  threedConfig: Product3DConfigSchema.optional(),
  specs: z.record(z.string(), z.string()),
  aiInsights: ProductAiInsightsSchema.optional(),
});
export type Product = z.infer<typeof ProductSchema>;

export const CartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  product: ProductSchema,
  quantity: z.number().int().positive(),
  selectedColor: z.string().optional(),
  selectedSpec: z.string().optional(),
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const OrderItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: stringSchema(),
  productImage: z.string(),
  vendorId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
});
function stringSchema() { return z.string(); }
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderShippingAddressSchema = z.object({
  fullName: z.string(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string().optional(),
});

export const OrderTrackingLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  name: z.string(),
});

export const OrderTrackingSchema = z.object({
  carrier: z.string(),
  trackingCode: z.string(),
  estimatedDelivery: z.string(),
  currentLocation: OrderTrackingLocationSchema,
});

export const OrderStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
]);

export const PaymentStatusSchema = z.enum(['PAID', 'PENDING', 'FAILED', 'REFUNDED']);
export const PaymentMethodSchema = z.enum(['STRIPE', 'RAZORPAY', 'WALLET', 'CRYPTO', 'COD']);

export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  userId: z.string(),
  items: z.array(OrderItemSchema),
  subtotal: z.number(),
  platformFee: z.number(),
  shippingFee: z.number(),
  tax: z.number(),
  total: z.number(),
  currency: z.string(),
  status: OrderStatusSchema,
  paymentStatus: PaymentStatusSchema,
  paymentMethod: PaymentMethodSchema,
  shippingAddress: OrderShippingAddressSchema,
  tracking: OrderTrackingSchema,
  createdAt: z.string(),
});
export type Order = z.infer<typeof OrderSchema>;

export const ProductReviewSchema = z.object({
  id: z.string(),
  productId: z.string(),
  author: z.string(),
  avatarUrl: z.string().optional(),
  rating: z.number().min(1).max(5),
  date: z.string(),
  title: z.string(),
  comment: z.string(),
  verifiedPurchase: z.boolean(),
  helpfulCount: z.number().int().nonnegative(),
});
export type ProductReview = z.infer<typeof ProductReviewSchema>;

export const ProductBundleSchema = z.object({
  mainProduct: ProductSchema,
  bundledProducts: z.array(ProductSchema),
  totalOriginalPrice: z.number(),
  bundlePrice: z.number(),
  discountPercentage: z.number(),
});
export type ProductBundle = z.infer<typeof ProductBundleSchema>;

/* ─────────────────────────────────────────────────────────────
   Advanced AI Depth Feature Layer Schemas (Category A)
───────────────────────────────────────────────────────────── */

export const AgentToolNameSchema = z.enum([
  'compare_products',
  'filter_catalog',
  'add_to_cart',
  'get_product_specs',
  'explain_tradeoffs',
  'check_stock',
  'apply_coupon',
]);
export type AgentToolName = z.infer<typeof AgentToolNameSchema>;

export const AgentToolCallSchema = z.object({
  id: z.string(),
  name: AgentToolNameSchema,
  arguments: z.record(z.string(), z.any()),
  result: z.any().optional(),
  reasoning: z.string().optional(),
});
export type AgentToolCall = z.infer<typeof AgentToolCallSchema>;

export const AgentActionPlanSchema = z.object({
  thought: z.string(),
  toolCalls: z.array(AgentToolCallSchema),
  finalResponse: z.string(),
  suggestedAction: z.object({
    type: z.enum(['navigate', 'add_to_cart', 'filter', 'inspect_3d']),
    payload: z.record(z.string(), z.any()),
  }).optional(),
});
export type AgentActionPlan = z.infer<typeof AgentActionPlanSchema>;

export const VisualSearchMatchSchema = z.object({
  product: ProductSchema,
  visualSimilarityScore: z.number(),
  dominantColors: z.array(z.string()),
  aestheticCategory: z.string(),
  matchedFeatures: z.array(z.string()),
});
export type VisualSearchMatch = z.infer<typeof VisualSearchMatchSchema>;

export const ReviewAspectSummarySchema = z.object({
  aspect: z.string(),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']),
  score: z.number(),
  summary: z.string(),
});
export type ReviewAspectSummary = z.infer<typeof ReviewAspectSummarySchema>;

export const ReviewSummarySchema = z.object({
  productId: z.string(),
  totalReviewsAnalyzed: z.number(),
  overallScore: z.number(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  verdict: z.string(),
  aspects: z.array(ReviewAspectSummarySchema),
  recommendedFor: z.array(z.string()),
  notRecommendedFor: z.array(z.string()),
});
export type ReviewSummary = z.infer<typeof ReviewSummarySchema>;

export const VendorAiMetadataSchema = z.object({
  title: z.string(),
  headline: z.string(),
  description: z.string(),
  bulletPoints: z.array(z.string()),
  tags: z.array(z.string()),
  seoMetaTitle: z.string(),
  seoMetaDescription: z.string(),
  targetKeywords: z.array(z.string()),
  suggestedPriceRange: z.object({
    min: z.number(),
    max: z.number(),
    optimal: z.number(),
  }),
});
export type VendorAiMetadata = z.infer<typeof VendorAiMetadataSchema>;

export const UserInterestProfileSchema = z.object({
  preferredCategories: z.array(z.string()),
  affinityTags: z.record(z.string(), z.number()),
  priceSensitivity: z.enum(['BUDGET', 'MID_TIER', 'PREMIUM', 'LUXURY']),
  recentViewedIds: z.array(z.string()),
  cartIntentIds: z.array(z.string()),
});
export type UserInterestProfile = z.infer<typeof UserInterestProfileSchema>;

/* ─────────────────────────────────────────────────────────────
   Phase 3: Bank-Grade Security & Address Management Schemas
───────────────────────────────────────────────────────────── */

export const PaymentStateSchema = z.enum([
  'INITIATED',
  'REQUIRES_ACTION', // 3D Secure / SCA
  'AUTHORIZED',
  'CAPTURED',
  'FAILED',
  'REFUNDED',
]);
export type PaymentState = z.infer<typeof PaymentStateSchema>;

export const PaymentAuditEntrySchema = z.object({
  id: z.string(),
  orderId: z.string(),
  previousState: PaymentStateSchema.nullable(),
  newState: PaymentStateSchema,
  amount: z.number(),
  currency: z.string(),
  provider: z.enum(['STRIPE', 'RAZORPAY', 'WALLET', 'CRYPTO']),
  transactionRef: z.string(),
  idempotencyKey: z.string(),
  verifiedPriceMatch: z.boolean(),
  clientIp: z.string().optional(),
  userAgent: z.string().optional(),
  timestamp: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
});
export type PaymentAuditEntry = z.infer<typeof PaymentAuditEntrySchema>;

export const FraudRiskLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'BLOCKED']);
export type FraudRiskLevel = z.infer<typeof FraudRiskLevelSchema>;

export const FraudAssessmentSchema = z.object({
  orderId: z.string(),
  riskScore: z.number().min(0).max(100),
  riskLevel: FraudRiskLevelSchema,
  reasons: z.array(z.string()),
  velocityCount: z.number(),
  requiresStepUpAuth: z.boolean(),
  allowCheckout: z.boolean(),
});
export type FraudAssessment = z.infer<typeof FraudAssessmentSchema>;

export const AddressTypeSchema = z.enum(['HOME', 'WORK', 'OTHER']);
export type AddressType = z.infer<typeof AddressTypeSchema>;

export const SavedAddressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: AddressTypeSchema,
  fullName: z.string().min(2),
  phone: z.string().min(10),
  street: z.string().min(5),
  landmark: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(5),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false),
  createdAt: z.string(),
});
export type SavedAddress = z.infer<typeof SavedAddressSchema>;

export const PincodeServiceabilitySchema = z.object({
  postalCode: z.string(),
  isServiceable: z.boolean(),
  city: z.string(),
  state: z.string(),
  estimatedDays: z.number(),
  shippingTiersAvailable: z.array(z.enum(['standard', 'express', 'drone'])),
  codAvailable: z.boolean(),
  message: z.string(),
});
export type PincodeServiceability = z.infer<typeof PincodeServiceabilitySchema>;

export const OrderCancellationSchema = z.object({
  orderId: z.string(),
  reason: z.enum([
    'ORDERED_BY_MISTAKE',
    'FOUND_BETTER_PRICE',
    'DELIVERY_TIME_TOO_LONG',
    'CHANGE_DELIVERY_ADDRESS',
    'INCORRECT_ITEM_VARIANTS',
    'OTHER',
  ]),
  notes: z.string().optional(),
});
export type OrderCancellation = z.infer<typeof OrderCancellationSchema>;

/* ─────────────────────────────────────────────────────────────
   Phase 4: Multi-Vendor Operations & Logistics Schemas
───────────────────────────────────────────────────────────── */

export const EscrowStatusSchema = z.enum([
  'HELD_IN_ESCROW',
  'ELIGIBLE_FOR_CLEARANCE',
  'PAYOUT_INITIATED',
  'SETTLED',
  'FROZEN_FOR_DISPUTE',
  'REFUNDED_TO_BUYER',
]);
export type EscrowStatus = z.infer<typeof EscrowStatusSchema>;

export const PayoutRailSchema = z.enum(['BANK_NEFT', 'BANK_ACH', 'USDC_POLYGON', 'USDC_SOLANA']);
export type PayoutRail = z.infer<typeof PayoutRailSchema>;

export const VendorSplitAllocationSchema = z.object({
  vendorId: z.string(),
  vendorName: z.string(),
  grossAmount: z.number(),
  commissionRate: z.number(),
  commissionFee: z.number(),
  logisticsShare: z.number(),
  taxWithheld: z.number(),
  netPayoutAmount: z.number(),
  currency: z.string().default('USD'),
  itemCount: z.number(),
  status: EscrowStatusSchema,
});
export type VendorSplitAllocation = z.infer<typeof VendorSplitAllocationSchema>;

export const VendorEscrowRecordSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  vendorId: z.string(),
  grossAmount: z.number(),
  platformFee: z.number(),
  netAmount: z.number(),
  currency: z.string().default('USD'),
  status: EscrowStatusSchema,
  lockedAt: z.string(),
  eligibleAt: z.string(),
  settledAt: z.string().optional(),
  payoutReference: z.string().optional(),
  rail: PayoutRailSchema.optional(),
});
export type VendorEscrowRecord = z.infer<typeof VendorEscrowRecordSchema>;

export const VendorPayoutRequestSchema = z.object({
  vendorId: z.string(),
  amount: z.number().positive(),
  rail: PayoutRailSchema,
  destinationAccount: z.string().min(5),
  notes: z.string().optional(),
});
export type VendorPayoutRequest = z.infer<typeof VendorPayoutRequestSchema>;

export const InventoryReservationStatusSchema = z.enum(['RESERVED', 'COMMITTED', 'RELEASED']);
export type InventoryReservationStatus = z.infer<typeof InventoryReservationStatusSchema>;

export const InventoryReservationSchema = z.object({
  reservationId: z.string(),
  orderOrSessionId: z.string(),
  productId: z.string(),
  vendorId: z.string(),
  quantity: z.number().int().positive(),
  status: InventoryReservationStatusSchema,
  expiresAt: z.string(),
  createdAt: z.string(),
});
export type InventoryReservation = z.infer<typeof InventoryReservationSchema>;

export const CarrierEventTypeSchema = z.enum([
  'MANIFEST_CREATED',
  'PICKED_UP_AT_WAREHOUSE',
  'SUBORBITAL_LAUNCH',
  'ORBITAL_APOGEE',
  'DESCENT_APPROACH',
  'LOCAL_DRONE_DISPATCH',
  'DELIVERED',
  'EXCEPTION_DELAY',
]);
export type CarrierEventType = z.infer<typeof CarrierEventTypeSchema>;

export const CarrierWebhookPayloadSchema = z.object({
  awbNumber: z.string(),
  orderId: z.string(),
  carrier: z.string(),
  eventType: CarrierEventTypeSchema,
  timestamp: z.string(),
  location: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  telemetry: z.object({
    altitudeKm: z.number(),
    speedKmh: z.number(),
    batteryOrFuelPct: z.number(),
    estimatedMinutesRemaining: z.number(),
  }).optional(),
  notes: z.string().optional(),
  signature: z.string().optional(),
});
export type CarrierWebhookPayload = z.infer<typeof CarrierWebhookPayloadSchema>;

export const AirWaybillSchema = z.object({
  awbNumber: z.string(),
  orderId: z.string(),
  vendorId: z.string(),
  vendorName: z.string(),
  carrierName: z.string(),
  shippingTier: z.string(),
  originHub: z.string(),
  destinationHub: z.string(),
  recipientName: z.string(),
  recipientCity: z.string(),
  weightKg: z.number(),
  declaredValue: z.number(),
  barcode: z.string(),
  qrCodeData: z.string(),
  generatedAt: z.string(),
  dispatchDeadline: z.string(),
});
export type AirWaybill = z.infer<typeof AirWaybillSchema>;



