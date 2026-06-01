/**
 * DataResponseTest.jsx — Paper 2 (DATA_RESPONSE) test screen.
 *
 * Layout:
 *   Desktop: split screen — context passage (left) | sub-questions (right)
 *   Mobile (<768px): tabs "Passage" | "Questions"
 *
 * Flow:
 *   1. Receives session (TestSessionDTO) as prop from Test.jsx dispatcher.
 *   2. Fetches all questions via GET /tests/{testId}/questions.
 *   3. Groups by groupId, sorts groups by first questionNumber, sorts
 *      questions within group by groupOrderIndex.
 *   4. Autosaves each textarea on change (debounced 2s).
 *   5. "Next group" / "Previous group" navigate between groups.
 *   6. "Submit test" on last group → navigate to /feedback.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate }        from "react-router-dom";
import { CaretLeft, CaretRight, PaperPlane } from "@phosphor-icons/react";
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

// ── Rows by marks ──────────────────────────────────────────────────────────────
const rowsForMarks = (marks) => {
  if (!marks || marks <= 2) return 4;
  if (marks <= 4)            return 6;
  return 10;
};

// ── Group questions into ordered arrays ────────────────────────────────────────
const buildGroups = (questions) => {
  const map = new Map();

  questions.forEach(q => {
    const key = q.groupId ?? `standalone_${q.quizId}`;
    if (!map.has(key)) {
      map.set(key, {
        groupId:       q.groupId,
        groupTitle:    q.groupTitle,
        contextText:   q.contextText,
        contextImageUrl: q.contextImageUrl,
        minQuestionNumber: q.questionNumber ?? 9999,
        questions:     [],
      });
    }
    const g = map.get(key);
    if ((q.questionNumber ?? 9999) < g.minQuestionNumber) {
      g.minQuestionNumber = q.questionNumber ?? 9999;
    }
    g.questions.push(q);
  });

  // Sort questions within each group by groupOrderIndex
  map.forEach(g => {
    g.questions.sort((a, b) =>
      (a.groupOrderIndex ?? 0) - (b.groupOrderIndex ?? 0));
  });

  // Sort groups by the earliest questionNumber they contain
  return [...map.values()].sort(
    (a, b) => a.minQuestionNumber - b.minQuestionNumber
  );
};

// ── Sub-question row ──────────────────────────────────────────────────────────

const SubQuestion = ({ q, testId, answer, onChange }) => {
  const { saveState, savedAt } = useAutosave(testId, q.quizId, answer);
  const label = q.groupOrderIndex
    ? String.fromCharCode(96 + q.groupOrderIndex)   // 1→'a', 2→'b', …
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10,
      paddingBottom: 24, borderBottom: "1px solid #F1F5F9" }}>
      {/* Question text + marks */}
      <div style={{ display: "flex", alignItems: "flex-start",
        gap: 10, flexWrap: "wrap" }}>
        {label && (
          <span style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700,
            color: BRAND, background: "#e8f7f9",
            border: "1px solid rgba(10,95,110,0.15)",
            borderRadius: 8, padding: "2px 8px",
            flexShrink: 0, marginTop: 2 }}>
            ({label})
          </span>
        )}
        <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.65,
          color: "#0F172A", margin: 0, flex: 1 }}>
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
        rows={rowsForMarks(q.marks)}
        counterMode="chars"
        saveState={saveState}
        savedAt={savedAt}
        placeholder="Write your answer here…"
      />
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
        fontFamily: SERIF, fontSize: 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
        background: disabled
          ? "#E8EDF2"
          : isPrimary ? MINT : "transparent",
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

const DataResponseTest = ({ session }) => {
  const navigate = useNavigate();
  const testId   = session.testId;

  const [groups,        setGroups]        = useState([]);
  const [groupIndex,    setGroupIndex]    = useState(0);
  const [answers,       setAnswers]       = useState({});   // quizId → string
  const [loading,       setLoading]       = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [activeTab,     setActiveTab]     = useState("passage"); // mobile tabs
  const [isMobile,      setIsMobile]      = useState(window.innerWidth < 768);

  // Responsive listener
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Fetch all questions on mount, build groups, pre-fill saved answers
  useEffect(() => {
    let cancelled = false;
    TestsApi.getQuestions(testId)
      .then(res => {
        if (cancelled) return;
        const built = buildGroups(res.data);
        setGroups(built);
        // Pre-fill with any already-saved responses
        const saved = {};
        res.data.forEach(q => { if (q.userResponse) saved[q.quizId] = q.userResponse; });
        setAnswers(saved);
      })
      .catch(err => { if (!cancelled) console.error("Could not load questions:", err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [testId]);

  // Reset to "Passage" tab when switching groups on mobile
  useEffect(() => { setActiveTab("passage"); }, [groupIndex]);

  const currentGroup = groups[groupIndex];
  const totalGroups  = groups.length;
  const isLastGroup  = groupIndex === totalGroups - 1;

  const setAnswer = useCallback((quizId, value) => {
    setAnswers(prev => ({ ...prev, [quizId]: value }));
  }, []);

  // Save all answers in the current group before navigating
  const saveGroupAnswers = useCallback(async () => {
    if (!currentGroup) return;
    const pending = currentGroup.questions.filter(
      q => answers[q.quizId] && answers[q.quizId].trim() !== ""
    );
    await Promise.allSettled(
      pending.map(q => TestsApi.submitAnswer(testId, q.quizId, answers[q.quizId]))
    );
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
      // Best-effort save of all current answers (failures are tolerated)
      await Promise.allSettled(
        groups.flatMap(group =>
          group.questions.map(q =>
            answers[q.quizId]?.trim()
              ? TestsApi.submitAnswer(testId, q.quizId, answers[q.quizId])
              : Promise.resolve()
          )
        )
      );
      // Force-complete the test server-side then go to results
      await TestsApi.submit(testId);
      navigate("/feedback", { state: { testId }, replace: true });
    } catch (err) {
      console.error("Submit failed:", err);
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen />;

  if (!currentGroup) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#F7F4EF" }}>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: "#64748B" }}>
        No question groups available for this paper.
      </p>
    </div>
  );

  const groupLabel = `Group ${groupIndex + 1} of ${totalGroups}`;

  // ── Mobile layout ──────────────────────────────────────────────────────────

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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column",
      background: "#F8FAFC", overflow: "hidden" }}>

      <TestTopBar
        paperName={session.paperName}
        groupLabel={groupLabel}
        remainingSeconds={session.remainingSeconds}
        onLeave={() => navigate("/courses")}
      />

      {/* Mobile: tabs bar */}
      {isMobile && <MobileTabs />}

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden",
        flexDirection: isMobile ? "column" : "row" }}>

        {/* ── Context panel (left / Passage tab) ── */}
        {(!isMobile || activeTab === "passage") && (
          <ContextPanel
            title={currentGroup.groupTitle}
            contextText={currentGroup.contextText}
            contextImageUrl={currentGroup.contextImageUrl}
            style={{
              width: isMobile ? "100%" : "46%",
              height: isMobile ? "100%" : "100%",
              flex: isMobile ? 1 : "0 0 46%",
            }}
          />
        )}

        {/* ── Questions panel (right / Questions tab) ── */}
        {(!isMobile || activeTab === "questions") && (
          <div style={{
            flex: 1, overflowY: "auto",
            background: "#fff",
            padding: "32px 36px 40px",
            display: "flex", flexDirection: "column", gap: 0,
          }}>
            {/* Section label */}
            <p style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 700,
              color: "#94A3B8", letterSpacing: "0.14em",
              textTransform: "uppercase", marginBottom: 22 }}>
              {groupLabel} — Answer all parts
            </p>

            {/* Sub-questions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {currentGroup.questions.map(q => (
                <SubQuestion
                  key={q.quizId}
                  q={q}
                  testId={testId}
                  answer={answers[q.quizId] ?? ""}
                  onChange={val => setAnswer(q.quizId, val)}
                />
              ))}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginTop: 36,
              paddingTop: 24, borderTop: "1px solid #F1F5F9" }}>
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
                  Next group <CaretRight size={15} weight="bold" />
                </NavBtn>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataResponseTest;
