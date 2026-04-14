/**
 * TestTopBar — fixed top bar for Paper 2 (Data Response) and Paper 3 (Essay).
 *
 * Props:
 *   paperName      string   e.g. "Paper 2 - Data Response"
 *   groupLabel     string   e.g. "Group 1 of 2" | "Essay 1 of 2"
 *   remainingSeconds number | null  (passed to internal timer)
 *   onLeave        fn       called when user confirms leaving
 */

import { useState, useEffect, useRef } from "react";
import { Timer, House, X } from "@phosphor-icons/react";

const DARK   = "#062f37";
const BRAND  = "#0a5f6e";
const MINT   = "#5DCAA5";
const SERIF  = "Newsreader, Georgia, serif";
const SCRIPT = "Cookie, cursive";

const fmt = (secs) => {
  if (secs == null || secs <= 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const TestTopBar = ({ paperName, groupLabel, remainingSeconds, onLeave }) => {
  const [timeLeft, setTimeLeft] = useState(remainingSeconds ?? null);
  const intervalRef = useRef(null);

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
  const timerColor = urgent ? "#e74c3c" : warning ? "#f5a623" : "rgba(255,255,255,0.55)";

  const handleLeave = () => {
    if (window.confirm("Leave the test? Your progress will be lost.")) {
      onLeave?.();
    }
  };

  return (
    <div style={{
      height: 52, flexShrink: 0,
      background: `linear-gradient(90deg, ${DARK} 0%, ${BRAND} 100%)`,
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      boxShadow: "0 2px 12px rgba(10,95,110,0.25)",
      zIndex: 20,
    }}>
      {/* Left: logo + paper name */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontFamily: SCRIPT, fontSize: 22, color: "#fff", letterSpacing: 0.3 }}>
          edusupernova
        </span>
        {paperName && (
          <>
            <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.2)" }} />
            <span style={{ fontFamily: SERIF, fontSize: 12,
              color: "rgba(255,255,255,0.55)", letterSpacing: "0.02em" }}>
              {paperName}
            </span>
          </>
        )}
      </div>

      {/* Centre: group / essay label */}
      {groupLabel && (
        <div style={{
          position: "absolute", left: "50%", transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: 999, padding: "3px 14px",
        }}>
          <span style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
            color: "rgba(255,255,255,0.85)", letterSpacing: "0.06em" }}>
            {groupLabel}
          </span>
        </div>
      )}

      {/* Right: timer + leave */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {timeLeft != null && (
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            background: urgent ? "rgba(231,76,60,0.15)" : warning ? "rgba(245,166,35,0.12)" : "transparent",
            borderRadius: 999, padding: urgent || warning ? "3px 10px" : "0",
            transition: "background 0.3s",
          }}>
            <Timer size={13} weight={urgent ? "fill" : "light"} color={timerColor} />
            <span style={{
              fontFamily: SERIF, fontSize: 12,
              fontWeight: urgent ? 700 : 400,
              color: timerColor,
              fontVariantNumeric: "tabular-nums",
              transition: "color 0.3s",
            }}>
              {fmt(timeLeft)}
            </span>
          </div>
        )}
        <button onClick={handleLeave}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8, padding: "5px 8px",
            cursor: "pointer", display: "flex", alignItems: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.16)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>
          <X size={14} color="rgba(255,255,255,0.6)" />
        </button>
      </div>
    </div>
  );
};

export default TestTopBar;
