/**
 * FeedbackPage.jsx — Results / report screen
 *
 * Fetches GET /tests/{testId}/report → FeedBackDTO, then renders
 * a celebratory hero with score + grade, and per-question breakdown.
 */

import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, ArrowClockwise } from "@phosphor-icons/react";
import AppHeader     from "../../components/common/appHeader.jsx";
import AppFooter     from "../../components/common/appFooter.jsx";
import QuestionCard  from "../../components/feedback/QuestionCard.jsx";
import ErrorScreen   from "../../components/common/ErrorScreen.jsx";
import LoadingScreen from "../../components/common/LoadingScreen.jsx";
import useInView     from "../../hooks/useInView.js";
import { TestsApi }  from "../../api/index.js";

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS  = 120_000; // 2 minutes

const MCQ_TYPES = new Set(["MULTIPLE_CHOICE", "TRUE_FALSE_NG", "NUMERIC_INPUT"]);

const hasPending = (report) =>
  report?.questionsFeedback?.some(q =>
    q.aiFeedback === "AI evaluation in progress..." ||
    (!MCQ_TYPES.has(q.questionType) && q.userResponse?.trim() && q.aiScore == null)
  ) ?? false;

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const CREAM = "#F7F4EF";
const SERIF = "Newsreader, Georgia, serif";

// ─── Score display ────────────────────────────────────────────────────────────

const gradeAccent = (grade) => {
  if (!grade) return MINT;
  if (["A*","A"].includes(grade)) return "#5DCAA5";
  if (grade === "B")              return "#60a5fa";
  if (grade === "C")              return "#f5a623";
  return                                 "#94A3B8";
};

const ScoreDisplay = ({ grade, finalScore }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 300); return () => clearTimeout(t); }, []);

  const pct     = finalScore != null ? Math.round(finalScore) : null;
  const accent  = gradeAccent(grade);

  return (
    <div style={{
      display:"flex", flexDirection:"column", gap:8,
      opacity: show ? 1 : 0,
      transform: show ? "translateY(0)" : "translateY(16px)",
      transition:"opacity 0.5s ease, transform 0.5s ease",
    }}>
      {/* Large percentage */}
      <div style={{ display:"flex", alignItems:"flex-end", gap:12 }}>
        <span style={{
          fontFamily:SERIF,
          fontSize:"clamp(64px,8vw,96px)",
          fontWeight:700, color:"#fff",
          lineHeight:1, letterSpacing:"-4px",
        }}>
          {pct != null ? `${pct}%` : "—"}
        </span>
        {grade && (
          <span style={{
            fontFamily:SERIF, fontSize:18, fontWeight:700,
            color: accent,
            background:"rgba(255,255,255,0.08)",
            border:`1.5px solid ${accent}55`,
            borderRadius:10, padding:"4px 14px",
            marginBottom:10, letterSpacing:"0.04em",
          }}>
            {grade}
          </span>
        )}
      </div>
      <span style={{ fontFamily:SERIF, fontSize:13,
        color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em",
        textTransform:"uppercase" }}>
        Final score
      </span>
    </div>
  );
};

// ─── Stat pill ────────────────────────────────────────────────────────────────

const StatPill = ({ value, label }) => (
  <div style={{ textAlign:"center", padding:"0 32px",
    borderRight:"1px solid rgba(255,255,255,0.1)" }}>
    <p style={{ fontFamily:SERIF, fontSize:28, fontWeight:700,
      color:"#fff", letterSpacing:"-1px", margin:0 }}>{value}</p>
    <p style={{ fontFamily:SERIF, fontSize:12, color:"rgba(255,255,255,0.45)",
      textTransform:"uppercase", letterSpacing:"0.08em", marginTop:4 }}>{label}</p>
  </div>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const FeedbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cardsRef = null; // ref placeholder — no scroll animation needed

  const { testId } = location.state || {};

  const [report,       setReport]       = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [pollTimedOut, setPollTimedOut] = useState(false);

  const pollRef    = useRef(null);
  const timeoutRef = useRef(null);
  const mountedRef = useRef(true);

  const stopPolling = () => {
    clearInterval(pollRef.current);
    clearTimeout(timeoutRef.current);
    pollRef.current    = null;
    timeoutRef.current = null;
  };

  const fetchReport = () => {
    setLoading(true);
    setError(null);
    TestsApi.getReport(testId)
      .then(res => {
        if (!mountedRef.current) return; // navigated away before response arrived
        setReport(res.data);
        if (hasPending(res.data)) {
          timeoutRef.current = setTimeout(() => {
            stopPolling();
            setPollTimedOut(true);
          }, POLL_TIMEOUT_MS);

          pollRef.current = setInterval(() => {
            if (!mountedRef.current) { stopPolling(); return; }
            TestsApi.getReport(testId)
              .then(r => {
                if (!mountedRef.current) { stopPolling(); return; }
                setReport(r.data);
                if (!hasPending(r.data)) stopPolling();
              })
              .catch(() => {});
          }, POLL_INTERVAL_MS);
        }
      })
      .catch(err => {
        if (mountedRef.current) setError(err.message ?? "Could not load your results.");
      })
      .finally(() => { if (mountedRef.current) setLoading(false); });
  };

  useEffect(() => {
    mountedRef.current = true;
    if (!testId) { setLoading(false); return; }
    fetchReport();
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [testId]);

  if (loading) return <LoadingScreen />;

  if (!testId || (!report && !error)) {
    return (
      <ErrorScreen
        message="No test result found. Please complete a test first."
        onRetry={() => navigate("/courses")}
      />
    );
  }

  if (error) return <ErrorScreen message={error} onRetry={fetchReport} />;

  const questions  = report.questionsFeedback ?? [];
  const correct    = report.totalCorrect ?? 0;
  const total      = report.totalQuestions ?? questions.length;
  const pct        = report.finalScore != null ? Math.round(report.finalScore) : null;

  const subtitle = [report.courseName, report.paperName].filter(Boolean).join(" · ");

  return (
    <div style={{ minHeight:"100vh", background:CREAM,
      display:"flex", flexDirection:"column" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <AppHeader />

      {/* ── Hero result strip ── */}
      <div style={{
        background:`linear-gradient(145deg, #021a1f 0%, ${DARK} 40%, ${BRAND} 100%)`,
        padding:"36px 48px 64px",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", inset:0, opacity:0.04,
          backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize:"28px 28px", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"10%", right:"-5%",
          width:500, height:500, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(93,202,165,0.08) 0%, transparent 70%)",
          pointerEvents:"none" }} />

        <div style={{ maxWidth:860, margin:"0 auto",
          position:"relative", zIndex:1 }}>

          {/* Badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(255,255,255,0.08)",
            border:"1px solid rgba(255,255,255,0.12)",
            borderRadius:999, padding:"6px 16px", marginBottom:40 }}>
            <Trophy size={14} weight="fill" color={MINT} />
            <span style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
              color:"rgba(255,255,255,0.75)",
              letterSpacing:"0.1em", textTransform:"uppercase" }}>
              Test complete
            </span>
          </div>

          {/* Two-column: score left, stats right */}
          <div style={{ display:"flex", alignItems:"center",
            gap:64, flexWrap:"wrap" }}>

            <ScoreDisplay grade={report.grade} finalScore={report.finalScore} />

            <div style={{ flex:1, minWidth:280 }}>
              <h1 style={{ fontFamily:SERIF,
                fontSize:"clamp(28px,3.5vw,48px)", fontWeight:700,
                color:"#fff", letterSpacing:"-1.5px",
                lineHeight:1.1, marginBottom:8 }}>
                Your Results
              </h1>
              {subtitle && (
                <p style={{ fontFamily:SERIF, fontSize:14,
                  color:"rgba(255,255,255,0.4)", marginBottom:32 }}>
                  {subtitle}
                </p>
              )}

              {/* Stats row */}
              <div style={{ display:"flex", gap:0,
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:20, padding:"20px 0",
                width:"fit-content" }}>
                <StatPill value={`${correct}/${total}`} label="Correct" />
                {pct != null && (
                  <StatPill value={`${pct}%`} label="Score" />
                )}
                {report.durationSeconds != null && (
                  <div style={{ textAlign:"center", padding:"0 32px" }}>
                    <p style={{ fontFamily:SERIF, fontSize:28, fontWeight:700,
                      color:"#fff", letterSpacing:"-1px", margin:0 }}>
                      {Math.round(report.durationSeconds / 60)}m
                    </p>
                    <p style={{ fontFamily:SERIF, fontSize:12,
                      color:"rgba(255,255,255,0.45)",
                      textTransform:"uppercase", letterSpacing:"0.08em", marginTop:4 }}>
                      Duration
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div style={{ position:"absolute", bottom:-1, left:0, right:0, lineHeight:0 }}>
          <svg viewBox="0 0 1440 48" fill="none" style={{ display:"block", width:"100%" }}>
            <path d="M0 48 C480 0 960 48 1440 18 L1440 48 Z" fill={CREAM}/>
          </svg>
        </div>
      </div>

      {/* ── Question cards ── */}
      <div ref={cardsRef} style={{ flex:1, maxWidth:880, margin:"0 auto",
        width:"100%", padding:"32px 32px 48px", boxSizing:"border-box" }}>

        {/* Poll timeout notice */}
        {pollTimedOut && (
          <div style={{
            background:"#fff8e6", border:"1px solid #f5a623",
            borderRadius:14, padding:"14px 20px", marginBottom:24,
            fontFamily:SERIF, fontSize:14, color:"#92400e", lineHeight:1.6,
          }}>
            AI grading is taking longer than usual. Refresh the page in a few
            minutes to check your results.
          </div>
        )}

        {questions.length > 0 ? (
          <>
            <p style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
              letterSpacing:"0.14em", textTransform:"uppercase",
              color:"#94A3B8", marginBottom:24 }}>
              Question by question
            </p>
            {questions.map((item, i) => (
              <div key={item.quizId ?? i} style={{
                animation:`fadeUp 0.4s ease both ${i * 40}ms`,
              }}>
                <QuestionCard item={item} index={i} />
              </div>
            ))}
          </>
        ) : (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <p style={{ fontFamily:SERIF, fontSize:16, color:"#94A3B8" }}>
              No question details available.
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display:"flex", justifyContent:"center",
          gap:14, marginTop:48 }}>
          <button
            onClick={() => navigate("/courses")}
            style={{ display:"flex", alignItems:"center", gap:8,
              background:MINT, border:"none", borderRadius:14,
              padding:"16px 40px", fontFamily:SERIF, fontSize:16,
              fontWeight:700, color:DARK, cursor:"pointer",
              boxShadow:"0 12px 40px rgba(93,202,165,0.35)",
              transition:"transform 0.18s, background 0.18s, box-shadow 0.18s" }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.background = "#3aab87";
              e.currentTarget.style.boxShadow = "0 16px 48px rgba(93,202,165,0.45)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.background = MINT;
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(93,202,165,0.35)";
            }}>
            <ArrowClockwise size={17} weight="bold" />
            Take another test
          </button>
          <button
            onClick={() => navigate("/")}
            style={{ display:"flex", alignItems:"center", gap:8,
              background:"transparent",
              border:"1.5px solid #E2EBF0",
              borderRadius:14, padding:"16px 28px",
              fontFamily:SERIF, fontSize:15, color:"#64748B",
              cursor:"pointer",
              transition:"border-color 0.15s, color 0.15s" }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = BRAND;
              e.currentTarget.style.color = BRAND;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#E2EBF0";
              e.currentTarget.style.color = "#64748B";
            }}>
            <ArrowLeft size={16} /> Back to home
          </button>
        </div>
      </div>

      <AppFooter />
    </div>
  );
};

export default FeedbackPage;
