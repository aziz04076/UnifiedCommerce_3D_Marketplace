'use client';

import React from 'react';
import { cn } from '../utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glow' | 'accent' | 'subtle';
  interactive?: boolean;
}

/**
 * High-performance GlassCard: No hover lift, solid semi-transparent surfaces
 * for fast GPU compositing, pure CSS hover highlights.
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, variant = 'default', interactive = false, ...props }, ref) => {
    const variantStyles = {
      default:
        'bg-slate-900/90 border border-white/10 shadow-lg',
      glow:
        'bg-slate-900/95 border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_20px_rgba(0,242,254,0.08)]',
      accent:
        'bg-gradient-to-br from-purple-950/60 via-slate-900/90 to-cyan-950/60 border border-purple-500/30 shadow-md',
      subtle:
        'bg-slate-950/80 border border-white/5',
    }[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl p-6 transition-colors duration-150 overflow-hidden',
          variantStyles,
          interactive && 'cursor-pointer hover:border-cyan-400/50',
          className
        )}
        {...props}
      >
        {/* Subtle top inner highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
