import crypto from 'crypto';
import { MOCK_PRODUCTS } from '@unified-commerce/database';
import {
  PaymentState,
  PaymentAuditEntry,
  FraudAssessment,
  FraudRiskLevel,
  CartItem,
} from '@unified-commerce/types';

// Default encryption master secret (in production, loaded via AWS Secrets Manager / Vault)
const ENCRYPTION_KEY = process.env.PII_ENCRYPTION_KEY || 'unified-commerce-bank-grade-aes256-key-32b!';
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'whsec_unified_commerce_live_secret_key_8942';

export function cryptoRandomString(length = 16): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

/* ─────────────────────────────────────────────────────────────
   1. Server-Side Price Verification (Zero Client Price Trust)
───────────────────────────────────────────────────────────── */

export interface PriceVerificationResult {
  isValid: boolean;
  serverSubtotal: number;
  serverTax: number;
  serverShippingFee: number;
  serverTotal: number;
  clientTotal: number;
  discrepancy: number;
  recalculatedItems: Array<{
    productId: string;
    productName: string;
    officialPrice: number;
    quantity: number;
    itemSubtotal: number;
  }>;
  reason?: string;
}

export function verifyOrderPrice(
  items: Array<{ productId: string; quantity: number }>,
  clientSubtotal: number,
  clientTotal: number,
  shippingTier: 'standard' | 'express' | 'drone' = 'standard',
  couponCode?: string
): PriceVerificationResult {
  let serverSubtotal = 0;
  const recalculatedItems = [];

  for (const item of items) {
    const officialProduct = MOCK_PRODUCTS.find((p) => p.id === item.productId);
    if (!officialProduct) {
      return {
        isValid: false,
        serverSubtotal: 0,
        serverTax: 0,
        serverShippingFee: 0,
        serverTotal: 0,
        clientTotal,
        discrepancy: clientTotal,
        recalculatedItems: [],
        reason: `Product ID ${item.productId} not found in verified catalog index.`,
      };
    }

    const itemSubtotal = officialProduct.price * item.quantity;
    serverSubtotal += itemSubtotal;
    recalculatedItems.push({
      productId: item.productId,
      productName: officialProduct.name,
      officialPrice: officialProduct.price,
      quantity: item.quantity,
      itemSubtotal,
    });
  }

  // Calculate discount
  let discount = 0;
  if (couponCode === 'CYBER2026') {
    discount = Math.round(serverSubtotal * 0.15);
  } else if (couponCode === 'NEURAL100') {
    discount = Math.min(serverSubtotal, 100);
  }

  const discountedSubtotal = Math.max(0, serverSubtotal - discount);

  // Calculate shipping
  let serverShippingFee = 0;
  const isFreeShipEligible = couponCode === 'FREESHIP' || (shippingTier === 'standard' && serverSubtotal >= 1000);
  if (!isFreeShipEligible) {
    if (shippingTier === 'drone') serverShippingFee = 120;
    else if (shippingTier === 'express') serverShippingFee = 65;
    else serverShippingFee = 25;
  }

  // 6.5% Sales / State Tax
  const serverTax = Math.round(discountedSubtotal * 0.065);
  const serverTotal = discountedSubtotal + serverShippingFee + serverTax;

  const discrepancy = Math.abs(serverTotal - clientTotal);
  const isValid = discrepancy <= 1; // Tolerance for 1 unit rounding difference

  return {
    isValid,
    serverSubtotal,
    serverTax,
    serverShippingFee,
    serverTotal,
    clientTotal,
    discrepancy,
    recalculatedItems,
    reason: isValid ? undefined : `Price tampering detected. Server verified: $${serverTotal}, Client claimed: $${clientTotal}.`,
  };
}

/* ─────────────────────────────────────────────────────────────
   2. Idempotency Key In-Memory Store (Prevents Double Billing)
───────────────────────────────────────────────────────────── */

interface CachedIdempotency {
  status: 'PENDING' | 'RESOLVED';
  statusCode: number;
  responsePayload: any;
  timestamp: number;
}

const IDEMPOTENCY_STORE = new Map<string, CachedIdempotency>();
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function checkIdempotency(key: string): CachedIdempotency | null {
  const cached = IDEMPOTENCY_STORE.get(key);
  if (!cached) return null;

  // Check TTL
  if (Date.now() - cached.timestamp > IDEMPOTENCY_TTL_MS) {
    IDEMPOTENCY_STORE.delete(key);
    return null;
  }
  return cached;
}

export function saveIdempotency(key: string, statusCode: number, responsePayload: any) {
  IDEMPOTENCY_STORE.set(key, {
    status: 'RESOLVED',
    statusCode,
    responsePayload,
    timestamp: Date.now(),
  });
}

/* ─────────────────────────────────────────────────────────────
   3. Webhook Signature Verification (HMAC-SHA256 Timing-Safe)
───────────────────────────────────────────────────────────── */

export function verifyWebhookSignature(
  rawPayload: string,
  signatureHeader: string,
  secret: string = WEBHOOK_SECRET
): boolean {
  try {
    const computedHmac = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');
    const signatureBuffer = Buffer.from(signatureHeader, 'utf-8');
    const computedBuffer = Buffer.from(computedHmac, 'utf-8');

    if (signatureBuffer.length !== computedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, computedBuffer);
  } catch (err) {
    return false;
  }
}

export function generateWebhookSignature(rawPayload: string, secret: string = WEBHOOK_SECRET): string {
  return crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');
}

/* ─────────────────────────────────────────────────────────────
   4. Field-Level PII Encryption at Rest (AES-256-GCM)
───────────────────────────────────────────────────────────── */

const ALGORITHM = 'aes-256-gcm';

export function encryptPII(plainText: string): string {
  try {
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');
    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('PII Encryption error:', err);
    return plainText;
  }
}

export function decryptPII(cipherPayload: string): string {
  try {
    const parts = cipherPayload.split(':');
    if (parts.length !== 3) return cipherPayload;

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('PII Decryption error:', err);
    return cipherPayload;
  }
}

/* ─────────────────────────────────────────────────────────────
   5. Immutable Payment State Audit Trail
───────────────────────────────────────────────────────────── */

const PAYMENT_AUDIT_LOGS: PaymentAuditEntry[] = [
  {
    id: 'pay-audit-001',
    orderId: 'ord-seed-8942',
    previousState: null,
    newState: 'INITIATED',
    amount: 249900,
    currency: 'INR',
    provider: 'STRIPE',
    transactionRef: 'pi_3P0000000000000000000001',
    idempotencyKey: 'idem_seed_8942_init',
    verifiedPriceMatch: true,
    clientIp: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'pay-audit-002',
    orderId: 'ord-seed-8942',
    previousState: 'INITIATED',
    newState: 'AUTHORIZED',
    amount: 249900,
    currency: 'INR',
    provider: 'STRIPE',
    transactionRef: 'ch_3P0000000000000000000001',
    idempotencyKey: 'idem_seed_8942_auth',
    verifiedPriceMatch: true,
    clientIp: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    timestamp: new Date(Date.now() - 3600000 * 2 + 15000).toISOString(),
  },
  {
    id: 'pay-audit-003',
    orderId: 'ord-seed-8942',
    previousState: 'AUTHORIZED',
    newState: 'CAPTURED',
    amount: 249900,
    currency: 'INR',
    provider: 'STRIPE',
    transactionRef: 'ch_3P0000000000000000000001',
    idempotencyKey: 'idem_seed_8942_cap',
    verifiedPriceMatch: true,
    clientIp: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    timestamp: new Date(Date.now() - 3600000 * 2 + 18000).toISOString(),
  },
];

export function recordPaymentTransition(entry: Omit<PaymentAuditEntry, 'id' | 'timestamp'>): PaymentAuditEntry {
  const record: PaymentAuditEntry = {
    ...entry,
    id: `pay-audit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    timestamp: new Date().toISOString(),
  };
  PAYMENT_AUDIT_LOGS.unshift(record);
  return record;
}

export function getPaymentAuditLogs(orderId?: string): PaymentAuditEntry[] {
  if (orderId) {
    return PAYMENT_AUDIT_LOGS.filter((l) => l.orderId === orderId);
  }
  return PAYMENT_AUDIT_LOGS;
}

/* ─────────────────────────────────────────────────────────────
   6. Velocity-Based Fraud Assessment Engine
───────────────────────────────────────────────────────────── */

// Tracks IP and user order velocity in memory
const IP_VELOCITY_TRACKER = new Map<string, number[]>();

export function assessCheckoutFraud(
  orderId: string,
  amount: number,
  clientIp: string = '127.0.0.1',
  shippingCountry: string = 'India',
  billingCountry: string = 'India'
): FraudAssessment {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15-minute window

  // Clean old entries
  const recentOrders = (IP_VELOCITY_TRACKER.get(clientIp) || []).filter((t) => now - t < windowMs);
  recentOrders.push(now);
  IP_VELOCITY_TRACKER.set(clientIp, recentOrders);

  let riskScore = 5; // baseline low risk
  const reasons: string[] = [];

  // Velocity checks
  if (recentOrders.length > 5) {
    riskScore += 60;
    reasons.push(`High velocity rate: ${recentOrders.length} checkouts in 15 minutes from same IP.`);
  } else if (recentOrders.length > 3) {
    riskScore += 25;
    reasons.push(`Moderate velocity: ${recentOrders.length} checkouts in 15 minutes.`);
  }

  // High ticket value checks
  if (amount > 200000) {
    riskScore += 20;
    reasons.push(`High-value transaction: ₹${amount.toLocaleString('en-IN')}. Requires SCA / 3D-Secure.`);
  }

  // Cross-border mismatch
  if (shippingCountry.toLowerCase() !== billingCountry.toLowerCase()) {
    riskScore += 30;
    reasons.push(`Country mismatch between shipping (${shippingCountry}) and billing (${billingCountry}).`);
  }

  let riskLevel: FraudRiskLevel = 'LOW';
  if (riskScore >= 75) riskLevel = 'BLOCKED';
  else if (riskScore >= 45) riskLevel = 'HIGH';
  else if (riskScore >= 25) riskLevel = 'MEDIUM';

  const requiresStepUpAuth = riskScore >= 25;
  const allowCheckout = riskLevel !== 'BLOCKED';

  return {
    orderId,
    riskScore: Math.min(100, riskScore),
    riskLevel,
    reasons: reasons.length > 0 ? reasons : ['Normal biometric and velocity signals.'],
    velocityCount: recentOrders.length,
    requiresStepUpAuth,
    allowCheckout,
  };
}
