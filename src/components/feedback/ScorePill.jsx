/**
 * ScorePill.jsx — Score display (WEB) — redesigned 2026
 * Animated score reveal with colour-coded feedback message.
 */

import { useEffect, useState } from "react";

const SERIF = "Newsreader, Georgia, serif";

const getTheme = (raw) => {
  if (!raw) return { bg:"#e8f7f9", text:"#0a5f6e", border:"#1c94a7", label:"Results ready", emoji:"📊" };
  const n = parseFloat(raw);
  if (n >= 8)  return { bg:"#f0fdf4", text:"#15803d", border:"#86efac", label:"Excellent work!", emoji:"🏆" };
  if (n >= 5)  return { bg:"#fff8e6", text:"#a06a00", border:"#f5a623", label:"Good effort",    emoji:"📈" };
  return             { bg:"#fff0f0", text:"#b02020", border:"#e74c3c", label:"Keep practising", emoji:"💪" };
};

const ScorePill = ({ mark }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 300); return () => clearTimeout(t); }, []);

  const theme = getTheme(mark);

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
      <div style={{
        background: theme.bg, border:`2.5px solid ${theme.border}`,
        borderRadius:999, padding:"20px 52px",
        display:"flex", flexDirection:"column", alignItems:"center",
        transition:"transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        transform: show ? "scale(1)" : "scale(0.85)",
        opacity: show ? 1 : 0,
      }}>
        <span style={{ fontSize:56, fontWeight:800, fontFamily:SERIF,
          color:theme.text, lineHeight:1, letterSpacing:"-2px" }}>
          {mark ?? "—"}
        </span>
        <span style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
          color:theme.text, textTransform:"uppercase", letterSpacing:"0.14em", marginTop:4 }}>
          Final score
        </span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:18 }}>{theme.emoji}</span>
        <span style={{ fontFamily:SERIF, fontSize:14, fontWeight:600, color:theme.text }}>
          {theme.label}
        </span>
      </div>
    </div>
  );
};

export default ScorePill;