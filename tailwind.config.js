/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deep: {
          DEFAULT: '#060B17',
          50: '#0a1628',
          100: '#0f1d35',
          200: '#162a4a',
          300: '#1e3a5f',
        },
        cyan: {
          DEFAULT: '#06b6d4',
          glow: '#22d3ee',
          dim: '#0e7490',
          50: '#ecfeff',
          900: '#083344',
        },
        cobalt: {
          DEFAULT: '#2563eb',
          light: '#3b82f6',
          dark: '#1d4ed8',
          glow: '#60a5fa',
        },
        emerald: {
          DEFAULT: '#10b981',
          glow: '#34d399',
          dim: '#065f46',
        },
        surface: {
          DEFAULT: 'rgba(15, 23, 42, 0.6)',
          card: 'rgba(15, 23, 42, 0.8)',
          glass: 'rgba(6, 11, 23, 0.7)',
          border: 'rgba(148, 163, 184, 0.15)',
          borderHover: 'rgba(148, 163, 184, 0.3)',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(6, 182, 212, 0.1)',
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.3), 0 0 40px rgba(37, 99, 235, 0.1)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4), 0 0 1px rgba(148, 163, 184, 0.1)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 1px rgba(6, 182, 212, 0.2)',
      },
      backdropBlur: {
        'glass': '16px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
