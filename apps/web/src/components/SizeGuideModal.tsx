'use client';

import React, { useState } from 'react';
import { Ruler, X, Check, ShieldCheck } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, category }) => {
  const [unit, setUnit] = useState<'MM' | 'INCHES'>('MM');

  if (!isOpen) return null;

  const chart = [
    {
      size: 'Small (S)',
      circumference: unit === 'MM' ? '145 - 165 mm' : '5.7 - 6.5 in',
      sensorBand: unit === 'MM' ? '22 mm' : '0.86 in',
      fitRecommendation: 'Ideal for slender wrists or compact cranial interface fits.',
    },
    {
      size: 'Medium (M)',
      circumference: unit === 'MM' ? '165 - 190 mm' : '6.5 - 7.5 in',
      sensorBand: unit === 'MM' ? '24 mm' : '0.94 in',
      fitRecommendation: 'Standard calibration fit for 80% of neural interface users.',
    },
    {
      size: 'Large (L)',
      circumference: unit === 'MM' ? '190 - 215 mm' : '7.5 - 8.5 in',
      sensorBand: unit === 'MM' ? '26 mm' : '1.02 in',
      fitRecommendation: 'Relaxed fit designed for high-motion biometric monitoring.',
    },
    {
      size: 'Extra Large (XL)',
      circumference: unit === 'MM' ? '215 - 240 mm' : '8.5 - 9.5 in',
      sensorBand: unit === 'MM' ? '28 mm' : '1.10 in',
      fitRecommendation: 'Maximum span for outerwear over-cuff telemetry or broad frames.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Neural & Hardware Fit Calibration Guide</h3>
              <p className="text-xs text-slate-400">Micro-metric sizing standards for zero impedance telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Unit Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-300">Measurement Scale:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setUnit('MM')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                unit === 'MM' ? 'bg-cyan-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Metric (mm)
            </button>
            <button
              onClick={() => setUnit('INCHES')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                unit === 'INCHES' ? 'bg-cyan-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Imperial (in)
            </button>
          </div>
        </div>

        {/* Sizing Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-2.5 px-4 font-bold">Size</th>
                <th className="py-2.5 px-4 font-bold">Circumference</th>
                <th className="py-2.5 px-4 font-bold">Sensor Width</th>
                <th className="py-2.5 px-4 font-bold">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {chart.map((row) => (
                <tr key={row.size} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{row.size}</td>
                  <td className="py-3 px-4 text-cyan-300">{row.circumference}</td>
                  <td className="py-3 px-4 text-purple-300">{row.sensorBand}</td>
                  <td className="py-3 px-4 text-slate-400 font-sans text-xs">{row.fitRecommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Every order includes 3 complimentary biocompatible micro-spacers for micro-calibration fit.</span>
        </div>
      </div>
    </div>
  );
};
