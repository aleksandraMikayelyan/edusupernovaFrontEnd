/**
 * ReadingTest.jsx — Passage-based MCQ test screen.
 *
 * Used for:
 *   • TOEFL Reading section  (format = "READING")
 *   • TOEFL Listening section (format = "LISTENING") — same layout, text transcript
 *
 * Layout:
 *   Desktop: split screen — passage/context (left) | MCQ questions (right)
 *   Mobile (<768px): two tabs "Passage" | "Questions"
 *
 * Flow:
 *   1. Receives session (TestSessionDTO) as prop from Test.jsx dispatcher.
 *   2. Fetches all questions via GET /tests/{testId}/questions.
 *   3. Groups by groupId; standalone questions (no group) each get their own group.
 *   4. User answers MCQ questions one group at a time.
 *   5. "Next group" submits current group's answers, then advances.
 *   6. "Submit test" on last group → navigate to /feedback.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate }   from "react-router-dom";
import { CaretLeft, CaretRight, PaperPlane } from "@phosphor-icons/react";
import { TestsApi }      from "../api/index.js";
import LoadingScreen     from "../components/common/LoadingScreen.jsx";
import TestTopBar        from "../components/test/TestTopBar.jsx";
import ContextPanel      from "../components/test/ContextPanel.jsx";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif";

// ── Group all questions by their groupId ──────────────────────────────────────

const buildGroups = (questions) => {
  const map = new Map();

  questions.forEach(q => {
    const key = q.groupId ?? `standalone_${q.quizId}`;
    if (!map.has(key)) {
      map.set(key, {
        groupId:        q.groupId,
        groupTitle:     q.groupTitle,
        contextText:    q.contextText,
        contextImageUrl: q.contextImageUrl,
        minQuestionNumber: q.questionNumber ?? 9999,
        questions:      [],
      });
    }
    const g = map.get(key);
    if ((q.questionNumber ?? 9999) < g.minQuestionNumber) {
      g.minQuestionNumber = q.questionNumber ?? 9999;
    }
    g.questions.push(q);
  });

  map.forEach(g => {
    g.questions.sort((a, b) =>
      (a.groupOrderIndex ?? 0) - (b.groupOrderIndex ?? 0));
  });

  return [...map.values()].sort(
    (a, b) => a.minQuestionNumber - b.minQuestionNumber
  );
};

const getOptions = (q) =>
  ["A", "B", "C", "D", "E"]
    .map(l => ({ letter: l, text: q[`option${l}`] }))
    .filter(o => o.text);

// ── Single MCQ question card ──────────────────────────────────────────────────

const MCQQuestion = ({ q, index, selected, onSelect }) => {
  const options = getOptions(q);
  const label   = q.groupOrderIndex
    ? String.fromCharCode(96 + q.groupOrderIndex)  // 1→a, 2→b, …
    : null;

  return (
    <div style={{
      paddingBottom: 28,
      borderBottom: "1px solid #F1F5F9",
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      {/* Question text */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {label && (
          <span style={{
            fontFamily: SERIF, fontSize: 13, fontWeight: 700,
            color: BRAND, background: "#e8f7f9",
            border: "1px solid rgba(10,95,110,0.15)",
            borderRadius: 8, padding: "2px 8px",
            flexShrink: 0, marginTop: 2,
          }}>
            ({label})
          </span>
        )}
        <p style={{
          fontFamily: SERIF, fontSize: 15, lineHeight: 1.65,
          color: "#0F172A", margin: 0, flex: 1,
        }}>
          {q.questionText}
          {q.marks && (
            <span style={{
              fontFamily: SERIF, fontSize: 12, fontWeight: 700,
              color: "#94A3B8", marginLeft: 8,
            }}>
              [{q.marks} mark{q.marks !== 1 ? "s" : ""}]
            </span>
          )}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map(({ letter, text }) => {
          const isSelected = selected === letter;
          return (
            <button
              key={letter}
              onClick={() => onSelect(q.quizId, letter)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 16px", borderRadius: 14, textAlign: "left",
                border: `2px solid ${isSelected ? BRAND : "#EEF2F7"}`,
                background: isSelected ? "#e8f7f9" : "#FAFBFC",
                cursor: "pointer",
                boxShadow: isSelected ? "0 4px 16px rgba(10,95,110,0.10)" : "none",
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
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: isSelected ? BRAND : "#E8EDF2",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.18s",
              }}>
                <span style={{
                  fontFamily: SERIF, fontSize: 12, fontWeight: 700,
                  color: isSelected ? "#fff" : "#64748B",
                }}>
                  {letter}
                </span>
              </div>
              <span style={{
                fontFamily: SERIF, fontSize: 14, lineHeight: 1.5, flex: 1,
                color: isSelected ? BRAND : "#374151",
                fontWeight: isSelected ? 600 : 400,
                transition: "color 0.18s",
              }}>
                {text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Nav button ────────────────────────────────────────────────────────────────

const NavBtn = ({ onClick, disabled, variant = "secondary", children }) => {
  const isPrimary = variant === "primary";
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "13px 28px", borderRadius: 12,
        fontFamily: SERIF, fontSize: 14, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? "#E8EDF2" : isPrimary ? MINT : "transparent",
        color: disabled ? "#94A3B8" : isPrimary ? DARK : BRAND,
        border: isPrimary ? "none" : `2px solid ${disabled ? "#E2EBF0" : BRAND}`,
        boxShadow: isPrimary && !disabled ? "0 8px 24px rgba(93,202,165,0.3)" : "none",
        transition: "all 0.18s",
      }}
      onMouseEnter={e => {
        if (!disabled && isPrimary) {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.background = "#3aab87";
        }
      }}
      onMouseLeave={e => {
        if (!disabled && isPrimary) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.background = MINT;
        }
      }}>
      {children}
    </button>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const ReadingTest = ({ session }) => {
  const navigate = useNavigate();
  const testId   = session.testId;

  const [groups,     setGroups]     = useState([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [answers,    setAnswers]    = useState({});   // quizId → letter
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab,  setActiveTab]  = useState("passage");
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
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
    for (const q of pending) {
      await TestsApi.submitAnswer(testId, q.quizId, answers[q.quizId]);
    }
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
    } catch {
      setSubmitting(false);
    }
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

  const groupLabel      = hasContext
    ? `Passage ${groupIndex + 1} of ${totalGroups}`
    : "Complete the Words";
  const taskInstruction = hasContext ? "Choose the best answer" : "Fill in the missing letters";

  // ── Mobile tabs ──────────────────────────────────────────────────────────────

  const MobileTabs = () => (
    <div style={{ display: "flex", borderBottom: "1px solid #E2EBF0",
      background: "#fff", flexShrink: 0 }}>
      {["passage", "questions"].map(tab => (
        <button key={tab} onClick={() => setActiveTab(tab)}
          style={{
            flex: 1, padding: "12px 0", border: "none",
            background: "none", cursor: "pointer",
            fontFamily: SERIF, fontSize: 13, fontWeight: 700,
            textTransform: "capitalize",
            color: activeTab === tab ? BRAND : "#94A3B8",
            borderBottom: `2px solid ${activeTab === tab ? BRAND : "transparent"}`,
            transition: "color 0.15s",
          }}>
          {tab === "passage" ? "Passage" : "Questions"}
        </button>
      ))}
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column",
      background: "#F8FAFC", overflow: "hidden" }}>

      <TestTopBar
        paperName={session.paperName}
        groupLabel={groupLabel}
        remainingSeconds={session.remainingSeconds}
        onLeave={() => navigate("/courses")}
      />

      {isMobile && hasContext && <MobileTabs />}

      <div style={{ flex: 1, display: "flex", overflow: "hidden",
        flexDirection: isMobile ? "column" : "row" }}>

        {/* ── Passage panel (left) ── */}
        {hasContext && (!isMobile || activeTab === "passage") && (
          <ContextPanel
            title={currentGroup.groupTitle}
            contextText={currentGroup.contextText}
            contextImageUrl={currentGroup.contextImageUrl}
            style={{
              width: isMobile ? "100%" : "48%",
              flex: isMobile ? 1 : "0 0 48%",
            }}
          />
        )}

        {/* ── Questions panel (right) ── */}
        {(!isMobile || !hasContext || activeTab === "questions") && (
          <div style={{
            flex: 1, overflowY: "auto",
            background: "#fff",
            display: "flex", justifyContent: hasContext ? "flex-start" : "center",
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
              {groupLabel} — {taskInstruction}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {currentGroup.questions.map((q, i) => (
                <MCQQuestion
                  key={q.quizId}
                  q={q}
                  index={i}
                  selected={answers[q.quizId] ?? null}
                  onSelect={setAnswer}
                />
              ))}
            </div>

            {/* Navigation */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginTop: 36,
              paddingTop: 24, borderTop: "1px solid #F1F5F9",
            }}>
              <NavBtn onClick={handlePrev} disabled={groupIndex === 0}>
                <CaretLeft size={15} weight="bold" /> Previous
              </NavBtn>
              {isLastGroup ? (
                <NavBtn onClick={handleSubmit} disabled={submitting} variant="primary">
                  <PaperPlane size={15} weight="bold" />
                  {submitting ? "Submitting…" : "Submit test"}
                </NavBtn>
              ) : (
                <NavBtn onClick={handleNext} variant="primary">
                  {hasContext ? "Next passage" : "Next"} <CaretRight size={15} weight="bold" />
                </NavBtn>
              )}
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingTest;
