import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '../context/CartContext';
import { AIChatWidget } from '../components/AIChatWidget';
import { CookieConsentBanner } from '../components/CookieConsentBanner';
import { WebVitalsTracker } from '../components/WebVitalsTracker';
import { getStoreConfig } from '../lib/store-config';
import { getTheme } from '../themes';

export const metadata: Metadata = {
  title: 'UnifiedCommerce — AI-Powered 3D Multi-Vendor Marketplace',
  description:
    'Experience the future of multi-vendor shopping with interactive 3D product previews, neural semantic search, and verified artisanal engineering.',
  keywords: [
    '3D e-commerce',
    'AI marketplace',
    'React Three Fiber',
    'multi-vendor',
    'vector search',
    'UnifiedCommerce',
  ],
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let storeConfig;
  try {
    storeConfig = getStoreConfig();
  } catch {
    // Fallback if running outside full environment
  }
  const theme = getTheme(storeConfig?.theme || 'general');

  return (
    <html lang={storeConfig?.language || 'en'} className="dark">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --store-primary: ${theme.primaryColor};
                --store-accent: ${theme.accentColor};
                --store-surface: ${theme.surface};
                --store-radius: ${theme.borderRadius};
              }
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'UnifiedCommerce',
              url: 'https://unified-commerce.internal',
              description:
                'AI-Powered 3D Multi-Vendor Marketplace with interactive WebXR previews, vector search, and verified artisanal engineering.',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://unified-commerce.internal/products?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.debug('SW reg failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#07090e] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-white">
        <WebVitalsTracker />
        <CartProvider>
          {children}
          <AIChatWidget />
          <CookieConsentBanner />
        </CartProvider>
      </body>
    </html>
  );
}
