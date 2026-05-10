/**
 * Test.jsx — dispatcher + Paper 1 MCQ screen.
 *
 * On mount: calls POST /tests/start and reads session.paperFormat.
 *   DATA_RESPONSE → renders <DataResponseTest session={…} />
 *   ESSAY         → renders <EssayTest session={…} />
 *   everything else (MCQ, default) → MCQ flow below (unchanged)
 *
 * MCQ per-question flow (unchanged):
 *   POST /tests/start → TestSessionDTO (testId + first question)
 *   POST /tests/{testId}/answer → AnswerFeedbackDTO
 *   sessionComplete → navigate to /feedback with { testId }
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { WarningCircle, House, BookOpen, User, SignOut } from "@phosphor-icons/react";
import { TestsApi }          from "../../api/index.js";
import ProgressHeader        from "../../components/test/ProgressHeader.jsx";
import LoadingScreen         from "../../components/common/LoadingScreen.jsx";
import SaveIndicator         from "../../components/test/SaveIndicator.jsx";
import DataResponseTest      from "../alevel/DataResponseTest.jsx";
import EssayTest             from "../alevel/EssayTest.jsx";
import ReadingWritingTest    from "../alevel/ReadingWritingTest.jsx";
import MultiEssayTest        from "../alevel/MultiEssayTest.jsx";
import ReadingTest           from "../toefl/ReadingTest.jsx";
import ListeningTest         from "../toefl/ListeningTest.jsx";
import WritingTest           from "../toefl/WritingTest.jsx";
import SpeakingTest          from "../toefl/SpeakingTest.jsx";
import ACTEnglishTest        from "../act/ACTEnglishTest.jsx";
import ACTReadingTest        from "../act/ACTReadingTest.jsx";
import ACTScienceTest        from "../act/ACTScienceTest.jsx";
import ACTMathTest           from "../act/ACTMathTest.jsx";
import SATReadingTest        from "../sat/SATReadingTest.jsx";
import SATMathTest           from "../sat/SATMathTest.jsx";
import IELTSListeningTest    from "../ielts/IELTSListeningTest.jsx";
import IELTSReadingTest      from "../ielts/IELTSReadingTest.jsx";
import IELTSWritingTest      from "../ielts/IELTSWritingTest.jsx";
import IELTSSpeakingTest     from "../ielts/IELTSSpeakingTest.jsx";
import useAutosave           from "../../hooks/useAutosave.js";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif";
const SCRIPT= "Cookie, cursive";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getOptions = (q) =>
  [q.optionA, q.optionB, q.optionC, q.optionD, q.optionE].filter(Boolean);

const getWordCount = (text) =>
  text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

const isFreeText = (type) =>
  ["ESSAY", "OPEN_ENDED", "NUMERIC_INPUT"].includes(type?.toUpperCase());

const typeLabel = (type) => {
  switch (type?.toUpperCase()) {
    case "ESSAY":
    case "OPEN_ENDED":     return "Essay";
    case "TRUE_FALSE_NG":  return "True / False / Not Given";
    case "NUMERIC_INPUT":  return "Numeric answer";
    default:               return "Multiple choice";
  }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const HamburgerBtn = ({ open, onClick }) => (
  <button onClick={onClick} aria-label={open ? "Close menu" : "Open menu"}
    style={{ width:38, height:38, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:5,
      background:"none", border:"none", cursor:"pointer", borderRadius:10,
      padding:4, transition:"background 0.15s" }}
    onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
    onMouseLeave={e => e.currentTarget.style.background = "none"}>
    {[
      { transform: open ? "translateY(6.5px) rotate(45deg)"   : "none" },
      { opacity:   open ? 0 : 1 },
      { transform: open ? "translateY(-6.5px) rotate(-45deg)" : "none" },
    ].map((s, i) => (
      <span key={i} style={{ display:"block", width:20, height:1.5,
        background: open ? BRAND : "#64748B", borderRadius:2,
        transition:"transform 0.25s ease, opacity 0.2s ease", ...s }} />
    ))}
  </button>
);

const DrawerItem = ({ Icon, label, onClick, danger = false }) => (
  <button onClick={onClick}
    style={{ width:"100%", display:"flex", alignItems:"center", gap:12,
      padding:"12px 16px", borderRadius:12, border:"none",
      background:"none", cursor:"pointer", textAlign:"left",
      fontFamily:SERIF, fontSize:14,
      color: danger ? "#b02020" : "#374151",
      transition:"background 0.12s" }}
    onMouseEnter={e => e.currentTarget.style.background = danger ? "#fff0f0" : "#F1F5F9"}
    onMouseLeave={e => e.currentTarget.style.background = "none"}>
    <Icon size={17} weight="light" color={danger ? "#b02020" : "#64748B"} />
    {label}
  </button>
);

const Spinner = ({ small, dark }) => (
  <div style={{
    width: small ? 16 : 40, height: small ? 16 : 40,
    borderRadius:"50%",
    border: dark
      ? "2px solid rgba(6,47,55,0.15)"
      : "2px solid rgba(255,255,255,0.3)",
    borderTopColor: dark ? DARK : "#fff",
    animation:"tspin 0.7s linear infinite",
  }} />
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const TestScreen = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { courseId, paperId = null, unitId = null, examType = null } = location.state || {};

  const [session,     setSession]     = useState(null);
  const [question,    setQuestion]    = useState(null);
  const [answered,    setAnswered]    = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [freeText,    setFreeText]    = useState("");
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [drawerOpen,  setDrawerOpen]  = useState(false);

  // Autosave for open-ended / essay questions in Paper 1.
  // Use question.testId so the save always targets the correct test session.
  const { saveState: autoSaveState, savedAt: autoSavedAt } = useAutosave(
    question?.testId ?? session?.testId,
    question?.quizId,
    freeText,
    2000
  );

  useEffect(() => {
    const h = e => { if (e.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (!courseId) { setError("No course selected."); setLoading(false); return; }
    TestsApi.start(courseId, paperId, unitId)
      .then(res => {
        const { currentQuestion, ...meta } = res.data;
        setSession(meta);
        setQuestion(currentQuestion);
      })
      .catch(err => setError(err.message ?? "Could not start the test."))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleSubmit = async () => {
    if (submitting || !question || !session) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const response = selectedOpt ?? freeText;
      // Use question.testId (from the DTO) to guarantee we submit to the correct
      // test session — session.testId can be stale if the component re-used state
      // from a previous test run.
      const effectiveTestId = question.testId ?? session.testId;
      const res = await TestsApi.submitAnswer(effectiveTestId, question.quizId, response);
      const feedback = res.data;
      if (feedback.sessionComplete) {
        navigate("/feedback", { state: { testId: effectiveTestId }, replace: true });
        return;
      }
      setQuestion(feedback.nextQuestion);
      setAnswered(prev => prev + 1);
      setSelectedOpt(null);
      setFreeText("");
    } catch (err) {
      setSubmitError(err.message ?? "Could not submit. Please try again.");
    } finally { setSubmitting(false); }
  };

  const confirmLeave = (dest) => {
    setDrawerOpen(false);
    if (window.confirm("Leave the test? Your progress will be lost.")) navigate(dest);
  };

  // ── Loading / error states ─────────────────────────────────────────────────

  if (loading) return <LoadingScreen />;

  // ── Format-based dispatch ─────────────────────────────────────────────────
  if (session) {
    const fmt  = session.paperFormat?.toUpperCase();
    const exam = (examType ?? session.examType ?? "").toUpperCase().replace(/[\s_-]/g, "");

    // Future-proof: if backend ever adds ACT/SAT-specific format values
    if (fmt === "ACT_ENGLISH")     return <ACTEnglishTest    session={session} />;
    if (fmt === "ACT_READING")     return <ACTReadingTest    session={session} />;
    if (fmt === "ACT_SCIENCE")     return <ACTScienceTest    session={session} />;
    if (fmt === "ACT_MATH")        return <ACTMathTest       session={session} />;
    if (fmt === "SAT_READING")       return <SATReadingTest      session={session} />;
    if (fmt === "SAT_MATH")          return <SATMathTest         session={session} />;
    if (fmt === "IELTS_LISTENING")   return <IELTSListeningTest  session={session} />;
    if (fmt === "IELTS_READING")     return <IELTSReadingTest    session={session} />;
    if (fmt === "IELTS_WRITING")     return <IELTSWritingTest    session={session} />;
    if (fmt === "IELTS_SPEAKING")    return <IELTSSpeakingTest   session={session} />;

    // Backend currently stores ACT/SAT as generic formats (MCQ, MULTI_ESSAY, READING, NUMERIC_INPUT).
    // Dispatch by exam type + course name to reach the right UI.
    if (exam.includes("ACT")) {
      const course = session.courseName?.toUpperCase() ?? "";
      if (fmt === "MULTI_ESSAY")                    return <ACTEnglishTest  session={session} />;
      if (course.includes("SCIENCE"))               return <ACTScienceTest  session={session} />;
      if (course.includes("MATH"))                  return <ACTMathTest     session={session} />;
      if (course.includes("READING") || fmt === "READING") return <ACTReadingTest session={session} />;
      return <ACTEnglishTest session={session} />;
    }
    if (exam.includes("SAT")) {
      const course = session.courseName?.toUpperCase() ?? "";
      if (course.includes("MATH") || fmt === "NUMERIC_INPUT") return <SATMathTest    session={session} />;
      return <SATReadingTest session={session} />;
    }
    if (exam.includes("IELTS")) {
      const course = session.courseName?.toUpperCase() ?? "";
      if (course.includes("LISTEN") || fmt === "IELTS_LISTENING") return <IELTSListeningTest session={session} />;
      if (course.includes("SPEAK")  || fmt === "IELTS_SPEAKING")  return <IELTSSpeakingTest  session={session} />;
      if (course.includes("WRIT")   || fmt === "IELTS_WRITING")   return <IELTSWritingTest    session={session} />;
      return <IELTSReadingTest session={session} />;
    }

    if (fmt === "DATA_RESPONSE")   return <DataResponseTest   session={session} />;
    if (fmt === "READING_WRITING" && session.courseName === "Writing")
                                   return <WritingTest        session={session} />;
    if (fmt === "READING_WRITING") return <ReadingWritingTest session={session} />;
    if (fmt === "MULTI_ESSAY")     return <MultiEssayTest     session={session} />;
    if (fmt === "ESSAY")           return <EssayTest          session={session} />;
    if (fmt === "READING")         return <ReadingTest        session={session} />;
    if (fmt === "LISTENING")       return <ListeningTest      session={session} />;
    if (fmt === "SPEAKING")        return <SpeakingTest       session={session} />;
    // MCQ / default: falls through to the Paper 1 UI below
  }

  if (error) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"#F7F4EF", gap:20, padding:48 }}>
      <div style={{ width:72, height:72, borderRadius:24,
        background:"#fff", border:"1px solid #E2EBF0",
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"0 4px 16px rgba(0,0,0,0.06)" }}>
        <WarningCircle size={36} weight="duotone" color="#94A3B8" />
      </div>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontFamily:SERIF, fontSize:18, fontWeight:700,
          color:"#0F172A", marginBottom:8 }}>Something went wrong</p>
        <p style={{ fontFamily:SERIF, fontSize:14, color:"#64748B",
          maxWidth:320 }}>{error}</p>
      </div>
      <button onClick={() => navigate(-1)}
        style={{ background:MINT, border:"none", borderRadius:14,
          padding:"14px 36px", fontFamily:SERIF, fontSize:15, fontWeight:700,
          color:DARK, cursor:"pointer", boxShadow:"0 8px 24px rgba(93,202,165,0.3)" }}>
        Go back
      </button>
    </div>
  );

  if (!question) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", background:"#F7F4EF" }}>
      <p style={{ fontFamily:SERIF, fontSize:16, color:"#64748B" }}>
        No questions available for this course.
      </p>
    </div>
  );

  // ── Derived values ─────────────────────────────────────────────────────────

  const total        = session?.totalQuestions ?? 1;
  const progress     = answered / total;
  const type         = question.type?.toUpperCase() ?? "MULTIPLE_CHOICE";
  const options      = getOptions(question);
  const isEssay      = isFreeText(type);
  const wordCount    = getWordCount(freeText);
  const validText    = type === "NUMERIC_INPUT" ? freeText.trim() !== "" : wordCount >= 50;
  const canSubmit    = isEssay ? validText : selectedOpt !== null;
  const nextDisabled = !canSubmit || submitting;
  const isLast       = answered === total - 1;

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column",
      background:"#F8FAFC", overflow:"hidden", position:"relative" }}>
      <style>{`
        @keyframes tspin { to { transform:rotate(360deg); } }
        @keyframes tslideIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* Submit error banner */}
      {submitError && (
        <div style={{ background:"#fff0f0", borderBottom:"1px solid #fca5a5",
          padding:"10px 28px", display:"flex", alignItems:"center",
          justifyContent:"space-between", flexShrink:0 }}>
          <span style={{ fontFamily:SERIF, fontSize:13, color:"#b02020" }}>
            {submitError}
          </span>
          <button onClick={() => setSubmitError(null)}
            style={{ fontFamily:SERIF, fontSize:20, color:"#b02020",
              background:"none", border:"none", cursor:"pointer", lineHeight:1 }}>
            ×
          </button>
        </div>
      )}

      {/* Top bar */}
      <div style={{ height:56, flexShrink:0, background:"#fff",
        borderBottom:"1px solid #E8F0F4",
        display:"flex", alignItems:"center",
        justifyContent:"space-between", padding:"0 24px",
        boxShadow:"0 1px 8px rgba(0,0,0,0.04)" }}>
        <span style={{ fontFamily:SCRIPT, fontSize:24, color:BRAND, letterSpacing:0.3 }}>
          edusupernova
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {session?.courseName && (
            <span style={{ fontFamily:SERIF, fontSize:12,
              color:"#94A3B8", letterSpacing:"0.03em" }}>
              {session.courseName}
            </span>
          )}
          <HamburgerBtn open={drawerOpen} onClick={() => setDrawerOpen(o => !o)} />
        </div>
      </div>

      {/* Overlay */}
      {drawerOpen && (
        <div onClick={() => setDrawerOpen(false)}
          style={{ position:"absolute", inset:0, zIndex:30,
            background:"rgba(6,47,55,0.25)",
            backdropFilter:"blur(2px)",
            WebkitBackdropFilter:"blur(2px)" }} />
      )}

      {/* Drawer */}
      <div style={{ position:"absolute", top:0, right:0, width:256, height:"100%",
        background:"#fff", zIndex:40,
        display:"flex", flexDirection:"column",
        paddingTop:14, paddingBottom:24,
        transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
        transition:"transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: drawerOpen ? "-8px 0 32px rgba(0,0,0,0.1)" : "none" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 16px 14px", borderBottom:"1px solid #F1F5F9", marginBottom:8 }}>
          <span style={{ fontFamily:SCRIPT, fontSize:20, color:BRAND }}>Menu</span>
          <HamburgerBtn open={true} onClick={() => setDrawerOpen(false)} />
        </div>
        <div style={{ flex:1, padding:"0 8px" }}>
          <DrawerItem Icon={House}    label="Home"    onClick={() => confirmLeave("/")} />
          <DrawerItem Icon={BookOpen} label="Units"   onClick={() => { setDrawerOpen(false); navigate(-1); }} />
          <DrawerItem Icon={User}     label="Profile" onClick={() => setDrawerOpen(false)} />
        </div>
        <div style={{ padding:"12px 8px 0", borderTop:"1px solid #F1F5F9" }}>
          <DrawerItem Icon={SignOut} label="Log out" danger
            onClick={() => confirmLeave("/login")} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
        <div style={{ display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          minHeight:"100%", padding:"36px 32px" }}>

          <ProgressHeader currentIndex={answered}
            totalQuestions={total} progress={progress}
            remainingSeconds={session?.remainingSeconds} />

          {/* Question card */}
          <div style={{
            background:"#fff", borderRadius:28, padding:"44px 48px",
            width:"100%", maxWidth:780,
            border:"1px solid #E8F0F4",
            boxShadow:"0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
            animation:"tslideIn 0.35s ease both",
          }}>

            {/* Type badge */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:6,
              background:"#e8f7f9", borderRadius:999, padding:"4px 12px",
              marginBottom:20 }}>
              <span style={{ width:6, height:6, borderRadius:"50%",
                background:BRAND, flexShrink:0 }} />
              <span style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
                color:BRAND, letterSpacing:"0.12em", textTransform:"uppercase" }}>
                {typeLabel(type)}
              </span>
            </div>

            {/* Question text */}
            <p style={{ fontFamily:SERIF, fontSize:21, lineHeight:1.65,
              color:"#0F172A", marginBottom:32, letterSpacing:"-0.2px",
              fontWeight:500 }}>
              {question.questionText}
            </p>

            {/* ── Answer input ── */}
            {isEssay ? (
              <div>
                <textarea
                  placeholder={
                    type === "NUMERIC_INPUT"
                      ? "Enter your numeric answer…"
                      : "Write your answer here…"
                  }
                  value={freeText}
                  onChange={e => setFreeText(e.target.value)}
                  maxLength={type === "NUMERIC_INPUT" ? 30 : 3000}
                  rows={type === "NUMERIC_INPUT" ? 2 : 11}
                  style={{
                    width:"100%", background:"#F8FAFC",
                    border:`2px solid ${validText ? MINT : "#E2EBF0"}`,
                    borderRadius:18, padding:"20px 24px",
                    fontFamily:SERIF, fontSize:17, color:"#0F172A",
                    lineHeight:1.75, resize: type === "NUMERIC_INPUT" ? "none" : "vertical",
                    outline:"none", boxSizing:"border-box",
                    transition:"border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={e => e.target.style.boxShadow = "0 0 0 3px rgba(10,95,110,0.08)"}
                  onBlur={e => e.target.style.boxShadow = "none"}
                />
                {type !== "NUMERIC_INPUT" && (
                  <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", marginTop:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <span style={{ fontFamily:SERIF, fontSize:12, color:"#94A3B8" }}>
                        Minimum 50 words recommended
                      </span>
                      <SaveIndicator saveState={autoSaveState} savedAt={autoSavedAt} />
                    </div>
                    <span style={{ fontFamily:SERIF, fontSize:13, fontWeight:700,
                      color: validText ? "#15803d" : "#94A3B8" }}>
                      {wordCount} words
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {options.map((opt, i) => {
                  const letter   = String.fromCharCode(65 + i);
                  const selected = selectedOpt === letter;
                  return (
                    <button key={i} onClick={() => setSelectedOpt(letter)}
                      style={{
                        display:"flex", alignItems:"center", gap:16,
                        padding:"15px 20px", borderRadius:18, textAlign:"left",
                        border:`2px solid ${selected ? BRAND : "#EEF2F7"}`,
                        background: selected ? "#e8f7f9" : "#FAFBFC",
                        cursor:"pointer",
                        boxShadow: selected ? "0 4px 20px rgba(10,95,110,0.1)" : "none",
                        transition:"all 0.18s",
                      }}
                      onMouseEnter={e => {
                        if (!selected) {
                          e.currentTarget.style.borderColor = "#CBD5E1";
                          e.currentTarget.style.background  = "#F1F5F9";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!selected) {
                          e.currentTarget.style.borderColor = "#EEF2F7";
                          e.currentTarget.style.background  = "#FAFBFC";
                        }
                      }}
                    >
                      <div style={{
                        width:38, height:38, borderRadius:12, flexShrink:0,
                        background: selected ? BRAND : "#E8EDF2",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        transition:"background 0.18s",
                      }}>
                        <span style={{ fontFamily:SERIF, fontSize:13, fontWeight:700,
                          color: selected ? "#fff" : "#64748B" }}>
                          {letter}
                        </span>
                      </div>
                      <span style={{
                        fontFamily:SERIF, fontSize:17, lineHeight:1.55, flex:1,
                        color: selected ? BRAND : "#374151",
                        fontWeight: selected ? 600 : 400,
                        transition:"color 0.18s",
                      }}>
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Next / Finish button */}
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:32 }}>
              <button onClick={handleSubmit} disabled={nextDisabled}
                style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"15px 44px", borderRadius:14, border:"none",
                  fontFamily:SERIF, fontSize:15, fontWeight:700, cursor:"pointer",
                  background: nextDisabled ? "#E8EDF2" : MINT,
                  color: nextDisabled ? "#94A3B8" : DARK,
                  boxShadow: nextDisabled ? "none" : "0 8px 28px rgba(93,202,165,0.4)",
                  transition:"all 0.18s",
                }}
                onMouseEnter={e => { if (!nextDisabled) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.background = "#3aab87";
                  e.currentTarget.style.boxShadow  = "0 12px 36px rgba(93,202,165,0.5)";
                }}}
                onMouseLeave={e => { if (!nextDisabled) {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.background = MINT;
                  e.currentTarget.style.boxShadow  = "0 8px 28px rgba(93,202,165,0.4)";
                }}}
              >
                {submitting
                  ? <Spinner small dark={!nextDisabled} />
                  : isLast ? "Finish Test ›" : "Next Question ›"
                }
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TestScreen;
