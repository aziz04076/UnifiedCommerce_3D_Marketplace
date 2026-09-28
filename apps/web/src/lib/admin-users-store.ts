import fs from 'fs';
import path from 'path';
import { hashPassword, verifyPassword } from './auth';

export interface AdminUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: 'super_admin' | 'owner' | 'admin' | 'staff_orders' | 'staff_products';
  mustChangePassword?: boolean;
  twoFaEnabled: boolean;
  totpSecret?: string;
  createdAt: number;
  lastLoginAt?: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'admin-users.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getAllAdminUsers(): AdminUserRecord[] {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw) as AdminUserRecord[];
  } catch (err) {
    console.error('[admin-users-store] Failed to read admin users:', err);
    return [];
  }
}

export function getAdminUserByEmail(email: string): AdminUserRecord | undefined {
  const users = getAllAdminUsers();
  const normalized = email.toLowerCase().trim();
  return users.find((u) => u.email.toLowerCase().trim() === normalized);
}

export function saveAdminUser(user: AdminUserRecord): void {
  ensureDataDir();
  const users = getAllAdminUsers();
  const index = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
  if (index >= 0) {
    users[index] = { ...users[index], ...user };
  } else {
    users.push(user);
  }
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

export function deleteAdminUser(id: string): boolean {
  ensureDataDir();
  const users = getAllAdminUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  fs.writeFileSync(USERS_FILE, JSON.stringify(filtered, null, 2), 'utf8');
  return true;
}
