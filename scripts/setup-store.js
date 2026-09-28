#!/usr/bin/env node

/**
 * UnifiedCommerce Store Setup Wizard
 * Configures store identity, branding, generates secure local secrets,
 * and sets up payment credentials safely without guessing or inventing keys.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT_DIR, 'apps', 'web');
const ENV_LOCAL_PATH = path.join(WEB_DIR, '.env.local');
const STORE_CONFIG_PATH = path.join(WEB_DIR, 'store.config.ts');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question, defaultValue = '') {
  const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      env[key] = val;
    }
  }
  return env;
}

function writeEnvFile(filePath, envObj) {
  const lines = [
    '# =====================================================================',
    '# UnifiedCommerce Environment Configuration (.env.local)',
    `# Generated at ${new Date().toISOString()}`,
    '# =====================================================================',
    '',
    '# ── Store Identity ───────────────────────────────────────────────────',
    `NEXT_PUBLIC_SITE_URL=${envObj.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`,
    `NEXT_PUBLIC_STORE_NAME=${envObj.NEXT_PUBLIC_STORE_NAME || 'My Shop'}`,
    '',
    '# ── Local Cryptographic Secrets ──────────────────────────────────────',
    `ENCRYPTION_KEY=${envObj.ENCRYPTION_KEY || ''}`,
    '',
    '# ── Razorpay Payment Gateway ─────────────────────────────────────────',
    '# Keys from https://dashboard.razorpay.com/app/keys',
    `RAZORPAY_KEY_ID=${envObj.RAZORPAY_KEY_ID || ''}`,
    `RAZORPAY_KEY_SECRET=${envObj.RAZORPAY_KEY_SECRET || ''}`,
    `RAZORPAY_WEBHOOK_SECRET=${envObj.RAZORPAY_WEBHOOK_SECRET || ''}`,
    '',
    '# ── Runtime ──────────────────────────────────────────────────────────',
    `NODE_ENV=${envObj.NODE_ENV || 'development'}`,
    '',
  ];
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
}

async function main() {
  console.log('\n=================================================================');
  console.log('🛍️  UnifiedCommerce — Store Setup Wizard');
  console.log('=================================================================\n');
  console.log('This wizard safely configures your store identity, generates local');
  console.log('cryptographic keys, and guides you through setting up payments.\n');

  const existingEnv = parseEnvFile(ENV_LOCAL_PATH);

  // 1. Identity
  console.log('── Step 1: Store Identity & Contact ───────────────────────────');
  const storeName = await ask('Store Name', existingEnv.NEXT_PUBLIC_STORE_NAME || 'My Local Shop');
  const tagline = await ask('Store Tagline', 'Quality products, delivered fast.');
  const phone = await ask('Phone number (with country code)', '+91-9876543210');
  const email = await ask('Support Email', 'hello@myshop.com');
  const address = await ask('Physical Store Address', '123 Market Street, City, State - 000000');

  // 2. Branding
  console.log('\n── Step 2: Branding & Theme ───────────────────────────────────');
  console.log('Available themes: fashion, food, electronics, general');
  const theme = await ask('Theme', 'general');
  const primaryColor = await ask('Primary Brand Color (Hex)', '#2563eb');
  const siteUrl = await ask('Website URL', existingEnv.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

  // 3. Cryptographic Secrets
  console.log('\n── Step 3: Cryptographic Keys ─────────────────────────────────');
  let encryptionKey = existingEnv.ENCRYPTION_KEY;
  if (!encryptionKey || encryptionKey.length !== 64) {
    encryptionKey = crypto.randomBytes(32).toString('hex');
    console.log('🔐 Generated new 256-bit AES ENCRYPTION_KEY (32 bytes).');
  } else {
    console.log('✓ Retaining existing valid ENCRYPTION_KEY.');
  }

  // 4. Payment Setup
  console.log('\n── Step 4: Razorpay Payments Setup ────────────────────────────');
  console.log('ℹ️  You can obtain Razorpay API keys for free at:');
  console.log('   https://dashboard.razorpay.com/app/keys');
  console.log('   (Leave blank if you want to use Cash on Delivery only for now)');

  const razorpayKeyId = await ask('Razorpay Key ID (rzp_test_... or rzp_live_...)', existingEnv.RAZORPAY_KEY_ID || '');
  let razorpayKeySecret = existingEnv.RAZORPAY_KEY_SECRET || '';
  if (razorpayKeyId) {
    razorpayKeySecret = await ask('Razorpay Key Secret', razorpayKeySecret);
  }
  let webhookSecret = existingEnv.RAZORPAY_WEBHOOK_SECRET || '';
  if (razorpayKeyId) {
    if (!webhookSecret) {
      webhookSecret = crypto.randomBytes(16).toString('hex');
      console.log(`✓ Generated local webhook verification secret: ${webhookSecret}`);
    }
  }

  // 5. Update .env.local
  const updatedEnv = {
    ...existingEnv,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_PUBLIC_STORE_NAME: storeName,
    ENCRYPTION_KEY: encryptionKey,
    RAZORPAY_KEY_ID: razorpayKeyId,
    RAZORPAY_KEY_SECRET: razorpayKeySecret,
    RAZORPAY_WEBHOOK_SECRET: webhookSecret,
    NODE_ENV: existingEnv.NODE_ENV || 'development',
  };

  writeEnvFile(ENV_LOCAL_PATH, updatedEnv);
  console.log(`\n✓ Saved environment configuration to apps/web/.env.local`);

  // 6. Update store.config.ts if present
  if (fs.existsSync(STORE_CONFIG_PATH)) {
    let configContent = fs.readFileSync(STORE_CONFIG_PATH, 'utf8');
    configContent = configContent.replace(/storeName:\s*'[^']*'/, `storeName: '${storeName.replace(/'/g, "\\'")}'`);
    configContent = configContent.replace(/storeTagline:\s*'[^']*'/, `storeTagline: '${tagline.replace(/'/g, "\\'")}'`);
    configContent = configContent.replace(/phone:\s*'[^']*'/, `phone: '${phone}'`);
    configContent = configContent.replace(/email:\s*'[^']*'/, `email: '${email}'`);
    configContent = configContent.replace(/address:\s*'[^']*'/, `address: '${address.replace(/'/g, "\\'")}'`);
    configContent = configContent.replace(/theme:\s*'[^']*'/, `theme: '${theme}'`);
    configContent = configContent.replace(/primaryColor:\s*'[^']*'/, `primaryColor: '${primaryColor}'`);

    fs.writeFileSync(STORE_CONFIG_PATH, configContent, 'utf8');
    console.log('✓ Updated store configuration in apps/web/store.config.ts');
  }

  console.log('\n=================================================================');
  console.log('🎉 Store setup complete!');
  console.log('=================================================================');
  console.log('\nNext steps:');
  console.log('  1. Run `npm run check:env` to verify your environment.');
  console.log('  2. Run `npm run verify:razorpay` to test your payment gateway credentials.');
  console.log('  3. Run `npm run create-super-admin` to seed your admin account.');
  console.log('  4. Review `GO_LIVE_CHECKLIST.md` before going to production.\n');

  rl.close();
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Setup wizard error:', err);
    process.exit(1);
  });
}
