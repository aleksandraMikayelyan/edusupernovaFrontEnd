/**
 * AnswerTextarea — textarea with counter + integrated SaveIndicator.
 *
 * Props:
 *   value          string
 *   onChange       fn(newValue)
 *   rows           number   (default 6)
 *   placeholder    string
 *   counterMode    "words" | "chars"  (default "chars")
 *   minWords       number   minimum word threshold to highlight green (essay mode)
 *   saveState      "idle"|"saving"|"saved"|"error"
 *   savedAt        Date | null
 *   disabled       bool
 */

import SaveIndicator from "./SaveIndicator.jsx";

const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif";

const countWords = (text) =>
  text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

const AnswerTextarea = ({
  value = "",
  onChange,
  rows = 6,
  placeholder = "Write your answer here…",
  counterMode = "chars",
  minWords = 0,
  saveState = "idle",
  savedAt = null,
  disabled = false,
}) => {
  const wordCount = countWords(value);
  const charCount = value.length;
  const isValid   = counterMode === "words"
    ? (minWords > 0 ? wordCount >= minWords : wordCount > 0)
    : charCount > 0;

  const borderColor = isValid ? MINT : "#E2EBF0";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <textarea
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        style={{
          width: "100%",
          background: disabled ? "#F1F5F9" : "#F8FAFC",
          border: `2px solid ${borderColor}`,
          borderRadius: 14,
          padding: "16px 18px",
          fontFamily: SERIF,
          fontSize: 15,
          color: "#0F172A",
          lineHeight: 1.75,
          resize: "vertical",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s, box-shadow 0.2s",
          cursor: disabled ? "not-allowed" : "text",
        }}
        onFocus={e => {
          if (!disabled) e.target.style.boxShadow = "0 0 0 3px rgba(10,95,110,0.08)";
        }}
        onBlur={e => { e.target.style.boxShadow = "none"; }}
      />

      {/* Counter + save indicator row */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "0 2px" }}>
        <SaveIndicator saveState={saveState} savedAt={savedAt} />
        <span style={{
          fontFamily: SERIF, fontSize: 11,
          color: isValid ? "#15803d" : "#94A3B8",
          fontWeight: isValid ? 700 : 400,
          transition: "color 0.2s",
        }}>
          {counterMode === "words"
            ? `${wordCount} word${wordCount !== 1 ? "s" : ""}`
            : `${charCount} char${charCount !== 1 ? "s" : ""}`}
        </span>
      </div>
    </div>
  );
};

export default AnswerTextarea;
