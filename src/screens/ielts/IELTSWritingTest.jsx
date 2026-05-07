/**
 * IELTSWritingTest.jsx — IELTS Writing section.
 *
 * Two tasks presented as separate groups:
 *   Task 1 (150+ words, ~20 min): Academic → describe chart/graph/diagram/map
 *                                  General  → write a formal/informal letter
 *   Task 2 (250+ words, ~40 min): Essay — opinion, discussion, advantages/
 *                                           disadvantages, causes/solutions,
 *                                           or two-part question
 *
 * Task number is detected from groupTitle containing "Task 1" / "Task 2".
 * Fallback: groupIndex 0 = Task 1, groupIndex 1+ = Task 2.
 *
 * Task 2 counts twice as much as Task 1 in the final Writing band score.
 * Both tasks assessed on: Task Achievement, Coherence & Cohesion,
 * Lexical Resource, Grammatical Range & Accuracy.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CaretLeft, CaretRight, PaperPlane, Clock } from "@phosphor-icons/react";
import { TestsApi }  from "../../api/index.js";
import LoadingScreen from "../../components/common/LoadingScreen.jsx";
import TestTopBar    from "../../components/test/TestTopBar.jsx";
import ContextPanel  from "../../components/test/ContextPanel.jsx";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif";

// ── Helpers ───────────────────────────────────────────────────────────────────

const buildGroups = (questions) => {
  const map = new Map();
  questions.forEach(q => {
    const key = q.groupId ?? `standalone_${q.quizId}`;
    if (!map.has(key)) {
      map.set(key, {
        groupId: q.groupId,
        groupTitle: q.groupTitle,
        contextText: q.contextText,
        contextImageUrl: q.contextImageUrl,
        minQuestionNumber: q.questionNumber ?? 9999,
        questions: [],
      });
    }
    const g = map.get(key);
    if ((q.questionNumber ?? 9999) < g.minQuestionNumber)
      g.minQuestionNumber = q.questionNumber ?? 9999;
    g.questions.push(q);
  });
  map.forEach(g => {
    g.questions.sort((a, b) => (a.groupOrderIndex ?? 0) - (b.groupOrderIndex ?? 0));
  });
  return [...map.values()].sort((a, b) => a.minQuestionNumber - b.minQuestionNumber);
};

const wordCount = (text) =>
  text?.trim() ? text.trim().split(/\s+/).length : 0;

// Returns 1 or 2 based on groupTitle; falls back to groupIndex
const detectTaskNumber = (group, groupIndex) => {
  const title = (group.groupTitle ?? "").toLowerCase();
  if (title.includes("task 1") || title.includes("task1")) return 1;
  if (title.includes("task 2") || title.includes("task2")) return 2;
  return groupIndex === 0 ? 1 : 2;
};

// Word count colour: gray → amber → mint
const wcColor = (count, target) => {
  if (count === 0) return "#CBD5E1";
  if (count >= target) return MINT;
  if (count >= target * 0.75) return "#F59E0B";
  return "#94A3B8";
};

// ── Nav button ────────────────────────────────────────────────────────────────

const NavBtn = ({ onClick, disabled, variant = "secondary", children }) => {
  const isPrimary = variant === "primary";
  return (
    <button onClick={onClick} disabled={disabled} style={{
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

// ── Task info banner ──────────────────────────────────────────────────────────

const TaskBanner = ({ taskNum }) => {
  const isTask1 = taskNum === 1;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      background: isTask1 ? "#f0fdf4" : "#faf5ff",
      border: `1px solid ${isTask1 ? "#86efac" : "#d8b4fe"}`,
      borderRadius: 14, padding: "14px 20px", marginBottom: 24,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: isTask1 ? "#dcfce7" : "#ede9fe",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 800,
          color: isTask1 ? "#15803d" : "#7c3aed" }}>
          {taskNum}
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700,
          color: isTask1 ? "#15803d" : "#7c3aed", margin: "0 0 2px" }}>
          Task {taskNum} — {isTask1 ? "Report / Letter" : "Essay"}
        </p>
        <p style={{ fontFamily: SERIF, fontSize: 12, color: "#64748B", margin: 0 }}>
          Minimum {isTask1 ? "150" : "250"} words ·&nbsp;
          Contributes {isTask1 ? "33%" : "67%"} of Writing score
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5,
        background: "#fff", borderRadius: 8, padding: "6px 10px",
        border: "1px solid #E2EBF0" }}>
        <Clock size={12} color="#94A3B8" weight="bold" />
        <span style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 700,
          color: "#64748B" }}>
          ~{isTask1 ? "20" : "40"} min
        </span>
      </div>
    </div>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const IELTSWritingTest = ({ session }) => {
  const navigate = useNavigate();
  const testId   = session.testId;

  const [groups,     setGroups]     = useState([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [answers,    setAnswers]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab,  setActiveTab]  = useState("task");
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

  useEffect(() => { setActiveTab("task"); }, [groupIndex]);

  const currentGroup = groups[groupIndex];
  const totalGroups  = groups.length;
  const isLastGroup  = groupIndex === totalGroups - 1;
  const hasContext   = !!(currentGroup?.contextText || currentGroup?.contextImageUrl);

  const setAnswer = useCallback((quizId, text) => {
    setAnswers(prev => ({ ...prev, [quizId]: text }));
  }, []);

const saveGroupAnswers = useCallback(async () => {
  if (!currentGroup) return;
  
  // Usamos Promise.all para evitar bloqueos en el loop y mejorar performance
  try {
    await Promise.all(
      currentGroup.questions.map(q => {
        const answer = answers[q.quizId] ?? "";
        // Intentar usar q.testId si la API lo provee, de lo contrario testId del prop
        return TestsApi.submitAnswer(q.testId || testId, q.quizId, answer);
      })
    );
  } catch (error) {
    console.error("Error saving writing answers:", error);
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

  const taskNum    = detectTaskNumber(currentGroup, groupIndex);
  const minWords   = taskNum === 1 ? 150 : 250;
  const groupLabel = `Task ${taskNum} of ${totalGroups}`;

  const MobileTabs = () => (
    <div style={{ display: "flex", borderBottom: "1px solid #E2EBF0",
      background: "#fff", flexShrink: 0 }}>
      {["task", "write"].map(tab => (
        <button key={tab} onClick={() => setActiveTab(tab)} style={{
          flex: 1, padding: "12px 0", border: "none", background: "none",
          cursor: "pointer", fontFamily: SERIF, fontSize: 13, fontWeight: 700,
          color: activeTab === tab ? BRAND : "#94A3B8",
          borderBottom: `2px solid ${activeTab === tab ? BRAND : "transparent"}`,
          transition: "color 0.15s",
        }}>
          {tab === "task" ? "Task" : "Write"}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column",
      background: "#F8FAFC", overflow: "hidden" }}>

      <TestTopBar
        paperName={session.paperName}
        groupLabel={`IELTS Writing — ${groupLabel}`}
        remainingSeconds={session.remainingSeconds}
        onLeave={() => navigate("/courses")}
      />

      {isMobile && hasContext && <MobileTabs />}

      <div style={{ flex: 1, display: "flex", overflow: "hidden",
        flexDirection: isMobile ? "column" : "row" }}>

        {/* Left: Task prompt / context panel */}
        {hasContext && (!isMobile || activeTab === "task") && (
          <ContextPanel
            title={currentGroup.groupTitle ?? `Task ${taskNum} Prompt`}
            contextText={currentGroup.contextText}
            contextImageUrl={currentGroup.contextImageUrl}
            style={{ width: isMobile ? "100%" : "46%", flex: isMobile ? 1 : "0 0 46%" }}
          />
        )}

        {/* Right: Writing area */}
        {(!isMobile || !hasContext || activeTab === "write") && (
          <div style={{ flex: 1, overflowY: "auto", background: "#fff",
            display: "flex", justifyContent: hasContext ? "flex-start" : "center" }}>
            <div style={{
              width: "100%", maxWidth: hasContext ? "none" : 820,
              padding: "32px 36px 40px",
              display: "flex", flexDirection: "column",
            }}>

              <TaskBanner taskNum={taskNum} />

              {currentGroup.questions.map(q => {
                const val = answers[q.quizId] ?? "";
                const wc  = wordCount(val);

                return (
                  <div key={q.quizId} style={{ display: "flex", flexDirection: "column",
                    gap: 16, marginBottom: 28 }}>

                    <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.75,
                      color: "#0F172A", margin: 0 }}>
                      {q.questionText}
                      {q.marks && (
                        <span style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
                          color: "#94A3B8", marginLeft: 8 }}>
                          [{q.marks} mark{q.marks !== 1 ? "s" : ""}]
                        </span>
                      )}
                    </p>

                    <div style={{ position: "relative" }}>
                      <textarea
                        value={val}
                        onChange={e => setAnswer(q.quizId, e.target.value)}
                        placeholder={
                          taskNum === 1
                            ? `Write your Task 1 response here. Aim for at least ${minWords} words…`
                            : `Write your essay here. Aim for at least ${minWords} words…`
                        }
                        rows={hasContext ? 16 : 20}
                        style={{
                          width: "100%", boxSizing: "border-box",
                          padding: "14px 16px 48px", borderRadius: 14,
                          border: `2px solid ${val ? BRAND : "#E2EBF0"}`,
                          fontFamily: SERIF, fontSize: 15, lineHeight: 1.8,
                          color: "#0F172A", background: val ? "#f0faf7" : "#FAFBFC",
                          outline: "none", resize: "vertical",
                          transition: "border 0.18s, background 0.18s",
                        }}
                        onFocus={e => {
                          e.target.style.borderColor = BRAND;
                          e.target.style.background = "#f0faf7";
                        }}
                        onBlur={e => {
                          if (!val) {
                            e.target.style.borderColor = "#E2EBF0";
                            e.target.style.background = "#FAFBFC";
                          }
                        }}
                      />

                      {/* Word count + target */}
                      <div style={{
                        position: "absolute", bottom: 14, right: 14,
                        display: "flex", alignItems: "center", gap: 8,
                        pointerEvents: "none",
                      }}>
                        <div style={{
                          height: 4, width: 80, borderRadius: 2, overflow: "hidden",
                          background: "#E2EBF0",
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${Math.min(100, (wc / minWords) * 100)}%`,
                            background: wcColor(wc, minWords),
                            transition: "width 0.3s, background 0.3s",
                            borderRadius: 2,
                          }} />
                        </div>
                        <span style={{
                          fontFamily: SERIF, fontSize: 11, fontWeight: 700,
                          color: wcColor(wc, minWords),
                        }}>
                          {wc} / {minWords}+ words
                        </span>
                      </div>
                    </div>

                    {/* Scoring criteria reminder */}
                    <p style={{ fontFamily: SERIF, fontSize: 11, color: "#94A3B8",
                      margin: 0, lineHeight: 1.6 }}>
                      Assessed on: Task Achievement · Coherence &amp; Cohesion ·
                      Lexical Resource · Grammatical Range &amp; Accuracy
                    </p>
                  </div>
                );
              })}

              {/* Navigation */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginTop: 20,
                paddingTop: 24, borderTop: "1px solid #F1F5F9",
              }}>
                <NavBtn onClick={handlePrev} disabled={groupIndex === 0}>
                  <CaretLeft size={15} weight="bold" /> Previous task
                </NavBtn>
                {isLastGroup ? (
                  <NavBtn onClick={handleSubmit} disabled={submitting} variant="primary">
                    <PaperPlane size={15} weight="bold" />
                    {submitting ? "Submitting…" : "Submit test"}
                  </NavBtn>
                ) : (
                  <NavBtn onClick={handleNext} variant="primary">
                    Next task <CaretRight size={15} weight="bold" />
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

export default IELTSWritingTest;
