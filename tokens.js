/**
 * tokens.js — EduSupernova design system
 *
 * Single source of truth. Import this everywhere instead of
 * hardcoding hex values. If the brand changes, change it here.
 *
 * SOLID: Open/Closed — screens are open for extension (add tokens)
 * but closed for modification (don't hardcode values in components).
 */

export const COLOR = {
  // ── Brand ──────────────────────────────────────────────────────────
  DARK:         "#062f37",   // darkest teal — hero backgrounds
  BRAND:        "#0a5f6e",   // primary brand teal
  BRAND_MID:    "#1c94a7",   // mid teal — hover states
  BRAND_LIGHT:  "#e8f7f9",   // lightest teal — bg tints
  MINT:         "#5DCAA5",   // accent green — CTAs, highlights
  MINT_DARK:    "#3aab87",   // mint hover
  MINT_GLOW:    "rgba(93,202,165,0.35)",

  // ── Neutrals ───────────────────────────────────────────────────────
  CREAM:        "#F7F4EF",   // warm off-white page bg
  CREAM_DARK:   "#EDE8DF",   // exam pill default bg
  WHITE:        "#ffffff",
  BORDER:       "#E2EBF0",
  BORDER_LIGHT: "#F1F5F9",

  // ── Text ───────────────────────────────────────────────────────────
  TEXT_PRIMARY:   "#0F172A",
  TEXT_SECONDARY: "#64748B",
  TEXT_MUTED:     "#94A3B8",
  TEXT_FAINT:     "#CBD5E1",

  // ── Semantic ───────────────────────────────────────────────────────
  CORRECT_BG:     "#f0fdf4",
  CORRECT_TEXT:   "#15803d",
  CORRECT_BORDER: "#86efac",
  WRONG_BG:       "#fff0f0",
  WRONG_TEXT:     "#b02020",
  WRONG_BORDER:   "#e74c3c",
  WARN_BG:        "#fff8e6",
  WARN_TEXT:      "#a06a00",
  WARN_BORDER:    "#f5a623",
};

export const FONT = {
  SERIF:  "Newsreader, Georgia, serif",
  SCRIPT: "Cookie, cursive",
};

export const SHADOW = {
  SM:     "0 1px 4px rgba(0,0,0,0.06)",
  MD:     "0 4px 16px rgba(0,0,0,0.08)",
  LG:     "0 8px 32px rgba(0,0,0,0.10)",
  BRAND:  "0 8px 32px rgba(10,95,110,0.25)",
  MINT:   "0 12px 40px rgba(93,202,165,0.35)",
  CARD:   "0 2px 8px rgba(0,0,0,0.04)",
};

export const RADIUS = {
  SM:   8,
  MD:   12,
  LG:   20,
  XL:   28,
  PILL: 999,
};

export const ANIMATION = {
  FADE_UP: `
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes slideRight {
      from { opacity: 0; transform: translateX(-20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `,
};