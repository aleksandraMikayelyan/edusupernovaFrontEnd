/**
 * QuestionDotNav — clickable dot grid showing answered/current/unanswered status.
 *
 * Props:
 *   total     number   — total question count
 *   current   number   — 0-based index of active question
 *   answers   object   — map of index → truthy value (answered)
 *   onClick   fn(index) — jump to that question
 */

const BRAND = "#0a5f6e";
const SERIF = "Newsreader, Georgia, serif";

const QuestionDotNav = ({ total, current, answers, onClick }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
    {Array.from({ length: total }).map((_, i) => {
      const isCurrent  = i === current;
      const isAnswered = !!answers[i];
      return (
        <button
          key={i}
          onClick={() => onClick(i)}
          title={`Question ${i + 1}`}
          style={{
            width: 30, height: 30, borderRadius: 8,
            border: `2px solid ${isCurrent ? BRAND : "transparent"}`,
            background: isCurrent
              ? BRAND
              : isAnswered ? "#e8f7f9" : "#F1F5F9",
            color: isCurrent ? "#fff" : isAnswered ? BRAND : "#94A3B8",
            fontFamily: SERIF, fontSize: 11, fontWeight: 700,
            cursor: "pointer", transition: "all 0.18s",
          }}
        >
          {i + 1}
        </button>
      );
    })}
  </div>
);

export default QuestionDotNav;
