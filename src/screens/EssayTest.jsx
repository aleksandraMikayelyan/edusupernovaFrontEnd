/**
 * EssayTest.jsx — Paper 3 (ESSAY) test screen.
 *
 * One essay at a time, linear flow.
 * Large textarea with live word count.
 * Autosave every 2s.
 * "Next essay" / "Submit test" navigation.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate }        from "react-router-dom";
import { ArrowRight, PaperPlaneTilt } from "@phosphor-icons/react";
import { TestsApi }           from "../api/index.js";
import LoadingScreen          from "../components/common/LoadingScreen.jsx";
import TestTopBar             from "../components/test/TestTopBar.jsx";
import AnswerTextarea         from "../components/test/AnswerTextarea.jsx";
import useAutosave            from "../hooks/useAutosave.js";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif";

// ── Single essay view ─────────────────────────────────────────────────────────

const EssayQuestion = ({ q, testId, answer, onChange }) => {
  const { saveState, savedAt } = useAutosave(testId, q.quizId, answer);

  return (
    <div style={{
      background: "#fff", borderRadius: 24, padding: "44px 48px",
      width: "100%", maxWidth: 820,
      border: "1px solid #E8F0F4",
      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      animation: "efadeIn 0.35s ease both",
    }}>
      {/* Type badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6,
        background: "#e8f7f9", borderRadius: 999, padding: "4px 12px",
        marginBottom: 20 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%",
          background: BRAND, flexShrink: 0 }} />
        <span style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 700,
          color: BRAND, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Essay
        </span>
      </div>

      {/* Question text */}
      <p style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.7,
        color: "#0F172A", fontWeight: 500, marginBottom: 6,
        letterSpacing: "-0.2px" }}>
        {q.questionText}
        {q.marks && (
          <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700,
            color: "#94A3B8", marginLeft: 10 }}>
            [{q.marks} marks]
          </span>
        )}
      </p>

      {/* Hint */}
      <p style={{ fontFamily: SERIF, fontSize: 12, color: "#94A3B8",
        marginBottom: 28, fontStyle: "italic" }}>
        Write a full essay response. Aim for at least 300–400 words.
      </p>

      <AnswerTextarea
        value={answer}
        onChange={onChange}
        rows={22}
        counterMode="words"
        minWords={50}
        saveState={saveState}
        savedAt={savedAt}
        placeholder="Begin your essay here…"
      />
    </div>
  );
};

// ── Nav button ────────────────────────────────────────────────────────────────

const NavBtn = ({ onClick, disabled, children }) => (
  <button onClick={onClick} disabled={disabled}
    style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "15px 44px", borderRadius: 14, border: "none",
      fontFamily: SERIF, fontSize: 15, fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      background: disabled ? "#E8EDF2" : MINT,
      color: disabled ? "#94A3B8" : DARK,
      boxShadow: disabled ? "none" : "0 8px 28px rgba(93,202,165,0.4)",
      transition: "all 0.18s",
    }}
    onMouseEnter={e => {
      if (!disabled) {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.background = "#3aab87";
        e.currentTarget.style.boxShadow = "0 12px 36px rgba(93,202,165,0.5)";
      }
    }}
    onMouseLeave={e => {
      if (!disabled) {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.background = MINT;
        e.currentTarget.style.boxShadow = "0 8px 28px rgba(93,202,165,0.4)";
      }
    }}>
    {children}
  </button>
);

// ── Main screen ───────────────────────────────────────────────────────────────

const EssayTest = ({ session }) => {
  const navigate = useNavigate();
  const testId   = session.testId;

  const [questions,   setQuestions]   = useState([]);
  const [essayIndex,  setEssayIndex]  = useState(0);
  const [answers,     setAnswers]     = useState({});
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);

  // Fetch all essay questions and pre-fill
  useEffect(() => {
    TestsApi.getQuestions(testId)
      .then(res => {
        // Sort by questionNumber for linear order
        const sorted = [...res.data].sort(
          (a, b) => (a.questionNumber ?? 0) - (b.questionNumber ?? 0)
        );
        setQuestions(sorted);
        const saved = {};
        res.data.forEach(q => { if (q.userResponse) saved[q.quizId] = q.userResponse; });
        setAnswers(saved);
      })
      .catch(err => console.error("Could not load questions:", err))
      .finally(() => setLoading(false));
  }, [testId]);

  const currentQ   = questions[essayIndex];
  const totalQ     = questions.length;
  const isLast     = essayIndex === totalQ - 1;
  const currentAns = answers[currentQ?.quizId] ?? "";

  const setAnswer = useCallback((quizId, value) => {
    setAnswers(prev => ({ ...prev, [quizId]: value }));
  }, []);

  const saveCurrentAnswer = useCallback(async () => {
    if (!currentQ || !currentAns.trim()) return;
    await TestsApi.submitAnswer(testId, currentQ.quizId, currentAns).catch(() => {});
  }, [currentQ, currentAns, testId]);

  const handleNext = async () => {
    await saveCurrentAnswer();
    setEssayIndex(i => i + 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await saveCurrentAnswer();
      navigate("/feedback", { state: { testId }, replace: true });
    } catch (err) {
      console.error("Submit failed:", err);
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen />;

  if (!currentQ) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#F7F4EF" }}>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: "#64748B" }}>
        No essay questions available for this paper.
      </p>
    </div>
  );

  const essayLabel = `Essay ${essayIndex + 1} of ${totalQ}`;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column",
      background: "#F8FAFC", overflow: "hidden" }}>
      <style>{`
        @keyframes efadeIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <TestTopBar
        paperName={session.paperName}
        groupLabel={essayLabel}
        remainingSeconds={session.remainingSeconds}
        onLeave={() => navigate("/courses")}
      />

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column",
          alignItems: "center", padding: "40px 24px 60px",
          minHeight: "100%" }}>

          <EssayQuestion
            key={currentQ.quizId}
            q={currentQ}
            testId={testId}
            answer={currentAns}
            onChange={val => setAnswer(currentQ.quizId, val)}
          />

          {/* Nav */}
          <div style={{ marginTop: 28 }}>
            {isLast ? (
              <NavBtn onClick={handleSubmit} disabled={submitting}>
                <PaperPlaneTilt size={16} weight="bold" />
                {submitting ? "Submitting…" : "Submit test"}
              </NavBtn>
            ) : (
              <NavBtn onClick={handleNext} disabled={!currentAns.trim()}>
                Next essay <ArrowRight size={16} weight="bold" />
              </NavBtn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EssayTest;
