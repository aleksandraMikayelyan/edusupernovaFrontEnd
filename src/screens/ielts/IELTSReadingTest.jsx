/**
 * IELTSReadingTest.jsx — IELTS Reading section.
 *
 * 3 long passages, ~40 questions total. Supports three question types:
 *   MULTIPLE_CHOICE (MCQ)      → standard A/B/C/D buttons
 *   TRUE_FALSE_NG              → True / False / Not Given 3-button selector
 *   SHORT_ANSWER / COMPLETION  → text input (max 3 words in real IELTS)
 *
 * Layout:
 *   Desktop: split screen — passage left (48%) | questions right
 *   Mobile (<768px): two tabs "Passage" | "Questions"
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate }    from "react-router-dom";
import { BookOpen }       from "@phosphor-icons/react";
import { TestsApi }       from "../../api/index.js";
import LoadingScreen      from "../../components/common/LoadingScreen.jsx";
import TestTopBar         from "../../components/test/TestTopBar.jsx";
import ContextPanel       from "../../components/test/ContextPanel.jsx";
import MCQQuestionCard    from "../../components/test/MCQQuestionCard.jsx";
import TestNavBar         from "../../components/test/TestNavBar.jsx";
import { buildGroups }    from "../../utils/buildGroups.js";

const BRAND = "#0a5f6e";
const SERIF = "Newsreader, Georgia, serif";

// ── Mobile tabs ───────────────────────────────────────────────────────────────

const MobileTabs = ({ activeTab, onChange }) => (
  <div style={{ display: "flex", borderBottom: "1px solid #E2EBF0",
    background: "#fff", flexShrink: 0 }}>
    {[["passage", "Passage"], ["questions", "Questions"]].map(([key, label]) => (
      <button key={key} onClick={() => onChange(key)} style={{
        flex: 1, padding: "12px 0", border: "none", background: "none",
        cursor: "pointer", fontFamily: SERIF, fontSize: 13, fontWeight: 700,
        color: activeTab === key ? BRAND : "#94A3B8",
        borderBottom: `2px solid ${activeTab === key ? BRAND : "transparent"}`,
        transition: "color 0.15s",
      }}>
        {label}
      </button>
    ))}
  </div>
);

// ── True / False / Not Given selector ────────────────────────────────────────

const TFNGCard = ({ q, index, selected, onSelect }) => {
  const options = [
    { label: "True",      value: "T"  },
    { label: "False",     value: "F"  },
    { label: "Not Given", value: "NG" },
  ];

  return (
    <div style={{
      background: "#fff", border: "1px solid #E8F0F4",
      borderRadius: 16, padding: "20px 24px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      animation: `ieltsRdFade 0.3s ${index * 40}ms ease both`,
    }}>
      <style>{`@keyframes ieltsRdFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start" }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 2,
          background: "#e8f7f9", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 700, color: BRAND }}>
            {q.questionNumber ?? index + 1}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 700,
            color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.12em",
            margin: "0 0 6px" }}>
            True / False / Not Given
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.65,
            color: "#0F172A", margin: 0 }}>
            {q.questionText}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingLeft: 40 }}>
        {options.map(opt => {
          const isSelected = selected === opt.value;
          return (
            <button key={opt.value} onClick={() => onSelect(q.quizId, opt.value)} style={{
              padding: "10px 20px", borderRadius: 10,
              border: `2px solid ${isSelected ? BRAND : "#E2EBF0"}`,
              background: isSelected ? "#e8f7f9" : "#FAFBFC",
              fontFamily: SERIF, fontSize: 14,
              fontWeight: isSelected ? 700 : 400,
              color: isSelected ? BRAND : "#374151",
              cursor: "pointer", transition: "all 0.18s",
            }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "#CBD5E1";
                  e.currentTarget.style.background = "#F1F5F9";
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "#E2EBF0";
                  e.currentTarget.style.background = "#FAFBFC";
                }
              }}>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Sentence / Summary completion input ───────────────────────────────────────

const CompletionCard = ({ q, index, value, onChange }) => (
  <div style={{
    background: "#fff", border: "1px solid #E8F0F4",
    borderRadius: 16, padding: "20px 24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    animation: `ieltsRdFade 0.3s ${index * 40}ms ease both`,
  }}>
    <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 2,
        background: "#e8f7f9", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 700, color: BRAND }}>
          {q.questionNumber ?? index + 1}
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 700,
          color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.12em",
          margin: "0 0 6px" }}>
          Short Answer
        </p>
        <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.65,
          color: "#0F172A", margin: 0 }}>
          {q.questionText}
        </p>
      </div>
    </div>
    <div style={{ paddingLeft: 40 }}>
      <input
        value={value ?? ""}
        onChange={e => onChange(q.quizId, e.target.value)}
        placeholder="Write your answer (max 3 words)…"
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "11px 14px", borderRadius: 10,
          border: `2px solid ${value ? BRAND : "#E2EBF0"}`,
          fontFamily: SERIF, fontSize: 14, color: "#0F172A",
          background: value ? "#f0faf7" : "#FAFBFC",
          outline: "none", transition: "border 0.18s, background 0.18s",
        }}
        onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.background = "#f0faf7"; }}
        onBlur={e => {
          if (!value) {
            e.target.style.borderColor = "#E2EBF0";
            e.target.style.background = "#FAFBFC";
          }
        }}
      />
    </div>
  </div>
);

// ── Question type router ──────────────────────────────────────────────────────

const QuestionRenderer = ({ q, index, selected, onSelect }) => {
  const qType = q.type?.toUpperCase();

  if (qType === "TRUE_FALSE_NG" || qType === "TRUE_FALSE_NOT_GIVEN" || qType === "TFNG") {
    return <TFNGCard q={q} index={index} selected={selected} onSelect={onSelect} />;
  }

  if (
    qType === "SHORT_ANSWER"         ||
    qType === "COMPLETION"           ||
    qType === "SENTENCE_COMPLETION"  ||
    qType === "SUMMARY_COMPLETION"   ||
    qType === "NOTE_COMPLETION"
  ) {
    return <CompletionCard q={q} index={index} value={selected ?? ""} onChange={onSelect} />;
  }

  return (
    <MCQQuestionCard
      q={q} index={index}
      selected={selected ?? null}
      onSelect={onSelect}
      showLabel
    />
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const IELTSReadingTest = ({ session }) => {
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

  const setAnswer = useCallback((quizId, value) => {
    setAnswers(prev => ({ ...prev, [quizId]: value }));
  }, []);

const saveGroupAnswers = useCallback(async () => {
  if (!currentGroup) return;

  // Solo enviamos las preguntas que tienen una respuesta en el estado local
  const pending = currentGroup.questions.filter(q => answers[q.quizId]);

  try {
    // Usamos Promise.all para que sea más rápido que un for await
    await Promise.all(
      pending.map(q => 
        // USAR q.testId (si tu API lo devuelve) en lugar de testId de la sesión
        TestsApi.submitAnswer(q.testId || testId, q.quizId, answers[q.quizId])
      )
    );
  } catch (error) {
    console.error("Error al guardar respuestas:", error);
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

  // Count answered in current group for progress pill
  const answeredInGroup = currentGroup.questions.filter(q => answers[q.quizId]).length;
  const totalInGroup    = currentGroup.questions.length;

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
              flex: isMobile ? 1 : "0 0 48%",
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
              display: "flex", flexDirection: "column",
            }}>

              {/* Section badge + progress */}
              <div style={{ display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#e8f7f9", borderRadius: 999, padding: "4px 12px",
                  border: "1px solid rgba(10,95,110,0.15)",
                }}>
                  <BookOpen size={11} color={BRAND} weight="fill" />
                  <span style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 700,
                    color: BRAND, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    IELTS Reading — {groupLabel}
                  </span>
                </div>

                <div style={{
                  background: answeredInGroup === totalInGroup ? "#f0fdf4" : "#F1F5F9",
                  borderRadius: 999, padding: "4px 12px",
                  border: `1px solid ${answeredInGroup === totalInGroup ? "#86efac" : "#E2EBF0"}`,
                }}>
                  <span style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 700,
                    color: answeredInGroup === totalInGroup ? "#15803d" : "#64748B" }}>
                    {answeredInGroup} / {totalInGroup} answered
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {currentGroup.questions.map((q, i) => (
                  <QuestionRenderer
                    key={q.quizId}
                    q={q}
                    index={i}
                    selected={answers[q.quizId] ?? null}
                    onSelect={setAnswer}
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

export default IELTSReadingTest;
