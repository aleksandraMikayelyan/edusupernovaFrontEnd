/**
 * Test.jsx — Test-taking screen (WEB) — SOLID refactor + redesigned 2026
 *
 * SOLID:
 *   SRP  — screen manages only UI state + question navigation
 *   DIP  — depends on TestsApi abstraction, not axios directly
 *   OCP  — parseOptions is a pure utility, question types handled by render branch
 *
 * Design:
 *   - White top bar: logo + animated hamburger right
 *   - Gradient progress bar (brand → mint)
 *   - Question card: large serif text, clean letter-badge options
 *   - Slide-in drawer from right, confirm before abandoning test
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { WarningCircle, House, BookOpen, User, ChartBar, SignOut } from "@phosphor-icons/react";
import { TestsApi, FeedbackApi } from "../api/index.js";
import useAuth        from "../hooks/useAuth.js";
import ProgressHeader from "../components/test/ProgressHeader.jsx";
import LoadingScreen  from "../components/common/LoadingScreen.jsx";

const DARK  = "#062f37"; const BRAND = "#0a5f6e"; const MINT = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif"; const SCRIPT = "Cookie, cursive";

// ─── Pure utilities (SRP) ─────────────────────────────────────────────────────

const parseOptions = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); }
    catch {
      return raw.split(raw.includes("|") ? "|" : "\n")
                .map(o => o.trim()).filter(Boolean);
    }
  }
  return [];
};

const getWordCount = (text) =>
  text.trim().split(/\s+/).filter(w => w.length > 0).length;

// ─── Animated hamburger ───────────────────────────────────────────────────────

const HamburgerBtn = ({ open, onClick }) => (
  <button onClick={onClick} aria-label={open ? "Close menu" : "Open menu"}
    style={{ width:36, height:36, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:5,
      background:"none", border:"none", cursor:"pointer",
      padding:4, borderRadius:8 }}>
    {[
      { transform: open ? "translateY(6.5px) rotate(45deg)"  : "none" },
      { opacity: open ? 0 : 1 },
      { transform: open ? "translateY(-6.5px) rotate(-45deg)": "none" },
    ].map((s, i) => (
      <span key={i} style={{ display:"block", width:20, height:1.5,
        background:BRAND, borderRadius:2,
        transition:"transform 0.25s ease, opacity 0.2s ease", ...s }} />
    ))}
  </button>
);

// ─── Drawer item ──────────────────────────────────────────────────────────────

const DrawerItem = ({ Icon, label, onClick, danger = false }) => (
  <button onClick={onClick}
    style={{ width:"100%", display:"flex", alignItems:"center", gap:12,
      padding:"11px 14px", borderRadius:12, border:"none",
      background:"none", cursor:"pointer", textAlign:"left",
      fontFamily:SERIF, fontSize:14,
      color: danger ? "#b02020" : "#374151",
      transition:"background 0.12s" }}
    onMouseEnter={e=>e.currentTarget.style.background=danger?"#fff0f0":"#F1F5F9"}
    onMouseLeave={e=>e.currentTarget.style.background="none"}>
    <Icon size={17} weight="light" color={danger ? "#b02020" : "#64748B"} />
    {label}
  </button>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner = ({ small }) => (
  <div style={{ width:small?16:40, height:small?16:40, borderRadius:"50%",
    border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff",
    animation:"tspin 0.7s linear infinite" }} />
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const TestScreen = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { courseId, examType = "", sectionName = "" } = location.state || {};

  const [questions,      setQuestions]      = useState([]);
  const [currentIndex,   setCurrentIndex]   = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers,        setAnswers]        = useState({});
  const [openEndedText,  setOpenEndedText]  = useState("");
  const [loading,        setLoading]        = useState(true);
  const [submitting,     setSubmitting]     = useState(false);
  const [testId,         setTestId]         = useState(null);
  const [error,          setError]          = useState(null);
  const [limitReached,   setLimitReached]   = useState(false);
  const [drawerOpen,     setDrawerOpen]     = useState(false);

  const { getAuthInfo } = useAuth();

  useEffect(() => {
    const h = e => { if (e.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (!courseId) { setError("No course selected."); setLoading(false); return; }
    initTest();
  }, [courseId]);

  const initTest = async () => {
    try {
      setError(null);
      const auth = await getAuthInfo();
      if (!auth) { setError("Session expired. Please log in again."); setLoading(false); return; }

      const startRes     = await TestsApi.start(auth.email, courseId);
      const newTestId    = startRes.data;
      setTestId(newTestId);

      const questionsRes = await TestsApi.getQuestions(newTestId);
      const rawData      = Array.isArray(questionsRes.data) ? questionsRes.data : [];

      setQuestions(rawData.map(q => {
        const quiz = q.quiz || q;
        return {
          quizId:   quiz.id           || q.quizId,
          question: quiz.questionText || q.questionText,
          options:  parseOptions(quiz.options || q.options),
          type:     quiz.type         || q.type,
        };
      }));
    } catch { setError("Could not load the test. Check your connection."); }
    finally { setLoading(false); }
  };

  const handleSelectOption = (i) => {
    setSelectedOption(i);
    const q = questions[currentIndex];
    if (q) setAnswers(prev => ({ ...prev, [q.quizId]: q.options[i] }));
  };

  const handleOpenEndedText = (text) => {
    setOpenEndedText(text);
    const q = questions[currentIndex];
    if (q) setAnswers(prev => ({ ...prev, [q.quizId]: text }));
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      const nextQ      = questions[currentIndex + 1];
      const prevAnswer = answers[nextQ.quizId];
      setCurrentIndex(currentIndex + 1);
      if (nextQ.type === "OPEN_ENDED") { setOpenEndedText(prevAnswer || ""); setSelectedOption(null); }
      else { setOpenEndedText(""); setSelectedOption(prevAnswer ? nextQ.options.indexOf(prevAnswer) : null); }
      return;
    }
    await submitTest();
  };

  const submitTest = async () => {
    setSubmitting(true);
    try {
      const answersList = questions.map(q => ({
        id: { testId, quizId: q.quizId },
        userResponse: answers[q.quizId] || "",
      }));
      const res = await FeedbackApi.process(testId, answersList, examType, sectionName);
      navigate("/feedback", { state: { feedbackData: res.data, testId, examType, sectionName } });
    } catch (err) {
      if (err?.response?.status === 429) setLimitReached(true);
      else setError("Could not submit your test. Please try again.");
    } finally { setSubmitting(false); }
  };

  const confirmLeave = (dest) => {
    setDrawerOpen(false);
    if (window.confirm("Leave the test? Your progress will be lost.")) navigate(dest);
  };

  // ── States ─────────────────────────────────────────────────────────────────

  if (loading) return <LoadingScreen />;

  if (error) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", background:"#F7F4EF", gap:16, padding:40 }}>
      <WarningCircle size={48} weight="duotone" color="#94A3B8" />
      <p style={{ fontFamily:SERIF, fontSize:16, color:"#64748B", textAlign:"center", maxWidth:320 }}>{error}</p>
      <button onClick={() => navigate(-1)}
        style={{ background:MINT, border:"none", borderRadius:12, padding:"14px 32px",
          fontFamily:SERIF, fontSize:15, fontWeight:700, color:DARK, cursor:"pointer",
          boxShadow:"0 8px 24px rgba(93,202,165,0.3)" }}>
        Go back
      </button>
    </div>
  );

  if (questions.length === 0) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center",
      justifyContent:"center", background:"#F7F4EF" }}>
      <p style={{ fontFamily:SERIF, fontSize:16, color:"#64748B" }}>
        No questions available for this course.
      </p>
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────────────

  const q               = questions[currentIndex];
  const progress        = (currentIndex + 1) / questions.length;
  const isMC            = q.type === "MULTIPLE_CHOICE" || !q.type;
  const wordCount       = getWordCount(openEndedText);
  const validWordCount  = wordCount >= 250 && wordCount <= 300;
  const nextDisabled    = isMC ? selectedOption === null || submitting : !validWordCount || submitting;

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column",
      background:"#F7F4EF", overflow:"hidden", position:"relative" }}>
      <style>{`@keyframes tspin { to { transform: rotate(360deg); } }`}</style>

      {/* Limit banner */}
      {limitReached && (
        <div style={{ background:"#fff8e6", borderBottom:"1px solid #f5a623",
          padding:"10px 24px", display:"flex", alignItems:"center",
          justifyContent:"space-between", flexShrink:0 }}>
          <p style={{ fontFamily:SERIF, fontSize:13, color:"#a06a00" }}>
            <strong>Daily limit reached.</strong> Free accounts: 2 tests/day.
          </p>
          <button onClick={()=>setLimitReached(false)}
            style={{ fontFamily:SERIF, fontSize:18, color:"#a06a00",
              background:"none", border:"none", cursor:"pointer" }}>×</button>
        </div>
      )}

      {/* Top bar */}
      <div style={{ height:52, flexShrink:0, background:"#fff",
        borderBottom:"1px solid #E2EBF0",
        display:"flex", alignItems:"center",
        justifyContent:"space-between",
        padding:"0 20px" }}>
        <span style={{ fontFamily:SCRIPT, fontSize:24, color:BRAND, letterSpacing:0.3 }}>
          edusupernova
        </span>
        <HamburgerBtn open={drawerOpen} onClick={()=>setDrawerOpen(o=>!o)} />
      </div>

      {/* Overlay */}
      {drawerOpen && (
        <div onClick={()=>setDrawerOpen(false)}
          style={{ position:"absolute", inset:0, zIndex:30,
            background:"rgba(0,0,0,0.2)" }} />
      )}

      {/* Drawer */}
      <div style={{ position:"absolute", top:0, right:0, width:240, height:"100%",
        background:"#fff", boxShadow:"-4px 0 24px rgba(0,0,0,0.08)",
        zIndex:40, display:"flex", flexDirection:"column",
        paddingTop:14, paddingBottom:20,
        transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
        transition:"transform 0.28s cubic-bezier(0.4,0,0.2,1)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 14px 14px", borderBottom:"1px solid #F1F5F9", marginBottom:8 }}>
          <span style={{ fontFamily:SCRIPT, fontSize:20, color:BRAND }}>Menu</span>
          <HamburgerBtn open={true} onClick={()=>setDrawerOpen(false)} />
        </div>
        <div style={{ flex:1, padding:"0 8px" }}>
          <DrawerItem Icon={House}    label="Home"    onClick={()=>confirmLeave("/")} />
          <DrawerItem Icon={BookOpen} label="Units"   onClick={()=>{setDrawerOpen(false);navigate(-1);}} />
          <DrawerItem Icon={User}     label="Profile" onClick={()=>setDrawerOpen(false)} />
          <DrawerItem Icon={ChartBar} label="Scores"  onClick={()=>setDrawerOpen(false)} />
        </div>
        <div style={{ padding:"12px 8px 0", borderTop:"1px solid #F1F5F9" }}>
          <DrawerItem Icon={SignOut} label="Log out" danger onClick={()=>confirmLeave("/login")} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          minHeight:"100%", padding:"32px 24px" }}>

          <ProgressHeader currentIndex={currentIndex}
            totalQuestions={questions.length} progress={progress} />

          {/* Question card */}
          <div style={{ background:"#fff", borderRadius:24, padding:"36px 40px",
            width:"100%", maxWidth:760,
            border:"1px solid #E2EBF0",
            boxShadow:"0 8px 32px rgba(0,0,0,0.06)" }}>

            <p style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
              color:BRAND, letterSpacing:"0.16em", textTransform:"uppercase", marginBottom:16 }}>
              Evaluation
            </p>
            <p style={{ fontFamily:SERIF, fontSize:20, lineHeight:1.65,
              color:"#0F172A", marginBottom:28, letterSpacing:"-0.2px" }}>
              {q.question}
            </p>

            {isMC ? (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {q.options.map((opt, i) => {
                  const letter   = String.fromCharCode(65 + i);
                  const selected = selectedOption === i;
                  return (
                    <button key={i} onClick={() => handleSelectOption(i)}
                      style={{ display:"flex", alignItems:"center", gap:14,
                        padding:"14px 18px", borderRadius:16, textAlign:"left",
                        border: `2px solid ${selected ? BRAND : "transparent"}`,
                        background: selected ? "#e8f7f9" : "#F8FAFC",
                        cursor:"pointer", transition:"all 0.18s",
                        boxShadow: selected ? "0 4px 16px rgba(10,95,110,0.12)" : "none" }}
                      onMouseEnter={e=>{ if (!selected) e.currentTarget.style.borderColor="#CBD5E1"; }}
                      onMouseLeave={e=>{ if (!selected) e.currentTarget.style.borderColor="transparent"; }}
                    >
                      <div style={{ width:36, height:36, borderRadius:10, flexShrink:0,
                        background: selected ? BRAND : "#E2EBF0",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        transition:"background 0.18s" }}>
                        <span style={{ fontFamily:SERIF, fontSize:13, fontWeight:700,
                          color: selected ? "#fff" : "#64748B" }}>{letter}</span>
                      </div>
                      <span style={{ fontFamily:SERIF, fontSize:17, lineHeight:1.5, flex:1,
                        color: selected ? BRAND : "#0F172A",
                        fontWeight: selected ? 600 : 400 }}>{opt}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div>
                <textarea
                  placeholder="Write your answer here (250–300 words)…"
                  value={openEndedText}
                  onChange={e=>handleOpenEndedText(e.target.value)}
                  maxLength={2000}
                  style={{ width:"100%", minHeight:300, background:"#F8FAFC",
                    border:`2px solid ${validWordCount ? MINT : "#E2EBF0"}`,
                    borderRadius:16, padding:"20px 24px",
                    fontFamily:SERIF, fontSize:17, color:"#0F172A",
                    lineHeight:1.7, resize:"vertical", outline:"none",
                    boxSizing:"border-box", transition:"border-color 0.2s" }}
                />
                <div style={{ display:"flex", justifyContent:"flex-end", marginTop:8 }}>
                  <span style={{ fontFamily:SERIF, fontSize:13, fontWeight:700,
                    color: validWordCount ? MINT : "#e74c3c" }}>
                    {wordCount} / 250–300 words
                  </span>
                </div>
              </div>
            )}

            {/* Next button */}
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:24 }}>
              <button onClick={handleNext} disabled={nextDisabled}
                style={{ display:"flex", alignItems:"center", gap:8,
                  padding:"15px 40px", borderRadius:14, border:"none",
                  fontFamily:SERIF, fontSize:15, fontWeight:700, cursor:"pointer",
                  background: nextDisabled ? "#E2EBF0" : MINT,
                  color: nextDisabled ? "#94A3B8" : DARK,
                  boxShadow: nextDisabled ? "none" : "0 8px 24px rgba(93,202,165,0.35)",
                  transition:"all 0.18s",
                  transform: nextDisabled ? "none" : undefined }}
                onMouseEnter={e=>{ if (!nextDisabled) { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.background="#3aab87"; }}}
                onMouseLeave={e=>{ if (!nextDisabled) { e.currentTarget.style.transform="none"; e.currentTarget.style.background=MINT; }}}
              >
                {submitting ? <Spinner small /> : (
                  <>{currentIndex === questions.length - 1 ? "Finish Test" : "Next Question"} ›</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestScreen;