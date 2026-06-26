import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        // Brand palette — Arabic-first redesign
        ink: {
          DEFAULT: "#0D1117",
          80: "#1C2333",
          50: "#4A5568",
          30: "#8B9BAD",
          10: "#EFF2F6",
        },
        paper: "#FAFBFC",
        green: {
          DEFAULT: "#1B7A4E",
          mid: "#22A063",
          bright: "#2DC072",
          glow: "rgba(34,160,99,0.15)",
        },
        gold: {
          DEFAULT: "#C8862A",
          light: "#F5D48A",
        },
      },
      boxShadow: {
        green: "0 8px 32px rgba(34,160,99,0.25)",
        "green-lg": "0 16px 48px rgba(34,160,99,0.35)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      outlineColor: {
        DEFAULT: "var(--ring)",
      },
    },
  },
  plugins: [],
};
export default config;
