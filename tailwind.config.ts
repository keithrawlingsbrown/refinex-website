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
        border: '#1E293B',
        refinex: {
          navy: '#0A0F1E',
          slate: '#0F172A',
          'slate-light': '#1E293B',
          blue: '#2563EB',
          'blue-light': '#3B82F6',
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#475569',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(180deg, #0A0F1E 0%, #0F172A 100%)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
