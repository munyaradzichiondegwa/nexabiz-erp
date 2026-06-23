import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── NexaBiz Brand Palette (matches wireframe) ──
        navy: {
          DEFAULT: "#1A2B4A",   // sidebar background
          light:   "#223559",
          dark:    "#111D33",
        },
        teal: {
          DEFAULT: "#2DB89E",   // primary CTA / active nav
          light:   "#3ECDB2",
          dark:    "#1E9E87",
        },
        surface: "#F0F4F8",     // page background
        border:  "#D9E2EC",
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;