'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Floating Futuristic Cyber-Knot Core (Static materials, zero pointer hover recalculation)
function FloatingCore() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1.2}>
      <mesh ref={meshRef} scale={2.1}>
        <torusKnotGeometry args={[1, 0.3, 96, 24, 2, 3]} />
        <MeshDistortMaterial
          color="#00F2FE"
          attach="material"
          distort={0.2}
          speed={1.5}
          roughness={0.15}
          metalness={0.85}
          wireframe={false}
        />
      </mesh>
    </Float>
  );
}

// Surrounding Orbital Wireframe Rings
function OrbitalRings() {
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.12;
      ring1Ref.current.rotation.y += delta * 0.18;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.15;
    }
  });

  return (
    <>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[3.2, 0.015, 12, 64]} />
        <meshBasicMaterial color="#00F2FE" transparent opacity={0.6} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[3.8, 0.012, 12, 64]} />
        <meshBasicMaterial color="#7928CA" transparent opacity={0.5} />
      </mesh>
    </>
  );
}

// Particle Constellation Field (Capped at 600 points for GPU efficiency)
function ParticleConstellation() {
  const pointsRef = useRef<THREE.Points>(null!);

  const [sphere] = useState(() => {
    const coords = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 5.5;
      const sinPhi = Math.sin(phi);
      coords[i * 3] = r * sinPhi * Math.cos(theta);
      coords[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      coords[i * 3 + 2] = r * Math.cos(phi);
    }
    return coords;
  });

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y -= delta * 0.04;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={pointsRef} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00F2FE"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.75}
        />
      </Points>
    </group>
  );
}

// Fixed High-Performance Lights (No pointer tracking listeners)
function StaticLights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 3, 3]} color="#00F2FE" intensity={3} distance={10} />
      <pointLight position={[-4, -3, -2]} color="#7928CA" intensity={3.5} distance={10} />
      <pointLight position={[2, -4, -1]} color="#FF0080" intensity={2} distance={8} />
    </>
  );
}

export const Hero3DCanvas: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Disable on mobile (< 768px) or prefers-reduced-motion for battery/GPU longevity
    const checkMobileOrReducedMotion = () => {
      const mobile = window.innerWidth < 768;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsMobile(mobile || reducedMotion);
    };

    checkMobileOrReducedMotion();
    window.addEventListener('resize', checkMobileOrReducedMotion);

    // IntersectionObserver to pause rendering when scrolled out of viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', checkMobileOrReducedMotion);
      observer.disconnect();
    };
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border border-cyan-500/20 bg-cyan-500/5 animate-pulse" />
      </div>
    );
  }

  // Lightweight poster gradient fallback on mobile or reduced-motion
  if (isMobile) {
    return (
      <div className="w-full h-full flex items-center justify-center relative">
        <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-cyan-500/20 via-purple-600/25 to-pink-500/10 blur-2xl border border-white/5" />
        <div className="absolute font-mono text-[11px] text-cyan-400 bg-slate-950/80 px-3 py-1 rounded-full border border-cyan-500/20">
          CYBERNETIC TELEMETRY CORE
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        dpr={[1, 1.5]}
        frameloop={isVisible ? 'always' : 'never'}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false,
        }}
      >
        <StaticLights />
        <ParticleConstellation />
        <FloatingCore />
        <OrbitalRings />
      </Canvas>
    </div>
  );
};

Hero3DCanvas.displayName = 'Hero3DCanvas';
