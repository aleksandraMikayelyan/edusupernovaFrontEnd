/**
 * ACTScienceTest.jsx — ACT Science section exam screen.
 *
 * Real ACT Science format:
 *   • 40 questions, 35 minutes
 *   • 6–7 passages (varying question counts)
 *   • Three passage types (identified by groupTitle):
 *       Data Representation  — charts, graphs, tables
 *       Research Summaries   — one or more experiment descriptions
 *       Conflicting Viewpoints — two scientists' differing theories
 *   • Questions test: data interpretation, experimental design,
 *     inference, extrapolation, comparison of models
 *   • All 4-option MCQ (A/B/C/D)
 *
 * Backend contract: format = "ACT_SCIENCE"
 *   contextText — experimental data, passage, or figure descriptions
 *   groupTitle  — "Data Representation", "Research Summaries", or "Conflicting Viewpoints"
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

// ── Passage type styling ──────────────────────────────────────────────────────

const SCIENCE_TYPES = {
  data:        { label: "Data Representation", icon: "📊",
                 bg: "#e0f2fe", border: "#7dd3fc", text: "#0c4a6e" },
  research:    { label: "Research Summaries",  icon: "🔬",
                 bg: "#f0fdf4", border: "#86efac", text: "#15803d" },
  conflict:    { label: "Conflicting Viewpoints", icon: "⚖️",
                 bg: "#fef3c7", border: "#fcd34d", text: "#92400e" },
  default:     { label: "ACT Science",         icon: "🧪",
                 bg: "#e8f7f9", border: "rgba(10,95,110,0.3)", text: BRAND },
};

const getScienceType = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("data") || t.includes("graph") || t.includes("table"))
    return SCIENCE_TYPES.data;
  if (t.includes("research") || t.includes("experiment") || t.includes("summar"))
    return SCIENCE_TYPES.research;
  if (t.includes("conflict") || t.includes("viewpoint") || t.includes("scientist"))
    return SCIENCE_TYPES.conflict;
  return SCIENCE_TYPES.default;
};

// ── Science passage renderer — pre-formatted for data/tables ─────────────────

const SciencePassage = ({ group }) => {
  if (!group?.contextText) return (
    <p style={{ fontFamily: SERIF, fontSize: 14, color: "#94A3B8",
      fontStyle: "italic", textAlign: "center", padding: "60px 0" }}>
      Data not available.
    </p>
  );

  const typeInfo = getScienceType(group.groupTitle);

  return (
    <div>
      {/* Science type badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        background: typeInfo.bg,
        border: `1px solid ${typeInfo.border}`,
        borderRadius: 10, padding: "5px 12px", marginBottom: 20,
      }}>
        <span style={{ fontSize: 13 }}>{typeInfo.icon}</span>
        <span style={{
          fontFamily: SERIF, fontSize: 11, fontWeight: 700,
          color: typeInfo.text, letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          {typeInfo.label}
        </span>
      </div>

      {/* Passage / data text — monospace-friendly for tables */}
      <div style={{
        fontFamily: SERIF, fontSize: 14, lineHeight: 1.85,
        color: "#1E293B", whiteSpace: "pre-wrap",
      }}>
        {group.contextText}
      </div>
    </div>
  );
};

// ── Left panel header ─────────────────────────────────────────────────────────

const LeftHeader = ({ group, groupIndex, totalGroups }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <span style={{
      fontFamily: SERIF, fontSize: 11, fontWeight: 700,
      color: BRAND, letterSpacing: "0.12em", textTransform: "uppercase",
    }}>
      Data Set {groupIndex + 1} of {totalGroups}
    </span>
    <span style={{
      background: "#e8f7f9", border: "1px solid rgba(10,95,110,0.3)",
      borderRadius: 999, padding: "3px 10px",
      fontFamily: SERIF, fontSize: 11, fontWeight: 700, color: BRAND,
    }}>
      ACT Science
    </span>
  </div>
);

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
        ACT Science
      </p>
      <span style={{ fontFamily: SERIF, fontSize: 11, color: "#64748B" }}>
        Questions {start}–{end}
      </span>
    </div>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const ACTScienceTest = ({ session }) => {
  const navigate = useNavigate();
  const testId   = session.testId;

  const [groups,     setGroups]     = useState([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [answers,    setAnswers]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    TestsApi.getQuestions(testId)
      .then(res => {
        if (cancelled) return;
        setGroups(buildGroups(res.data));
        const saved = {};
        res.data.forEach(q => { if (q.userResponse) saved[q.quizId] = q.userResponse; });
        setAnswers(saved);
      })
      .catch(err => { if (!cancelled) console.error("Could not load questions:", err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
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
      await TestsApi.submitAnswer(q.testId ?? testId, q.quizId, answers[q.quizId]);
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
      topBarLabel="ACT Science"
      groups={groups}
      groupIndex={groupIndex}
      answers={answers}
      submitting={submitting}
      isLastGroup={isLastGroup}
      onAnswer={onAnswer}
      onNext={handleNext}
      onPrev={handlePrev}
      onSubmit={handleSubmit}
      nextLabel="Next data set"
      renderLeftHeader={(g, gi, total) => (
        <LeftHeader group={g} groupIndex={gi} totalGroups={total} />
      )}
      renderPassage={g => <SciencePassage group={g} />}
      renderRightHeader={(g, gi) => (
        <RightHeader group={g} groupIndex={gi} allGroups={groups} />
      )}
    />
  );
};

export default ACTScienceTest;
