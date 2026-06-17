import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C5A059',
          dark: '#A8863A',
          light: '#D4C08A',
        },
        success: '#059669',
        danger:  '#DC2626',
        warning: '#D97706',
        info:    '#2563EB',
        surface: {
          base:   '#FAFAFA',
          card:   '#FFFFFF',
          raised: '#F8F7F4',
          border: 'rgba(197,160,89,0.12)',
          hover:  'rgba(197,160,89,0.06)',
          ring:   'rgba(197,160,89,0.28)',
        },
        neutral: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans:     ['Plus Jakarta Sans',  'system-ui', 'sans-serif'],
        display:  ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        headline: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        brand:    ['Syne',              'system-ui', 'sans-serif'],
        mono:     ['JetBrains Mono',    'Fira Code', 'monospace'],
      },
      borderRadius: {
        xl:   '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card:       '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(197,160,89,0.10)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.09), 0 0 0 1px rgba(197,160,89,0.22)',
        'gold-glow':  '0 0 24px rgba(197,160,89,0.18), 0 0 48px rgba(197,160,89,0.06)',
        'gold-glow-sm': '0 0 12px rgba(197,160,89,0.12)',
        dropdown:   '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(197,160,89,0.14)',
        sidebar:    '2px 0 12px rgba(0,0,0,0.06)',
      },
      animation: {
        shimmer:    'shimmer 2s linear infinite',
        'fade-up':  'fade-up 0.4s ease-out both',
        'scale-in': 'scale-in 0.2s ease-out both',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
