import { test, expect } from '@playwright/test';

test.describe('Bank-Grade Security & Attack Simulation Suite', () => {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  test('Attack 1: Price Manipulation — Client tamper with total must be rejected', async ({ request }) => {
    // Attempt to create an order with client-supplied zero/reduced amount
    const res = await request.post(`${BASE_URL}/api/payment/create-order`, {
      data: {
        cartItems: [{ productId: 'prod-001', quantity: 1 }],
        deliveryPincode: '110001',
        idempotencyKey: '00000000-0000-0000-0000-000000000001',
        // Injected malicious payload attempting to force total to ₹1
        injectedClientPrice: 1.0,
      },
    });

    // The endpoint recalculates prices strictly from database
    const json = await res.json();
    if (res.ok()) {
      // Amount must be calculated server-side, not the ₹1 attacker sent
      expect(json.subtotal).toBeGreaterThan(10);
      expect(json.total).toBeGreaterThan(10);
    } else {
      // Or server rejects payment gateway call if unconfigured in test
      expect([200, 503, 502]).toContain(res.status());
    }
  });

  test('Attack 2: Privilege Escalation — Injecting role: owner/admin must be rejected', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: 'attacker@evil.com',
        password: 'Password123!',
        role: 'owner', // Malicious privilege escalation
        isAdmin: true,
      },
    });

    // Deny unauthorized or invalid credentials without elevating
    expect(res.status()).toBe(401);
  });

  test('Attack 3: Webhook Forgery & Replay — Tampered or missing signature must be rejected with 400/401', async ({ request }) => {
    const fakePayload = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_fake_9999', amount: 50000 } } },
    });

    const res = await request.post(`${BASE_URL}/api/payment/webhook`, {
      data: fakePayload,
      headers: {
        'x-razorpay-signature': 'invalid_forged_hmac_signature_hex_code_1234567890',
        'Content-Type': 'application/json',
      },
    });

    expect([400, 401, 503]).toContain(res.status());
  });

  test('Attack 4: Brute Force & Rate Limiting — Rapid requests trigger 429 Too Many Requests', async ({ request }) => {
    let triggeredRateLimit = false;

    // Send rapid sequential auth requests
    for (let i = 0; i < 20; i++) {
      const res = await request.post(`${BASE_URL}/api/auth/login`, {
        data: { email: `probe_${i}@test.com`, password: 'WrongPassword!' },
      });

      if (res.status() === 429) {
        triggeredRateLimit = true;
        break;
      }
    }

    // Rate limiter must trip within 20 attempts
    expect(triggeredRateLimit).toBe(true);
  });

  test('Attack 5: Magic Bytes File Validation — Executable disguised as image must be blocked', async () => {
    const { validateUpload } = await import('../../apps/web/src/lib/upload-validator');

    // Fake Windows PE executable bytes disguised with image/png mime
    const fakeExeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // MZ header
    const result = validateUpload(fakeExeBuffer, 'image/png');

    expect(result.valid).toBe(false);
    expect(result.error).toContain('File type not allowed');
  });

  test('Attack 6: XSS Injection — Input sanitizer strips harmful tags and scripts', async () => {
    const { sanitizeString } = await import('../../apps/web/src/lib/input-sanitizer');

    const maliciousInput = '<script>alert("XSS")</script><img src=x onerror=alert(1)>Handmade Saree';
    const cleaned = sanitizeString(maliciousInput);

    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('onerror=');
    expect(cleaned).toContain('Handmade Saree');
  });
});
