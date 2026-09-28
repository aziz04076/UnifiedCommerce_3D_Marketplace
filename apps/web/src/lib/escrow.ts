import {
  VendorSplitAllocation,
  VendorEscrowRecord,
  EscrowStatus,
  PayoutRail,
  VendorPayoutRequest,
} from '@unified-commerce/types';
import { getProductById, getVendorById, getAllVendors } from '@unified-commerce/database';
import { cryptoRandomString } from './security';

/* ─────────────────────────────────────────────────────────────
   Multi-Vendor Split Escrow Ledger (In-Memory Thread-Safe State)
───────────────────────────────────────────────────────────── */

interface PayoutLedgerEntry {
  payoutId: string;
  vendorId: string;
  amount: number;
  rail: PayoutRail;
  destinationAccount: string;
  txHashOrUtr: string;
  status: 'SETTLED' | 'PROCESSING' | 'FAILED';
  createdAt: string;
  settledAt: string;
}

// In-memory ledger storage initialized with historical data
const ESCROW_RECORDS: Map<string, VendorEscrowRecord> = new Map();
const PAYOUT_LEDGER: PayoutLedgerEntry[] = [
  {
    payoutId: 'payout-101',
    vendorId: 'vendor-001',
    amount: 14500,
    rail: 'USDC_POLYGON',
    destinationAccount: '0x71C...4a92',
    txHashOrUtr: '0x8f2c39d8e12140bb9a65d7010419e7cfbc194a11f2385002bca89d12301984bc',
    status: 'SETTLED',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    settledAt: new Date(Date.now() - 7 * 86400000 + 3600000).toISOString(),
  },
  {
    payoutId: 'payout-102',
    vendorId: 'vendor-001',
    amount: 32000,
    rail: 'BANK_NEFT',
    destinationAccount: 'HDFC0000240-918237192',
    txHashOrUtr: 'CMS-NEFT-928471928-IN',
    status: 'SETTLED',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    settledAt: new Date(Date.now() - 3 * 86400000 + 7200000).toISOString(),
  },
];

// Prepopulate initial escrow records for existing orders
const INITIAL_ESCROWS: VendorEscrowRecord[] = [
  {
    id: 'esc-seed-001',
    orderId: 'ord-seed-8942',
    vendorId: 'vendor-001',
    grossAmount: 1899,
    platformFee: 151.92,
    netAmount: 1747.08,
    currency: 'USD',
    status: 'ELIGIBLE_FOR_CLEARANCE',
    lockedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    eligibleAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'esc-seed-002',
    orderId: 'ord-seed-8942-b',
    vendorId: 'vendor-001',
    grossAmount: 2450,
    platformFee: 196.00,
    netAmount: 2254.00,
    currency: 'USD',
    status: 'HELD_IN_ESCROW',
    lockedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    eligibleAt: new Date(Date.now() + 86400000 * 2).toISOString(),
  },
  {
    id: 'esc-seed-003',
    orderId: 'ord-seed-8941',
    vendorId: 'vendor-002',
    grossAmount: 890,
    platformFee: 71.20,
    netAmount: 818.80,
    currency: 'USD',
    status: 'ELIGIBLE_FOR_CLEARANCE',
    lockedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    eligibleAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

INITIAL_ESCROWS.forEach(rec => ESCROW_RECORDS.set(rec.id, rec));

/* ─────────────────────────────────────────────────────────────
   Multi-Vendor Split Calculations
───────────────────────────────────────────────────────────── */

export interface SplitCalculationItem {
  productId: string;
  quantity: number;
}

export interface MultiVendorOrderSplit {
  orderSubtotal: number;
  totalPlatformTake: number;
  totalLogisticsAllocated: number;
  totalVendorNet: number;
  currency: string;
  allocations: VendorSplitAllocation[];
}

/**
 * Calculates itemized split allocations per vendor for a set of cart/order items.
 * Computes platform take-rate (commission), tax allocation, and logistics share.
 */
export function calculateOrderSplits(
  items: SplitCalculationItem[],
  totalShippingFee: number = 0,
  currency: string = 'USD'
): MultiVendorOrderSplit {
  const vendorBuckets = new Map<string, {
    vendorId: string;
    vendorName: string;
    gross: number;
    count: number;
    commissionRate: number;
  }>();

  let orderSubtotal = 0;

  for (const item of items) {
    const product = getProductById(item.productId);
    if (!product) continue;

    const lineTotal = product.price * item.quantity;
    orderSubtotal += lineTotal;

    const vendorId = product.vendorId || 'vendor-001';
    const vendor = getVendorById(vendorId);
    const vendorName = vendor?.name || product.vendorName || 'Independent Maker';
    const commissionRate = vendor?.commissionRate || 0.08; // 8% standard

    const current = vendorBuckets.get(vendorId) || {
      vendorId,
      vendorName,
      gross: 0,
      count: 0,
      commissionRate,
    };

    current.gross += lineTotal;
    current.count += item.quantity;
    vendorBuckets.set(vendorId, current);
  }

  const vendorCount = Math.max(1, vendorBuckets.size);
  const perVendorLogistics = Math.round((totalShippingFee / vendorCount) * 100) / 100;

  let totalPlatformTake = 0;
  let totalVendorNet = 0;
  const allocations: VendorSplitAllocation[] = [];

  for (const bucket of vendorBuckets.values()) {
    const commissionFee = Math.round(bucket.gross * bucket.commissionRate * 100) / 100;
    // 1% tax withheld at source (TDS / marketplace facilitator tax)
    const taxWithheld = Math.round(bucket.gross * 0.01 * 100) / 100;
    const netPayoutAmount = Math.round((bucket.gross - commissionFee - taxWithheld) * 100) / 100;

    totalPlatformTake += commissionFee;
    totalVendorNet += netPayoutAmount;

    allocations.push({
      vendorId: bucket.vendorId,
      vendorName: bucket.vendorName,
      grossAmount: bucket.gross,
      commissionRate: bucket.commissionRate,
      commissionFee,
      logisticsShare: perVendorLogistics,
      taxWithheld,
      netPayoutAmount,
      currency,
      itemCount: bucket.count,
      status: 'HELD_IN_ESCROW',
    });
  }

  return {
    orderSubtotal,
    totalPlatformTake,
    totalLogisticsAllocated: totalShippingFee,
    totalVendorNet,
    currency,
    allocations,
  };
}

/* ─────────────────────────────────────────────────────────────
   Escrow Lifecycle State Machine
───────────────────────────────────────────────────────────── */

/**
 * Creates escrow records for an order upon customer payment confirmation.
 */
export function holdOrderInEscrow(
  orderId: string,
  splits: MultiVendorOrderSplit
): VendorEscrowRecord[] {
  const created: VendorEscrowRecord[] = [];
  const now = new Date();
  // 48 hours return/inspection buffer before eligible
  const eligibleTime = new Date(now.getTime() + 48 * 3600 * 1000);

  for (const alloc of splits.allocations) {
    const recordId = `esc-${orderId}-${alloc.vendorId}`;
    const record: VendorEscrowRecord = {
      id: recordId,
      orderId,
      vendorId: alloc.vendorId,
      grossAmount: alloc.grossAmount,
      platformFee: alloc.commissionFee,
      netAmount: alloc.netPayoutAmount,
      currency: alloc.currency,
      status: 'HELD_IN_ESCROW',
      lockedAt: now.toISOString(),
      eligibleAt: eligibleTime.toISOString(),
    };

    ESCROW_RECORDS.set(recordId, record);
    created.push(record);
  }

  return created;
}

/**
 * Transitions escrow funds to ELIGIBLE_FOR_CLEARANCE (e.g. order marked delivered).
 */
export function matureEscrowForOrder(orderId: string): VendorEscrowRecord[] {
  const updated: VendorEscrowRecord[] = [];

  for (const [id, rec] of ESCROW_RECORDS.entries()) {
    if (rec.orderId === orderId && rec.status === 'HELD_IN_ESCROW') {
      const matured: VendorEscrowRecord = {
        ...rec,
        status: 'ELIGIBLE_FOR_CLEARANCE',
      };
      ESCROW_RECORDS.set(id, matured);
      updated.push(matured);
    }
  }

  return updated;
}

/**
 * Freezes escrow funds if a dispute is raised.
 */
export function freezeEscrowForDispute(orderId: string): boolean {
  let matched = false;
  for (const [id, rec] of ESCROW_RECORDS.entries()) {
    if (rec.orderId === orderId) {
      rec.status = 'FROZEN_FOR_DISPUTE';
      ESCROW_RECORDS.set(id, rec);
      matched = true;
    }
  }
  return matched;
}

/**
 * Calculates current escrow wallet summary for a vendor.
 */
export function getVendorEscrowSummary(vendorId: string) {
  const norm = (id: string) => id.replace(/^vendor-0*/, 'vendor-');
  let availableBalance = 0;
  let lockedInEscrow = 0;
  let disputedAmount = 0;
  let totalDisbursed = 0;

  for (const rec of ESCROW_RECORDS.values()) {
    if (norm(rec.vendorId) === norm(vendorId)) {
      if (rec.status === 'ELIGIBLE_FOR_CLEARANCE') {
        availableBalance += rec.netAmount;
      } else if (rec.status === 'HELD_IN_ESCROW') {
        lockedInEscrow += rec.netAmount;
      } else if (rec.status === 'FROZEN_FOR_DISPUTE') {
        disputedAmount += rec.netAmount;
      } else if (rec.status === 'SETTLED') {
        totalDisbursed += rec.netAmount;
      }
    }
  }

  const vendorPayouts = PAYOUT_LEDGER.filter(p => norm(p.vendorId) === norm(vendorId));
  const historicalPaidOut = vendorPayouts
    .filter(p => p.status === 'SETTLED')
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    vendorId,
    availableBalance: Math.round(availableBalance * 100) / 100,
    lockedInEscrow: Math.round(lockedInEscrow * 100) / 100,
    disputedAmount: Math.round(disputedAmount * 100) / 100,
    totalDisbursed: Math.round((totalDisbursed + historicalPaidOut) * 100) / 100,
    escrowRecords: Array.from(ESCROW_RECORDS.values()).filter(r => r.vendorId === vendorId),
    payoutHistory: vendorPayouts,
  };
}

/**
 * Disburses a vendor payout via Bank NEFT/ACH or Web3 USDC.
 */
export function disburseVendorPayout(
  request: VendorPayoutRequest
): { success: boolean; payout?: PayoutLedgerEntry; error?: string } {
  const summary = getVendorEscrowSummary(request.vendorId);

  if (request.amount > summary.availableBalance) {
    return {
      success: false,
      error: `Insufficient eligible escrow balance. Requested: $${request.amount}, Available: $${summary.availableBalance}`,
    };
  }

  // Minimum threshold: $50
  if (request.amount < 50) {
    return {
      success: false,
      error: 'Minimum withdrawal threshold is $50.00.',
    };
  }

  const payoutId = `pay-${Date.now()}-${cryptoRandomString(6)}`;
  const isCrypto = request.rail.startsWith('USDC');
  const txHashOrUtr = isCrypto
    ? `0x${cryptoRandomString(64)}`
    : `CMS-ACH-${Date.now()}-${cryptoRandomString(8).toUpperCase()}`;

  const entry: PayoutLedgerEntry = {
    payoutId,
    vendorId: request.vendorId,
    amount: request.amount,
    rail: request.rail,
    destinationAccount: request.destinationAccount,
    txHashOrUtr,
    status: 'SETTLED',
    createdAt: new Date().toISOString(),
    settledAt: new Date().toISOString(),
  };

  PAYOUT_LEDGER.unshift(entry);

  // Mark eligible escrow records as SETTLED up to requested amount
  const norm = (id: string) => id.replace(/^vendor-0*/, 'vendor-');
  let remainingToDeduct = request.amount;
  for (const [id, rec] of ESCROW_RECORDS.entries()) {
    if (norm(rec.vendorId) === norm(request.vendorId) && rec.status === 'ELIGIBLE_FOR_CLEARANCE') {
      if (remainingToDeduct <= 0) break;
      rec.status = 'SETTLED';
      rec.settledAt = new Date().toISOString();
      rec.payoutReference = payoutId;
      rec.rail = request.rail;
      ESCROW_RECORDS.set(id, rec);
      remainingToDeduct -= rec.netAmount;
    }
  }

  return {
    success: true,
    payout: entry,
  };
}
