import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: "#f6f7ee",
          100: "#ebedda",
          200: "#d5dab8",
          300: "#b8c18e",
          400: "#9aa868",
          500: "#7d8f4a",
          600: "#627139",
          700: "#4c582d",
          800: "#3e4826",
          900: "#353d22",
        },
        terracotta: {
          50: "#fdf4f0",
          100: "#fae7de",
          200: "#f4cebb",
          300: "#ecae8f",
          400: "#e38761",
          500: "#d86540",
          600: "#c04d2a",
          700: "#a03c23",
          800: "#843323",
          900: "#6d2e22",
        },
        cream: {
          50: "#fffdf9",
          100: "#fdf8f0",
          200: "#faf0e0",
          300: "#f5e4c8",
          400: "#eed4a8",
          500: "#e5c07e",
          600: "#d4a853",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
