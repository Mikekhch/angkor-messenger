/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cipherSurface: "#071423",
        cipherCanvas: "#0B0F17",
        cipherContainer: "#14202f",
        cipherContainerHigh: "#1e2b3a",
        cipherElevated: "#1c2433",
        cipherInteractive: "#253045",
        cipherBlue: "#007AFF",
        cipherCyan: "#00C2FF",
        cipherEmerald: "#10B981",
        khmerRed: "#E11D48",
        khmerBlue: "#1D4ED8",
        khmerDark: "#0F172A",
      }
    },
  },
  plugins: [],
}
