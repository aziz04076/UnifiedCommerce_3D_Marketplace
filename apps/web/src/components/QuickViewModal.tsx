'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { X, Star, ShoppingBag, ShieldCheck, Sparkles, Check, Heart, ExternalLink } from 'lucide-react';
import { Product } from '@unified-commerce/types';
import { formatPrice } from '@unified-commerce/ui';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

// Interactive 3D Model Viewer for the modal
function Modal3DModel({ config }: { config: Product['threedConfig'] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geomType = config?.geometry || 'torus';
  const wireColor = config?.wireframeColor || '#00F2FE';
  const glowColor = config?.glowColor || '#7928CA';

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={2.5} color="#00F2FE" />
      <pointLight position={[-5, -5, -3]} intensity={3} color={glowColor} />
      <Float speed={2} rotationIntensity={0.8} floatIntensity={1}>
        <mesh ref={meshRef} scale={1.8}>
          {geomType === 'polyhedron' ? (
            <icosahedronGeometry args={[1, 1]} />
          ) : geomType === 'cylinder' ? (
            <cylinderGeometry args={[0.7, 0.7, 1.8, 32]} />
          ) : geomType === 'sphere' ? (
            <sphereGeometry args={[1, 32, 32]} />
          ) : (
            <torusGeometry args={[1, 0.35, 30, 80]} />
          )}
          <MeshDistortMaterial
            color={wireColor}
            distort={0.2}
            speed={2}
            roughness={config?.roughness ?? 0.15}
            metalness={config?.metalness ?? 0.9}
            wireframe={false}
          />
        </mesh>
      </Float>
      <OrbitControls enableZoom={true} minDistance={2.5} maxDistance={6} />
    </>
  );
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [activeTab, setActiveTab] = useState<'3d' | 'gallery'>('3d');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.8)] z-10 flex flex-col md:flex-row overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-950/70 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: 3D Stage / Gallery */}
          <div className="w-full md:w-1/2 bg-slate-950/80 border-b md:border-b-0 md:border-r border-white/10 p-6 flex flex-col justify-between">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setActiveTab('3d')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === '3d'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-neon-cyan'
                    : 'bg-slate-900 text-slate-400 border border-white/5 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                3D Interactive (360°)
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'gallery'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-neon-cyan'
                    : 'bg-slate-900 text-slate-400 border border-white/5 hover:text-white'
                }`}
              >
                Photographic
              </button>
            </div>

            {/* Display Area */}
            <div className="relative w-full h-72 sm:h-80 rounded-2xl bg-slate-900/50 border border-white/5 overflow-hidden flex items-center justify-center">
              {activeTab === '3d' ? (
                <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
                  <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
                    <Modal3DModel config={product.threedConfig} />
                  </Canvas>
                  <div className="absolute bottom-2 left-3 text-[10px] text-cyan-400/70 font-mono pointer-events-none">
                    CLICK & DRAG TO ROTATE • SCROLL TO ZOOM
                  </div>
                </div>
              ) : (
                <img
                  src={product.images[selectedImage] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Thumbnail selector */}
            {activeTab === 'gallery' && product.images.length > 1 && (
              <div className="flex items-center gap-2 mt-4">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i
                        ? 'border-cyan-400 shadow-neon-cyan'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Vendor Mini Card */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={product.vendorAvatar}
                  alt={product.vendorName}
                  className="w-8 h-8 rounded-full object-cover border border-cyan-400/30"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white">{product.vendorName}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <span className="text-[10px] text-slate-400">Verified Marketplace Maker</span>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                In Stock ({product.stock})
              </span>
            </div>
          </div>

          {/* Right Column: Details, Specs & Add to Cart */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                  {product.subcategory}
                </span>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-white">{product.rating}</span>
                  <span className="text-slate-500">({product.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Title & Headline */}
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                  {product.name}
                </h2>
                <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                  {product.headline}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-white">
                  {formatPrice(product.price, product.currency)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-slate-500 line-through">
                    {formatPrice(product.originalPrice, product.currency)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed border-t border-b border-white/5 py-3">
                {product.description}
              </p>

              {/* AI Insights Chip */}
              {product.aiInsights && (
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-purple-300">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Neural Demand Score
                    </span>
                    <span className="font-mono font-bold text-cyan-300">
                      {product.aiInsights.demandScore}/100
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {product.aiInsights.sentimentSummary}
                  </p>
                </div>
              )}

              {/* Specifications */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                  Key Specifications
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <div key={k} className="p-2 rounded-lg bg-slate-950/50 border border-white/5">
                      <span className="text-slate-500 block text-[10px]">{k}</span>
                      <span className="font-medium text-slate-200">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity & CTA Buttons */}
            <div className="pt-4 border-t border-white/5 flex items-center gap-3">
              <div className="flex items-center border border-white/10 rounded-xl bg-slate-950/60 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-semibold text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600 text-slate-950 font-bold text-sm shadow-neon-cyan hover:shadow-cyan-400/50 flex items-center justify-center gap-2 transition-all"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Order
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart (
                    {formatPrice(product.price * quantity, product.currency)})
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
