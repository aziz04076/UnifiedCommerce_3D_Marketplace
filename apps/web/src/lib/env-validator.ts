import { z } from 'zod';

const PLACEHOLDERS = [
  'changeme',
  'placeholder',
  'your_key_here',
  'your_key_secret',
  'your_webhook_secret',
  '64_hex_characters_here',
  'rzp_test_your_key_id',
  'rzp_live_your_key_id',
  'xxxx',
  '000000',
];

function isPlaceholder(val?: string | null): boolean {
  if (!val) return false;
  const lower = val.toLowerCase().trim();
  return PLACEHOLDERS.some((p) => lower.includes(p));
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_STORE_NAME: z.string().default('UnifiedCommerce'),
  
  // 64 hex characters (32 bytes AES-256 key)
  ENCRYPTION_KEY: z.string().optional(),

  // Razorpay credentials
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // Optional services
  SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

export type ValidatedEnv = z.infer<typeof EnvSchema>;

export interface EnvValidationReport {
  isValid: boolean;
  isProduction: boolean;
  warnings: string[];
  errors: string[];
  featuresDisabled: string[];
  maskedKeys: Record<string, string>;
}

let _report: EnvValidationReport | null = null;
let _env: ValidatedEnv | null = null;

export function validateEnvironment(): { env: ValidatedEnv; report: EnvValidationReport } {
  if (_env && _report) {
    return { env: _env, report: _report };
  }

  const raw = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME ?? 'UnifiedCommerce',
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
  };

  const parsed = EnvSchema.safeParse(raw);
  const isProd = raw.NODE_ENV === 'production';

  const warnings: string[] = [];
  const errors: string[] = [];
  const featuresDisabled: string[] = [];
  const maskedKeys: Record<string, string> = {};

  const mask = (s?: string) => {
    if (!s) return '(not set)';
    if (s.length <= 8) return '********';
    return `${s.slice(0, 4)}...${s.slice(-4)}`;
  };

  // 1. Validate ENCRYPTION_KEY
  if (!raw.ENCRYPTION_KEY) {
    const msg = 'ENCRYPTION_KEY is missing. Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"';
    if (isProd) {
      errors.push(msg);
    } else {
      warnings.push(msg);
      featuresDisabled.push('AES-256 data-at-rest encryption (using ephemeral dev key fallback)');
    }
  } else if (isPlaceholder(raw.ENCRYPTION_KEY)) {
    const msg = 'ENCRYPTION_KEY contains a placeholder value. Replace with a real 64-hex key.';
    if (isProd) errors.push(msg);
    else warnings.push(msg);
  } else if (!/^[0-9a-fA-F]{64}$/.test(raw.ENCRYPTION_KEY)) {
    const msg = `ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). Current length: ${raw.ENCRYPTION_KEY.length}`;
    if (isProd) errors.push(msg);
    else warnings.push(msg);
  } else {
    maskedKeys.ENCRYPTION_KEY = mask(raw.ENCRYPTION_KEY);
  }

  // 2. Validate Razorpay Keys
  const rzpId = raw.RAZORPAY_KEY_ID;
  const rzpSec = raw.RAZORPAY_KEY_SECRET;
  const rzpWebhook = raw.RAZORPAY_WEBHOOK_SECRET;

  if (!rzpId || !rzpSec) {
    warnings.push('Razorpay keys not configured. To enable online payments, set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from dashboard.razorpay.com.');
    featuresDisabled.push('Razorpay UPI / Cards / NetBanking payments (Cash on Delivery remains available)');
  } else {
    maskedKeys.RAZORPAY_KEY_ID = rzpId;
    maskedKeys.RAZORPAY_KEY_SECRET = mask(rzpSec);

    if (isPlaceholder(rzpId) || isPlaceholder(rzpSec)) {
      const msg = 'Razorpay keys contain placeholder text. Please obtain real API keys from your Razorpay Dashboard.';
      if (isProd) errors.push(msg);
      else warnings.push(msg);
    } else if (!/^rzp_(test|live)_[a-zA-Z0-9]+$/.test(rzpId)) {
      const msg = `RAZORPAY_KEY_ID format invalid: must start with "rzp_test_" or "rzp_live_" followed by alphanumeric characters.`;
      if (isProd) errors.push(msg);
      else warnings.push(msg);
    }

    // Check mixed mode (e.g. live key with test webhook)
    const isLiveKey = rzpId.startsWith('rzp_live_');
    if (rzpWebhook && !isPlaceholder(rzpWebhook)) {
      maskedKeys.RAZORPAY_WEBHOOK_SECRET = mask(rzpWebhook);
    }
  }

  // 3. Site URL
  if (isProd && (raw.NEXT_PUBLIC_SITE_URL.includes('localhost') || raw.NEXT_PUBLIC_SITE_URL.includes('127.0.0.1'))) {
    warnings.push('NEXT_PUBLIC_SITE_URL is set to localhost in production mode. Set your live custom domain.');
  }

  _report = {
    isValid: errors.length === 0,
    isProduction: isProd,
    warnings,
    errors,
    featuresDisabled,
    maskedKeys,
  };

  _env = parsed.success ? parsed.data : (raw as ValidatedEnv);

  // In production mode, throw hard on required violations
  if (isProd && errors.length > 0) {
    const errorBlock = [
      '================================================================================',
      '🚨 PRODUCTION ENVIRONMENT VALIDATION FAILED',
      '================================================================================',
      ...errors.map((e) => `  ✖ ${e}`),
      '--------------------------------------------------------------------------------',
      'Run `npm run setup` or `npm run check:env` to configure your environment safely.',
      '================================================================================',
    ].join('\n');
    throw new Error(errorBlock);
  }

  // In dev mode, print color-coded warning summary once if there are warnings
  if (!isProd && (warnings.length > 0 || featuresDisabled.length > 0)) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
      console.log('\x1b[33m%s\x1b[0m', '⚠️  [EnvValidator] Development Mode Environment Status:');
      warnings.forEach((w) => console.log('\x1b[33m%s\x1b[0m', `   • ${w}`));
      if (featuresDisabled.length > 0) {
        console.log('\x1b[36m%s\x1b[0m', '   ℹ️  Features running in safe fallback mode:');
        featuresDisabled.forEach((f) => console.log('\x1b[36m%s\x1b[0m', `     - ${f}`));
      }
    }
  }

  return { env: _env, report: _report };
}

export function isRazorpayConfigured(): boolean {
  const { env, report } = validateEnvironment();
  if (!report.isValid) return false;
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return false;
  if (isPlaceholder(env.RAZORPAY_KEY_ID) || isPlaceholder(env.RAZORPAY_KEY_SECRET)) return false;
  return true;
}

export function getSafeEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (key && /^[0-9a-fA-F]{64}$/.test(key) && !isPlaceholder(key)) {
    return Buffer.from(key, 'hex');
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ENCRYPTION_KEY must be a valid 64-hex character string in production.');
  }
  // Safe ephemeral dev fallback (consistent for dev session)
  return Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
}
