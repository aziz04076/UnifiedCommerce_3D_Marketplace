'use client';

import React, { useState } from 'react';
import { Star, ShoppingBag, Eye, Heart } from 'lucide-react';
import { Product } from '@unified-commerce/types';
import { cn, formatPrice } from '../utils';
import { Badge } from './Badge';

export interface ProductCard3DProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onCompareToggle?: (product: Product) => void;
  isCompared?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
}

/**
 * ProductCard3D: Optimized stable product card with zero hover tilt, zero layout shifts,
 * and high-performance CSS-only border and color transitions.
 */
export const ProductCard3D: React.FC<ProductCard3DProps> = ({
  product,
  onAddToCart,
  onQuickView,
  onCompareToggle,
  isCompared = false,
  onClick,
  href,
  className,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const targetHref = href ?? `/products/${product.slug}`;

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (targetHref) {
      window.location.href = targetHref;
    }
  };

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'relative group cursor-pointer rounded-2xl bg-slate-900/90 border border-white/10 p-4 transition-colors duration-150 hover:border-cyan-500/50 hover:bg-slate-900 shadow-md',
        className
      )}
    >
      {/* Top Badges & Actions */}
      <div className="flex items-center justify-between mb-3 z-10 relative">
        <div className="flex items-center gap-1.5 flex-wrap">
          {product.badge && (
            <Badge variant="cyan" size="sm" withDot>
              {product.badge}
            </Badge>
          )}
          {discountPercent && (
            <Badge variant="rose" size="sm">
              -{discountPercent}%
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {onCompareToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompareToggle(product);
              }}
              title={isCompared ? 'Remove from compare' : 'Compare product'}
              className={cn(
                'px-2 py-1 rounded-md text-[10px] font-mono border transition-colors',
                isCompared
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-slate-950/80 border-white/10 text-slate-400 hover:text-white hover:border-white/30'
              )}
            >
              {isCompared ? 'Comparing' : 'Compare'}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center border transition-colors',
              isLiked
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                : 'bg-slate-950/80 border-white/10 text-slate-400 hover:text-white hover:border-white/30'
            )}
          >
            <Heart className={cn('w-4 h-4', isLiked && 'fill-rose-500')} />
          </button>
        </div>
      </div>

      {/* Product Image Stage (Visually stable, zero scale) */}
      <div className="relative w-full aspect-square rounded-xl bg-slate-950 border border-white/5 overflow-hidden mb-4 flex items-center justify-center">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center"
        />

        {/* Hover Action Bar */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView?.(product);
            }}
            className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-200 hover:text-white border border-white/20 flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            Quick View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product);
            }}
            className="py-2 px-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold border border-cyan-300 shadow-neon-cyan flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>

      {/* Product Meta */}
      <div className="space-y-2">
        {/* Vendor Chip */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <img
            src={product.vendorAvatar}
            alt={product.vendorName}
            className="w-4 h-4 rounded-full object-cover border border-cyan-400/40"
          />
          <span className="truncate hover:text-cyan-300 transition-colors">
            {product.vendorName}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-white tracking-tight line-clamp-1 group-hover:text-cyan-300 transition-colors">
          {product.name}
        </h3>

        {/* Headline */}
        <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
          {product.headline}
        </p>

        {/* Price & Rating Row */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-white tracking-tight">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-slate-500 line-through">
                {formatPrice(product.originalPrice, product.currency)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-md border border-white/5 text-xs">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-200">{product.rating}</span>
            <span className="text-slate-500 text-[10px]">({product.reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

ProductCard3D.displayName = 'ProductCard3D';
