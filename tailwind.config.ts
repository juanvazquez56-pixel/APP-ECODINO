import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2F8',
          100: '#D9E2F3',
          500: '#1F3864',
          600: '#1A2E54',
          700: '#152444',
        },
        ok: {
          50: '#DCFCE7', 100: '#BBF7D0', 500: '#16A34A', 600: '#15803D', 800: '#14532D',
        },
        warn: {
          50: '#FEF3C7', 100: '#FDE68A', 500: '#F59E0B', 600: '#D97706', 800: '#78350F',
        },
        bad: {
          50: '#FEE2E2', 100: '#FECACA', 500: '#DC2626', 600: '#B91C1C', 800: '#7F1D1D',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
