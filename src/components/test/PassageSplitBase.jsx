/**
 * PassageSplitBase — reusable split-screen shell for passage-based MCQ tests.
 *
 * Used by: ACTReadingTest, ACTScienceTest (and could replace ReadingTest internals).
 *
 * Props:
 *   session           TestSessionDTO
 *   topBarLabel       string          e.g. "ACT Reading"
 *   groups            group[]
 *   groupIndex        number
 *   answers           { quizId: letter }
 *   submitting        bool
 *   isLastGroup       bool
 *   onAnswer          (quizId, letter) => void
 *   onNext            () => Promise<void>
 *   onPrev            () => void
 *   onSubmit          () => Promise<void>
 *   nextLabel         string          e.g. "Next passage"
 *   renderLeftHeader  (group, gi, total) => ReactNode   — header inside left panel
 *   renderPassage     (group)          => ReactNode     — passage body (left panel)
 *   renderRightHeader (group, gi, total, answered, total) => ReactNode  — right panel header
 */

import { useState, useEffect }  from "react";
import { useNavigate }          from "react-router-dom";
import TestTopBar               from "./TestTopBar.jsx";
import MCQQuestionCard          from "./MCQQuestionCard.jsx";
import TestNavBar               from "./TestNavBar.jsx";

const BRAND = "#0a5f6e";
const SERIF = "Newsreader, Georgia, serif";

const MobileTabs = ({ active, onChange }) => (
  <div style={{ display: "flex", borderBottom: "1px solid #E2EBF0",
    background: "#fff", flexShrink: 0 }}>
    {[["passage", "Passage"], ["questions", "Questions"]].map(([k, l]) => (
      <button key={k} onClick={() => onChange(k)}
        style={{
          flex: 1, padding: "12px 0", border: "none", background: "none",
          cursor: "pointer", fontFamily: SERIF, fontSize: 13, fontWeight: 700,
          color: active === k ? BRAND : "#94A3B8",
          borderBottom: `2px solid ${active === k ? BRAND : "transparent"}`,
          transition: "color 0.15s",
        }}>
        {l}
      </button>
    ))}
  </div>
);

const PassageSplitBase = ({
  session,
  topBarLabel,
  groups,
  groupIndex,
  answers,
  submitting,
  isLastGroup,
  onAnswer,
  onNext,
  onPrev,
  onSubmit,
  nextLabel      = "Next passage",
  renderLeftHeader,
  renderPassage,
  renderRightHeader,
}) => {
  const navigate  = useNavigate();
  const [activeTab, setActiveTab] = useState("passage");
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => { setActiveTab("passage"); }, [groupIndex]);

  const currentGroup    = groups[groupIndex];
  const totalGroups     = groups.length;
  const answeredInGroup = currentGroup
    ? currentGroup.questions.filter(q => answers[q.quizId]).length
    : 0;
  const totalInGroup = currentGroup?.questions.length ?? 0;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column",
      background: "#F8FAFC", overflow: "hidden" }}>
      <style>{`
        @keyframes psbSlide {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <TestTopBar
        paperName={topBarLabel}
        groupLabel={`Passage ${groupIndex + 1} of ${totalGroups}`}
        remainingSeconds={session.remainingSeconds}
        onLeave={() => navigate("/courses")}
      />

      {isMobile && <MobileTabs active={activeTab} onChange={setActiveTab} />}

      <div style={{ flex: 1, display: "flex", overflow: "hidden",
        flexDirection: isMobile ? "column" : "row" }}>

        {/* LEFT — passage */}
        {(!isMobile || activeTab === "passage") && (
          <div style={{
            width: isMobile ? "100%" : "48%",
            flex: isMobile ? 1 : "0 0 48%",
            display: "flex", flexDirection: "column",
            background: "#FAF9F6",
            borderRight: "1px solid #E2EBF0",
            overflow: "hidden",
          }}>
            {/* Left header */}
            <div style={{
              padding: "14px 24px 12px", background: "#fff",
              borderBottom: "1px solid #E2EBF0", flexShrink: 0,
            }}>
              {renderLeftHeader?.(currentGroup, groupIndex, totalGroups)}
            </div>
            {/* Scrollable passage */}
            <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
              {renderPassage?.(currentGroup)}
            </div>
          </div>
        )}

        {/* RIGHT — questions */}
        {(!isMobile || activeTab === "questions") && (
          <div style={{ flex: 1, overflowY: "auto", background: "#fff" }}>
            <div style={{ padding: "28px 36px 48px", maxWidth: 640 }}>

              {/* Right header */}
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 24,
              }}>
                <div>
                  {renderRightHeader?.(currentGroup, groupIndex, totalGroups)}
                </div>
                {/* Answered pill */}
                <div style={{
                  background: answeredInGroup === totalInGroup ? "#f0fdf4" : "#F8FAFC",
                  border: `1px solid ${answeredInGroup === totalInGroup ? "#86efac" : "#E2EBF0"}`,
                  borderRadius: 999, padding: "4px 14px", transition: "all 0.3s",
                }}>
                  <span style={{
                    fontFamily: SERIF, fontSize: 12, fontWeight: 700,
                    color: answeredInGroup === totalInGroup ? "#15803d" : "#64748B",
                  }}>
                    {answeredInGroup}/{totalInGroup} answered
                  </span>
                </div>
              </div>

              {/* Question cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {currentGroup?.questions.map((q, i) => (
                  <div key={q.quizId}
                    style={{ animation: `psbSlide 0.3s ease ${i * 40}ms both` }}>
                    <MCQQuestionCard
                      q={q}
                      index={i}
                      selected={answers[q.quizId] ?? null}
                      onSelect={onAnswer}
                    />
                  </div>
                ))}
              </div>

              <TestNavBar
                onPrev={onPrev}
                onNext={onNext}
                onSubmit={onSubmit}
                canPrev={groupIndex > 0}
                isLast={isLastGroup}
                submitting={submitting}
                nextLabel={nextLabel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassageSplitBase;
