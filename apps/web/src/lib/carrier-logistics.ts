import {
  AirWaybill,
  CarrierWebhookPayload,
  CarrierEventType,
} from '@unified-commerce/types';
import { getProductById, getVendorById } from '@unified-commerce/database';
import { cryptoRandomString, verifyWebhookSignature } from './security';
import { matureEscrowForOrder } from './escrow';

/* ─────────────────────────────────────────────────────────────
   Multi-Tier Carrier Logistics & AWB Engine
───────────────────────────────────────────────────────────── */

interface CarrierEventRecord extends CarrierWebhookPayload {
  receivedAt: string;
}

// In-memory AWB registry and carrier event streams
const AWB_REGISTRY: Map<string, AirWaybill> = new Map();
const ORDER_CARRIER_EVENTS: Map<string, CarrierEventRecord[]> = new Map();

// Hub definitions for global logistics corridors
const ORIGIN_HUBS: Record<string, string> = {
  Tokyo: 'HND-HYPER-01 (Tokyo Suborbital Spaceport)',
  Kyoto: 'ITM-NEXUS-02 (Kansai Maglev Cargo Terminal)',
  Zurich: 'ZRH-ALPINE-07 (Zurich Quantum Logistics)',
  Stockholm: 'ARN-NORDIC-03 (Stockholm Clean Freight Hub)',
  SanFrancisco: 'SFO-AERO-09 (SF Autonomous Skyport)',
  Berlin: 'BER-VECTOR-04 (Berlin Drone Corridor)',
  default: 'GLOBAL-ORBITAL-HUB-00',
};

// Seed sample AWB and telemetry for ord-seed-8942
const SEED_AWB: AirWaybill = {
  awbNumber: 'AWB-SUB-779124-JP',
  orderId: 'ord-seed-8942',
  vendorId: 'vendor-001',
  vendorName: 'AetherApex Systems',
  carrierName: 'Hyper-Suborbital Express Corp',
  shippingTier: 'Hyper-Suborbital Air Transit',
  originHub: 'HND-HYPER-01 (Tokyo Suborbital Spaceport)',
  destinationHub: 'BOM-CORRIDOR-04 (Mumbai Bandra Vertiport)',
  recipientName: 'Arjun Mehta',
  recipientCity: 'Mumbai',
  weightKg: 1.45,
  declaredValue: 1899,
  barcode: '||| | | || ||| || ||| || |||| |',
  qrCodeData: 'https://unified-commerce.ai/track/AWB-SUB-779124-JP',
  generatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  dispatchDeadline: new Date(Date.now() + 3600000 * 16).toISOString(),
};

AWB_REGISTRY.set(SEED_AWB.awbNumber, SEED_AWB);
AWB_REGISTRY.set(SEED_AWB.orderId, SEED_AWB);

ORDER_CARRIER_EVENTS.set(SEED_AWB.orderId, [
  {
    awbNumber: SEED_AWB.awbNumber,
    orderId: SEED_AWB.orderId,
    carrier: 'Hyper-Suborbital Express Corp',
    eventType: 'MANIFEST_CREATED',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    location: 'Tokyo Haneda Spaceport Launch Complex 3',
    coordinates: { lat: 35.5494, lng: 139.7798 },
    telemetry: { altitudeKm: 0, speedKmh: 0, batteryOrFuelPct: 100, estimatedMinutesRemaining: 180 },
    notes: 'AWB registered, autonomous payload pod sealed with cryogenic lock.',
    receivedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    awbNumber: SEED_AWB.awbNumber,
    orderId: SEED_AWB.orderId,
    carrier: 'Hyper-Suborbital Express Corp',
    eventType: 'SUBORBITAL_LAUNCH',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    location: 'Pacific Suborbital Transit Corridor Vector 12',
    coordinates: { lat: 28.6139, lng: 110.2341 },
    telemetry: { altitudeKm: 28.4, speedKmh: 4200, batteryOrFuelPct: 82, estimatedMinutesRemaining: 95 },
    notes: 'Scramjet ignition nominal. Reached Mach 4.2 suborbital cruising vector.',
    receivedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    awbNumber: SEED_AWB.awbNumber,
    orderId: SEED_AWB.orderId,
    carrier: 'Hyper-Suborbital Express Corp',
    eventType: 'LOCAL_DRONE_DISPATCH',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    location: 'Mumbai Bandra Vertiport Rooftop Terminal',
    coordinates: { lat: 19.0596, lng: 72.8295 },
    telemetry: { altitudeKm: 0.15, speedKmh: 75, batteryOrFuelPct: 68, estimatedMinutesRemaining: 24 },
    notes: 'Transferred to Hexacopter Teleport Drone #7. Final descent in progress.',
    receivedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
]);

/**
 * Generates an Air Waybill (AWB) when a vendor fulfills and dispatches an order.
 */
export function generateAirWaybill(
  orderId: string,
  vendorId: string,
  recipient: { name: string; city: string },
  shippingTier: string = 'Hyper-Suborbital Air Transit',
  declaredValue: number = 499
): AirWaybill {
  const existing = AWB_REGISTRY.get(orderId);
  if (existing) return existing;

  const vendor = getVendorById(vendorId);
  const locationCity = vendor?.location?.split(',')[0]?.trim() || 'Tokyo';
  const originHub = ORIGIN_HUBS[locationCity] || ORIGIN_HUBS.default;
  const destinationHub = `${recipient.city.toUpperCase().slice(0, 3)}-SKYPORT-ROOFTOP-01`;

  const codeSuffix = cryptoRandomString(6).toUpperCase();
  const awbNumber = `AWB-SUB-${codeSuffix}`;
  const now = new Date();
  const deadline = new Date(now.getTime() + 24 * 3600 * 1000);

  const awb: AirWaybill = {
    awbNumber,
    orderId,
    vendorId,
    vendorName: vendor?.name || 'Verified Maker',
    carrierName: shippingTier.includes('Drone')
      ? 'Autonomous Drone Teleport Express'
      : shippingTier.includes('Suborbital')
      ? 'Hyper-Suborbital Express Corp'
      : 'Quantum Standard Freight Logistics',
    shippingTier,
    originHub,
    destinationHub,
    recipientName: recipient.name,
    recipientCity: recipient.city,
    weightKg: 1.25,
    declaredValue,
    barcode: '||| || ||| | |||| || || | |||',
    qrCodeData: `https://unified-commerce.ai/manifest/${awbNumber}`,
    generatedAt: now.toISOString(),
    dispatchDeadline: deadline.toISOString(),
  };

  AWB_REGISTRY.set(awbNumber, awb);
  AWB_REGISTRY.set(orderId, awb);

  // Initialize initial manifest carrier event
  const initialEvent: CarrierEventRecord = {
    awbNumber,
    orderId,
    carrier: awb.carrierName,
    eventType: 'MANIFEST_CREATED',
    timestamp: now.toISOString(),
    location: originHub,
    coordinates: { lat: 35.6762, lng: 139.6503 },
    telemetry: { altitudeKm: 0, speedKmh: 0, batteryOrFuelPct: 100, estimatedMinutesRemaining: 180 },
    notes: 'AWB created by vendor. Package staged at fulfillment bay.',
    receivedAt: now.toISOString(),
  };

  const events = ORDER_CARRIER_EVENTS.get(orderId) || [];
  events.push(initialEvent);
  ORDER_CARRIER_EVENTS.set(orderId, events);

  return awb;
}

/**
 * Returns AWB record by AWB number or orderId.
 */
export function getAirWaybill(identifier: string): AirWaybill | undefined {
  return AWB_REGISTRY.get(identifier);
}

/**
 * Processes incoming signed carrier telemetry webhooks.
 */
export function processCarrierWebhook(
  payload: CarrierWebhookPayload
): { success: boolean; eventRecord?: CarrierEventRecord; error?: string } {
  if (!payload.awbNumber || !payload.orderId || !payload.eventType) {
    return { success: false, error: 'Missing mandatory AWB or event payload fields.' };
  }

  const now = new Date().toISOString();
  const eventRecord: CarrierEventRecord = {
    ...payload,
    timestamp: payload.timestamp || now,
    receivedAt: now,
  };

  const existing = ORDER_CARRIER_EVENTS.get(payload.orderId) || [];
  existing.push(eventRecord);
  ORDER_CARRIER_EVENTS.set(payload.orderId, existing);

  // If carrier announces delivery, mature escrow for vendor payout clearance
  if (payload.eventType === 'DELIVERED') {
    matureEscrowForOrder(payload.orderId);
  }

  return {
    success: true,
    eventRecord,
  };
}

/**
 * Retrieves the flight telemetry event history for an order or AWB.
 */
export function getOrderCarrierEvents(orderId: string): CarrierEventRecord[] {
  return ORDER_CARRIER_EVENTS.get(orderId) || [];
}

/**
 * Simulates a progressive carrier step forward for interactive testing.
 */
export function simulateNextCarrierEvent(orderId: string) {
  const awb = AWB_REGISTRY.get(orderId);
  const events = ORDER_CARRIER_EVENTS.get(orderId) || [];
  const lastEvent = events[events.length - 1];

  const sequence: CarrierEventType[] = [
    'MANIFEST_CREATED',
    'PICKED_UP_AT_WAREHOUSE',
    'SUBORBITAL_LAUNCH',
    'ORBITAL_APOGEE',
    'DESCENT_APPROACH',
    'LOCAL_DRONE_DISPATCH',
    'DELIVERED',
  ];

  let nextIdx = 0;
  if (lastEvent) {
    const curIdx = sequence.indexOf(lastEvent.eventType);
    nextIdx = curIdx >= 0 && curIdx < sequence.length - 1 ? curIdx + 1 : sequence.length - 1;
  }

  const nextType = sequence[nextIdx];
  const now = new Date().toISOString();

  const coordsMap: Record<CarrierEventType, { lat: number; lng: number; alt: number; spd: number; loc: string; note: string }> = {
    MANIFEST_CREATED: { lat: 35.5494, lng: 139.7798, alt: 0, spd: 0, loc: 'Origin Haneda Hub', note: 'Package sealed in cargo container.' },
    PICKED_UP_AT_WAREHOUSE: { lat: 35.5494, lng: 139.7798, alt: 0, spd: 45, loc: 'Haneda Tarmac', note: 'Loaded onto Suborbital Shuttle Falcon-X.' },
    SUBORBITAL_LAUNCH: { lat: 30.1234, lng: 125.4567, alt: 24.5, spd: 3800, loc: 'East China Sea Corridor', note: 'Scramjets firing at Mach 3.8.' },
    ORBITAL_APOGEE: { lat: 24.5678, lng: 95.1234, alt: 42.1, spd: 5400, loc: 'Bay of Bengal Apogee Point', note: 'Zero-G glide phase across orbital vector.' },
    DESCENT_APPROACH: { lat: 19.8765, lng: 74.3210, alt: 8.2, spd: 850, loc: 'Western Ghats Approach', note: 'Aero-braking and descent corridor alignment.' },
    LOCAL_DRONE_DISPATCH: { lat: 19.0596, lng: 72.8295, alt: 0.12, spd: 65, loc: 'Bandra West Skyport', note: 'Autonomous hexacopter dispatched to recipient.' },
    DELIVERED: { lat: 19.0596, lng: 72.8295, alt: 0, spd: 0, loc: 'Recipient Rooftop Landing Pad', note: 'Package delivered and biometric scan verified.' },
    EXCEPTION_DELAY: { lat: 0, lng: 0, alt: 0, spd: 0, loc: 'Holding Pattern', note: 'Atmospheric turbulence holding vector.' },
  };

  const meta = coordsMap[nextType];

  return processCarrierWebhook({
    awbNumber: awb?.awbNumber || `AWB-${orderId}`,
    orderId,
    carrier: awb?.carrierName || 'Hyper-Suborbital Express Corp',
    eventType: nextType,
    timestamp: now,
    location: meta.loc,
    coordinates: { lat: meta.lat, lng: meta.lng },
    telemetry: {
      altitudeKm: meta.alt,
      speedKmh: meta.spd,
      batteryOrFuelPct: Math.max(20, 100 - nextIdx * 12),
      estimatedMinutesRemaining: Math.max(0, (sequence.length - 1 - nextIdx) * 30),
    },
    notes: meta.note,
  });
}
