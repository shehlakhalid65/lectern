/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#2e1065',
        },
        ink: {
          700: '#2a2547',
          800: '#1b1733',
          900: '#110e24',
          950: '#0b0918',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(23, 16, 56, 0.04), 0 8px 24px -12px rgba(23, 16, 56, 0.12)',
        lift: '0 2px 4px rgba(23, 16, 56, 0.04), 0 20px 40px -16px rgba(23, 16, 56, 0.22)',
        glow: '0 8px 24px -8px rgba(124, 58, 237, 0.55)',
      },
    },
  },
  plugins: [],
}
