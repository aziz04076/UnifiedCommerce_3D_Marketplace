import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession, hashPassword, verifyTotp, generateTotpSecret } from '../../../../lib/auth';
import { getAdminUserByEmail, saveAdminUser } from '../../../../lib/admin-users-store';
import { isAllowed } from '../../../../lib/rate-limiter';

export const dynamic = 'force-dynamic';

const SetupAdminSchema = z.object({
  newPassword: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special symbol'),
  totpCode: z.string().length(6).regex(/^\d{6}$/, 'TOTP code must be 6 digits'),
  totpSecret: z.string().min(1, 'TOTP secret required'),
});

/**
 * GET: Returns a new TOTP secret for initial 2FA enrollment
 */
export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('session')?.value;
  const session = sessionId ? getSession(sessionId) : null;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const totpSecret = generateTotpSecret();
  const issuer = encodeURIComponent('UnifiedCommerce SuperAdmin');
  const account = encodeURIComponent(session.userId);
  const otpauthUrl = `otpauth://totp/${issuer}:${account}?secret=${totpSecret}&issuer=${issuer}`;

  return NextResponse.json({
    totpSecret,
    otpauthUrl,
  });
}

/**
 * POST: Complete mandatory first-login password change and 2FA activation
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (!isAllowed(`setup-admin:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please wait.' }, { status: 429 });
  }

  const sessionId = req.cookies.get('session')?.value;
  const session = sessionId ? getSession(sessionId) : null;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: unknown = await req.json().catch(() => ({}));
  const parsed = SetupAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const { newPassword, totpCode, totpSecret } = parsed.data;

  // Verify TOTP code before activating
  const isValidTotp = verifyTotp(totpSecret, totpCode);
  if (!isValidTotp) {
    return NextResponse.json({ error: 'Invalid 2FA authenticator code. Check your authenticator app.' }, { status: 400 });
  }

  // Find user and update
  const user = getAdminUserByEmail(session.userId);
  if (!user) {
    return NextResponse.json({ error: 'Admin account record not found.' }, { status: 404 });
  }

  const newHash = await hashPassword(newPassword);

  saveAdminUser({
    ...user,
    passwordHash: newHash,
    mustChangePassword: false,
    twoFaEnabled: true,
    totpSecret,
  });

  return NextResponse.json({
    success: true,
    message: 'Super Admin credentials updated and 2FA successfully activated.',
  });
}
