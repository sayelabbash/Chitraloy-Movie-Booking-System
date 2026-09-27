/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Poppins"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe1e3',
          200: '#ffc7cb',
          300: '#ff9fa7',
          400: '#fc6874',
          500: '#f53347',
          600: '#e21f3a',
          700: '#c01530',
          800: '#9f142d',
          900: '#84152b',
          950: '#490812',
        },
        gold: {
          400: '#e8a93a',
          500: '#d9932a',
          600: '#b87a1f',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#afb7c7',
          400: '#8390a6',
          500: '#63708a',
          600: '#4e5971',
          700: '#40495d',
          800: '#2b3242',
          900: '#1c212c',
          950: '#12151d',
        },
      },
      boxShadow: {
        card: '0 2px 10px -2px rgba(18,21,29,0.08), 0 1px 2px rgba(18,21,29,0.04)',
        pop: '0 12px 30px -8px rgba(226,31,58,0.35)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        fadeIn: 'fadeIn .3s ease-out',
        slideUp: 'slideUp .35s ease-out',
      },
    },
  },
  plugins: [],
}
