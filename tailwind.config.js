/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/react");

module.exports = {
  content: [
    "./frontend/app/**/*.{js,ts,jsx,tsx}",
    "./frontend/components/**/*.{js,ts,jsx,tsx}",
    "./frontend/theme/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/react/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2ff',
          100: '#cce4ff',
          200: '#99c9ff',
          300: '#66adff',
          400: '#3392ff',
          500: '#0077ff', // Primary color
          600: '#0061cc',
          700: '#004c99',
          800: '#003366',
          900: '#001933',
          DEFAULT: '#0077ff',
        },
        secondary: {
          50: '#f0f0fa',
          100: '#e1e1f6',
          200: '#c3c3ec',
          300: '#a5a5e3',
          400: '#8787d9',
          500: '#6969d0', // Secondary color
          600: '#5454a6',
          700: '#3f3f7d',
          800: '#2a2a53',
          900: '#15152a',
          DEFAULT: '#6969d0',
        },
        success: {
          500: '#22c55e',
          DEFAULT: '#22c55e',
        },
        warning: {
          500: '#f59e0b',
          DEFAULT: '#f59e0b',
        },
        danger: {
          500: '#ef4444',
          DEFAULT: '#ef4444',
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
