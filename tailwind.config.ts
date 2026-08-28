import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4B2E83", // Deep Purple
          dark: "#3A2266",
          light: "#6B4C9A",
        },
        accent: {
          DEFAULT: "#A8D5BA", // Mint Green
          dark: "#7AB890", // Muted Green for Dark Mode
          light: "#C8E6D2",
        },
        background: {
          DEFAULT: "#FFFFFF",
          subtle: "#F8F9FC",
        },
        surface: "#FFFFFF",
        dark: {
          bg: "#0F0A1A", // Very dark purple/black
          surface: "#1A122B", // Dark purple for cards
          border: "#2D2145",
        }
      },
      fontFamily: {
        sans: ["var(--font-tajawal)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "sm": "8px",
        "md": "12px",
        "lg": "16px",
        "xl": "20px",
        "2xl": "24px",
      },
      boxShadow: {
        "soft": "0 4px 20px rgba(75, 46, 131, 0.06)",
        "hover": "0 12px 40px rgba(75, 46, 131, 0.12)",
        "glow": "0 0 25px rgba(168, 213, 186, 0.4)",
      },
      transitionDuration: {
        'smooth': '300ms',
      }
    },
  },
  plugins: [],
}
export default config