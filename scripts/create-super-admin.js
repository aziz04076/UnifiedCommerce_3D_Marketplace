#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

// Path to persistent admin-users.json
const DATA_DIR = path.join(__dirname, '..', 'apps', 'web', 'data');
const USERS_FILE = path.join(DATA_DIR, 'admin-users.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readUsers() {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function generateOneTimePassword(length = 16) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

async function promptEmail() {
  // Check CLI argument or environment variable first
  const envEmail = process.env.SUPER_ADMIN_EMAIL || process.argv[2];
  if (envEmail && envEmail.includes('@')) {
    return envEmail.trim().toLowerCase();
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Enter Super Admin Email: ', (answer) => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();
      if (!trimmed || !trimmed.includes('@')) {
        console.error('❌ Error: A valid email address is required.');
        process.exit(1);
      }
      resolve(trimmed);
    });
  });
}

async function main() {
  console.log('\n======================================================');
  console.log('   🛡️  UnifiedCommerce — Create Super Admin CLI       ');
  console.log('======================================================\n');

  const email = await promptEmail();
  const oneTimePassword = generateOneTimePassword(18);
  const passwordHash = await hashPassword(oneTimePassword);

  const users = readUsers();
  const existingIndex = users.findIndex((u) => u.email.toLowerCase() === email);

  const superAdminRecord = {
    id: `sa_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    email,
    passwordHash,
    role: 'super_admin',
    mustChangePassword: true,
    twoFaEnabled: false,
    createdAt: Date.now(),
  };

  if (existingIndex >= 0) {
    users[existingIndex] = { ...users[existingIndex], ...superAdminRecord };
    console.log(`⚠️  Existing account for "${email}" updated to Super Admin.`);
  } else {
    users.push(superAdminRecord);
    console.log(`✅ Super Admin created successfully.`);
  }

  writeUsers(users);

  console.log('\n------------------------------------------------------');
  console.log('  ONE-TIME CREDENTIALS (SHOWN ONCE — SAVE SECURELY)   ');
  console.log('------------------------------------------------------');
  console.log(`  Role:               SUPER ADMIN`);
  console.log(`  Email:              ${email}`);
  console.log(`  One-Time Password:  ${oneTimePassword}`);
  console.log('------------------------------------------------------');
  console.log('  ⚠️  MANDATORY SECURITY ENFORCEMENT:');
  console.log('  1. Navigate to: http://localhost:3000/super-admin/login');
  console.log('  2. Log in using the one-time password above.');
  console.log('  3. You will be forced to change your password (min 12 chars)');
  console.log('     and configure 2FA (Authenticator app) before access is granted.');
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('❌ Fatal error generating super admin:', err);
  process.exit(1);
});
