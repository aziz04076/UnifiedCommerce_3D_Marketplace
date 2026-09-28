import { NextRequest, NextResponse } from 'next/server';

// ── Rate limit store (in-memory, per worker — use Redis in production) ────────
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

interface RateLimitRule {
  windowMs: number;
  max: number;
}

const RULES: Record<string, RateLimitRule> = {
  '/api/auth/login':           { windowMs: 15 * 60 * 1000, max: 10  },
  '/api/auth/2fa':             { windowMs: 15 * 60 * 1000, max: 10  },
  '/api/payment/create-order': { windowMs:       60 * 1000, max: 5   },
  '/api/payment/verify':       { windowMs:       60 * 1000, max: 10  },
  '/api/payment/webhook':      { windowMs:       60 * 1000, max: 100 },
  '/api/':                     { windowMs:       60 * 1000, max: 120 },
};

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function checkRateLimit(ip: string, pathname: string): boolean {
  // Find the most specific matching rule
  const rule =
    RULES[pathname] ??
    Object.entries(RULES)
      .sort(([a], [b]) => b.length - a.length)
      .find(([prefix]) => pathname.startsWith(prefix))?.[1];

  if (!rule) return true; // No rule = allow

  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.windowStart > rule.windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return true;
  }

  entry.count++;
  return entry.count <= rule.max;
}

// ── Allowed origins (CORS) ────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001',
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // same-origin requests have no Origin header
  return ALLOWED_ORIGINS.some((o) => origin.startsWith(o));
}

// ── Security headers ──────────────────────────────────────────────────────────
function addSecurityHeaders(res: NextResponse, req: NextRequest): NextResponse {
  const origin = req.headers.get('origin');
  const isApi = req.nextUrl.pathname.startsWith('/api/');

  // Content Security Policy
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
      "frame-src https://api.razorpay.com https://checkout.razorpay.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  // Other security headers
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );

  // CORS for API routes
  if (isApi) {
    if (origin && isAllowedOrigin(origin)) {
      res.headers.set('Access-Control-Allow-Origin', origin);
    }
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-idempotency-key');
    res.headers.set('Access-Control-Max-Age', '86400');
  }

  // Remove revealing headers
  res.headers.delete('X-Powered-By');
  res.headers.delete('Server');

  return res;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Handle CORS preflight ──────────────────────────────────────────────────
  if (req.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    const preflightRes = new NextResponse(null, { status: 204 });
    return addSecurityHeaders(preflightRes, req);
  }

  // ── Block requests from disallowed origins (for mutating API calls) ────────
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && pathname.startsWith('/api/')) {
    const origin = req.headers.get('origin');
    // Allow requests with no Origin (server-to-server) and allowed origins
    if (origin && !isAllowedOrigin(origin)) {
      return new NextResponse(JSON.stringify({ error: 'CORS: origin not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // ── Rate limiting ──────────────────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const ip = getClientIp(req);
    const allowed = checkRateLimit(ip, pathname);
    if (!allowed) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      });
    }
  }

  // ── Continue with security headers ────────────────────────────────────────
  const res = NextResponse.next();
  return addSecurityHeaders(res, req);
}

export const config = {
  matcher: [
    // Run on all routes except static files and _next
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot)).*)',
  ],
};
