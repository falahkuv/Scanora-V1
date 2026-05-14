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
        'floaty': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'page-in': 'page-in 500ms cubic-bezier(0.22, 1, 0.36, 1)',
        'floaty': 'floaty 3s ease-in-out infinite',
      },
      colors: {
        'scanora-green': '#10b981', // Emerald Green 500
        'scanora-dark': '#064e3b',  // Emerald Green 900
        'status-ripe': '#f59e0b',   // Amber 500
        'status-unripe': '#9ca3af', // Gray 400
        'status-rotten': '#ef4444', // Red 500
        'yellow-main': '#fdc107',
        'orange-main': '#f87305',
        'red-main': '#e02224',
        'leaf-main': '#076a26',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
