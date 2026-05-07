/**
 * ACTEnglishTest.jsx — ACT English section exam screen.
 *
 * Real ACT English format:
 *   • 75 questions, 45 minutes
 *   • 5 passages (15 questions each)
 *   • Passage is shown on the LEFT; questions on the RIGHT
 *   • Specific portions of the passage are UNDERLINED and numbered.
 *     The backend embeds [1], [2], … markers in contextText at the start
 *     of each underlined span.  The question says "The best replacement
 *     for the underlined portion in [1] is:"
 *   • All questions are 4-option MCQ (A/B/C/D).
 *     Option A is always "NO CHANGE" for usage questions.
 *
 * Backend data contract:
 *   format = "ACT_ENGLISH"
 *   contextText  — passage text with [N] markers
 *   questionText — "Which of the following best replaces [3]?"
 *   optionA      — "NO CHANGE"  (or other options)
 *   optionB/C/D  — alternatives
 *
 * Layout: identical split-screen to ReadingTest.
 * Uses shared: MCQQuestionCard, TestNavBar, TestTopBar, buildGroups.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate }     from "react-router-dom";
import { TestsApi }        from "../../api/index.js";
import LoadingScreen       from "../../components/common/LoadingScreen.jsx";
import TestTopBar          from "../../components/test/TestTopBar.jsx";
import MCQQuestionCard     from "../../components/test/MCQQuestionCard.jsx";
import TestNavBar          from "../../components/test/TestNavBar.jsx";
import { buildGroups }     from "../../utils/buildGroups.js";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const CREAM = "#F7F4EF";
const SERIF = "Newsreader, Georgia, serif";

// ── Passage renderer — parses [N] markers into inline number bubbles ──────────

const ACTPassage = ({ text, title }) => {
  if (!text) return (
    <p style={{ fontFamily: SERIF, fontSize: 14, color: "#94A3B8",
      fontStyle: "italic", textAlign: "center", padding: "60px 0" }}>
      Passage not available.
    </p>
  );

  // Split on [NUMBER] markers, e.g. "[1]", "[12]"
  const parts = text.split(/(\[\d+\])/);

  return (
    <div>
      {title && (
        <p style={{
          fontFamily: SERIF, fontSize: 11, fontWeight: 700,
          color: "#94A3B8", letterSpacing: "0.14em",
          textTransform: "uppercase", marginBottom: 20,
        }}>
          {title}
        </p>
      )}
      <div style={{
        fontFamily: SERIF, fontSize: 15, lineHeight: 1.9,
        color: "#1E293B",
      }}>
        {parts.map((part, i) => {
          const match = part.match(/^\[(\d+)\]$/);
          if (match) {
            return (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center", justifyContent: "center",
                  minWidth: 20, height: 20, borderRadius: "50%",
                  background: BRAND, color: "#fff",
                  fontSize: 10, fontWeight: 700,
                  margin: "0 3px", padding: "0 4px",
                  verticalAlign: "middle", flexShrink: 0,
                  boxShadow: "0 1px 4px rgba(10,95,110,0.25)",
                  lineHeight: 1,
                }}
              >
                {match[1]}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    </div>
  );
};

// ── Passage sidebar (left panel) ──────────────────────────────────────────────

const PassagePanel = ({ group, passageNum, totalPassages }) => (
  <div style={{
    display: "flex", flexDirection: "column",
    height: "100%", background: CREAM,
    borderRight: "1px solid #E2EBF0",
    overflow: "hidden",
  }}>
    {/* Header */}
    <div style={{
      padding: "14px 24px 12px",
      background: "#fff",
      borderBottom: "1px solid #E2EBF0",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontFamily: SERIF, fontSize: 11, fontWeight: 700,
          color: BRAND, letterSpacing: "0.12em", textTransform: "uppercase",
        }}>
          Passage {passageNum} of {totalPassages}
        </span>
        <span style={{
          background: "#e8f7f9",
          border: "1px solid rgba(10,95,110,0.15)",
          borderRadius: 999, padding: "3px 10px",
          fontFamily: SERIF, fontSize: 11, fontWeight: 700, color: BRAND,
        }}>
          ACT English
        </span>
      </div>
    </div>

    {/* Scrollable passage */}
    <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
      <ACTPassage text={group?.contextText} title={group?.groupTitle} />
    </div>
  </div>
);

// ── Question count badge ──────────────────────────────────────────────────────

const QuestionRange = ({ group, groupIndex, allGroups }) => {
  let start = 1;
  for (let i = 0; i < groupIndex; i++)
    start += allGroups[i].questions.length;
  const end = start + group.questions.length - 1;
  return (
    <span style={{
      fontFamily: SERIF, fontSize: 11, color: "#94A3B8",
      letterSpacing: "0.04em",
    }}>
      Questions {start}–{end}
    </span>
  );
};

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

const ACTEnglishTest = ({ session }) => {
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

  const answeredInGroup = currentGroup
    ? currentGroup.questions.filter(q => answers[q.quizId]).length
    : 0;
  const totalInGroup = currentGroup?.questions.length ?? 0;

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

  const hasPassage = !!currentGroup?.contextText;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column",
      background: "#F8FAFC", overflow: "hidden" }}>
      <style>{`
        @keyframes actSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <TestTopBar
        paperName="ACT English"
        groupLabel={`Section ${groupIndex + 1} of ${totalGroups}`}
        remainingSeconds={session.remainingSeconds}
        onLeave={() => navigate("/courses")}
      />

      {isMobile && hasPassage && <MobileTabs activeTab={activeTab} onChange={setActiveTab} />}

      <div style={{ flex: 1, display: "flex", overflow: "hidden",
        flexDirection: isMobile ? "column" : "row" }}>

        {/* ── LEFT: Passage panel — only when passage text exists ── */}
        {hasPassage && (!isMobile || activeTab === "passage") && (
          <div style={{
            width: isMobile ? "100%" : "48%",
            flex: isMobile ? 1 : "0 0 48%",
            overflow: "hidden",
          }}>
            <PassagePanel
              group={currentGroup}
              passageNum={groupIndex + 1}
              totalPassages={totalGroups}
            />
          </div>
        )}

        {/* ── RIGHT: Questions panel ── */}
        {(!hasPassage || !isMobile || activeTab === "questions") && (
          <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
            <div style={{
              padding: "28px 36px 48px",
              maxWidth: hasPassage ? 640 : 820,
              margin: hasPassage ? undefined : "0 auto",
            }}>

              {/* Header row */}
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 24,
              }}>
                <div>
                  <p style={{
                    fontFamily: SERIF, fontSize: 10, fontWeight: 700,
                    color: "#94A3B8", letterSpacing: "0.14em",
                    textTransform: "uppercase", margin: "0 0 4px",
                  }}>
                    ACT English — {currentGroup?.groupTitle ?? `Section ${groupIndex + 1}`}
                  </p>
                  {groups.length > 0 && (
                    <QuestionRange
                      group={currentGroup}
                      groupIndex={groupIndex}
                      allGroups={groups}
                    />
                  )}
                </div>

                {/* Progress pill */}
                <div style={{
                  background: answeredInGroup === totalInGroup ? "#f0fdf4" : "#F8FAFC",
                  border: `1px solid ${answeredInGroup === totalInGroup ? "#86efac" : "#E2EBF0"}`,
                  borderRadius: 999, padding: "4px 14px",
                  transition: "all 0.3s",
                }}>
                  <span style={{
                    fontFamily: SERIF, fontSize: 12, fontWeight: 700,
                    color: answeredInGroup === totalInGroup ? "#15803d" : "#64748B",
                  }}>
                    {answeredInGroup}/{totalInGroup} answered
                  </span>
                </div>
              </div>

              {/* Questions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {currentGroup.questions.map((q, i) => (
                  <div key={q.quizId}
                    style={{ animation: `actSlide 0.3s ease ${i * 40}ms both` }}>
                    <MCQQuestionCard
                      q={q}
                      index={i}
                      selected={answers[q.quizId] ?? null}
                      onSelect={setAnswer}
                    />
                  </div>
                ))}
              </div>

              <TestNavBar
                onPrev={handlePrev}
                onNext={handleNext}
                onSubmit={handleSubmit}
                canPrev={groupIndex > 0}
                isLast={isLastGroup}
                submitting={submitting}
                nextLabel="Next passage"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ACTEnglishTest;
