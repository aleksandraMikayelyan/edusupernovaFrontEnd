import React, { useEffect, useState } from "react";
/**
 * FeedbackPage.jsx — Results screen (WEB) — redesigned 2026, field names fixed
 *
 * SOLID:
 *   SRP  — only renders feedback data passed via navigation state
 *   DIP  — no direct API call here; Test.jsx already fetched the data
 *
 * Field name mapping (backend DTO → frontend):
 *   questionsFeedback[]  ← the array (or questionsResults, questions — handled defensively)
 *   totalScore           ← overall score string e.g. "7.0/10"
 *   mcScore              ← multiple choice score
 *   openEndedPending     ← boolean, true while Groq is still running
 *
 * Design: dark result hero + scrollable cream body with animated cards
 */

import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Clock } from "@phosphor-icons/react";
import AppHeader    from "../components/common/appHeader.jsx";
import AppFooter    from "../components/common/appFooter.jsx";
import QuestionCard from "../components/feedback/QuestionCard.jsx";
import ScorePill    from "../components/feedback/ScorePill.jsx";
import ErrorScreen  from "../components/common/ErrorScreen.jsx";
import { MULTIPLE_CHOICE_LIMIT } from "../constants/api.js";
import useInView from "../hooks/useInView.js";
import { FeedbackApi } from "../api/index.js";

const DARK  = "#062f37"; const BRAND = "#0a5f6e"; const MINT = "#5DCAA5";
const CREAM = "#F7F4EF"; const SERIF = "Newsreader, Georgia, serif";

const FeedbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cardsRef, cardsInView] = useInView(0.05);

  const { feedbackData: initialData, testId, examType = "", sectionName = "" } = location.state || {};

  // Live data — starts with what Test.jsx passed, updates when polling completes
  const [feedbackData, setFeedbackData] = React.useState(initialData);

  // Poll every 4s while open-ended feedback is still pending (Groq async)
  React.useEffect(() => {
    if (!feedbackData?.openEndedPending || !testId) return;
    const interval = setInterval(async () => {
      try {
        const res = await FeedbackApi.poll(testId);
        if (res.data && !res.data.openEndedPending) {
          setFeedbackData(res.data);
          clearInterval(interval);
        }
      } catch { /* silent — keep polling */ }
    }, 4000);
    return () => clearInterval(interval);
  }, [feedbackData?.openEndedPending, testId]);

  if (!feedbackData) {
    return (
      <ErrorScreen
        message="No feedback data found. Please complete a test first."
        onRetry={() => navigate("/courses")}
      />
    );
  }

  // Defensive field resolution — handles different backend naming conventions
  const questions = feedbackData.questionsFeedback
    ?? feedbackData.questionsResults
    ?? feedbackData.questions
    ?? [];

  const totalQuestions      = questions.length;
  const multipleChoiceCount = Math.min(MULTIPLE_CHOICE_LIMIT, totalQuestions);
  const openEndedCount      = Math.max(0, totalQuestions - MULTIPLE_CHOICE_LIMIT);
  const scoreMark           = feedbackData.totalScore ?? feedbackData.mcScore ?? null;
  const isPending           = feedbackData.openEndedPending ?? false;

  return (
    <div style={{ minHeight:"100vh", background:CREAM, display:"flex", flexDirection:"column" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <AppHeader />

      {/* ── Hero result strip ── */}
      <div style={{
        background:`linear-gradient(135deg, ${DARK} 0%, ${BRAND} 100%)`,
        padding:"52px 40px 72px", position:"relative", overflow:"hidden",
        textAlign:"center",
      }}>
        <div style={{ position:"absolute", inset:0, opacity:0.05,
          backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize:"28px 28px", pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)",
            borderRadius:999, padding:"5px 14px", marginBottom:20 }}>
            <Trophy size={14} weight="fill" color={MINT} />
            <span style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
              color:"rgba(255,255,255,0.8)", letterSpacing:"0.1em", textTransform:"uppercase" }}>
              Test complete
            </span>
          </div>

          <h1 style={{ fontFamily:SERIF, fontSize:"clamp(32px,5vw,52px)", fontWeight:700,
            color:"#fff", letterSpacing:"-1.5px", lineHeight:1.1, marginBottom:8 }}>
            Your Results
          </h1>
          <p style={{ fontFamily:SERIF, fontSize:15, color:"rgba(255,255,255,0.5)", marginBottom:36 }}>
            {multipleChoiceCount > 0 && `${multipleChoiceCount} multiple choice`}
            {openEndedCount > 0 && ` · ${openEndedCount} open-ended`}
            {examType && ` · ${examType}`}
          </p>

          <ScorePill mark={scoreMark} />

          {isPending && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
              gap:8, marginTop:20 }}>
              <Clock size={14} color="rgba(255,255,255,0.4)" />
              <p style={{ fontFamily:SERIF, fontSize:13, color:"rgba(255,255,255,0.4)", fontStyle:"italic" }}>
                Open-ended feedback is still being generated — check back shortly.
              </p>
            </div>
          )}
        </div>

        {/* Wave */}
        <div style={{ position:"absolute", bottom:-1, left:0, right:0, lineHeight:0 }}>
          <svg viewBox="0 0 1440 40" fill="none" style={{ display:"block", width:"100%" }}>
            <path d="M0 40 C480 0 960 40 1440 15 L1440 40 Z" fill={CREAM}/>
          </svg>
        </div>
      </div>

      {/* ── Question cards ── */}
      <div ref={cardsRef} style={{ flex:1, maxWidth:860, margin:"0 auto",
        width:"100%", padding:"40px 24px 80px", boxSizing:"border-box" }}>

        {questions.length > 0 ? (
          <>
            <p style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
              letterSpacing:"0.12em", textTransform:"uppercase",
              color:"#94A3B8", marginBottom:20 }}>
              Question by question
            </p>
            {questions.map((item, i) => (
              <div key={i} style={{
                animation: cardsInView ? `fadeUp 0.5s ease both ${i * 60}ms` : "none",
                opacity: cardsInView ? undefined : 0,
              }}>
                <QuestionCard item={item} index={i} />
              </div>
            ))}
          </>
        ) : (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <p style={{ fontFamily:SERIF, fontSize:16, color:"#94A3B8" }}>
              No question details available yet.
            </p>
          </div>
        )}

        {/* Action */}
        <div style={{ display:"flex", justifyContent:"center", gap:14, marginTop:40 }}>
          <button
            onClick={() => navigate("/courses")}
            style={{ display:"flex", alignItems:"center", gap:8,
              background:MINT, border:"none", borderRadius:14,
              padding:"16px 36px", fontFamily:SERIF, fontSize:16, fontWeight:700,
              color:DARK, cursor:"pointer",
              boxShadow:"0 12px 40px rgba(93,202,165,0.35)",
              transition:"transform 0.18s, background 0.18s" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.background="#3aab87"}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.background=MINT}}
          >
            Take another test
          </button>
          <button
            onClick={() => navigate("/")}
            style={{ display:"flex", alignItems:"center", gap:8,
              background:"transparent", border:`1.5px solid #E2EBF0`,
              borderRadius:14, padding:"16px 28px",
              fontFamily:SERIF, fontSize:15, color:"#64748B",
              cursor:"pointer", transition:"border-color 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=BRAND}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#E2EBF0"}
          >
            <ArrowLeft size={16} /> Back to home
          </button>
        </div>
      </div>

      <AppFooter />
    </div>
  );
};

export default FeedbackPage;