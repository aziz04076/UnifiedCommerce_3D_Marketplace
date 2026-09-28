#!/usr/bin/env node

/**
 * UnifiedCommerce Environment Pre-Flight Checker
 * Validates configuration, detects mixed environments, checks key formats,
 * and prints safe masked diagnostics without leaking secrets.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_PATHS = [
  path.join(ROOT_DIR, 'apps', 'web', '.env.local'),
  path.join(ROOT_DIR, 'apps', 'web', '.env'),
  path.join(ROOT_DIR, '.env'),
];

function loadEnvFiles() {
  const merged = { ...process.env };
  for (const p of ENV_PATHS) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim();
          if (!merged[key]) {
            merged[key] = val;
          }
        }
      }
    }
  }
  return merged;
}

function maskSecret(val) {
  if (!val) return '\x1b[90m(not configured)\x1b[0m';
  if (val.length <= 8) return '********';
  return `${val.slice(0, 4)}...${val.slice(-4)}`;
}

const PLACEHOLDERS = [
  'changeme',
  'placeholder',
  'your_key_here',
  'your_key_secret',
  'your_webhook_secret',
  '64_hex_characters_here',
  'rzp_test_your_key_id',
  'rzp_live_your_key_id',
];

function isPlaceholder(val) {
  if (!val) return false;
  const lower = val.toLowerCase().trim();
  return PLACEHOLDERS.some((p) => lower.includes(p));
}

function main() {
  console.log('\n================================================================================');
  console.log('🔍 UnifiedCommerce — Pre-Flight Environment Audit');
  console.log('================================================================================\n');

  const env = loadEnvFiles();
  const isProd = env.NODE_ENV === 'production';

  const rows = [];
  let errorCount = 0;
  let warnCount = 0;

  // 1. NODE_ENV
  rows.push({
    variable: 'NODE_ENV',
    value: env.NODE_ENV || 'development (default)',
    status: '\x1b[32mOK\x1b[0m',
    notes: isProd ? 'Production optimization active' : 'Dev mode active',
  });

  // 2. NEXT_PUBLIC_SITE_URL
  const siteUrl = env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const isLocalUrl = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');
  if (isProd && isLocalUrl) {
    warnCount++;
    rows.push({
      variable: 'NEXT_PUBLIC_SITE_URL',
      value: siteUrl,
      status: '\x1b[33mWARN\x1b[0m',
      notes: 'Production domain should not be localhost',
    });
  } else {
    rows.push({
      variable: 'NEXT_PUBLIC_SITE_URL',
      value: siteUrl,
      status: '\x1b[32mOK\x1b[0m',
      notes: 'Valid URL format',
    });
  }

  // 3. ENCRYPTION_KEY
  const encKey = env.ENCRYPTION_KEY;
  if (!encKey) {
    if (isProd) {
      errorCount++;
      rows.push({
        variable: 'ENCRYPTION_KEY',
        value: '\x1b[31mMISSING\x1b[0m',
        status: '\x1b[31mERROR\x1b[0m',
        notes: 'Required for AES-256 GCM in production',
      });
    } else {
      warnCount++;
      rows.push({
        variable: 'ENCRYPTION_KEY',
        value: '\x1b[33mFALLBACK\x1b[0m',
        status: '\x1b[33mWARN\x1b[0m',
        notes: 'Dev fallback active. Run `npm run setup`',
      });
    }
  } else if (isPlaceholder(encKey)) {
    errorCount++;
    rows.push({
      variable: 'ENCRYPTION_KEY',
      value: maskSecret(encKey),
      status: '\x1b[31mERROR\x1b[0m',
      notes: 'Placeholder detected. Generate a real 64-hex key',
    });
  } else if (!/^[0-9a-fA-F]{64}$/.test(encKey)) {
    errorCount++;
    rows.push({
      variable: 'ENCRYPTION_KEY',
      value: `${encKey.length} chars`,
      status: '\x1b[31mERROR\x1b[0m',
      notes: 'Must be exactly 64 hex characters (32 bytes)',
    });
  } else {
    rows.push({
      variable: 'ENCRYPTION_KEY',
      value: maskSecret(encKey),
      status: '\x1b[32mOK\x1b[0m',
      notes: '64 hex characters (256-bit AES-GCM)',
    });
  }

  // 4. RAZORPAY_KEY_ID & SECRET
  const rzpId = env.RAZORPAY_KEY_ID;
  const rzpSecret = env.RAZORPAY_KEY_SECRET;
  const rzpWebhook = env.RAZORPAY_WEBHOOK_SECRET;

  if (!rzpId) {
    warnCount++;
    rows.push({
      variable: 'RAZORPAY_KEY_ID',
      value: '\x1b[90m(blank)\x1b[0m',
      status: '\x1b[33mINFO\x1b[0m',
      notes: 'Online payments disabled (COD active)',
    });
  } else if (isPlaceholder(rzpId)) {
    errorCount++;
    rows.push({
      variable: 'RAZORPAY_KEY_ID',
      value: rzpId,
      status: '\x1b[31mERROR\x1b[0m',
      notes: 'Placeholder detected. Use real key or leave blank',
    });
  } else if (!/^rzp_(test|live)_[a-zA-Z0-9]+$/.test(rzpId)) {
    errorCount++;
    rows.push({
      variable: 'RAZORPAY_KEY_ID',
      value: rzpId,
      status: '\x1b[31mERROR\x1b[0m',
      notes: 'Must begin with rzp_test_ or rzp_live_',
    });
  } else {
    const isLive = rzpId.startsWith('rzp_live_');
    rows.push({
      variable: 'RAZORPAY_KEY_ID',
      value: rzpId,
      status: '\x1b[32mOK\x1b[0m',
      notes: isLive ? 'Live Production Mode' : 'Test Sandbox Mode',
    });
  }

  if (!rzpSecret) {
    if (rzpId) {
      errorCount++;
      rows.push({
        variable: 'RAZORPAY_KEY_SECRET',
        value: '\x1b[31mMISSING\x1b[0m',
        status: '\x1b[31mERROR\x1b[0m',
        notes: 'Secret required when KEY_ID is present',
      });
    }
  } else if (isPlaceholder(rzpSecret)) {
    errorCount++;
    rows.push({
      variable: 'RAZORPAY_KEY_SECRET',
      value: maskSecret(rzpSecret),
      status: '\x1b[31mERROR\x1b[0m',
      notes: 'Placeholder detected',
    });
  } else {
    rows.push({
      variable: 'RAZORPAY_KEY_SECRET',
      value: maskSecret(rzpSecret),
      status: '\x1b[32mOK\x1b[0m',
      notes: 'Secret present and masked',
    });
  }

  if (rzpWebhook) {
    rows.push({
      variable: 'RAZORPAY_WEBHOOK_SECRET',
      value: maskSecret(rzpWebhook),
      status: '\x1b[32mOK\x1b[0m',
      notes: 'Webhook HMAC verification active',
    });
  }

  // Print Table
  console.log('--------------------------------------------------------------------------------');
  console.log(
    'Variable'.padEnd(25) +
    'Value / Preview'.padEnd(24) +
    'Status'.padEnd(12) +
    'Notes'
  );
  console.log('--------------------------------------------------------------------------------');
  for (const r of rows) {
    console.log(
      r.variable.padEnd(25) +
      r.value.padEnd(30) +
      r.status.padEnd(18) +
      r.notes
    );
  }
  console.log('--------------------------------------------------------------------------------\n');

  console.log(`Summary: ${errorCount} Error(s), ${warnCount} Warning(s) / Info.`);

  if (errorCount > 0) {
    console.log('\n\x1b[31m✖ Fix the errors above before launching your store in production.\x1b[0m');
    console.log('  Run `npm run setup` for an interactive guided fix.\n');
    process.exit(isProd ? 1 : 0);
  } else {
    console.log('\n\x1b[32m✓ Environment check completed successfully.\x1b[0m\n');
  }
}

if (require.main === module) {
  main();
}
