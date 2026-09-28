#!/usr/bin/env node

/**
 * UnifiedCommerce Production Pre-Flight Smoke Test
 * Tests public pages and API endpoints against HTTP 500 errors and crashes.
 */

const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

const PUBLIC_ROUTES = [
  { path: '/', expected: [200, 307, 308] },
  { path: '/products', expected: [200, 307, 308] },
  { path: '/collections', expected: [200, 307, 308] },
  { path: '/collections/cyberpunk-wearables', expected: [200, 307, 308] },
  { path: '/about', expected: [200, 307, 308] },
  { path: '/contact', expected: [200, 307, 308] },
  { path: '/privacy', expected: [200, 307, 308] },
  { path: '/terms', expected: [200, 307, 308] },
  { path: '/track', expected: [200, 307, 308] },
  { path: '/cart', expected: [200, 307, 308] },
  { path: '/checkout', expected: [200, 307, 308] },
  { path: '/vendor', expected: [200, 307, 308] },
  { path: '/vendor/dashboard', expected: [200, 307, 308] },
  { path: '/super-admin', expected: [200, 307, 308] },
  { path: '/super-admin/login', expected: [200, 307, 308] },
  { path: '/shop-admin', expected: [200, 307, 308] },
  { path: '/shop-admin/orders', expected: [200, 307, 308] },
  { path: '/shop-admin/products', expected: [200, 307, 308] },
];

const API_ROUTES = [
  { path: '/api/health', expected: [200] },
  { path: '/api/auth/login', expected: [400, 405] }, // POST route pinged with GET
  { path: '/api/auth/setup-admin', expected: [200, 401] }, // Protected route requires session
  { path: '/api/payment/create-order', expected: [400, 405] }, // POST route pinged with GET
  { path: '/api/vendor/analytics?vendorId=vendor-1&range=30d', expected: [200] },
];

function testRoute(routePath, expectedStatuses) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${routePath}`;
    const startTime = Date.now();

    const req = http.get(url, { timeout: 6000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const duration = Date.now() - startTime;
        const isOk = expectedStatuses.includes(res.statusCode) && res.statusCode < 500;
        resolve({
          path: routePath,
          statusCode: res.statusCode,
          duration,
          passed: isOk,
          error: isOk ? null : `Unexpected status code: ${res.statusCode} (expected: ${expectedStatuses.join(', ')})`,
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        path: routePath,
        statusCode: 0,
        duration: Date.now() - startTime,
        passed: false,
        error: 'Request timed out after 6000ms',
      });
    });

    req.on('error', (err) => {
      resolve({
        path: routePath,
        statusCode: 0,
        duration: Date.now() - startTime,
        passed: false,
        error: err.message,
      });
    });
  });
}

async function main() {
  console.log('\n================================================================================');
  console.log(`🚀 UnifiedCommerce — Pre-Flight Smoke Test`);
  console.log(`Target: ${BASE_URL}`);
  console.log('================================================================================\n');

  // Verify server is reachable
  try {
    await new Promise((resolve, reject) => {
      const probe = http.get(BASE_URL, { timeout: 3000 }, () => resolve());
      probe.on('error', reject);
      probe.on('timeout', () => { probe.destroy(); reject(new Error('Connection timed out')); });
    });
  } catch (err) {
    console.error(`\x1b[31m✖ Cannot connect to server at ${BASE_URL}\x1b[0m`);
    console.error('  Please start the production server first: `npm run build && npm start` (or in apps/web: `npm start`)');
    process.exit(1);
  }

  const allRoutes = [...PUBLIC_ROUTES, ...API_ROUTES];
  const results = [];

  for (const r of allRoutes) {
    const res = await testRoute(r.path, r.expected);
    results.push(res);
    const icon = res.passed ? '\x1b[32m✔ PASS\x1b[0m' : '\x1b[31m✖ FAIL\x1b[0m';
    const durationStr = `${res.duration}ms`.padStart(6);
    console.log(`  ${icon}  ${res.path.padEnd(46)} [${res.statusCode || 'ERR'}] ${durationStr}`);
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((acc, r) => acc + r.duration, 0);
  const avgDuration = Math.round(totalDuration / results.length);

  console.log('\n--------------------------------------------------------------------------------');
  console.log(`Total Routes: ${results.length} | Passed: \x1b[32m${passed}\x1b[0m | Failed: \x1b[${failed > 0 ? '31' : '32'}m${failed}\x1b[0m | Avg Latency: ${avgDuration}ms`);
  console.log('--------------------------------------------------------------------------------\n');

  if (failed > 0) {
    console.error('\x1b[31m✖ Smoke test detected failures:\x1b[0m');
    for (const r of results.filter((r) => !r.passed)) {
      console.error(`  • ${r.path} -> ${r.error}`);
    }
    console.log('');
    process.exit(1);
  } else {
    console.log('\x1b[32m✔ All smoke test checks passed with zero HTTP 500 errors!\x1b[0m\n');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}
