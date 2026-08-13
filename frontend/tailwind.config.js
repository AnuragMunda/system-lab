/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          950: "#08080a",
          900: "#0c0c0f",
          850: "#101013",
          800: "#141418",
          750: "#1a1a1f",
          700: "#202026",
          600: "#2a2a32",
          500: "#3a3a44",
          400: "#52525e",
          300: "#71717f",
          200: "#9a9aa8",
          100: "#c5c5d0",
          50: "#e6e6ee",
        },
        accent: {
          DEFAULT: "#3dd68c",
          dim: "#1a8a5a",
          glow: "rgba(61,214,140,0.35)",
        },
        signal: {
          cyan: "#22d3ee",
          amber: "#f59e0b",
          red: "#ef4444",
          violet: "#a78bfa",
        },
      },
      borderColor: {
        DEFAULT: "#202028",
      },
      animation: {
        flow: "flow 2.5s linear infinite",
        "flow-slow": "flow 4s linear infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        blink: "blink 1.4s steps(1) infinite",
        scan: "scan 6s linear infinite",
        "float-in": "float-in 0.6s ease-out both",
      },
      keyframes: {
        flow: {
          "0%": { offsetDistance: "0%" },
          "100%": { offsetDistance: "100%" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "float-in": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
