/**
 * MultiEssayTest.jsx — Paper 2 Writing (MULTI_ESSAY format)
 *
 * Cambridge AS Level English Language Paper 2:
 *   Two independent essay/writing tasks, no passage or reference text.
 *   Both questions visible simultaneously on one page.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate }        from "react-router-dom";
import { PaperPlaneTilt }    from "@phosphor-icons/react";
import { TestsApi }           from "../../api/index.js";
import LoadingScreen          from "../../components/common/LoadingScreen.jsx";
import TestTopBar             from "../../components/test/TestTopBar.jsx";
import AnswerTextarea         from "../../components/test/AnswerTextarea.jsx";
import useAutosave            from "../../hooks/useAutosave.js";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif";

// ── Single essay card ─────────────────────────────────────────────────────────

const EssayCard = ({ q, label, testId, answer, onChange }) => {
  const { saveState, savedAt } = useAutosave(testId, q.quizId, answer);

  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      border: "1px solid #E8F0F4",
      padding: "32px 36px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    }}>
      {/* Label + prompt */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
        <span style={{
          fontFamily: SERIF, fontSize: 13, fontWeight: 700,
          color: BRAND, background: "#e8f7f9",
          border: "1px solid rgba(10,95,110,0.15)",
          borderRadius: 8, padding: "4px 12px", flexShrink: 0, marginTop: 2,
        }}>
          {label}
        </span>
        <p style={{
          fontFamily: SERIF, fontSize: 16, lineHeight: 1.7,
          color: "#0F172A", margin: 0, flex: 1,
        }}>
          {q.questionText}
          {q.marks && (
            <span style={{
              fontFamily: SERIF, fontSize: 13, fontWeight: 700,
              color: "#94A3B8", marginLeft: 10,
            }}>
              [{q.marks} marks]
            </span>
          )}
        </p>
      </div>

      <AnswerTextarea
        value={answer}
        onChange={onChange}
        rows={16}
        counterMode="words"
        minWords={50}
        saveState={saveState}
        savedAt={savedAt}
        placeholder="Write your response here…"
      />
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const MultiEssayTest = ({ session }) => {
  const navigate = useNavigate();
  const testId   = session.testId;

  const [questions,   setQuestions]   = useState([]);
  const [answers,     setAnswers]     = useState({});
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);

  useEffect(() => {
    let cancelled = false;
    TestsApi.getQuestions(testId)
      .then(res => {
        if (cancelled) return;
        const sorted = [...res.data].sort(
          (a, b) => (a.questionNumber ?? 0) - (b.questionNumber ?? 0)
        );
        setQuestions(sorted);
        const saved = {};
        res.data.forEach(q => { if (q.userResponse) saved[q.quizId] = q.userResponse; });
        setAnswers(saved);
      })
      .catch(err => { if (!cancelled) console.error("Could not load questions:", err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [testId]);

  const setAnswer = useCallback((quizId, value) => {
    setAnswers(prev => ({ ...prev, [quizId]: value }));
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await Promise.allSettled(
        questions.map(q =>
          TestsApi.submitAnswer(testId, q.quizId, answers[q.quizId] ?? "")
        )
      );
      navigate("/feedback", { state: { testId }, replace: true });
    } catch (err) {
      console.error("Submit failed:", err);
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen />;

  if (!questions.length) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#F7F4EF" }}>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: "#64748B" }}>
        No questions available for this paper.
      </p>
    </div>
  );

  const answeredCount = questions.filter(q => answers[q.quizId]?.trim()).length;

  // Cambridge Paper 2 label mapping by groupOrderIndex: 1→Q1a, 2→Q1b, 3→Q2
  const getLabel = (q, i) => {
    if (q.groupOrderIndex === 1) return "Q1a";
    if (q.groupOrderIndex === 2) return "Q1b";
    if (q.groupOrderIndex === 3) return "Q2";
    return `Q${i + 1}`;
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column",
      background: "#F7F4EF" }}>
      <style>{`@keyframes meFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>

      <TestTopBar
        paperName={session.paperName}
        groupLabel={`${questions.length} Essay${questions.length !== 1 ? "s" : ""}`}
        remainingSeconds={session.remainingSeconds}
        onLeave={() => navigate("/courses")}
      />

      <main style={{
        flex: 1, maxWidth: 860, width: "100%",
        margin: "0 auto", padding: "40px 24px 80px",
        display: "flex", flexDirection: "column", gap: 28,
        boxSizing: "border-box",
      }}>
        {/* Progress hint */}
        <p style={{
          fontFamily: SERIF, fontSize: 11, fontWeight: 700,
          color: "#94A3B8", letterSpacing: "0.12em",
          textTransform: "uppercase", margin: 0,
        }}>
          {answeredCount} of {questions.length} essay{questions.length !== 1 ? "s" : ""} started
        </p>

        {questions.map((q, i) => (
          <div key={q.quizId} style={{ animation: `meFade 0.35s ease ${i * 80}ms both` }}>
            <EssayCard
              q={q}
              label={getLabel(q, i)}
              testId={testId}
              answer={answers[q.quizId] ?? ""}
              onChange={val => setAnswer(q.quizId, val)}
            />
          </div>
        ))}

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "14px 40px", borderRadius: 14, border: "none",
              fontFamily: SERIF, fontSize: 15, fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
              background: submitting ? "#E8EDF2" : MINT,
              color: submitting ? "#94A3B8" : DARK,
              boxShadow: submitting ? "none" : "0 8px 28px rgba(93,202,165,0.4)",
              transition: "all 0.18s",
            }}
          >
            <PaperPlaneTilt size={16} weight="bold" />
            {submitting ? "Submitting…" : "Submit test"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default MultiEssayTest;
