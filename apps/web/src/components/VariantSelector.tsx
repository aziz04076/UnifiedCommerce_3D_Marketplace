'use client';

import React from 'react';
import { Ruler, Check, AlertCircle } from 'lucide-react';
import { cn } from '@unified-commerce/ui';

export interface ProductVariant {
  id: string;
  size: string;
  finish: string;
  stock: number;
}

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onSelectVariant: (v: ProductVariant) => void;
  onOpenSizeGuide: () => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onSelectVariant,
  onOpenSizeGuide,
}) => {
  const uniqueSizes = Array.from(new Set(variants.map((v) => v.size)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono text-slate-400 block">
          SELECT SIZE / CALIBRATION FIT: <span className="text-white font-bold">{selectedVariant.size}</span>
        </label>
        <button
          type="button"
          onClick={onOpenSizeGuide}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors underline"
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Interactive Size Guide</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {uniqueSizes.map((size) => {
          const variantForSize = variants.find(
            (v) => v.size === size && v.finish === selectedVariant.finish
          ) || variants.find((v) => v.size === size);

          const isOutOfStock = !variantForSize || variantForSize.stock <= 0;
          const isSelected = selectedVariant.size === size;

          return (
            <button
              key={size}
              type="button"
              disabled={isOutOfStock}
              onClick={() => variantForSize && onSelectVariant(variantForSize)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-mono font-medium border flex items-center gap-1.5 transition-colors relative',
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                  : isOutOfStock
                  ? 'bg-slate-950/60 border-white/5 text-slate-600 cursor-not-allowed line-through'
                  : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/30 hover:text-white'
              )}
            >
              <span>{size}</span>
              {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
              {isOutOfStock && <span className="text-[10px] text-rose-500 ml-1">Sold out</span>}
            </button>
          );
        })}
      </div>

      {/* Stock status indicator */}
      <div className="flex items-center gap-2 text-xs font-mono pt-1">
        {selectedVariant.stock > 10 ? (
          <span className="text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>In Stock ({selectedVariant.stock} units ready for suborbital dispatch)</span>
          </span>
        ) : selectedVariant.stock > 0 ? (
          <span className="text-amber-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Low Stock (Only {selectedVariant.stock} units left in laboratory)</span>
          </span>
        ) : (
          <span className="text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Out of Stock in this variant</span>
          </span>
        )}
      </div>
    </div>
  );
};
