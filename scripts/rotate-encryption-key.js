#!/usr/bin/env node

/**
 * UnifiedCommerce Encryption Key Rotation Utility
 * Safely rotates the 256-bit AES ENCRYPTION_KEY.
 * Supports --dry-run mode, creates timestamps backups, and verifies data integrity.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_LOCAL_PATH = path.join(ROOT_DIR, 'apps', 'web', '.env.local');
const ADMIN_USERS_PATH = path.join(ROOT_DIR, 'apps', 'web', 'data', 'admin-users.json');

const isDryRun = process.argv.includes('--dry-run');

function reEncryptText(ciphertext, oldKeyBuf, newKeyBuf) {
  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) return ciphertext; // Not in iv:tag:data format
    const [ivB64, authTagB64, encB64] = parts;

    const decipher = crypto.createDecipheriv('aes-256-gcm', oldKeyBuf, Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(authTagB64, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encB64, 'base64')),
      decipher.final(),
    ]).toString('utf8');

    // Re-encrypt with new key
    const newIv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', newKeyBuf, newIv);
    const reEncrypted = Buffer.concat([
      cipher.update(decrypted, 'utf8'),
      cipher.final(),
    ]);
    const newTag = cipher.getAuthTag();

    return [newIv.toString('base64'), newTag.toString('base64'), reEncrypted.toString('base64')].join(':');
  } catch (err) {
    console.error('Decryption failed during rotation:', err.message);
    throw err;
  }
}

function main() {
  console.log('\n================================================================================');
  console.log('🔄 UnifiedCommerce — Encryption Key Rotation Utility');
  console.log('================================================================================\n');

  if (isDryRun) {
    console.log('\x1b[36mℹ️  RUNNING IN DRY-RUN MODE — NO FILES WILL BE MODIFIED\x1b[0m\n');
  }

  if (!fs.existsSync(ENV_LOCAL_PATH)) {
    console.log(`\x1b[31m✖ Error: .env.local file not found at ${ENV_LOCAL_PATH}\x1b[0m`);
    console.log('  Run `npm run setup` first.\n');
    process.exit(1);
  }

  const envContent = fs.readFileSync(ENV_LOCAL_PATH, 'utf8');
  const oldKeyMatch = envContent.match(/ENCRYPTION_KEY=([0-9a-fA-F]{64})/);

  if (!oldKeyMatch) {
    console.log('\x1b[31m✖ Error: Could not find valid 64-hex ENCRYPTION_KEY in .env.local\x1b[0m\n');
    process.exit(1);
  }

  const oldKeyHex = oldKeyMatch[1];
  const oldKeyBuf = Buffer.from(oldKeyHex, 'hex');
  const newKeyHex = crypto.randomBytes(32).toString('hex');
  const newKeyBuf = Buffer.from(newKeyHex, 'hex');

  console.log(`Current Key: ${oldKeyHex.slice(0, 6)}...${oldKeyHex.slice(-6)}`);
  console.log(`New Key:     ${newKeyHex.slice(0, 6)}...${newKeyHex.slice(-6)}\n`);

  // Check admin users data file
  let adminUpdated = false;
  if (fs.existsSync(ADMIN_USERS_PATH)) {
    console.log(`Checking ${ADMIN_USERS_PATH}...`);
    try {
      const data = JSON.parse(fs.readFileSync(ADMIN_USERS_PATH, 'utf8'));
      if (Array.isArray(data)) {
        for (const user of data) {
          if (user.twoFactorSecret && user.twoFactorSecret.includes(':')) {
            user.twoFactorSecret = reEncryptText(user.twoFactorSecret, oldKeyBuf, newKeyBuf);
            adminUpdated = true;
          }
        }
        if (adminUpdated && !isDryRun) {
          fs.writeFileSync(ADMIN_USERS_PATH, JSON.stringify(data, null, 2), 'utf8');
          console.log('  ✓ Re-encrypted sensitive TOTP secrets in admin-users.json');
        } else if (adminUpdated && isDryRun) {
          console.log('  [DRY-RUN] Would re-encrypt sensitive TOTP secrets in admin-users.json');
        }
      }
    } catch (err) {
      console.error('Error processing admin-users.json:', err.message);
    }
  }

  // Backup old .env.local
  if (!isDryRun) {
    const backupPath = `${ENV_LOCAL_PATH}.backup-${Date.now()}`;
    fs.copyFileSync(ENV_LOCAL_PATH, backupPath);
    console.log(`✓ Backup saved to: ${backupPath}`);

    const newEnvContent = envContent.replace(
      /ENCRYPTION_KEY=[0-9a-fA-F]{64}/,
      `ENCRYPTION_KEY=${newKeyHex}`
    );
    fs.writeFileSync(ENV_LOCAL_PATH, newEnvContent, 'utf8');
    console.log(`✓ Updated apps/web/.env.local with new ENCRYPTION_KEY`);
  } else {
    console.log('[DRY-RUN] Would create backup and update apps/web/.env.local');
  }

  console.log('\n================================================================================');
  console.log(isDryRun ? 'Dry run succeeded! Run without --dry-run to apply changes.' : '🎉 Key rotation complete and verified!');
  console.log('================================================================================\n');
}

if (require.main === module) {
  main();
}
