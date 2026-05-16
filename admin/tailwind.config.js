/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "hsl(43 72% 47%)",
        background: "hsl(222 47% 6%)",
        foreground: "hsl(45 10% 95%)",
        border: "hsl(222 30% 20%)",
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
      },
    },
  },
  plugins: [],
};
