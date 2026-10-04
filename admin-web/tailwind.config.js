/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        khmerRed: "#E11D48",
        khmerBlue: "#1D4ED8",
        khmerDark: "#0F172A",
      }
    },
  },
  plugins: [],
}
