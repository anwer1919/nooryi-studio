import type { Config } from "tailwindcss"

const config: Config = {
  // تفعيل الوضع الليلي يدوياً عبر إضافة كلاس "dark" للـ html
  darkMode: "class",
  
  // تحديد المسارات التي يبحث فيها Tailwind عن الكلاسات
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  theme: {
    extend: {
      // 1. نظام الألوان الفاخر (Mint Green & Deep Purple)
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
          DEFAULT: "#FFFFFF", // Pure White
          subtle: "#F8F9FC", // Off-white for subtle backgrounds
        },
        surface: "#FFFFFF",
        dark: {
          bg: "#0F0A1A", // Very dark purple/black
          surface: "#1A122B", // Dark purple for cards
          border: "#2D2145",
        }
      },
      
      // 2. الخطوط (تتوافق مع المتغير المعرف في layout.tsx)
      fontFamily: {
        sans: ["var(--font-tajawal)", "system-ui", "sans-serif"],
      },
      
      // 3. زوايا دائرية ناعمة وفاخرة (12px - 20px)
      borderRadius: {
        "sm": "8px",
        "md": "12px",
        "lg": "16px",
        "xl": "20px",
        "2xl": "24px",
      },
      
      // 4. ظلال ناعمة وعصرية
      boxShadow: {
        "soft": "0 4px 20px rgba(75, 46, 131, 0.06)",
        "hover": "0 12px 40px rgba(75, 46, 131, 0.12)",
        "glow": "0 0 25px rgba(168, 213, 186, 0.4)",
      },
    },
  },
  
  plugins: [],
}

export default config