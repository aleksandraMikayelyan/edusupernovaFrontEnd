/**
 * ACTReadingTest.jsx — ACT Reading section exam screen.
 *
 * Real ACT Reading format:
 *   • 40 questions, 35 minutes
 *   • 4 passages × 10 questions each
 *   • Passage types (from groupTitle):
 *       Literary Narrative / Literary Nonfiction
 *       Social Science
 *       Humanities
 *       Natural Science
 *   • Questions test: Main idea, detail, inference,
 *     vocabulary in context, function, comparison
 *   • All 4-option MCQ (A/B/C/D)
 *
 * Backend contract: format = "ACT_READING"
 *   contextText  — full passage (no [N] markers; questions reference "lines X–Y")
 *   groupTitle   — passage type / title
 *   questionText — question prompt
 *
 * Reuses: PassageSplitBase, buildGroups, TestsApi.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate }     from "react-router-dom";
import { TestsApi }        from "../../api/index.js";
import LoadingScreen       from "../../components/common/LoadingScreen.jsx";
import PassageSplitBase    from "../../components/test/PassageSplitBase.jsx";
import { buildGroups }     from "../../utils/buildGroups.js";

const BRAND = "#0a5f6e";
const SERIF = "Newsreader, Georgia, serif";

// ── Passage type → accent color ───────────────────────────────────────────────

const PASSAGE_TYPE_COLORS = {
  "literary":  { bg: "#fef3c7", border: "#fcd34d", text: "#92400e" },
  "social":    { bg: "#ede9fe", border: "#c4b5fd", text: "#5b21b6" },
  "humanit":   { bg: "#fce7f3", border: "#f9a8d4", text: "#9d174d" },
  "natural":   { bg: "#e0f2fe", border: "#7dd3fc", text: "#0c4a6e" },
  "default":   { bg: "#e8f7f9", border: "rgba(10,95,110,0.3)", text: BRAND },
};

const getPassageColor = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("liter")) return PASSAGE_TYPE_COLORS.literary;
  if (t.includes("social")) return PASSAGE_TYPE_COLORS.social;
  if (t.includes("human")) return PASSAGE_TYPE_COLORS.humanit;
  if (t.includes("natural") || t.includes("science")) return PASSAGE_TYPE_COLORS.natural;
  return PASSAGE_TYPE_COLORS.default;
};

// ── Passage body renderer ─────────────────────────────────────────────────────

const PassageBody = ({ group }) => {
  if (!group?.contextText) return (
    <p style={{ fontFamily: SERIF, fontSize: 14, color: "#94A3B8",
      fontStyle: "italic", textAlign: "center", padding: "60px 0" }}>
      Passage not available.
    </p>
  );

  return (
    <div style={{
      fontFamily: SERIF, fontSize: 15, lineHeight: 1.9,
      color: "#1E293B", whiteSpace: "pre-wrap",
    }}>
      {group.contextText}
    </div>
  );
};

// ── Left panel header ─────────────────────────────────────────────────────────

const LeftHeader = ({ group, groupIndex, totalGroups }) => {
  const colors = getPassageColor(group?.groupTitle);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{
        fontFamily: SERIF, fontSize: 11, fontWeight: 700,
        color: BRAND, letterSpacing: "0.12em", textTransform: "uppercase",
      }}>
        Passage {groupIndex + 1} of {totalGroups}
      </span>
      {group?.groupTitle && (
        <span style={{
          background: colors.bg, border: `1px solid ${colors.border}`,
          borderRadius: 999, padding: "3px 10px",
          fontFamily: SERIF, fontSize: 11, fontWeight: 700, color: colors.text,
        }}>
          {group.groupTitle}
        </span>
      )}
    </div>
  );
};

// ── Right panel header ────────────────────────────────────────────────────────

const RightHeader = ({ group, groupIndex, allGroups }) => {
  let start = 1;
  for (let i = 0; i < groupIndex; i++) start += allGroups[i].questions.length;
  const end = start + (group?.questions.length ?? 0) - 1;

  return (
    <div>
      <p style={{
        fontFamily: SERIF, fontSize: 10, fontWeight: 700,
        color: "#94A3B8", letterSpacing: "0.14em",
        textTransform: "uppercase", margin: "0 0 4px",
      }}>
        ACT Reading
      </p>
      <span style={{ fontFamily: SERIF, fontSize: 11, color: "#64748B" }}>
        Questions {start}–{end}
      </span>
    </div>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const ACTReadingTest = ({ session }) => {
  const navigate = useNavigate();
  const testId   = session.testId;

  const [groups,     setGroups]     = useState([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [answers,    setAnswers]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const currentGroup = groups[groupIndex];
  const isLastGroup  = groupIndex === groups.length - 1;

  const onAnswer = useCallback((quizId, letter) => {
    setAnswers(prev => ({ ...prev, [quizId]: letter }));
  }, []);

  const saveGroup = useCallback(async () => {
    if (!currentGroup) return;
    const pending = currentGroup.questions.filter(q => answers[q.quizId]);
    for (const q of pending)
      await TestsApi.submitAnswer(testId, q.quizId, answers[q.quizId]);
  }, [currentGroup, answers, testId]);

  const handleNext = async () => {
    await saveGroup();
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
      await saveGroup();
      navigate("/feedback", { state: { testId }, replace: true });
    } catch { setSubmitting(false); }
  };

  if (loading) return <LoadingScreen />;

  if (!currentGroup) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center" }}>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: "#64748B" }}>
        No questions available.
      </p>
    </div>
  );

  return (
    <PassageSplitBase
      session={session}
      topBarLabel="ACT Reading"
      groups={groups}
      groupIndex={groupIndex}
      answers={answers}
      submitting={submitting}
      isLastGroup={isLastGroup}
      onAnswer={onAnswer}
      onNext={handleNext}
      onPrev={handlePrev}
      onSubmit={handleSubmit}
      nextLabel="Next passage"
      renderLeftHeader={(g, gi, total) => (
        <LeftHeader group={g} groupIndex={gi} totalGroups={total} />
      )}
      renderPassage={g => <PassageBody group={g} />}
      renderRightHeader={(g, gi) => (
        <RightHeader group={g} groupIndex={gi} allGroups={groups} />
      )}
    />
  );
};

export default ACTReadingTest;
