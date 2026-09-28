'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, MeshDistortMaterial, Grid } from '@react-three/drei';
import * as THREE from 'three';
import {
  RotateCcw,
  Sun,
  Moon,
  Sparkles,
  Layers,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Product } from '@unified-commerce/types';

interface Product3DStudioProps {
  product: Product;
  className?: string;
}

type LightingMode = 'neon' | 'daylight' | 'amber';

function ModelMesh({
  config,
  wireframe,
  autoRotate,
}: {
  config: Product['threedConfig'];
  wireframe: boolean;
  autoRotate: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geomType = config?.geometry || 'torus';
  const wireColor = config?.wireframeColor || '#00F2FE';

  useFrame((state, delta) => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.8}>
      <mesh ref={meshRef} scale={1.85}>
        {geomType === 'polyhedron' ? (
          <icosahedronGeometry args={[1, 1]} />
        ) : geomType === 'cylinder' ? (
          <cylinderGeometry args={[0.75, 0.75, 2, 32]} />
        ) : geomType === 'sphere' ? (
          <sphereGeometry args={[1.1, 32, 32]} />
        ) : (
          <torusGeometry args={[1.05, 0.38, 30, 80]} />
        )}
        <MeshDistortMaterial
          color={wireframe ? '#00F2FE' : wireColor}
          distort={wireframe ? 0 : 0.18}
          speed={1.8}
          roughness={wireframe ? 0 : (config?.roughness ?? 0.15)}
          metalness={wireframe ? 0 : (config?.metalness ?? 0.88)}
          wireframe={wireframe}
        />
      </mesh>
    </Float>
  );
}

function StudioLighting({ mode }: { mode: LightingMode }) {
  if (mode === 'daylight') {
    return (
      <>
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 8, 5]} intensity={2.8} color="#FFFFFF" castShadow />
        <directionalLight position={[-5, -2, -5]} intensity={0.8} color="#E2E8F0" />
      </>
    );
  }

  if (mode === 'amber') {
    return (
      <>
        <ambientLight intensity={0.6} color="#FFE8D6" />
        <pointLight position={[4, 5, 3]} intensity={4.0} color="#FFB800" />
        <pointLight position={[-4, -3, -2]} intensity={2.0} color="#FF6B00" />
        <directionalLight position={[0, 6, 2]} intensity={1.5} color="#FFF8E7" />
      </>
    );
  }

  // Neon (Default)
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 4, 4]} intensity={4.5} color="#00F2FE" />
      <pointLight position={[-4, -3, -2]} intensity={4.0} color="#7928CA" />
      <pointLight position={[0, 5, -3]} intensity={2.5} color="#FF0080" />
    </>
  );
}

export const Product3DStudio: React.FC<Product3DStudioProps> = ({ product, className }) => {
  const [mounted, setMounted] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [lightingMode, setLightingMode] = useState<LightingMode>('neon');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const orbitRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleResetCamera = () => {
    if (orbitRef.current) {
      orbitRef.current.reset();
    }
  };

  const handleZoom = (delta: number) => {
    if (orbitRef.current) {
      const controls = orbitRef.current;
      controls.object.position.multiplyScalar(delta);
      controls.update();
    }
  };

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[460px] rounded-3xl bg-slate-950/80 border border-white/10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-cyan-300">Initializing 3D Studio Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-3xl bg-gradient-to-b from-slate-950/90 to-slate-900/90 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-[999]' : 'w-full h-full min-h-[460px] lg:min-h-[560px]'
      } ${className ?? ''}`}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <StudioLighting mode={lightingMode} />
        <ModelMesh
          config={product.threedConfig}
          wireframe={wireframe}
          autoRotate={autoRotate}
        />
        <Grid
          position={[0, -1.8, 0]}
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#1e293b"
          sectionSize={2}
          sectionThickness={1}
          sectionColor={lightingMode === 'neon' ? '#00f2fe' : '#475569'}
          fadeDistance={12}
          fadeStrength={1.5}
        />
        <OrbitControls
          ref={orbitRef}
          enableDamping={true}
          dampingFactor={0.05}
          minDistance={2.2}
          maxDistance={8}
        />
      </Canvas>

      {/* Top HUD: Status & Geometry Metadata */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 bg-slate-950/80 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00F2FE]" />
          <span className="text-xs font-mono text-slate-200">
            3D STUDIO • {product.threedConfig?.geometry?.toUpperCase() || 'MESH'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="w-8 h-8 rounded-xl bg-slate-950/80 border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-white flex items-center justify-center transition-colors backdrop-blur-md"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Bottom Control Deck */}
      <div className="absolute bottom-4 inset-x-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-10">
        {/* Left Controls: Lighting Presets */}
        <div className="flex items-center gap-1 bg-slate-950/85 border border-white/10 p-1 rounded-2xl backdrop-blur-xl pointer-events-auto shadow-xl">
          <button
            onClick={() => setLightingMode('neon')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              lightingMode === 'neon'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-neon-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Neon</span>
          </button>
          <button
            onClick={() => setLightingMode('daylight')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              lightingMode === 'daylight'
                ? 'bg-white/20 text-white border border-white/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Daylight</span>
          </button>
          <button
            onClick={() => setLightingMode('amber')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              lightingMode === 'amber'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Amber</span>
          </button>
        </div>

        {/* Right Controls: Studio Manipulation */}
        <div className="flex items-center gap-1.5 bg-slate-950/85 border border-white/10 p-1 rounded-2xl backdrop-blur-xl pointer-events-auto shadow-xl">
          {/* Wireframe toggle */}
          <button
            onClick={() => setWireframe(!wireframe)}
            title="Toggle Wireframe"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              wireframe
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wireframe</span>
          </button>

          {/* Auto-rotate toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Zoom controls */}
          <button
            onClick={() => handleZoom(0.85)}
            title="Zoom In"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(1.15)}
            title="Zoom Out"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera */}
          <button
            onClick={handleResetCamera}
            title="Reset Angle"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Orbit Helper Tip */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] font-mono text-cyan-400/60 bg-slate-950/60 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md">
        CLICK & DRAG TO ORBIT 360° • PINCH / SCROLL TO ZOOM
      </div>
    </div>
  );
};

Product3DStudio.displayName = 'Product3DStudio';
