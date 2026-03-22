/**
 * SectionHeading.jsx — Numbered section heading (WEB)
 * Inline styles only — no Tailwind dependency.
 */

const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif";

const SectionHeading = ({ text, number }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16,
    marginTop: 40, marginBottom: 20 }}>
    {/* Large decorative ordinal */}
    <span style={{ fontFamily: SERIF, fontSize: 52, fontWeight: 700,
      color: "#e2f4f7", lineHeight: 1, flexShrink: 0, userSelect: "none" }}>
      {String(number).padStart(2, "0")}
    </span>

    {/* Mint divider bar */}
    <div style={{ width: 3, height: 32, background: MINT,
      borderRadius: 2, flexShrink: 0 }} />

    {/* Section text */}
    <span style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700,
      color: BRAND, letterSpacing: "0.12em",
      textTransform: "uppercase", flex: 1, lineHeight: 1.4 }}>
      {text}
    </span>
  </div>
);

export default SectionHeading;