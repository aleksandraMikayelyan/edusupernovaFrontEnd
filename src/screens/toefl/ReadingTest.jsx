/**
 * ReadingTest.jsx — Passage-based MCQ test screen.
 *
 * Used for:
 *   • TOEFL Reading section  (format = "READING")
 *   • IELTS Reading section  (format = "READING" dispatched from IELTS courses)
 *
 * Layout:
 *   Desktop: split screen — passage/context (left 48%) | MCQ questions (right)
 *   Mobile (<768px): two tabs "Passage" | "Questions"
 *
 * Flow:
 *   1. Receives session (TestSessionDTO) as prop from Test.jsx dispatcher.
 *   2. Fetches all questions via GET /tests/{testId}/questions.
 *   3. Groups by groupId; standalone questions each get their own group.
 *   4. User answers MCQ questions one group at a time.
 *   5. "Next passage" submits current group's answers, then advances.
 *   6. "Submit test" on last group → navigate to /feedback.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate }       from "react-router-dom";
import { TestsApi }          from "../../api/index.js";
import LoadingScreen         from "../../components/common/LoadingScreen.jsx";
import TestTopBar            from "../../components/test/TestTopBar.jsx";
import ContextPanel          from "../../components/test/ContextPanel.jsx";
import MCQQuestionCard       from "../../components/test/MCQQuestionCard.jsx";
import TestNavBar            from "../../components/test/TestNavBar.jsx";
import { buildGroups }       from "../../utils/buildGroups.js";

const BRAND = "#0a5f6e";
const SERIF = "Newsreader, Georgia, serif";

// ── Mobile tab bar ────────────────────────────────────────────────────────────

const MobileTabs = ({ activeTab, onChange }) => (
  <div style={{ display: "flex", borderBottom: "1px solid #E2EBF0",
    background: "#fff", flexShrink: 0 }}>
    {[["passage", "Passage"], ["questions", "Questions"]].map(([key, label]) => (
      <button key={key} onClick={() => onChange(key)}
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

// ── Main screen ───────────────────────────────────────────────────────────────

const ReadingTest = ({ session }) => {
  const navigate = useNavigate();
  const testId   = session.testId;

  const [groups,     setGroups]     = useState([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [answers,    setAnswers]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab,  setActiveTab]  = useState("passage");
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    TestsApi.getQuestions(testId)
      .then(res => {
        setGroups(buildGroups(res.data));
        const saved = {};
        res.data.forEach(q => { if (q.userResponse) saved[q.quizId] = q.userResponse; });
        setAnswers(saved);
      })
      .catch(err => console.error("Could not load questions:", err))
      .finally(() => setLoading(false));
  }, [testId]);

  useEffect(() => { setActiveTab("passage"); }, [groupIndex]);

  const currentGroup = groups[groupIndex];
  const totalGroups  = groups.length;
  const isLastGroup  = groupIndex === totalGroups - 1;
  const hasContext   = !!(currentGroup?.contextText || currentGroup?.contextImageUrl);

  const setAnswer = useCallback((quizId, letter) => {
    setAnswers(prev => ({ ...prev, [quizId]: letter }));
  }, []);

  const saveGroupAnswers = useCallback(async () => {
    if (!currentGroup) return;
    const pending = currentGroup.questions.filter(q => answers[q.quizId]);
    for (const q of pending)
      await TestsApi.submitAnswer(testId, q.quizId, answers[q.quizId]);
  }, [currentGroup, answers, testId]);

  const handleNext = async () => {
    await saveGroupAnswers();
    setGroupIndex(i => i + 1);
    window.scrollTo(0, 0);
  };

  const handlePrev = () => {
    setGroupIndex(i => i - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await saveGroupAnswers();
      navigate("/feedback", { state: { testId }, replace: true });
    } catch { setSubmitting(false); }
  };

  if (loading) return <LoadingScreen />;

  if (!currentGroup) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#F7F4EF" }}>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: "#64748B" }}>
        No questions available for this section.
      </p>
    </div>
  );

  const groupLabel = hasContext
    ? `Passage ${groupIndex + 1} of ${totalGroups}`
    : "Questions";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column",
      background: "#F8FAFC", overflow: "hidden" }}>

      <TestTopBar
        paperName={session.paperName}
        groupLabel={groupLabel}
        remainingSeconds={session.remainingSeconds}
        onLeave={() => navigate("/courses")}
      />

      {isMobile && hasContext && (
        <MobileTabs activeTab={activeTab} onChange={setActiveTab} />
      )}

      <div style={{ flex: 1, display: "flex", overflow: "hidden",
        flexDirection: isMobile ? "column" : "row" }}>

        {/* Passage panel */}
        {hasContext && (!isMobile || activeTab === "passage") && (
          <ContextPanel
            title={currentGroup.groupTitle}
            contextText={currentGroup.contextText}
            contextImageUrl={currentGroup.contextImageUrl}
            style={{
              width: isMobile ? "100%" : "48%",
              flex:  isMobile ? 1 : "0 0 48%",
            }}
          />
        )}

        {/* Questions panel */}
        {(!isMobile || !hasContext || activeTab === "questions") && (
          <div style={{
            flex: 1, overflowY: "auto", background: "#fff",
            display: "flex",
            justifyContent: hasContext ? "flex-start" : "center",
          }}>
            <div style={{
              width: "100%",
              maxWidth: hasContext ? "none" : 820,
              padding: "32px 36px 40px",
              display: "flex", flexDirection: "column", gap: 0,
            }}>
              <p style={{
                fontFamily: SERIF, fontSize: 10, fontWeight: 700,
                color: "#94A3B8", letterSpacing: "0.14em",
                textTransform: "uppercase", marginBottom: 24,
              }}>
                {groupLabel} — Choose the best answer
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {currentGroup.questions.map((q, i) => (
                  <MCQQuestionCard
                    key={q.quizId}
                    q={q}
                    index={i}
                    selected={answers[q.quizId] ?? null}
                    onSelect={setAnswer}
                    showLabel
                  />
                ))}
              </div>

              <TestNavBar
                onPrev={handlePrev}
                onNext={handleNext}
                onSubmit={handleSubmit}
                canPrev={groupIndex > 0}
                isLast={isLastGroup}
                submitting={submitting}
                nextLabel={hasContext ? "Next passage" : "Next"}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingTest;
