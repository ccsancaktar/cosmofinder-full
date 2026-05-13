/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(43 72% 47%)",
        "primary-foreground": "hsl(222 47% 6%)",
        secondary: "hsl(222 35% 15%)",
        "secondary-foreground": "hsl(45 10% 95%)",
        accent: "hsl(43 72% 47%)",
        "accent-foreground": "hsl(222 47% 6%)",
        muted: "hsl(222 30% 18%)",
        "muted-foreground": "hsl(220 15% 60%)",
        background: "hsl(222 47% 6%)",
        foreground: "hsl(45 10% 95%)",
        card: "hsl(222 40% 10%)",
        "card-foreground": "hsl(45 10% 95%)",
        border: "hsl(222 30% 20%)",
        input: "hsl(222 30% 20%)",
        ring: "hsl(43 72% 47%)",
        "dark-bg": "hsl(222 47% 6%)",
        "light-bg": "hsl(222 40% 10%)",
        "text-primary": "hsl(45 10% 95%)",
        surface: "hsl(222 40% 12%)",
        gold: {
          DEFAULT: "hsl(43 72% 47%)",
          light: "hsl(43 72% 60%)",
          dark: "hsl(43 72% 35%)",
        },
        cosmic: {
          dark: "hsl(222 50% 4%)",
          DEFAULT: "hsl(222 47% 6%)",
          light: "hsl(222 40% 12%)",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Cinzel", "serif"],
        decorative: ["Cinzel Decorative", "serif"],
        runic: ["Noto Sans Runic", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "8px",
        md: "12px",
        lg: "16px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss/plugin")(function({ addUtilities }) {
      addUtilities({
        ".glass": {
          "@apply bg-white/10 backdrop-blur-md border border-white/20 rounded-xl": {},
        },
        ".glass-dark": {
          "@apply bg-black/40 backdrop-blur-md border border-white/10 rounded-xl": {},
        },
        ".gradient-text": {
          "background": "linear-gradient(135deg, hsl(43 72% 47%), hsl(35 80% 55%))",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
        ".glow-gold": {
          "box-shadow": "0 0 20px hsla(43, 72%, 47%, 0.3)",
        },
        ".glow-gold-sm": {
          "box-shadow": "0 0 10px hsla(43, 72%, 47%, 0.2)",
        },
      });
    }),
  ],
}
