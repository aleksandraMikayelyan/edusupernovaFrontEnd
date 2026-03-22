/**
 * QuestionCard.jsx — Per-question result card (WEB) — field names fixed + redesigned
 *
 * Backend DTO fields used:
 *   questionText  — the question text  (was: item.text)
 *   type          — MULTIPLE_CHOICE or OPEN_ENDED
 *   punctuation   — score for this question
 *
 * SOLID: SRP — renders one question's result. Child components handle answer display.
 */

import { useEffect, useState } from "react";
import { MULTIPLE_CHOICE_LIMIT } from "../../constants/api.js";
import MultipleChoiceAnswer from "./MultipleChoiceAnswer.jsx";
import OpenEndedAnswer      from "./OpenEndedAnswer.jsx";

const BRAND = "#0a5f6e"; const SERIF = "Newsreader, Georgia, serif";

const isOpenEnded = (item, index) =>
  item.type === "OPEN_ENDED" ||
  (item.id != null ? item.id > MULTIPLE_CHOICE_LIMIT : index >= MULTIPLE_CHOICE_LIMIT);

const QuestionCard = ({ item, index }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 70);
    return () => clearTimeout(t);
  }, [index]);

  const openEnded     = isOpenEnded(item, index);
  const questionNum   = item.id ?? index + 1;
  const questionText  = item.questionText ?? item.text ?? "";
  const userResponse  = item.userResponse ?? item.userAnswer ?? "";
  const correctAnswer = item.correctResponse ?? item.correctAnswer ?? "";
  const isCorrect     = !openEnded && userResponse === correctAnswer;

  const borderColor = openEnded
    ? "#E2EBF0"
    : isCorrect ? "#86efac" : "#e74c3c";

  return (
    <div style={{
      background:"#fff", borderRadius:20, padding:"28px 32px",
      marginBottom:16, border:`1.5px solid ${borderColor}`,
      boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
      transition:"opacity 0.4s ease",
      opacity: visible ? 1 : 0,
    }}>
      {/* Card header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <div style={{ background:"#e8f7f9", borderRadius:10, padding:"5px 12px" }}>
          <span style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
            color:BRAND, letterSpacing:"0.12em", textTransform:"uppercase" }}>
            Q{questionNum}
          </span>
        </div>
        <span style={{ fontFamily:SERIF, fontSize:13, fontWeight:600,
          color:"#64748B", letterSpacing:"0.02em" }}>
          {openEnded ? "Open-ended" : "Multiple choice"}
        </span>
        {item.punctuation != null && (
          <span style={{ marginLeft:"auto", fontFamily:SERIF, fontSize:13,
            fontWeight:700, color: isCorrect ? "#15803d" : openEnded ? BRAND : "#b02020" }}>
            {item.punctuation} pts
          </span>
        )}
      </div>

      {/* Question text */}
      <p style={{ fontFamily:SERIF, fontSize:17, lineHeight:1.65,
        color:"#0F172A", marginBottom:20 }}>
        {questionText}
      </p>

      {/* Answer */}
      {openEnded
        ? <OpenEndedAnswer item={item} />
        : <MultipleChoiceAnswer item={item} />
      }
    </div>
  );
};

export default QuestionCard;