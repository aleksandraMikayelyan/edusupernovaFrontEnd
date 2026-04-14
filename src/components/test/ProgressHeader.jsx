/**
 * ProgressHeader.jsx — Test progress + live countdown timer
 *
 * Props:
 *   currentIndex     — 0-based answered count
 *   totalQuestions   — total questions in session
 *   progress         — 0-1 fraction (answered / total)
 *   remainingSeconds — initial seconds from TestSessionDTO (optional)
 */

import { useState, useEffect, useRef } from "react";
import { Timer } from "@phosphor-icons/react";

const BRAND = "#0a5f6e";
const SERIF = "Newsreader, Georgia, serif";

const fmt = (secs) => {
  if (secs == null || secs <= 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const ProgressHeader = ({ currentIndex, totalQuestions, progress, remainingSeconds }) => {
  const [timeLeft, setTimeLeft] = useState(remainingSeconds ?? null);
  const intervalRef = useRef(null);

  // Reset and restart when a new session begins (remainingSeconds changes)
  useEffect(() => {
    if (remainingSeconds == null) return;
    setTimeLeft(remainingSeconds);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [remainingSeconds]);

  const urgent  = timeLeft != null && timeLeft <= 60;
  const warning = timeLeft != null && timeLeft <= 120 && !urgent;
  const timerColor = urgent ? "#e74c3c" : warning ? "#f5a623" : "#94A3B8";

  return (
    <div style={{ width:"100%", maxWidth:760, margin:"0 auto 24px" }}>

      {/* Info row */}
      <div style={{ display:"flex", alignItems:"center",
        justifyContent:"space-between", marginBottom:10 }}>
        <span style={{ fontFamily:SERIF, fontSize:12, fontWeight:700,
          color:"#64748B", letterSpacing:"0.12em", textTransform:"uppercase" }}>
          Question {currentIndex + 1} of {totalQuestions}
        </span>

        {timeLeft != null && (
          <div style={{ display:"flex", alignItems:"center", gap:6,
            background: urgent ? "#fff0f0" : warning ? "#fff8e6" : "transparent",
            borderRadius: 999, padding: urgent || warning ? "3px 10px" : "0",
            transition:"background 0.3s",
          }}>
            <Timer size={14} weight={urgent ? "fill" : "light"} color={timerColor} />
            <span style={{ fontFamily:SERIF, fontSize:13, fontWeight: urgent ? 700 : 400,
              color:timerColor, letterSpacing:"0.04em", transition:"color 0.3s",
              fontVariantNumeric:"tabular-nums",
            }}>
              {fmt(timeLeft)} remaining
            </span>
          </div>
        )}
      </div>

      {/* Progress track */}
      <div style={{ height:5, background:"#E2EBF0",
        borderRadius:999, overflow:"hidden" }}>
        <div style={{
          height:"100%", borderRadius:999,
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
};

export default ProgressHeader;
