/**
 * CollapsibleSection.jsx — Toggleable sidebar section (WEB)
 * Inline styles only.
 */

import { useState } from "react";

const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 6px 10px", background: "none", border: "none",
          cursor: "pointer",
        }}
      >
        <span style={{
          fontFamily: "Newsreader, Georgia, serif",
          fontSize: 10, fontWeight: 700, color: "#94A3B8",
          letterSpacing: "0.14em", textTransform: "uppercase",
        }}>
          {title}
        </span>
        <span style={{ fontSize: 13, color: "#94A3B8" }}>
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
};

export default CollapsibleSection;