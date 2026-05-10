/**
 * QuestionCard.jsx — Per-question result card (WEB)
 *
 * Reads from FeedBackDTO.QuestionFeedbackDTO:
 *   questionNumber, quizId, questionText, type,
 *   userResponse, correctAnswer, isCorrect,
 *   explanation, aiFeedback, aiScore
 */

import MultipleChoiceAnswer from "./MultipleChoiceAnswer.jsx";
import OpenEndedAnswer      from "./OpenEndedAnswer.jsx";

const BRAND = "#0a5f6e";
const SERIF = "Newsreader, Georgia, serif";

const isOpenEndedType = (type) =>
  ["ESSAY", "OPEN_ENDED", "SHORT_ANSWER"].includes(type?.toUpperCase());

const QuestionCard = ({ item, index }) => {
  const openEnded   = isOpenEndedType(item.questionType ?? item.type);
  const questionNum = item.questionNumber ?? index + 1;
  const isCorrect   = item.isCorrect ?? false;
  const aiScore     = item.aiScore;

  const borderColor = openEnded
    ? "#E2EBF0"
    : isCorrect ? "#86efac" : "#fca5a5";

  const headerBg = openEnded
    ? "#F8FAFC"
    : isCorrect ? "#f0fdf4" : "#fff0f0";

  const statusLabel = openEnded
    ? null
    : isCorrect ? "Correct" : "Incorrect";

  const statusColor = isCorrect ? "#15803d" : "#b02020";

  return (
    <div style={{
      background: "#fff",
      borderRadius: 18,
      marginBottom: 14,
      border: `1.5px solid ${borderColor}`,
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      overflow: "hidden",
    }}>
      {/* Card header bar */}
      <div style={{
        background: headerBg,
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${borderColor}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            fontFamily: SERIF, fontSize: 11, fontWeight: 700,
            color: BRAND, background: "#e8f7f9",
            border: "1px solid rgba(10,95,110,0.15)",
            borderRadius: 8, padding: "3px 10px",
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            Q{questionNum}
          </span>
          <span style={{
            fontFamily: SERIF, fontSize: 12,
            color: "#94A3B8", letterSpacing: "0.04em",
          }}>
            {openEnded ? "Open-ended" : "Multiple choice"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {statusLabel && (
            <span style={{
              fontFamily: SERIF, fontSize: 12, fontWeight: 700,
              color: statusColor,
              background: isCorrect ? "#dcfce7" : "#fee2e2",
              borderRadius: 8, padding: "3px 10px",
            }}>
              {statusLabel}
            </span>
          )}
        </div>
      </div>

      {/* Question text */}
      <div style={{ padding: "18px 24px 4px" }}>
        <p style={{
          fontFamily: SERIF, fontSize: 16, lineHeight: 1.65,
          color: "#0F172A", margin: 0,
        }}>
          {item.questionText}
        </p>
      </div>

      {/* Answer breakdown */}
      <div style={{ padding: "12px 24px 20px" }}>
        {openEnded
          ? <OpenEndedAnswer item={item} />
          : <MultipleChoiceAnswer item={item} />
        }
      </div>
    </div>
  );
};

export default QuestionCard;
