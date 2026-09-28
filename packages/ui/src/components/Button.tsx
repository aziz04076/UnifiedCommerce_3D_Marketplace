'use client';

import React from 'react';
import { cn } from '../utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

/**
 * High-performance Button: pure CSS hover transitions, zero scale/motion, zero layout shift.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, icon, isLoading, disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
      md: 'px-5 py-2.5 text-sm rounded-xl gap-2 font-medium',
      lg: 'px-7 py-3.5 text-base rounded-2xl gap-2.5 font-semibold',
      icon: 'p-2.5 rounded-xl',
    }[size];

    const variantClasses = {
      primary:
        'bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 text-slate-950 font-bold shadow-neon-cyan hover:brightness-110 border border-cyan-300/30 transition-all duration-150',
      secondary:
        'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-neon-purple hover:brightness-110 border border-purple-400/30 transition-all duration-150',
      outline:
        'border border-slate-700/80 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:border-cyan-400/50 hover:text-white transition-all duration-150',
      ghost:
        'text-slate-300 hover:text-white hover:bg-white/5 transition-colors duration-150',
      glow:
        'relative bg-slate-950 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(0,242,254,0.4)] transition-all duration-150',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center relative overflow-hidden select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group',
          sizeClasses,
          variantClasses,
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
