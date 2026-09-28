/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        background: '#07090E',
        foreground: '#F1F5F9',
        card: {
          DEFAULT: 'rgba(15, 23, 42, 0.65)',
          foreground: '#F8FAFC',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        popover: {
          DEFAULT: 'rgba(15, 23, 42, 0.85)',
          foreground: '#F8FAFC',
        },
        primary: {
          DEFAULT: '#00F2FE',
          foreground: '#07090E',
          glow: '#4FACFE',
        },
        secondary: {
          DEFAULT: '#7928CA',
          foreground: '#FFFFFF',
          glow: '#FF0080',
        },
        accent: {
          cyan: '#00F2FE',
          purple: '#7928CA',
          pink: '#FF0080',
          amber: '#FFB800',
          emerald: '#10B981',
        },
        muted: {
          DEFAULT: '#1E293B',
          foreground: '#94A3B8',
        },
        border: 'rgba(255, 255, 255, 0.1)',
        ring: '#00F2FE',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'aurora-mesh': 'radial-gradient(at 0% 0%, rgba(121, 40, 202, 0.25) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(0, 242, 254, 0.22) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(255, 0, 128, 0.18) 0px, transparent 50%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%)',
      },
      boxShadow: {
        'neon-cyan': '0 0 25px -4px rgba(0, 242, 254, 0.5)',
        'neon-purple': '0 0 25px -4px rgba(121, 40, 202, 0.6)',
        'neon-pink': '0 0 25px -4px rgba(255, 0, 128, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
