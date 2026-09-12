/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'picton-blue': {
          '50': '#f0faff',
          '100': '#e1f3fd',
          '200': '#bce8fb',
          '300': '#81d7f8',
          '400': '#3dc3f3',
          '500': '#1eb4eb',
          '600': '#088ac1',
          '700': '#076e9d',
          '800': '#0b5d81',
          '900': '#0f4d6b',
          '950': '#0a3147',
        },
        islamic: {
          bg: {
            light: '#f5faff',
            dark: '#060e14',
          },
          card: {
            light: '#ffffff',
            dark: '#0b1822',
          },
          subtle: {
            light: '#e8f4fc',
            dark: '#0f2331',
          },
          border: {
            light: '#d2ebf9',
            dark: '#163246',
          },
          primary: {
            50: '#f0faff',
            100: '#e1f3fd',
            200: '#bce8fb',
            300: '#81d7f8',
            400: '#3dc3f3',
            500: '#1eb4eb',
            600: '#088ac1',
            700: '#076e9d',
            800: '#0b5d81',
            900: '#0f4d6b',
            950: '#0a3147',
          },
          gold: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        arabic: ['Amiri', 'Scheherazade New', 'Traditional Arabic', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'soft-lg': '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
        'emerald-glow': '0 0 25px -5px rgba(30, 180, 235, 0.35)',
        'picton-glow': '0 0 25px -5px rgba(30, 180, 235, 0.35)',
        'gold-glow': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
