/**
 * SATMathTest.jsx — SAT Math section exam screen.
 *
 * Real (digital) SAT Math format:
 *   • 2 modules × 27 questions, 35 min each
 *   • Module 1: ~20 MCQ + 7 SPR (student-produced response / grid-in)
 *   • Module 2: adaptive difficulty, same breakdown
 *   • Topics: Algebra, Advanced Math, Problem-Solving & Data Analysis,
 *     Geometry & Trigonometry
 *   • Some questions have a figure / table described in contextText
 *   • MCQ: 4 options (A/B/C/D)
 *   • SPR: text input (accepts integers, decimals, fractions like 3/2)
 *
 * Backend contract: format = "SAT_MATH"
 *   type        = "MULTIPLE_CHOICE" | "NUMERIC_INPUT" (for SPR)
 *   contextText = optional figure/table description
 *   questionText = problem statement
 *
 * One question at a time with dot navigator.
 * Reuses: QuestionDotNav, TestTopBar, buildGroups.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate }     from "react-router-dom";
import { TestsApi }        from "../../api/index.js";
import LoadingScreen       from "../../components/common/LoadingScreen.jsx";
import TestTopBar          from "../../components/test/TestTopBar.jsx";
import QuestionDotNav      from "../../components/test/QuestionDotNav.jsx";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif";

const isSPR = (type) =>
  ["NUMERIC_INPUT", "SPR", "GRID_IN"].includes(type?.toUpperCase());

// ── Math topic badge ──────────────────────────────────────────────────────────

const TOPIC_MAP = {
  ALGEBRA:         { label: "Algebra",                  color: "#0c4a6e" },
  ADVANCED_MATH:   { label: "Advanced Math",             color: "#5b21b6" },
  DATA_ANALYSIS:   { label: "Problem-Solving & Data",    color: "#065f46" },
  GEOMETRY:        { label: "Geometry & Trigonometry",   color: "#92400e" },
};

const TopicBadge = ({ type }) => {
  const info = TOPIC_MAP[type?.toUpperCase()] ?? { label: "SAT Math", color: BRAND };
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "#e8f7f9", borderRadius: 999, padding: "4px 12px",
      border: "1px solid rgba(10,95,110,0.15)", marginBottom: 16,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%",
        background: info.color, flexShrink: 0 }} />
      <span style={{
        fontFamily: SERIF, fontSize: 10, fontWeight: 700,
        color: info.color, letterSpacing: "0.12em", textTransform: "uppercase",
      }}>
        {info.label}
      </span>
    </div>
  );
};

// ── Optional figure/context box ───────────────────────────────────────────────

const FigureBox = ({ text }) => (
  <div style={{
    background: "#F8FAFC",
    border: "1.5px solid #E2EBF0",
    borderRadius: 14, padding: "18px 22px",
    marginBottom: 20,
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: 13, lineHeight: 1.75,
    color: "#374151", whiteSpace: "pre-wrap",
  }}>
    <p style={{
      fontFamily: SERIF, fontSize: 10, fontWeight: 700,
      color: "#94A3B8", letterSpacing: "0.12em",
      textTransform: "uppercase", margin: "0 0 10px",
    }}>
      Reference figure / data
    </p>
    {text}
  </div>
);

// ── MCQ options (A–D) ─────────────────────────────────────────────────────────

const MCQOptions = ({ options, selected, onSelect }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {options.map(({ letter, text }) => {
      const isSelected = selected === letter;
      return (
        <button key={letter} onClick={() => onSelect(letter)}
          style={{
            display: "flex", alignItems: "flex-start", gap: 16,
            padding: "14px 18px", borderRadius: 14, textAlign: "left",
            border: `2px solid ${isSelected ? BRAND : "#EEF2F7"}`,
            background: isSelected ? "#e8f7f9" : "#FAFBFC",
            cursor: "pointer",
            boxShadow: isSelected ? "0 4px 18px rgba(10,95,110,0.10)" : "none",
            transition: "all 0.18s",
          }}
          onMouseEnter={e => {
            if (!isSelected) {
              e.currentTarget.style.borderColor = "#CBD5E1";
              e.currentTarget.style.background  = "#F1F5F9";
            }
          }}
          onMouseLeave={e => {
            if (!isSelected) {
              e.currentTarget.style.borderColor = "#EEF2F7";
              e.currentTarget.style.background  = "#FAFBFC";
            }
          }}>
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
          <span style={{
            fontFamily: SERIF, fontSize: 15, lineHeight: 1.6,
            color: isSelected ? BRAND : "#374151",
            fontWeight: isSelected ? 600 : 400,
            flex: 1, paddingTop: 5, transition: "color 0.18s",
          }}>
            {text}
          </span>
        </button>
      );
    })}
  </div>
);

// ── SPR (grid-in) input ───────────────────────────────────────────────────────

const SPRInput = ({ value, onChange }) => (
  <div>
    <p style={{
      fontFamily: SERIF, fontSize: 11, fontWeight: 700,
      color: "#94A3B8", letterSpacing: "0.1em",
      textTransform: "uppercase", marginBottom: 10,
    }}>
      Enter your answer
    </p>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="e.g. 7, 3/2, .5"
      style={{
        width: "100%", maxWidth: 240, height: 52,
        background: "#F8FAFC",
        border: `2px solid ${value ? BRAND : "#E2EBF0"}`,
        borderRadius: 14, padding: "0 18px",
        fontFamily: SERIF, fontSize: 20, fontWeight: 700,
        color: "#0F172A", outline: "none",
        boxSizing: "border-box", transition: "border-color 0.2s",
        letterSpacing: "0.05em",
      }}
      onFocus={e => e.target.style.borderColor = BRAND}
      onBlur={e => e.target.style.borderColor = value ? BRAND : "#E2EBF0"}
    />
    <p style={{ fontFamily: SERIF, fontSize: 11, color: "#94A3B8",
      marginTop: 8, lineHeight: 1.5 }}>
      Accepts integers, decimals, and fractions (e.g. 1/2).
      Do not enter % or $ symbols.
    </p>
  </div>
);

// ── Main screen ───────────────────────────────────────────────────────────────

const SATMathTest = ({ session }) => {
  const navigate  = useNavigate();
  const testId    = session.testId;

  const [questions,   setQuestions]   = useState([]);
  const [answers,     setAnswers]     = useState({});  // index → value
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

  const total   = questions.length;
  const current = questions[qIndex];
  const isLastQ = qIndex === total - 1;
  const isSPRQ  = isSPR(current?.type);

  const options = current
    ? ["A", "B", "C", "D"]
        .map(l => ({ letter: l, text: current[`option${l}`] }))
        .filter(o => o.text)
    : [];

  const handleSelect = useCallback((val) => {
    setAnswers(prev => ({ ...prev, [qIndex]: val }));
  }, [qIndex]);

  const saveAndAdvance = async () => {
    if (answers[qIndex] && current) {
      try {
        await TestsApi.submitAnswer(testId, current.quizId, answers[qIndex]);
      } catch (err) {
        setSubmitError(err.message ?? "Could not save answer.");
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    const ok = await saveAndAdvance();
    if (!ok) return;
    if (isLastQ) {
      await handleFinalSubmit();
    } else {
      setQIndex(i => i + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    setQIndex(i => i - 1);
    window.scrollTo(0, 0);
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      // Flush any remaining unsaved answers
      await Promise.allSettled(
        questions.map((q, i) =>
          answers[i] ? TestsApi.submitAnswer(testId, q.quizId, answers[i]) : null
        ).filter(Boolean)
      );
      navigate("/feedback", { state: { testId }, replace: true });
    } catch { setSubmitting(false); }
  };

  if (loading) return <LoadingScreen />;

  if (!current) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center" }}>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: "#64748B" }}>
        No questions available.
      </p>
    </div>
  );

  const selected = answers[qIndex] ?? "";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column",
      background: "#F8FAFC", overflow: "hidden" }}>
      <style>{`
        @keyframes mathFade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <TestTopBar
        paperName="SAT Math"
        groupLabel={`${qIndex + 1} of ${total}`}
        remainingSeconds={session.remainingSeconds}
        onLeave={() => navigate("/courses")}
      />

      {/* Progress bar */}
      <div style={{ height: 3, background: "#E2EBF0", flexShrink: 0 }}>
        <div style={{
          height: "100%", borderRadius: "0 999px 999px 0",
          background: `linear-gradient(90deg, ${BRAND}, #1c94a7)`,
          width: `${Math.round(((qIndex + 1) / total) * 100)}%`,
          transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>

      {/* Submit error */}
      {submitError && (
        <div style={{ background: "#fff0f0", borderBottom: "1px solid #fca5a5",
          padding: "10px 24px", display: "flex",
          alignItems: "center", justifyContent: "space-between" }}>
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

      <div style={{ flex: 1, overflowY: "auto", display: "flex",
        justifyContent: "center", padding: "0 16px" }}>
        <div style={{ width: "100%", maxWidth: 720, padding: "28px 0 80px" }}>

          {/* Dot navigator */}
          <div style={{ marginBottom: 24 }}>
            <QuestionDotNav
              total={total}
              current={qIndex}
              answers={answers}
              onClick={setQIndex}
            />
          </div>

          {/* Question card */}
          <div style={{
            background: "#fff", borderRadius: 24, padding: "36px 40px",
            border: "1px solid #E8F0F4",
            boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            animation: "mathFade 0.3s ease both",
          }}>
            {/* Topic badge */}
            <TopicBadge type={current.difficulty} />

            {/* SPR badge */}
            {isSPRQ && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "#fef3c7", borderRadius: 999, padding: "3px 10px",
                border: "1px solid #fcd34d", marginBottom: 12, marginLeft: 8,
              }}>
                <span style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 700,
                  color: "#92400e", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Grid-in
                </span>
              </div>
            )}

            {/* Optional figure / data */}
            {current.contextText && <FigureBox text={current.contextText} />}

            {/* Question */}
            <p style={{
              fontFamily: SERIF, fontSize: 18, lineHeight: 1.65,
              color: "#0F172A", fontWeight: 500, marginBottom: 28,
            }}>
              {current.questionText}
            </p>

            {/* Answer input */}
            {isSPRQ ? (
              <SPRInput value={selected} onChange={handleSelect} />
            ) : (
              <MCQOptions options={options} selected={selected} onSelect={handleSelect} />
            )}
          </div>

          {/* Navigation */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginTop: 20,
          }}>
            <button onClick={handlePrev} disabled={qIndex === 0}
              style={{
                padding: "13px 24px", borderRadius: 12,
                fontFamily: SERIF, fontSize: 14, fontWeight: 700,
                cursor: qIndex === 0 ? "not-allowed" : "pointer",
                background: "transparent",
                color: qIndex === 0 ? "#94A3B8" : BRAND,
                border: `2px solid ${qIndex === 0 ? "#E2EBF0" : BRAND}`,
                transition: "all 0.18s",
              }}>
              ← Previous
            </button>

            <button onClick={handleNext} disabled={submitting}
              style={{
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
              }}>
              {submitting ? "Submitting…" : isLastQ ? "Finish ›" : "Next →"}
            </button>
          </div>

          {!selected && (
            <p style={{ fontFamily: SERIF, fontSize: 12, color: "#94A3B8",
              textAlign: "center", marginTop: 10 }}>
              {isSPRQ ? "Enter your answer to continue" : "Select an answer to continue"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SATMathTest;
