/**
 * MultipleChoiceAnswer.jsx — MC answer + AI feedback display (WEB)
 *
 * Reads from FeedBackDTO.QuestionFeedbackDTO:
 *   userResponse  — letter the student chose (A/B/C/D)
 *   correctAnswer — correct letter from DB
 *   isCorrect     — Boolean from backend evaluation
 *   explanation   — static explanation from DB
 *   aiFeedback    — Groq-generated feedback (generated for every MCQ answer)
 */

const BRAND = "#0a5f6e";
const SERIF = "Newsreader, Georgia, serif";

const MultipleChoiceAnswer = ({ item }) => {
  const userResponse  = item.userResponse  ?? "";
  const correctAnswer = item.correctAnswer ?? "";
  const isCorrect     = item.isCorrect     ?? false;
  const explanation   = item.explanation   ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Answer comparison row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {/* Your answer */}
        <div style={{
          flex: 1, minWidth: 140,
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", borderRadius: 12,
          background: isCorrect ? "#f0fdf4" : "#fff0f0",
          border: `1.5px solid ${isCorrect ? "#86efac" : "#fca5a5"}`,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: isCorrect ? "#15803d" : "#b02020",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: "#fff" }}>
              {userResponse || "–"}
            </span>
          </div>
          <div>
            <p style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 700,
              color: isCorrect ? "#15803d" : "#b02020",
              textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
              Your answer
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 13,
              color: isCorrect ? "#15803d" : "#b02020", margin: 0, marginTop: 1 }}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </p>
          </div>
        </div>

        {/* Correct answer — only if wrong */}
        {!isCorrect && (
          <div style={{
            flex: 1, minWidth: 140,
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 16px", borderRadius: 12,
            background: "#f0fdf4", border: "1.5px solid #86efac",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: "#15803d",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: "#fff" }}>
                {correctAnswer || "–"}
              </span>
            </div>
            <div>
              <p style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 700,
                color: "#15803d", textTransform: "uppercase",
                letterSpacing: "0.1em", margin: 0 }}>
                Correct answer
              </p>
              <p style={{ fontFamily: SERIF, fontSize: 13, color: "#15803d",
                margin: 0, marginTop: 1 }}>
                Answer {correctAnswer}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* DB explanation — no AI needed for MCQ, correct answer is in DB */}
      {explanation && (
        <div style={{
          background: "#F8FAFC", borderRadius: 14, padding: "14px 18px",
          border: "1px solid #E2EBF0",
        }}>
          <p style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 700,
            color: "#94A3B8", textTransform: "uppercase",
            letterSpacing: "0.12em", marginBottom: 8 }}>
            Explanation
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 14, color: "#374151",
            lineHeight: 1.7, margin: 0 }}>
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceAnswer;
