#!/usr/bin/env node

/**
 * UnifiedCommerce Razorpay Key Verification Script
 * Validates Razorpay credentials via a safe read-only API ping.
 * NEVER creates a charge or modifies financial state.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

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

function pingRazorpay(keyId, keySecret) {
  return new Promise((resolve) => {
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const options = {
      hostname: 'api.razorpay.com',
      port: 443,
      path: '/v1/payments?count=1',
      method: 'GET',
      headers: {
        Authorization: authHeader,
        'User-Agent': 'UnifiedCommerce-Preflight/1.0',
      },
      timeout: 8000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, error: 'Request timed out after 8s' });
    });

    req.on('error', (err) => {
      resolve({ status: 0, error: err.message });
    });

    req.end();
  });
}

async function main() {
  console.log('\n================================================================================');
  console.log('💳 UnifiedCommerce — Razorpay Gateway Verification');
  console.log('================================================================================\n');

  const env = loadEnvFiles();
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.log('\x1b[33m⚠️  No Razorpay credentials configured in apps/web/.env.local\x1b[0m\n');
    console.log('Your store will run in \x1b[36mCash on Delivery (COD) mode\x1b[0m only.');
    console.log('\nTo enable instant UPI, Credit/Debit cards, and NetBanking payments:');
    console.log('  1. Register a free account at: \x1b[34mhttps://dashboard.razorpay.com/signup\x1b[0m');
    console.log('  2. Complete your KYC (or stay in Test Mode for development).');
    console.log('  3. Go to Settings → API Keys → Generate Key.');
    console.log('  4. Run `npm run setup` and paste your Key ID and Key Secret.');
    console.log('     Or add them directly to `apps/web/.env.local`:');
    console.log('       RAZORPAY_KEY_ID=rzp_test_YourKeyHere');
    console.log('       RAZORPAY_KEY_SECRET=YourSecretHere\n');
    process.exit(0);
  }

  const isLive = keyId.startsWith('rzp_live_');
  const isTest = keyId.startsWith('rzp_test_');

  console.log(`Key ID:    ${keyId}`);
  console.log(`Mode:      ${isLive ? '\x1b[32mLIVE (Real Payments)\x1b[0m' : isTest ? '\x1b[36mTEST (Sandbox Mode)\x1b[0m' : '\x1b[31mUNKNOWN FORMAT\x1b[0m'}`);
  console.log('Connecting to https://api.razorpay.com/v1/payments (read-only ping)...\n');

  const result = await pingRazorpay(keyId, keySecret);

  if (result.status === 200) {
    console.log('\x1b[32m✔ SUCCESS: Razorpay credentials are valid and active!\x1b[0m');
    console.log(`  • Account is authorized to process payments.`);
    console.log(`  • Read verification confirmed without creating any charges.`);
    if (isLive) {
      console.log('  • \x1b[33mNOTICE: Real money transactions are ENABLED.\x1b[0m');
    } else {
      console.log('  • Sandbox test payments are active. Real cards will NOT be charged.');
    }
    console.log('');
  } else if (result.status === 401) {
    console.log('\x1b[31m✖ AUTHENTICATION FAILED (HTTP 401 Unauthorized)\x1b[0m');
    console.log('  The Key ID or Key Secret is incorrect or was regenerated in your Razorpay dashboard.');
    console.log('  Please verify your credentials at: https://dashboard.razorpay.com/app/keys\n');
    process.exit(1);
  } else {
    console.log(`\x1b[33m⚠️  Verification returned status: ${result.status}\x1b[0m`);
    if (result.error) console.log(`  Error: ${result.error}`);
    if (result.body) console.log('  Response:', JSON.stringify(result.body, null, 2));
    console.log('\nCheck your network connection or verify key permissions in your Razorpay dashboard.\n');
  }
}

if (require.main === module) {
  main();
}
