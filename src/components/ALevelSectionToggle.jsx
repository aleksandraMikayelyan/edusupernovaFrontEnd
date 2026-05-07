/**
 * ALevelSectionToggle — AS | A2 pill toggle for A Levels exam type.
 * Props:
 *   section  — "AS" | "A2"
 *   onChange — (newSection: "AS" | "A2") => void
 */

const BRAND = "#0a5f6e";
const SERIF = "Newsreader, Georgia, serif";

const ALevelSectionToggle = ({ section, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <span style={{
      fontFamily: SERIF, fontSize: 12, fontWeight: 700,
      color: "#94A3B8", letterSpacing: "0.1em", textTransform: "uppercase",
    }}>
      Section
    </span>
    <div style={{
      display: "flex", gap: 3,
      background: "#E8EDF2", borderRadius: 999, padding: 3,
    }}>
      {(["AS", "A2"]).map(s => {
        const active = section === s;
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            style={{
              padding: "7px 22px", borderRadius: 999, border: "none",
              fontFamily: SERIF, fontSize: 13, fontWeight: 700,
              cursor: "pointer", transition: "all 0.18s",
              background: active ? BRAND : "transparent",
              color: active ? "#fff" : "#64748B",
              boxShadow: active ? "0 2px 8px rgba(10,95,110,0.3)" : "none",
            }}
          >
            {s}
          </button>
        );
      })}
    </div>
  </div>
);

export default ALevelSectionToggle;
