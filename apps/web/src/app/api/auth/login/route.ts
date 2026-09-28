import { NextRequest, NextResponse } from 'next/server';
import {
  LoginSchema,
  isLockedOut,
  recordFailedAttempt,
  clearFailedAttempts,
  createSession,
  verifyPassword,
} from '../../../../lib/auth';
import { getAdminUserByEmail } from '../../../../lib/admin-users-store';
import { isAllowed } from '../../../../lib/rate-limiter';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  // Rate limit: 10 attempts per 15 minutes per IP
  if (!isAllowed(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait 15 minutes.' },
      { status: 429 }
    );
  }

  const body: unknown = await req.json().catch(() => ({}));
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid credentials format' }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  if (isLockedOut(normalizedEmail)) {
    return NextResponse.json(
      { error: 'Account temporarily locked due to repeated failed attempts. Try again in 15 minutes.' },
      { status: 423 }
    );
  }

  // Authoritative user lookup from persistent admin store
  const user = getAdminUserByEmail(normalizedEmail);

  if (!user) {
    recordFailedAttempt(normalizedEmail);
    // Generic error message to prevent user enumeration
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);

  if (!passwordOk) {
    recordFailedAttempt(normalizedEmail);
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  clearFailedAttempts(normalizedEmail);

  const userAgent = req.headers.get('user-agent') ?? '';
  const sessionId = createSession(user.email, user.role, userAgent, ip);

  const res = NextResponse.json({
    success: true,
    role: user.role,
    mustChangePassword: !!user.mustChangePassword,
    requires2fa: user.twoFaEnabled,
  });

  res.cookies.set('session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });

  return res;
}
