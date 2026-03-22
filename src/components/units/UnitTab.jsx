/**
 * UnitTab.jsx — Sidebar unit tab (WEB)
 * Inline styles only — consistent with Units.jsx.
 */

const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif";

const UnitTab = ({ unit, index, isActive, onPress }) => (
  <button
    onClick={onPress}
    style={{
      width: "100%", display: "flex", alignItems: "center", gap: 10,
      padding: "10px 10px 10px 8px", borderRadius: 12, marginBottom: 4,
      border: "none",
      borderLeft: `3px solid ${isActive ? MINT : "transparent"}`,
      background: isActive ? "#e8f7f9" : "transparent",
      cursor: "pointer", textAlign: "left",
      transition: "background 0.15s, border-color 0.15s",
    }}
    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#F7F4EF"; }}
    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
  >
    {/* Number badge */}
    <div style={{
      width: 26, height: 26, borderRadius: 8, flexShrink: 0,
      background: isActive ? BRAND : "#F1F5F9",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <span style={{
        fontFamily: SERIF, fontSize: 11, fontWeight: 700,
        color: isActive ? "#fff" : "#64748B",
      }}>
        {index + 1}
      </span>
    </div>

    {/* Title */}
    <span style={{
      fontFamily: SERIF, fontSize: 13, flex: 1, lineHeight: 1.35,
      color: isActive ? BRAND : "#64748B",
      fontWeight: isActive ? 700 : 400,
      display: "-webkit-box", WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical", overflow: "hidden",
    }}>
      {unit.title}
    </span>

    {/* Active dot */}
    {isActive && (
      <div style={{ width: 6, height: 6, borderRadius: "50%",
        background: MINT, flexShrink: 0 }} />
    )}
  </button>
);

export default UnitTab;