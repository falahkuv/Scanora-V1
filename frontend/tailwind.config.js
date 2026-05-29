/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        'page-in': {
          '0%': { opacity: '0', transform: 'translateY(18px) scale(0.98)' },
          '60%': { opacity: '1', transform: 'translateY(-2px) scale(1.01)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'swipe-swap': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '35%': { opacity: '0', transform: 'translateX(-24px)' },
          '45%': { opacity: '0', transform: 'translateX(28px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'floaty': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'fab-jiggle': {
          '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
          '20%': { transform: 'rotate(-12deg) scale(1.12)' },
          '40%': { transform: 'rotate(10deg) scale(1.08)' },
          '60%': { transform: 'rotate(-6deg) scale(1.04)' },
          '80%': { transform: 'rotate(4deg) scale(1.02)' },
        },
        'indeterminate': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' }
        },
      },
      animation: {
        'page-in': 'page-in 500ms cubic-bezier(0.22, 1, 0.36, 1)',
        'swipe-swap': 'swipe-swap 520ms cubic-bezier(0.22, 1, 0.36, 1)',
        'floaty': 'floaty 3s ease-in-out infinite',
        'fab-jiggle': 'fab-jiggle 500ms cubic-bezier(0.36,0.07,0.19,0.97) both',
      },
      colors: {
        'scanora-green': '#10b981', // Emerald Green 500
        'scanora-dark': '#064e3b',  // Emerald Green 900
        'yellow-main': '#fdc107',
        'orange-main': '#f97316',
        'red-main': '#bb0006ff',
        'leaf-main': '#076a26',
        orange: {
          700: '#cc4e00',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      fontSize: {
        'fruit-name': ['28px', { lineHeight: '1.1', fontWeight: '700' }],
        'fruit-name-sm': ['22px', { lineHeight: '1.1', fontWeight: '700' }],
      }
    },
  },
  plugins: [],
}
