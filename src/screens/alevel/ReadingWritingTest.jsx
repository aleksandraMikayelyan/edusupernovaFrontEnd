/**
 * ReadingWritingTest.jsx — Generic "Reading + Writing" test screen.
 *
 * Used for:
 *   • English Language A-Level Paper 1
 *   • IELTS / TOEFL Writing tasks
 *   • SAT / ACT Reading + Writing sections
 *   • Any READING_WRITING-format paper
 *
 * Layout:
 *   Desktop: Split screen
 *     LEFT  — Reference text panel with per-question toggle tabs.
 *             Switches which passage is shown WITHOUT losing essay progress.
 *     RIGHT — All essay textareas stacked and simultaneously editable.
 *
 *   Mobile (<768px): Two tabs — "Text" | "Essays"
 *
 * Data contract (TestQuestionDTO fields used):
 *   contextText      → the reference passage for that question
 *   questionText     → the essay prompt
 *   marks            → shown as "[N marks]" hint
 *   quizId           → autosave key
 *   questionNumber   → display order
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate }       from "react-router-dom";
import { PaperPlaneTilt }    from "@phosphor-icons/react";
import { TestsApi }          from "../../api/index.js";
import LoadingScreen         from "../../components/common/LoadingScreen.jsx";
import TestTopBar            from "../../components/test/TestTopBar.jsx";
import AnswerTextarea        from "../../components/test/AnswerTextarea.jsx";
import useAutosave           from "../../hooks/useAutosave.js";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const CREAM = "#F7F4EF";
const SERIF = "Newsreader, Georgia, serif";

// ── Single essay card (right panel) ──────────────────────────────────────────

const EssayCard = ({ q, index, testId, answer, onChange, isActive, onFocus }) => {
  const { saveState, savedAt } = useAutosave(testId, q.quizId, answer);
  const cardRef = useRef(null);

  return (
    <div
      ref={cardRef}
      onClick={onFocus}
      style={{
        background: "#fff",
        borderRadius: 20,
        border: `2px solid ${isActive ? BRAND : "#E8F0F4"}`,
        padding: "28px 32px",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: isActive
          ? "0 4px 24px rgba(10,95,110,0.10)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        cursor: "default",
      }}
    >
      {/* Essay number badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: isActive ? BRAND : "#E8EDF2",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s",
        }}>
          <span style={{
            fontFamily: SERIF, fontSize: 12, fontWeight: 700,
            color: isActive ? "#fff" : "#64748B",
          }}>
            {index + 1}
          </span>
        </div>
        <span style={{
          fontFamily: SERIF, fontSize: 10, fontWeight: 700,
          color: "#94A3B8", letterSpacing: "0.12em", textTransform: "uppercase",
        }}>
          Essay {index + 1}
          {q.marks ? ` — [${q.marks} marks]` : ""}
        </span>
      </div>

      {/* Question prompt */}
      <p style={{
        fontFamily: SERIF, fontSize: 16, lineHeight: 1.7,
        color: "#0F172A", fontWeight: 500, marginBottom: 18,
      }}>
        {q.questionText}
      </p>

      <AnswerTextarea
        value={answer}
        onChange={onChange}
        rows={14}
        counterMode="words"
        minWords={50}
        saveState={saveState}
        savedAt={savedAt}
        placeholder="Begin your essay here…"
      />
    </div>
  );
};

// ── Reference text panel (left) ───────────────────────────────────────────────

const ReferencePanel = ({ questions, activeIndex, onSelect }) => {
  const active = questions[activeIndex];
  const hasText = !!active?.contextText;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", background: CREAM,
      borderRight: "1px solid #E2EBF0",
    }}>
      {/* Tab bar */}
      <div style={{
        display: "flex", borderBottom: "1px solid #E2EBF0",
        background: "#fff", flexShrink: 0, overflowX: "auto",
      }}>
        {questions.map((q, i) => (
          <button
            key={q.quizId}
            onClick={() => onSelect(i)}
            style={{
              flex: "0 0 auto", padding: "12px 20px",
              border: "none", background: "none", cursor: "pointer",
              fontFamily: SERIF, fontSize: 12, fontWeight: 700,
              color: activeIndex === i ? BRAND : "#94A3B8",
              borderBottom: `2px solid ${activeIndex === i ? BRAND : "transparent"}`,
              transition: "color 0.15s, border-color 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            Text {i + 1}
          </button>
        ))}
      </div>

      {/* Passage */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
        {hasText ? (
          <>
            <p style={{
              fontFamily: SERIF, fontSize: 10, fontWeight: 700,
              color: "#94A3B8", letterSpacing: "0.14em",
              textTransform: "uppercase", marginBottom: 16,
            }}>
              Reference text — Question {activeIndex + 1}
            </p>
            <div style={{
              fontFamily: SERIF, fontSize: 15, lineHeight: 1.85,
              color: "#1E293B", whiteSpace: "pre-wrap",
            }}>
              {active.contextText}
            </div>
          </>
        ) : (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            height: "100%", gap: 12, opacity: 0.5,
          }}>
            <p style={{ fontFamily: SERIF, fontSize: 14, color: "#64748B", textAlign: "center" }}>
              No reference text for Question {activeIndex + 1}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Submit button ─────────────────────────────────────────────────────────────

const SubmitBtn = ({ onClick, disabled, submitting }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "14px 40px", borderRadius: 14, border: "none",
      fontFamily: SERIF, fontSize: 15, fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      background: disabled ? "#E8EDF2" : MINT,
      color: disabled ? "#94A3B8" : DARK,
      boxShadow: disabled ? "none" : "0 8px 28px rgba(93,202,165,0.4)",
      transition: "all 0.18s",
    }}
    onMouseEnter={e => { if (!disabled) {
      e.currentTarget.style.transform = "translateY(-1px)";
      e.currentTarget.style.background = "#3aab87";
    }}}
    onMouseLeave={e => { if (!disabled) {
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.background = MINT;
    }}}
  >
    <PaperPlaneTilt size={16} weight="bold" />
    {submitting ? "Submitting…" : "Submit test"}
  </button>
);

// ── Main component ────────────────────────────────────────────────────────────

const ReadingWritingTest = ({ session }) => {
  const navigate = useNavigate();
  const testId   = session.testId;

  const [questions,    setQuestions]    = useState([]);
  const [answers,      setAnswers]      = useState({});       // quizId → string
  const [activeRef,    setActiveRef]    = useState(0);        // which text tab is shown
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [activeEssay,  setActiveEssay]  = useState(0);        // highlights active card
  const [activeTab,    setActiveTab]    = useState("text");   // mobile tab
  const [isMobile,     setIsMobile]     = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Fetch all questions, sort by questionNumber, pre-fill saved answers
  useEffect(() => {
    TestsApi.getQuestions(testId)
      .then(res => {
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

  const setAnswer = useCallback((quizId, value) => {
    setAnswers(prev => ({ ...prev, [quizId]: value }));
  }, []);

  // When user focuses an essay card, sync the reference text tab to match
  const handleEssayFocus = useCallback((index) => {
    setActiveEssay(index);
    setActiveRef(index);       // keep text and essay in sync
    setActiveTab("text");      // mobile: hint user to switch to Text if needed
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await Promise.allSettled(
        questions
          .filter(q => answers[q.quizId]?.trim())
          .map(q => TestsApi.submitAnswer(testId, q.quizId, answers[q.quizId]))
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
      justifyContent: "center", background: CREAM }}>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: "#64748B" }}>
        No questions available for this paper.
      </p>
    </div>
  );

  const essayLabel = `${questions.length} Essay${questions.length !== 1 ? "s" : ""}`;
  const answeredCount = questions.filter(q => answers[q.quizId]?.trim()).length;
  const allAnswered = answeredCount === questions.length;

  // ── Mobile tab bar ──────────────────────────────────────────────────────────

  const MobileTabs = () => (
    <div style={{ display: "flex", borderBottom: "1px solid #E2EBF0",
      background: "#fff", flexShrink: 0 }}>
      {[["text", "Reference Text"], ["essays", "Essays"]].map(([key, label]) => (
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

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column",
      background: "#F8FAFC", overflow: "hidden" }}>
      <style>{`@keyframes rwFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>

      <TestTopBar
        paperName={session.paperName}
        groupLabel={essayLabel}
        remainingSeconds={session.remainingSeconds}
        onLeave={() => navigate("/courses")}
      />

      {isMobile && <MobileTabs />}

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden",
        flexDirection: isMobile ? "column" : "row" }}>

        {/* ── Left: Reference text panel ─────────────────────────────────── */}
        {(!isMobile || activeTab === "text") && (
          <div style={{
            width: isMobile ? "100%" : "42%",
            flex: isMobile ? 1 : "0 0 42%",
            height: isMobile ? "100%" : "100%",
            overflow: "hidden",
          }}>
            <ReferencePanel
              questions={questions}
              activeIndex={activeRef}
              onSelect={i => { setActiveRef(i); setActiveEssay(i); }}
            />
          </div>
        )}

        {/* ── Right: All essay cards ─────────────────────────────────────── */}
        {(!isMobile || activeTab === "essays") && (
          <div style={{
            flex: 1, overflowY: "auto",
            padding: isMobile ? "20px 16px 40px" : "28px 32px 48px",
            display: "flex", flexDirection: "column", gap: 20,
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
              <div key={q.quizId} style={{ animation: `rwFade 0.3s ease ${i * 60}ms both` }}>
                <EssayCard
                  q={q}
                  index={i}
                  testId={testId}
                  answer={answers[q.quizId] ?? ""}
                  onChange={val => setAnswer(q.quizId, val)}
                  isActive={activeEssay === i}
                  onFocus={() => handleEssayFocus(i)}
                />
              </div>
            ))}

            {/* Submit row */}
            <div style={{
              display: "flex", justifyContent: "flex-end",
              paddingTop: 8,
            }}>
              {!allAnswered && (
                <span style={{
                  fontFamily: SERIF, fontSize: 13, color: "#94A3B8",
                  alignSelf: "center", marginRight: 16,
                }}>
                  Complete all essays before submitting
                </span>
              )}
              <SubmitBtn
                onClick={handleSubmit}
                disabled={submitting}
                submitting={submitting}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingWritingTest;
