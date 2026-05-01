/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'scanora-green': '#10b981', // Emerald Green 500
        'scanora-dark': '#064e3b',  // Emerald Green 900
        'status-ripe': '#f59e0b',   // Amber 500
        'status-unripe': '#9ca3af', // Gray 400
        'status-rotten': '#ef4444', // Red 500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
