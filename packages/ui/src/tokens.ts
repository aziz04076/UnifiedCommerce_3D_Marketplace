/**
 * UnifiedCommerce Design Tokens & Motion Presets
 * Obsidian-and-Neon aesthetic system
 */

export const colors = {
  background: {
    obsidian: '#030712',
    surface: '#0B0F1A',
    surfaceSubtle: 'rgba(15, 23, 42, 0.6)',
    card: 'rgba(15, 23, 42, 0.45)',
    glass: 'rgba(255, 255, 255, 0.03)',
  },
  neon: {
    cyan: '#00F2FE',
    purple: '#7928CA',
    pink: '#FF0080',
    violet: '#8B5CF6',
    emerald: '#10B981',
    amber: '#F59E0B',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.07)',
    glowCyan: 'rgba(0, 242, 254, 0.3)',
    glowViolet: 'rgba(139, 92, 246, 0.3)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#94A3B8',
    muted: '#64748B',
    highlightCyan: '#67E8F9',
    highlightViolet: '#C4B5FD',
  },
} as const;

export const motionPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  springHover: {
    whileHover: {},
    whileTap: {},
    transition: { duration: 0.15 },
  },
  glowPulse: {
    animate: {
      boxShadow: [
        '0 0 10px rgba(0,242,254,0.2)',
        '0 0 25px rgba(0,242,254,0.5)',
        '0 0 10px rgba(0,242,254,0.2)',
      ],
    },
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
} as const;
