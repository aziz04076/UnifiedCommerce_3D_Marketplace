import React from 'react';
import { cn } from '../utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'neutral';
  withDot?: boolean;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'cyan',
  withDot = false,
  size = 'md',
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium',
  }[size];

  const variantClasses = {
    cyan: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30',
    purple: 'bg-purple-500/10 text-purple-300 border border-purple-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-300 border border-rose-500/30',
    neutral: 'bg-slate-800/60 text-slate-300 border border-slate-700/50',
  }[variant];

  const dotClasses = {
    cyan: 'bg-cyan-400 shadow-[0_0_8px_#00F2FE]',
    purple: 'bg-purple-400 shadow-[0_0_8px_#9B51E0]',
    emerald: 'bg-emerald-400 shadow-[0_0_8px_#10B981]',
    amber: 'bg-amber-400 shadow-[0_0_8px_#FFB800]',
    rose: 'bg-rose-400 shadow-[0_0_8px_#FF007A]',
    neutral: 'bg-slate-400',
  }[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 backdrop-blur-md transition-colors',
        sizeClasses,
        variantClasses,
        className
      )}
      {...props}
    >
      {withDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dotClasses)} />
      )}
      <span>{children}</span>
    </span>
  );
};
Badge.displayName = 'Badge';
