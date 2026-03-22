/**
 * ProgressHeader.jsx — Test progress indicator (WEB) — redesigned 2026
 *
 * SRP: only displays progress. No state, no side effects.
 * Phosphor icons replace lucide Clock.
 * Timer is static placeholder — wire a real countdown in Test.jsx when ready.
 */

import { Timer } from "@phosphor-icons/react";

const BRAND = "#0a5f6e";
const SERIF = "Newsreader, Georgia, serif";

const ProgressHeader = ({ currentIndex, totalQuestions, progress }) => (
  <div style={{ width:"100%", maxWidth:760, margin:"0 auto 24px" }}>

    {/* Info row */}
    <div style={{ display:"flex", alignItems:"center",
      justifyContent:"space-between", marginBottom:10 }}>
      <span style={{ fontFamily:SERIF, fontSize:12, fontWeight:700,
        color:"#64748B", letterSpacing:"0.12em", textTransform:"uppercase" }}>
        Question {currentIndex + 1} of {totalQuestions}
      </span>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <Timer size={14} weight="light" color="#94A3B8" />
        <span style={{ fontFamily:SERIF, fontSize:13, color:"#94A3B8" }}>
          12:45 remaining
        </span>
      </div>
    </div>

    {/* Progress track */}
    <div style={{ height:5, background:"#E2EBF0",
      borderRadius:999, overflow:"hidden" }}>
      <div style={{
        height:"100%", background:BRAND,
        borderRadius:999,
        width:`${Math.round(progress * 100)}%`,
        transition:"width 0.4s cubic-bezier(0.4,0,0.2,1)",
        backgroundImage:`linear-gradient(90deg, ${BRAND}, #1c94a7)`,
      }} />
    </div>

    {/* Percentage label */}
    <div style={{ display:"flex", justifyContent:"flex-end", marginTop:5 }}>
      <span style={{ fontFamily:SERIF, fontSize:11,
        color:"#94A3B8", letterSpacing:"0.05em" }}>
        {Math.round(progress * 100)}% complete
      </span>
    </div>
  </div>
);

export default ProgressHeader;