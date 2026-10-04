/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        angkor: {
          gold: '#C5A059',
          'gold-light': '#E5C178',
          'gold-dark': '#9A7B3A',
          blue: '#1B365D',
          'blue-dark': '#0F1F38',
          slate: '#0F172A',
          surface: '#1E293B',
          card: '#334155'
        }
      }
    },
  },
  plugins: [],
}
