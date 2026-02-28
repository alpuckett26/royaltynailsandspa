import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#0F0720',
          50: '#2a1a45',
          100: '#1e1035',
          200: '#180c2c',
          300: '#130926',
          400: '#0F0720',
        },
        offwhite: {
          DEFAULT: '#F7F3EE',
          50: '#FDFCFB',
          100: '#FAF8F5',
          200: '#F7F3EE',
          300: '#EDE8E1',
          400: '#E0D9CF',
        },
        gold: {
          DEFAULT: '#C6A15B',
          light: '#D4B47A',
          dark: '#A88540',
          muted: '#C6A15B80',
        },
        border: {
          DEFAULT: '#2a1a45',
          light: '#3a2560',
        },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '7xl': ['4.5rem', { lineHeight: '1.05' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      letterSpacing: {
        widest: '0.25em',
        'ultra-wide': '0.35em',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.7s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C6A15B 0%, #E8C97A 50%, #C6A15B 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0F0720 0%, #180c2c 100%)',
        'hero-gradient': 'radial-gradient(ellipse at 60% 50%, #2a1a45 0%, #0F0720 70%)',
        'card-gradient': 'linear-gradient(145deg, #1e1035 0%, #130926 100%)',
        'shimmer-gold': 'linear-gradient(90deg, transparent 0%, #C6A15B20 50%, transparent 100%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(198, 161, 91, 0.15)',
        'gold-md': '0 4px 30px rgba(198, 161, 91, 0.2)',
        'card': '0 4px 40px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 60px rgba(0, 0, 0, 0.5)',
        'inner-gold': 'inset 0 1px 0 rgba(198, 161, 91, 0.15)',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
}
export default config
