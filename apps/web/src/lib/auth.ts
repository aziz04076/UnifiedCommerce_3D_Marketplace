import crypto from 'crypto';
import { z } from 'zod';

// ── Types ──────────────────────────────────────────────────────────────────

export interface Session {
  sessionId: string;
  userId: string;
  role: 'super_admin' | 'owner' | 'staff_orders' | 'staff_products' | 'admin';
  createdAt: number;
  lastSeen: number;
  userAgent: string;
  ip: string;
}

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

// ── In-memory session store (replace with DB/Redis in production) ──────────
const sessions = new Map<string, Session>();
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Lockout ────────────────────────────────────────────────────────────────

export function isLockedOut(email: string): boolean {
  const record = failedAttempts.get(email);
  if (!record) return false;
  if (Date.now() < record.lockedUntil) return true;
  // Lock expired
  failedAttempts.delete(email);
  return false;
}

export function recordFailedAttempt(email: string): void {
  const record = failedAttempts.get(email) ?? { count: 0, lockedUntil: 0 };
  record.count++;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_MS;
  }
  failedAttempts.set(email, record);
}

export function clearFailedAttempts(email: string): void {
  failedAttempts.delete(email);
}

// ── Sessions ───────────────────────────────────────────────────────────────

export function createSession(
  userId: string,
  role: Session['role'],
  userAgent: string,
  ip: string
): string {
  const sessionId = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionId, {
    sessionId,
    userId,
    role,
    createdAt: Date.now(),
    lastSeen: Date.now(),
    userAgent,
    ip,
  });
  return sessionId;
}

export function getSession(sessionId: string): Session | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(sessionId);
    return null;
  }
  session.lastSeen = Date.now();
  return session;
}

export function listSessions(userId: string): Session[] {
  return Array.from(sessions.values()).filter((s) => s.userId === userId);
}

export function revokeSession(sessionId: string): void {
  sessions.delete(sessionId);
}

export function revokeAllSessions(userId: string): void {
  for (const [id, session] of sessions.entries()) {
    if (session.userId === userId) sessions.delete(id);
  }
}

// ── Password hashing ───────────────────────────────────────────────────────
// Uses Node's built-in crypto.scrypt (no bcrypt dep needed)

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, storedKey] = hash.split(':');
  if (!salt || !storedKey) return false;
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(crypto.timingSafeEqual(Buffer.from(storedKey, 'hex'), derivedKey));
    });
  });
}

// ── TOTP (2FA) — RFC 6238 ─────────────────────────────────────────────────
// Minimal implementation without a heavy dep

export function generateTotpSecret(): string {
  return crypto.randomBytes(20).toString('base64');
}

/** Verify a 6-digit TOTP code. Checks current window ± 1 step. */
export function verifyTotp(secret: string, code: string): boolean {
  const step = 30; // 30-second window
  const now = Math.floor(Date.now() / 1000);
  const windows = [-1, 0, 1];

  return windows.some((offset) => {
    const counter = Math.floor((now + offset * step) / step);
    const expected = generateHotp(secret, counter);
    return crypto.timingSafeEqual(
      Buffer.from(expected.toString().padStart(6, '0')),
      Buffer.from(code.padStart(6, '0'))
    );
  });
}

function generateHotp(secret: string, counter: number): number {
  const key = Buffer.from(secret, 'base64');
  const counterBuf = Buffer.alloc(8);
  // Write 8-byte big-endian counter
  const counterBig = BigInt(counter);
  for (let i = 7; i >= 0; i--) {
    counterBuf[i] = Number(counterBig & BigInt(0xff));
    // shift right
  }
  const hmac = crypto.createHmac('sha1', key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return code % 1_000_000;
}
