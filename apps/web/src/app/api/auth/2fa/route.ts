import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession, verifyTotp } from '../../../../lib/auth';
import { isAllowed } from '../../../../lib/rate-limiter';

const TotpSchema = z.object({
  code: z.string().length(6).regex(/^\d{6}$/, 'Code must be 6 digits'),
  totpSecret: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  // Rate limit: 10 TOTP attempts per 15 minutes per IP
  if (!isAllowed(`2fa:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many 2FA attempts. Please wait.' }, { status: 429 });
  }

  const sessionId = req.cookies.get('session')?.value;
  const session = sessionId ? getSession(sessionId) : null;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: unknown = await req.json().catch(() => ({}));
  const parsed = TotpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid code format' }, { status: 400 });
  }

  const { code, totpSecret } = parsed.data;
  const valid = verifyTotp(totpSecret, code);

  if (!valid) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
