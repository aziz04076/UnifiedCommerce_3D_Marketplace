'use client';

import Link from 'next/link';
import { Compass, ArrowLeft, Home, Sparkles, ShoppingBag } from 'lucide-react';
import { Button, Badge } from '@unified-commerce/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-6 p-8 rounded-3xl bg-slate-950/80 border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_30px_rgba(0,242,254,0.2)]">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '12s' }} />
        </div>

        <div className="space-y-2">
          <Badge variant="rose" size="sm" withDot>
            ERROR 404 • SUBNET OUT OF BOUNDS
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
            404_ORBIT_LOST
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            The target coordinates do not map to any active verified multi-vendor node on UnifiedCommerce.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="primary" size="md" icon={<Home className="w-4 h-4 text-slate-950" />}>
              Return to Marketplace
            </Button>
          </Link>
          <Link href="/products" className="w-full sm:w-auto">
            <Button variant="outline" size="md" icon={<ShoppingBag className="w-4 h-4" />}>
              Explore 3D Catalog
            </Button>
          </Link>
        </div>

        <p className="text-[11px] font-mono text-slate-600 pt-4 border-t border-white/5">
          UNIFIED_COMMERCE_NODE_ROUTER // STATUS_ANOMALY // ZERO_DATA_LOSS
        </p>
      </div>
    </div>
  );
}
