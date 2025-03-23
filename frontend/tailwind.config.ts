import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";
import { themeConfig } from "./theme/theme-config";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./theme/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/react/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@assistant-ui/react/tailwindcss"),
    require("@assistant-ui/react-markdown/tailwindcss"),
    heroui({
      prefix: "",
      addCommonColors: true,
      layout: {
        radius: themeConfig.radius,
        borderWidth: 1,
      },
      themes: {
        light: {
          colors: {
            primary: themeConfig.primary,
            secondary: themeConfig.secondary,
          },
        },
        dark: {
          colors: {
            primary: themeConfig.primary,
            secondary: themeConfig.secondary,
          },
        },
      },
    }),
  ],
} satisfies Config;

export default config;
