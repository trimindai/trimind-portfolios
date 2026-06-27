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
        ink: {
          DEFAULT: "#0D1117",
          80: "#1C2333",
          50: "#4A5568",
          30: "#8B9BAD",
          10: "#EFF2F6",
        },
        paper: "#FAFBFC",
        // `green` is an object so `bg-green` (DEFAULT) AND `bg-green-mid`/
        // `bg-green-bright` all resolve — spec snippets use both forms.
        green: {
          DEFAULT: "#22A063",
          mid: "#22A063",
          bright: "#2DC072",
          glow: "rgba(34,160,99,0.15)",
        },
        "green-mid": "#22A063",
        "green-bright": "#2DC072",
        "green-glow": "rgba(34,160,99,0.15)",
        gold: {
          DEFAULT: "#C8862A",
          light: "#F5D48A",
        },
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      outlineColor: {
        DEFAULT: "var(--ring)",
      },
      boxShadow: {
        green: "0 8px 32px rgba(34,160,99,0.25)",
        "green-lg": "0 16px 48px rgba(34,160,99,0.35)",
      },
      keyframes: {
        progress: {
          "0%": { width: "0%" },
          "80%": { width: "85%" },
          "100%": { width: "90%" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        progress: "progress 10s ease-in-out forwards",
        fadeInUp: "fadeInUp 0.4s ease both",
        slideIn: "slideIn 0.3s ease both",
      },
    },
  },
  plugins: [],
};
export default config;
