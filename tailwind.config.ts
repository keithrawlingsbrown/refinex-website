import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        refinex: {
          navy: {
            DEFAULT: '#001036',
            dark: '#000814',
            light: '#001A52',
          },
          cyan: {
            DEFAULT: '#4FE8FF',
            light: '#7FEDFF',
            dark: '#00C4E6',
          },
          blue: {
            DEFAULT: '#1B5BDB',
            light: '#3D7AFF',
            dark: '#0D3B8A',
          },
          gray: {
            900: '#0F1419',
            800: '#1A1F2E',
            700: '#2A3142',
            600: '#4A5568',
            100: '#F7F9FC',
            50: '#FAFBFD',
          },
        },
        semantic: {
          success: '#00D4AA',
          warning: '#FFB84D',
          error: '#FF4D6A',
        },
      },
      backgroundImage: {
        'gradient-signal': 'linear-gradient(135deg, #4FE8FF 0%, #1B5BDB 66%, #000000 100%)',
        'gradient-hero': 'linear-gradient(180deg, #001036 0%, #000814 100%)',
        'gradient-button': 'linear-gradient(135deg, #4FE8FF 0%, #1B5BDB 100%)',
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(79, 232, 255, 0.3)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 30px rgba(79, 232, 255, 0.6)' },
        },
        'grid-pulse': {
          '0%, 100%': { opacity: '0.1' },
          '50%': { opacity: '0.2' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-in-right': 'slide-in-right 0.6s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'grid-pulse': 'grid-pulse 20s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(79, 232, 255, 0.3)',
        'glow-blue': '0 0 20px rgba(27, 91, 219, 0.3)',
        'card-hover': '0 12px 32px rgba(79, 232, 255, 0.15)',
        'card-dark': '0 4px 16px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}

export default config
