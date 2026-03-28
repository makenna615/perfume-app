import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#0f0f1e',
        'primary-darker': '#0a0a14',
        'primary-surface': '#1a1a2e',
        'primary-border': '#2d2d44',
        'primary-hover': '#252538',
        'primary-accent': '#8b5cf6',
        'primary-accent-alt': '#06b6d4',
        'primary-success': '#10b981',
        'primary-warning': '#f59e0b',
        'pale-green': '#3aa655',
        'pale-blue': '#4f9dd9',
        'pale-purple': '#8b5cf6',
      },
      backgroundColor: {
        'perfume-bg': '#0f0f1e',
        'perfume-dark': '#0f0f1e',
        'perfume-darker': '#0a0a14',
        'perfume-surface': '#1a1a2e',
        'perfume-hover': '#252538',
      },
      textColor: {
        'perfume-accent': '#8b5cf6',
        'perfume-border': '#2d2d44',
      },
      borderColor: {
        'perfume-border': '#2d2d44',
        'perfume-accent': '#8b5cf6',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        playfair: ['var(--font-playfair)', 'serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
