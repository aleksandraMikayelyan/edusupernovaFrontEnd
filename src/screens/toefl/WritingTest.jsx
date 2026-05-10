/**
 * WritingTest.jsx — TOEFL Writing section.
 *
 * Handles three task types, detected from q.type:
 *   SHORT_ANSWER  → Build a Sentence  (text input + word chips)
 *   ESSAY + group → Academic Discussion (split: context left | textarea right)
 *   ESSAY + no group → Write an Email  (full-width textarea)
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CaretLeft, CaretRight, PaperPlane } from "@phosphor-icons/react";
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

// Extract word tokens from "Words: word1 / word2 / …" in question text
const extractTokens = (text) => {
  const m = text.match(/Words:\s*(.+?)(?:\.\s*Start|$)/is);
  if (!m) return [];
  return m[1].split("/").map(w => w.trim()).filter(Boolean);
};

const wordCount = (text) =>
  text?.trim() ? text.trim().split(/\s+/).length : 0;

// ── Subcomponents ─────────────────────────────────────────────────────────────

const WordChips = ({ tokens }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
    {tokens.map((w, i) => (
      <span key={i} style={{
        fontFamily: SERIF, fontSize: 13, color: BRAND,
        background: "#e8f7f9", border: "1px solid rgba(10,95,110,0.2)",
        borderRadius: 8, padding: "3px 10px",
      }}>
        {w}
      </span>
    ))}
  </div>
);

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
      onMouseEnter={e => { if (!disabled && isPrimary) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.background = "#3aab87"; } }}
      onMouseLeave={e => { if (!disabled && isPrimary) { e.currentTarget.style.transform = "none"; e.currentTarget.style.background = MINT; } }}>
      {children}
    </button>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const WritingTest = ({ session }) => {
  const navigate = useNavigate();
  const testId   = session.testId;

  const [groups,     setGroups]     = useState([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [answers,    setAnswers]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab,  setActiveTab]  = useState("context");
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

  useEffect(() => { setActiveTab("context"); }, [groupIndex]);

  const currentGroup = groups[groupIndex];
  const totalGroups  = groups.length;
  const isLastGroup  = groupIndex === totalGroups - 1;
  const hasContext   = !!(currentGroup?.contextText || currentGroup?.contextImageUrl);

  const setAnswer = useCallback((quizId, text) => {
    setAnswers(prev => ({ ...prev, [quizId]: text }));
  }, []);

  const saveGroupAnswers = useCallback(async () => {
    if (!currentGroup) return;
    for (const q of currentGroup.questions) {
      const answer = answers[q.quizId] ?? "";
      await TestsApi.submitAnswer(testId, q.quizId, answer);
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
      await Promise.all(
        groups.flatMap(group =>
          group.questions.map(q =>
            TestsApi.submitAnswer(testId, q.quizId, answers[q.quizId] ?? "")
          )
        )
      );
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
        No questions available for this section.
      </p>
    </div>
  );

  const firstQ       = currentGroup.questions[0];
  const qType        = firstQ?.type?.toUpperCase();
  const isShortAnswer = qType === "SHORT_ANSWER";

  const sectionLabel = isShortAnswer
    ? "Build a Sentence"
    : hasContext
      ? "Academic Discussion"
      : "Write an Email";

  const groupLabel = `${sectionLabel} — Question ${groupIndex + 1} of ${totalGroups}`;

  const MobileTabs = () => (
    <div style={{ display: "flex", borderBottom: "1px solid #E2EBF0",
      background: "#fff", flexShrink: 0 }}>
      {["context", "write"].map(tab => (
        <button key={tab} onClick={() => setActiveTab(tab)} style={{
          flex: 1, padding: "12px 0", border: "none",
          background: "none", cursor: "pointer",
          fontFamily: SERIF, fontSize: 13, fontWeight: 700,
          color: activeTab === tab ? BRAND : "#94A3B8",
          borderBottom: `2px solid ${activeTab === tab ? BRAND : "transparent"}`,
          transition: "color 0.15s",
        }}>
          {tab === "context" ? "Discussion" : "Write"}
        </button>
      ))}
    </div>
  );

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

        {/* Left: Discussion context panel */}
        {hasContext && (!isMobile || activeTab === "context") && (
          <ContextPanel
            title={currentGroup.groupTitle ?? "Discussion Prompt"}
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
              display: "flex", flexDirection: "column", gap: 0,
            }}>
              <p style={{
                fontFamily: SERIF, fontSize: 10, fontWeight: 700,
                color: "#94A3B8", letterSpacing: "0.14em",
                textTransform: "uppercase", marginBottom: 24,
              }}>
                {groupLabel}
              </p>

              {currentGroup.questions.map(q => {
                const tokens = isShortAnswer ? extractTokens(q.questionText) : [];
                const val    = answers[q.quizId] ?? "";
                const wc     = wordCount(val);
                const target = isShortAnswer ? null : 100;

                return (
                  <div key={q.quizId} style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
                    <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.7, color: "#0F172A", margin: 0 }}>
                      {q.questionText}
                      {q.marks && (
                        <span style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
                          color: "#94A3B8", marginLeft: 8 }}>
                          [{q.marks} mark{q.marks !== 1 ? "s" : ""}]
                        </span>
                      )}
                    </p>

                    {isShortAnswer && tokens.length > 0 && <WordChips tokens={tokens} />}

                    {isShortAnswer ? (
                      <input
                        value={val}
                        onChange={e => setAnswer(q.quizId, e.target.value)}
                        placeholder="Type your sentence here…"
                        style={{
                          width: "100%", boxSizing: "border-box",
                          padding: "14px 16px", borderRadius: 12,
                          border: `2px solid ${val ? BRAND : "#E2EBF0"}`,
                          fontFamily: SERIF, fontSize: 15, color: "#0F172A",
                          background: val ? "#f0faf7" : "#FAFBFC",
                          outline: "none", transition: "border 0.18s, background 0.18s",
                        }}
                        onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.background = "#f0faf7"; }}
                        onBlur={e => { if (!val) { e.target.style.borderColor = "#E2EBF0"; e.target.style.background = "#FAFBFC"; } }}
                      />
                    ) : (
                      <div style={{ position: "relative" }}>
                        <textarea
                          value={val}
                          onChange={e => setAnswer(q.quizId, e.target.value)}
                          placeholder={hasContext
                            ? "Write your response here. Aim for at least 100 words…"
                            : "Write your email here. Aim for 100–150 words…"}
                          rows={hasContext ? 13 : 16}
                          style={{
                            width: "100%", boxSizing: "border-box",
                            padding: "14px 16px 36px", borderRadius: 12,
                            border: `2px solid ${val ? BRAND : "#E2EBF0"}`,
                            fontFamily: SERIF, fontSize: 15, lineHeight: 1.75,
                            color: "#0F172A", background: val ? "#f0faf7" : "#FAFBFC",
                            outline: "none", resize: "vertical",
                            transition: "border 0.18s, background 0.18s",
                          }}
                          onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.background = "#f0faf7"; }}
                          onBlur={e => { if (!val) { e.target.style.borderColor = "#E2EBF0"; e.target.style.background = "#FAFBFC"; } }}
                        />
                        <span style={{
                          position: "absolute", bottom: 12, right: 14,
                          fontFamily: SERIF, fontSize: 11, fontWeight: 700,
                          color: target && wc >= target ? MINT : wc > 0 ? "#94A3B8" : "#CBD5E1",
                          pointerEvents: "none",
                        }}>
                          {wc} {target ? `/ ${target}+ words` : "words"}
                        </span>
                      </div>
                    )}
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
                  <CaretLeft size={15} weight="bold" /> Previous
                </NavBtn>
                {isLastGroup ? (
                  <NavBtn onClick={handleSubmit} disabled={submitting} variant="primary">
                    <PaperPlane size={15} weight="bold" />
                    {submitting ? "Submitting…" : "Submit test"}
                  </NavBtn>
                ) : (
                  <NavBtn onClick={handleNext} variant="primary">
                    Next <CaretRight size={15} weight="bold" />
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

export default WritingTest;
