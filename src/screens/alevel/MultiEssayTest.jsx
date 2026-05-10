/**
 * MultiEssayTest.jsx — Generic "Multi-Section Essay" test screen.
 *
 * Used for:
 *   • English Language A-Level Paper 2
 *   • ACT English section
 *   • Any MULTI_ESSAY-format paper
 *
 * Two-phase flow:
 *
 *   Phase 1 — Split-screen
 *     LEFT  — Shared reference/passage text (from Q1's contextText or groupContextText).
 *     RIGHT — Two essay inputs stacked (Q1 and Q2), both editable simultaneously.
 *     "Continue to Section 3 →" advances to Phase 2.
 *
 *   Phase 2 — Full-screen Q3
 *     A single essay prompt randomly selected from the Q3 pool
 *     (all questions with questionNumber ≥ 3).
 *     "Submit test" ends the session.
 *
 * Selection rule:
 *   Questions sorted by questionNumber.
 *   Q1 = sorted[0], Q2 = sorted[1], Q3 pool = sorted[2..N].
 *   One prompt is chosen at random from the pool on component mount.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate }        from "react-router-dom";
import { ArrowRight, PaperPlaneTilt } from "@phosphor-icons/react";
import { TestsApi }           from "../../api/index.js";
import LoadingScreen          from "../../components/common/LoadingScreen.jsx";
import TestTopBar             from "../../components/test/TestTopBar.jsx";
import ContextPanel           from "../../components/test/ContextPanel.jsx";
import AnswerTextarea         from "../../components/test/AnswerTextarea.jsx";
import useAutosave            from "../../hooks/useAutosave.js";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif";

// ── Essay input card ──────────────────────────────────────────────────────────

const EssayInput = ({ label, q, testId, answer, onChange, rows = 12 }) => {
  const { saveState, savedAt } = useAutosave(testId, q.quizId, answer);

  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 12,
      paddingBottom: 24, borderBottom: "1px solid #F1F5F9",
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{
          fontFamily: SERIF, fontSize: 12, fontWeight: 700,
          color: BRAND, background: "#e8f7f9",
          border: "1px solid rgba(10,95,110,0.15)",
          borderRadius: 8, padding: "3px 10px", flexShrink: 0,
        }}>
          {label}
        </span>
        <p style={{
          fontFamily: SERIF, fontSize: 15, lineHeight: 1.65,
          color: "#0F172A", margin: 0, flex: 1,
        }}>
          {q.questionText}
          {q.marks && (
            <span style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
              color: "#94A3B8", marginLeft: 8 }}>
              [{q.marks} mark{q.marks !== 1 ? "s" : ""}]
            </span>
          )}
        </p>
      </div>

      <AnswerTextarea
        value={answer}
        onChange={onChange}
        rows={rows}
        counterMode="words"
        minWords={50}
        saveState={saveState}
        savedAt={savedAt}
        placeholder="Write your essay here…"
      />
    </div>
  );
};

// ── Nav button ────────────────────────────────────────────────────────────────

const NavBtn = ({ onClick, disabled, variant = "primary", children }) => (
  <button onClick={onClick} disabled={disabled}
    style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "14px 40px", borderRadius: 14,
      fontFamily: SERIF, fontSize: 15, fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      background: disabled ? "#E8EDF2" : variant === "primary" ? MINT : "transparent",
      color: disabled ? "#94A3B8" : variant === "primary" ? DARK : BRAND,
      border: variant === "secondary" ? `2px solid ${BRAND}` : "none",
      boxShadow: (!disabled && variant === "primary")
        ? "0 8px 28px rgba(93,202,165,0.4)" : "none",
      transition: "all 0.18s",
    }}
    onMouseEnter={e => { if (!disabled && variant === "primary") {
      e.currentTarget.style.transform = "translateY(-1px)";
      e.currentTarget.style.background = "#3aab87";
    }}}
    onMouseLeave={e => { if (!disabled && variant === "primary") {
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.background = MINT;
    }}}
  >
    {children}
  </button>
);

// ── Main component ────────────────────────────────────────────────────────────

const MultiEssayTest = ({ session }) => {
  const navigate = useNavigate();
  const testId   = session.testId;

  const [q1,          setQ1]          = useState(null);
  const [q2,          setQ2]          = useState(null);
  const [q3,          setQ3]          = useState(null);   // randomly selected
  const [answers,     setAnswers]      = useState({});
  const [phase,       setPhase]        = useState(1);     // 1=split, 2=q3 full-screen
  const [loading,     setLoading]      = useState(true);
  const [submitting,  setSubmitting]   = useState(false);
  const [activeTab,   setActiveTab]    = useState("passage"); // mobile
  const [isMobile,    setIsMobile]     = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Fetch questions, partition into Q1/Q2/Q3-pool, select Q3 at random
  useEffect(() => {
    TestsApi.getQuestions(testId)
      .then(res => {
        const sorted = [...res.data].sort(
          (a, b) => (a.questionNumber ?? 0) - (b.questionNumber ?? 0)
        );
        setQ1(sorted[0] ?? null);
        setQ2(sorted[1] ?? null);

        const pool = sorted.slice(2);
        if (pool.length > 0) {
          setQ3(pool[Math.floor(Math.random() * pool.length)]);
        }

        const saved = {};
        res.data.forEach(q => { if (q.userResponse) saved[q.quizId] = q.userResponse; });
        setAnswers(saved);
      })
      .catch(err => console.error("Could not load questions:", err))
      .finally(() => setLoading(false));
  }, [testId]);

  const setAnswer = useCallback((quizId, value) => {
    setAnswers(prev => ({ ...prev, [quizId]: value }));
  }, []);

  // Save Q1 + Q2 before advancing to Q3
  const savePhase1 = useCallback(async () => {
    const toSave = [q1, q2].filter(Boolean).filter(
      q => answers[q.quizId]?.trim()
    );
    await Promise.allSettled(
      toSave.map(q => TestsApi.submitAnswer(testId, q.quizId, answers[q.quizId]))
    );
  }, [q1, q2, answers, testId]);

  const handleContinueToQ3 = async () => {
    await savePhase1();
    setPhase(2);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await Promise.all(
        [q1, q2, q3].filter(Boolean).map(q =>
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

  if (!q1) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#F7F4EF" }}>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: "#64748B" }}>
        No questions available for this paper.
      </p>
    </div>
  );

  // Shared passage: prefer Q1's contextText or group contextText
  const passageText  = q1.contextText ?? null;
  const passageTitle = q1.groupTitle   ?? "Source material";
  const passageImage = q1.contextImageUrl ?? null;

  const groupLabel = phase === 1 ? "Section 1 & 2" : "Section 3 — Question 3";

  // ── Mobile tab bar ──────────────────────────────────────────────────────────

  const MobileTabs = () => (
    <div style={{ display: "flex", borderBottom: "1px solid #E2EBF0",
      background: "#fff", flexShrink: 0 }}>
      {[["passage", "Passage"], ["questions", "Questions"]].map(([key, label]) => (
        <button key={key} onClick={() => setActiveTab(key)}
          style={{
            flex: 1, padding: "12px 0", border: "none",
            background: "none", cursor: "pointer",
            fontFamily: SERIF, fontSize: 13, fontWeight: 700,
            color: activeTab === key ? BRAND : "#94A3B8",
            borderBottom: `2px solid ${activeTab === key ? BRAND : "transparent"}`,
            transition: "color 0.15s",
          }}>
          {label}
        </button>
      ))}
    </div>
  );

  // ── Phase 2 — Full-screen Q3 ──────────────────────────────────────────────

  if (phase === 2) {
    const q3Ans = answers[q3?.quizId] ?? "";
    const { saveState, savedAt } = useAutosave(testId, q3?.quizId, q3Ans); // eslint-disable-line

    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column",
        background: "#F8FAFC", overflow: "hidden" }}>
        <style>{`@keyframes meFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>

        <TestTopBar
          paperName={session.paperName}
          groupLabel={groupLabel}
          remainingSeconds={session.remainingSeconds}
          onLeave={() => navigate("/courses")}
        />

        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "40px 24px 60px", minHeight: "100%",
            animation: "meFade 0.35s ease both",
          }}>
            {/* Q3 randomised badge */}
            <div style={{
              background: "#fff", borderRadius: 24, padding: "44px 48px",
              width: "100%", maxWidth: 820,
              border: "1px solid #E8F0F4",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
                background: "#e8f7f9", borderRadius: 999, padding: "4px 14px", marginBottom: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%",
                  background: BRAND, flexShrink: 0 }} />
                <span style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 700,
                  color: BRAND, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Question 3 — Essay
                </span>
              </div>

              {q3 ? (
                <>
                  <p style={{ fontFamily: SERIF, fontSize: 19, lineHeight: 1.7,
                    color: "#0F172A", fontWeight: 500, marginBottom: 8 }}>
                    {q3.questionText}
                    {q3.marks && (
                      <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700,
                        color: "#94A3B8", marginLeft: 10 }}>
                        [{q3.marks} marks]
                      </span>
                    )}
                  </p>
                  <p style={{ fontFamily: SERIF, fontSize: 12, color: "#94A3B8",
                    marginBottom: 28, fontStyle: "italic" }}>
                    Write a full essay response. Aim for at least 300–400 words.
                  </p>
                  <AnswerTextarea
                    value={q3Ans}
                    onChange={val => setAnswer(q3.quizId, val)}
                    rows={22}
                    counterMode="words"
                    minWords={50}
                    saveState={saveState}
                    savedAt={savedAt}
                    placeholder="Begin your essay here…"
                  />
                </>
              ) : (
                <p style={{ fontFamily: SERIF, fontSize: 15, color: "#64748B" }}>
                  No additional essay prompts in pool — submit to continue.
                </p>
              )}
            </div>

            <div style={{ marginTop: 28 }}>
              <NavBtn onClick={handleSubmit} disabled={submitting}>
                <PaperPlaneTilt size={16} weight="bold" />
                {submitting ? "Submitting…" : "Submit test"}
              </NavBtn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase 1 — Split-screen ────────────────────────────────────────────────

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column",
      background: "#F8FAFC", overflow: "hidden" }}>

      <TestTopBar
        paperName={session.paperName}
        groupLabel={groupLabel}
        remainingSeconds={session.remainingSeconds}
        onLeave={() => navigate("/courses")}
      />

      {isMobile && <MobileTabs />}

      <div style={{ flex: 1, display: "flex", overflow: "hidden",
        flexDirection: isMobile ? "column" : "row" }}>

        {/* ── Left: Shared passage ─────────────────────────────────────── */}
        {(!isMobile || activeTab === "passage") && (
          <ContextPanel
            title={passageTitle}
            contextText={passageText}
            contextImageUrl={passageImage}
            style={{
              width: isMobile ? "100%" : "46%",
              flex: isMobile ? 1 : "0 0 46%",
              height: "100%",
            }}
          />
        )}

        {/* ── Right: Q1 + Q2 essays ────────────────────────────────────── */}
        {(!isMobile || activeTab === "questions") && (
          <div style={{
            flex: 1, overflowY: "auto", background: "#fff",
            padding: "28px 32px 40px",
            display: "flex", flexDirection: "column", gap: 0,
          }}>
            <p style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 700,
              color: "#94A3B8", letterSpacing: "0.14em",
              textTransform: "uppercase", marginBottom: 24 }}>
              Section 1 & 2 — Answer both questions
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {q1 && (
                <EssayInput
                  label="Q1"
                  q={q1}
                  testId={testId}
                  answer={answers[q1.quizId] ?? ""}
                  onChange={val => setAnswer(q1.quizId, val)}
                  rows={11}
                />
              )}
              {q2 && (
                <EssayInput
                  label="Q2"
                  q={q2}
                  testId={testId}
                  answer={answers[q2.quizId] ?? ""}
                  onChange={val => setAnswer(q2.quizId, val)}
                  rows={11}
                />
              )}
            </div>

            {/* Continue to Q3 */}
            <div style={{
              display: "flex", justifyContent: "flex-end",
              marginTop: 32, paddingTop: 20, borderTop: "1px solid #F1F5F9",
            }}>
              {!q3 ? (
                /* No Q3 pool — submit directly */
                <NavBtn onClick={handleSubmit} disabled={submitting}>
                  <PaperPlaneTilt size={15} weight="bold" />
                  {submitting ? "Submitting…" : "Submit test"}
                </NavBtn>
              ) : (
                <NavBtn onClick={handleContinueToQ3}>
                  Continue to Question 3 <ArrowRight size={15} weight="bold" />
                </NavBtn>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiEssayTest;
