/**
 * SATReadingTest.jsx — SAT Reading & Writing section exam screen.
 *
 * Real (digital) SAT Reading & Writing format:
 *   • 2 modules × 27 questions, 32 min each
 *   • Every question has its OWN short passage (1–4 sentences or 1–2 paragraphs)
 *   • Passage is shown INLINE above the question — no split screen
 *   • Question types: Vocabulary in Context, Text Structure/Purpose,
 *     Cross-Text Connections, Command of Evidence, Rhetoric, Standard English
 *   • All 4-option MCQ (A/B/C/D)
 *   • One question at a time (the real SAT is digital, one screen per question)
 *
 * Backend data contract:
 *   format      = "SAT_READING"
 *   contextText = short passage for that question (each question has its own)
 *   questionText = question prompt
 *   optionA/B/C/D = choices
 *
 * The test loads all questions then presents them one at a time.
 * Answers are submitted question by question as user advances.
 *
 * Uses shared: MCQQuestionCard, TestTopBar.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate }   from "react-router-dom";
import { TestsApi }      from "../../api/index.js";
import LoadingScreen     from "../../components/common/LoadingScreen.jsx";
import TestTopBar        from "../../components/test/TestTopBar.jsx";
import { buildGroups }   from "../../utils/buildGroups.js";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const CREAM = "#F7F4EF";
const SERIF = "Newsreader, Georgia, serif";

// ── Inline passage card ───────────────────────────────────────────────────────

const PassageCard = ({ text, questionNum, total }) => (
  <div style={{
    background: CREAM,
    border: "1px solid #E2EBF0",
    borderRadius: 18, padding: "24px 28px",
    marginBottom: 20,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <span style={{
        fontFamily: SERIF, fontSize: 10, fontWeight: 700,
        color: BRAND, letterSpacing: "0.14em", textTransform: "uppercase",
      }}>
        SAT Reading &amp; Writing — Question {questionNum} of {total}
      </span>
    </div>
    <div style={{
      fontFamily: "'Newsreader', Georgia, serif",
      fontSize: 15, lineHeight: 1.85,
      color: "#1E293B",
      borderLeft: `3px solid ${BRAND}`,
      paddingLeft: 16,
    }}>
      {text}
    </div>
  </div>
);

// ── Question type label ───────────────────────────────────────────────────────

const TypeBadge = ({ type }) => {
  const labels = {
    VOCABULARY:     "Vocabulary in Context",
    TEXT_STRUCTURE: "Text Structure & Purpose",
    COMMAND_OF_EVIDENCE: "Command of Evidence",
    RHETORIC:       "Rhetoric",
    CROSS_TEXT:     "Cross-Text Connections",
    STANDARD_ENGLISH: "Standard English Conventions",
  };
  const label = labels[type?.toUpperCase()] ?? "Reading & Writing";

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "#e8f7f9", borderRadius: 999, padding: "4px 12px",
      border: "1px solid rgba(10,95,110,0.15)", marginBottom: 16,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%",
        background: BRAND, flexShrink: 0 }} />
      <span style={{
        fontFamily: SERIF, fontSize: 10, fontWeight: 700,
        color: BRAND, letterSpacing: "0.12em", textTransform: "uppercase",
      }}>
        {label}
      </span>
    </div>
  );
};

// ── MCQ options (4 options, SAT layout) ───────────────────────────────────────

const SATOptions = ({ options, selected, onSelect, submitted }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {options.map(({ letter, text }) => {
      const isSelected = selected === letter;
      return (
        <button
          key={letter}
          onClick={() => !submitted && onSelect(letter)}
          style={{
            display: "flex", alignItems: "flex-start", gap: 16,
            padding: "14px 18px", borderRadius: 14, textAlign: "left",
            border: `2px solid ${isSelected ? BRAND : "#EEF2F7"}`,
            background: isSelected ? "#e8f7f9" : "#FAFBFC",
            cursor: submitted ? "default" : "pointer",
            boxShadow: isSelected ? "0 4px 18px rgba(10,95,110,0.10)" : "none",
            transition: "all 0.18s",
          }}
          onMouseEnter={e => {
            if (!isSelected && !submitted) {
              e.currentTarget.style.borderColor = "#CBD5E1";
              e.currentTarget.style.background  = "#F1F5F9";
            }
          }}
          onMouseLeave={e => {
            if (!isSelected && !submitted) {
              e.currentTarget.style.borderColor = "#EEF2F7";
              e.currentTarget.style.background  = "#FAFBFC";
            }
          }}
        >
          {/* Letter circle */}
          <div style={{
            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
            background: isSelected ? BRAND : "#E8EDF2",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.18s",
          }}>
            <span style={{
              fontFamily: SERIF, fontSize: 13, fontWeight: 700,
              color: isSelected ? "#fff" : "#64748B",
            }}>
              {letter}
            </span>
          </div>

          {/* Option text */}
          <span style={{
            fontFamily: SERIF, fontSize: 15, lineHeight: 1.6,
            color: isSelected ? BRAND : "#374151",
            fontWeight: isSelected ? 600 : 400,
            flex: 1, paddingTop: 5,
            transition: "color 0.18s",
          }}>
            {text}
          </span>
        </button>
      );
    })}
  </div>
);

// ── Question dot navigator ────────────────────────────────────────────────────

const QuestionDots = ({ total, current, answers, onClick }) => (
  <div style={{
    display: "flex", flexWrap: "wrap", gap: 6,
    maxWidth: 520,
  }}>
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
            border: isCurrent ? `2px solid ${BRAND}` : "2px solid transparent",
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

// ── Main screen ───────────────────────────────────────────────────────────────

const SATReadingTest = ({ session }) => {
  const navigate = useNavigate();
  const testId   = session.testId;

  // Flat list of all questions in order
  const [questions,   setQuestions]   = useState([]);
  // Map: questionIndex → selected letter
  const [answers,     setAnswers]     = useState({});
  const [qIndex,      setQIndex]      = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    TestsApi.getQuestions(testId)
      .then(res => {
        const sorted = [...res.data].sort(
          (a, b) => (a.questionNumber ?? 0) - (b.questionNumber ?? 0)
        );
        setQuestions(sorted);
        const saved = {};
        sorted.forEach((q, i) => { if (q.userResponse) saved[i] = q.userResponse; });
        setAnswers(saved);
      })
      .catch(err => console.error("Could not load questions:", err))
      .finally(() => setLoading(false));
  }, [testId]);

  const total      = questions.length;
  const current    = questions[qIndex];
  const isLastQ    = qIndex === total - 1;
  const hasPassage = !!current?.contextText;

  const handleSelect = useCallback((letter) => {
    setAnswers(prev => ({ ...prev, [qIndex]: letter }));
  }, [qIndex]);

  const handleNext = async () => {
    // Save current answer
    if (answers[qIndex] && current) {
      try {
        await TestsApi.submitAnswer(testId, current.quizId, answers[qIndex]);
      } catch (err) {
        setSubmitError(err.message ?? "Could not save answer. Please try again.");
        return;
      }
    }
    if (isLastQ) {
      handleSubmit();
    } else {
      setQIndex(i => i + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    setQIndex(i => i - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Submit any remaining unanswered (or re-submit all for safety)
      const pending = questions.filter((q, i) => answers[i]);
      await Promise.allSettled(
        pending.map((q, _) => {
          const idx = questions.indexOf(q);
          return TestsApi.submitAnswer(testId, q.quizId, answers[idx]);
        })
      );
      navigate("/feedback", { state: { testId }, replace: true });
    } catch { setSubmitting(false); }
  };

  const getOptions = (q) =>
    ["A", "B", "C", "D"]
      .map(l => ({ letter: l, text: q?.[`option${l}`] }))
      .filter(o => o.text);

  if (loading) return <LoadingScreen />;

  if (!current) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#F7F4EF" }}>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: "#64748B" }}>
        No questions available for this section.
      </p>
    </div>
  );

  const options = getOptions(current);
  const selected = answers[qIndex] ?? null;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column",
      background: "#F8FAFC", overflow: "hidden" }}>
      <style>{`
        @keyframes satFade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <TestTopBar
        paperName="SAT Reading & Writing"
        groupLabel={`${qIndex + 1} of ${total}`}
        remainingSeconds={session.remainingSeconds}
        onLeave={() => navigate("/courses")}
      />

      {/* Submit error banner */}
      {submitError && (
        <div style={{
          background: "#fff0f0", borderBottom: "1px solid #fca5a5",
          padding: "10px 24px", display: "flex", alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ fontFamily: SERIF, fontSize: 13, color: "#b02020" }}>
            {submitError}
          </span>
          <button onClick={() => setSubmitError(null)}
            style={{ fontFamily: SERIF, fontSize: 18, color: "#b02020",
              background: "none", border: "none", cursor: "pointer" }}>
            ×
          </button>
        </div>
      )}

      {/* Teal progress bar */}
      <div style={{ height: 3, background: "#E2EBF0", flexShrink: 0 }}>
        <div style={{
          height: "100%", borderRadius: "0 999px 999px 0",
          background: `linear-gradient(90deg, ${BRAND}, #1c94a7)`,
          width: `${Math.round(((qIndex + 1) / total) * 100)}%`,
          transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex",
        justifyContent: "center", padding: "0 16px" }}>
        <div style={{
          width: "100%", maxWidth: 740,
          padding: "32px 0 80px",
        }}>

          {/* Question dot navigator */}
          <div style={{ marginBottom: 24 }}>
            <QuestionDots
              total={total}
              current={qIndex}
              answers={answers}
              onClick={setQIndex}
            />
          </div>

          {/* Question card */}
          <div style={{
            background: "#fff",
            borderRadius: 24, padding: "36px 40px",
            border: "1px solid #E8F0F4",
            boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            animation: "satFade 0.3s ease both",
          }}>

            {/* Inline passage */}
            {hasPassage && (
              <PassageCard
                text={current.contextText}
                questionNum={qIndex + 1}
                total={total}
              />
            )}

            {/* Question type badge */}
            <TypeBadge type={current.type} />

            {/* Question text */}
            <p style={{
              fontFamily: SERIF, fontSize: 18, lineHeight: 1.65,
              color: "#0F172A", fontWeight: 500,
              marginBottom: 28, letterSpacing: "-0.2px",
            }}>
              {current.questionText}
              {current.marks != null && (
                <span style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
                  color: "#94A3B8", marginLeft: 8 }}>
                  [{current.marks} mark{current.marks !== 1 ? "s" : ""}]
                </span>
              )}
            </p>

            {/* Options */}
            <SATOptions
              options={options}
              selected={selected}
              onSelect={handleSelect}
              submitted={submitting}
            />
          </div>

          {/* Navigation */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginTop: 24,
          }}>
            <button
              onClick={handlePrev}
              disabled={qIndex === 0}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "13px 24px", borderRadius: 12,
                fontFamily: SERIF, fontSize: 14, fontWeight: 700,
                cursor: qIndex === 0 ? "not-allowed" : "pointer",
                background: "transparent",
                color: qIndex === 0 ? "#94A3B8" : BRAND,
                border: `2px solid ${qIndex === 0 ? "#E2EBF0" : BRAND}`,
                transition: "all 0.18s",
              }}
            >
              ← Previous
            </button>

            <button
              onClick={handleNext}
              disabled={submitting}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "13px 32px", borderRadius: 12, border: "none",
                fontFamily: SERIF, fontSize: 14, fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                background: selected ? MINT : "#E8EDF2",
                color: selected ? DARK : "#94A3B8",
                boxShadow: selected ? "0 8px 24px rgba(93,202,165,0.35)" : "none",
                transition: "all 0.18s",
              }}
              onMouseEnter={e => {
                if (selected && !submitting) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.background = "#3aab87";
                }
              }}
              onMouseLeave={e => {
                if (selected && !submitting) {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.background = MINT;
                }
              }}
            >
              {submitting
                ? "Submitting…"
                : isLastQ ? "Finish ›" : "Next →"
              }
            </button>
          </div>

          {/* Unanswered hint */}
          {!selected && (
            <p style={{
              fontFamily: SERIF, fontSize: 12, color: "#94A3B8",
              textAlign: "center", marginTop: 10,
            }}>
              Select an answer to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SATReadingTest;
