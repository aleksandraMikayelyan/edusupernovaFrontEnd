/**
 * MCQQuestionCard — single MCQ question with A/B/C/D option buttons.
 *
 * Props:
 *   q          TestQuestionDTO
 *   selected   letter | null
 *   onSelect   (quizId: string, letter: string) => void
 *   locked     bool   — grays out + blocks interaction (Listening: before audio plays)
 *   showLabel  bool   — shows a sub-question label derived from groupOrderIndex
 *   extraText  string — optional text shown below question (e.g. cleaned prompt)
 */

import { getOptions } from "../../utils/buildGroups.js";

const BRAND = "#0a5f6e";
const SERIF = "Newsreader, Georgia, serif";

const MCQQuestionCard = ({
  q,
  selected,
  onSelect,
  locked    = false,
  showLabel = false,
}) => {
  const options  = getOptions(q);
  const subLabel = showLabel && q.groupOrderIndex
    ? String.fromCharCode(96 + q.groupOrderIndex)   // 1 → "a", 2 → "b" …
    : null;

  return (
    <div style={{
      paddingBottom: 28,
      borderBottom: "1px solid #F1F5F9",
      display: "flex", flexDirection: "column", gap: 14,
      opacity:        locked ? 0.35 : 1,
      transition:     "opacity 0.4s",
      pointerEvents:  locked ? "none" : "auto",
    }}>

      {/* Question text row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {subLabel && (
          <span style={{
            fontFamily: SERIF, fontSize: 13, fontWeight: 700,
            color: BRAND, background: "#e8f7f9",
            border: "1px solid rgba(10,95,110,0.15)",
            borderRadius: 8, padding: "2px 8px",
            flexShrink: 0, marginTop: 2,
          }}>
            ({subLabel})
          </span>
        )}
        <p style={{
          fontFamily: SERIF, fontSize: 15, lineHeight: 1.65,
          color: "#0F172A", margin: 0, flex: 1,
        }}>
          {q.questionText}
          {q.marks != null && (
            <span style={{
              fontFamily: SERIF, fontSize: 12, fontWeight: 700,
              color: "#94A3B8", marginLeft: 8,
            }}>
              [{q.marks} mark{q.marks !== 1 ? "s" : ""}]
            </span>
          )}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map(({ letter, text }) => {
          const isSelected = selected === letter;
          return (
            <button
              key={letter}
              onClick={() => !locked && onSelect(q.quizId, letter)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 16px", borderRadius: 14, textAlign: "left",
                border:     `2px solid ${isSelected ? BRAND : "#EEF2F7"}`,
                background: isSelected ? "#e8f7f9" : "#FAFBFC",
                cursor:     locked ? "default" : "pointer",
                boxShadow:  isSelected ? "0 4px 16px rgba(10,95,110,0.10)" : "none",
                transition: "all 0.18s",
              }}
              onMouseEnter={e => {
                if (!isSelected && !locked) {
                  e.currentTarget.style.borderColor = "#CBD5E1";
                  e.currentTarget.style.background  = "#F1F5F9";
                }
              }}
              onMouseLeave={e => {
                if (!isSelected && !locked) {
                  e.currentTarget.style.borderColor = "#EEF2F7";
                  e.currentTarget.style.background  = "#FAFBFC";
                }
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: isSelected ? BRAND : "#E8EDF2",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.18s",
              }}>
                <span style={{
                  fontFamily: SERIF, fontSize: 12, fontWeight: 700,
                  color: isSelected ? "#fff" : "#64748B",
                }}>
                  {letter}
                </span>
              </div>
              <span style={{
                fontFamily: SERIF, fontSize: 14, lineHeight: 1.5, flex: 1,
                color:      isSelected ? BRAND : "#374151",
                fontWeight: isSelected ? 600 : 400,
                transition: "color 0.18s",
              }}>
                {text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MCQQuestionCard;
