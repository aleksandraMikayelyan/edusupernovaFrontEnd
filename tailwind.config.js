/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Brand ──────────────────────────────────────────────
        ocean: {
          deep:   "#0a5f6e",   // dark header / sidebar logo
          bright: "#1c94a7",   // buttons / active / accents
          light:  "#e8f7f9",   // light teal backgrounds
        },
        // ── Semantic ───────────────────────────────────────────
        correct: {
          bg:     "#f0fdf4",
          text:   "#15803d",
          border: "#86efac",
        },
        wrong: {
          bg:     "#fff0f0",
          text:   "#b02020",
          border: "#e74c3c",
        },
        warn: {
          bg:     "#fff8e6",
          text:   "#a06a00",
          border: "#f5a623",
        },
        // ── Neutral ────────────────────────────────────────────
        page:   "#F0F4F8",    // body background
        cream:  "#e8e2d6",    // beige card / pill default
        border: {
          light:  "#E2EBF0",
          medium: "#CBD5E1",
        },
      },
      fontFamily: {
        serif:  ["Newsreader", "Georgia", "serif"],
        script: ["Cookie", "cursive"],
      },
      boxShadow: {
        card:   "0 2px 8px rgba(0,0,0,0.04)",
        hero:   "0 8px 32px rgba(28,148,167,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        modal:  "0 12px 48px rgba(0,0,0,0.08)",
        header: "0 2px 12px rgba(10,95,110,0.15)",
        action: "0 8px 24px rgba(28,148,167,0.3)",
        ai:     "0 2px 8px rgba(28,148,167,0.08)",
      },
    },
  },
  plugins: [
    // npm install -D tailwind-scrollbar-hide
    require("tailwind-scrollbar-hide"),
  ],
};