import {
  InventoryReservation,
  InventoryReservationStatus,
} from '@unified-commerce/types';
import { getProductById, getAllProducts } from '@unified-commerce/database';
import { cryptoRandomString } from './security';

/* ─────────────────────────────────────────────────────────────
   Distributed Stock Reservation Engine with 15-Min TTL
───────────────────────────────────────────────────────────── */

interface StockState {
  productId: string;
  totalStock: number;
  reservedStock: number;
}

// In-memory stock overrides initialized from catalog
const STOCK_REGISTRY: Map<string, StockState> = new Map();
// Active reservations mapped by reservationId
const ACTIVE_RESERVATIONS: Map<string, InventoryReservation> = new Map();

// Helper to initialize or get current stock state
function getStockState(productId: string): StockState {
  let state = STOCK_REGISTRY.get(productId);
  if (!state) {
    const product = getProductById(productId);
    const initialTotal = product ? product.stock : 25;
    state = {
      productId,
      totalStock: initialTotal,
      reservedStock: 0,
    };
    STOCK_REGISTRY.set(productId, state);
  }
  return state;
}

/**
 * Purges expired reservations and restores available stock.
 */
function cleanupExpiredReservations() {
  const now = new Date().toISOString();
  for (const [id, res] of ACTIVE_RESERVATIONS.entries()) {
    if (res.status === 'RESERVED' && res.expiresAt < now) {
      res.status = 'RELEASED';
      const stock = getStockState(res.productId);
      stock.reservedStock = Math.max(0, stock.reservedStock - res.quantity);
      STOCK_REGISTRY.set(res.productId, stock);
      ACTIVE_RESERVATIONS.set(id, res);
    }
  }
}

export interface ReservationRequestItem {
  productId: string;
  quantity: number;
}

export interface ReservationResult {
  success: boolean;
  orderOrSessionId: string;
  reservations: InventoryReservation[];
  error?: string;
  failedItems?: { productId: string; requested: number; available: number }[];
}

/**
 * Atomically reserves inventory units for 15 minutes during checkout initiation.
 */
export function reserveStock(
  items: ReservationRequestItem[],
  orderOrSessionId: string,
  ttlMinutes = 15
): ReservationResult {
  cleanupExpiredReservations();

  const failedItems: { productId: string; requested: number; available: number }[] = [];

  // First pass: Verify all items have sufficient available stock
  for (const item of items) {
    const product = getProductById(item.productId);
    if (!product) {
      failedItems.push({ productId: item.productId, requested: item.quantity, available: 0 });
      continue;
    }

    const state = getStockState(item.productId);
    const available = state.totalStock - state.reservedStock;
    if (available < item.quantity) {
      failedItems.push({
        productId: item.productId,
        requested: item.quantity,
        available: Math.max(0, available),
      });
    }
  }

  if (failedItems.length > 0) {
    return {
      success: false,
      orderOrSessionId,
      reservations: [],
      error: 'Insufficient available inventory for one or more requested items.',
      failedItems,
    };
  }

  // Second pass: Create reservations and increment reserved stock
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000).toISOString();
  const created: InventoryReservation[] = [];

  for (const item of items) {
    const product = getProductById(item.productId)!;
    const state = getStockState(item.productId);
    state.reservedStock += item.quantity;
    STOCK_REGISTRY.set(item.productId, state);

    const reservationId = `res-${Date.now()}-${cryptoRandomString(6)}`;
    const reservation: InventoryReservation = {
      reservationId,
      orderOrSessionId,
      productId: item.productId,
      vendorId: product.vendorId || 'vendor-001',
      quantity: item.quantity,
      status: 'RESERVED',
      expiresAt,
      createdAt: now.toISOString(),
    };

    ACTIVE_RESERVATIONS.set(reservationId, reservation);
    created.push(reservation);
  }

  return {
    success: true,
    orderOrSessionId,
    reservations: created,
  };
}

/**
 * Permanently commits reserved inventory upon order payment confirmation.
 */
export function commitStock(orderOrSessionId: string): boolean {
  cleanupExpiredReservations();
  let committedAny = false;

  for (const [id, res] of ACTIVE_RESERVATIONS.entries()) {
    if (res.orderOrSessionId === orderOrSessionId && res.status === 'RESERVED') {
      res.status = 'COMMITTED';
      ACTIVE_RESERVATIONS.set(id, res);

      const state = getStockState(res.productId);
      state.reservedStock = Math.max(0, state.reservedStock - res.quantity);
      state.totalStock = Math.max(0, state.totalStock - res.quantity);
      STOCK_REGISTRY.set(res.productId, state);

      committedAny = true;
    }
  }

  return committedAny;
}

/**
 * Releases reserved inventory back to the available pool (checkout abandoned/cancelled).
 */
export function releaseStock(orderOrSessionId: string): boolean {
  let releasedAny = false;

  for (const [id, res] of ACTIVE_RESERVATIONS.entries()) {
    if (res.orderOrSessionId === orderOrSessionId && res.status === 'RESERVED') {
      res.status = 'RELEASED';
      ACTIVE_RESERVATIONS.set(id, res);

      const state = getStockState(res.productId);
      state.reservedStock = Math.max(0, state.reservedStock - res.quantity);
      STOCK_REGISTRY.set(res.productId, state);

      releasedAny = true;
    }
  }

  return releasedAny;
}

/**
 * Returns inventory health report for a specific vendor's products or whole catalog.
 */
export function getInventoryHealth(vendorId?: string) {
  cleanupExpiredReservations();

  const norm = (id: string) => id.replace(/^vendor-0*/, 'vendor-');
  const all = getAllProducts();
  const filtered = vendorId
    ? all.filter(p => norm(p.vendorId) === norm(vendorId))
    : all.slice(0, 50);

  const inventory = filtered.map(p => {
    const state = getStockState(p.id);
    const available = Math.max(0, state.totalStock - state.reservedStock);
    const isLowStock = available > 0 && available <= 10;
    const isOutOfStock = available === 0;

    return {
      productId: p.id,
      productName: p.name,
      sku: p.specs?.SKU || `SKU-${p.id.toUpperCase()}`,
      vendorId: p.vendorId,
      totalStock: state.totalStock,
      reservedStock: state.reservedStock,
      availableStock: available,
      status: isOutOfStock ? 'OUT_OF_STOCK' : isLowStock ? 'LOW_STOCK' : 'HEALTHY',
      reorderAlert: isLowStock || isOutOfStock,
    };
  });

  const totalReserved = inventory.reduce((sum, item) => sum + item.reservedStock, 0);
  const lowStockCount = inventory.filter(item => item.reorderAlert).length;

  return {
    totalItemsTracked: inventory.length,
    totalReservedUnits: totalReserved,
    lowStockAlertsCount: lowStockCount,
    inventory,
    activeReservations: Array.from(ACTIVE_RESERVATIONS.values()).filter(r => r.status === 'RESERVED'),
  };
}
