/**
 * Units.jsx — Unit reading screen
 * Premium editorial layout: fixed sidebar + distraction-free article canvas.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FilePdf, CheckCircle, CaretRight, NotePencil, ListBullets } from "@phosphor-icons/react";
import { CoursesApi } from "../api/index.js";
import AppFooter          from "../components/common/appFooter.jsx";
import LoadingScreen      from "../components/common/LoadingScreen.jsx";
import ArticleBody        from "../components/units/ArticleBody.jsx";
import CollapsibleSection from "../components/units/CollapsibleSection.jsx";
import UnitTab            from "../components/units/UnitTab.jsx";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif";
const SCRIPT= "Cookie, cursive";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PDF_KEYWORDS = ["act science","act math","a level","a-level","economy","economics","math"];
const hasPdfSheet  = (name = "") => PDF_KEYWORDS.some(kw => name.toLowerCase().includes(kw));

const calcReadingTime = (text) => {
  if (!text) return "1 min read";
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const UnitScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId, examType, papers: coursePapers = [] } = location.state || {};

  const [courseData,     setCourseData]     = useState(null);
  const [activeUnit,     setActiveUnit]     = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    CoursesApi.getUnits(courseId)
      .then(res => {
        setCourseData(res.data);
        if (res.data.units?.length > 0) setActiveUnit(res.data.units[0]);
      })
      .catch(err => console.error("Error loading units:", err))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleScroll = useCallback((e) => {
    const el  = e.currentTarget;
    const max = el.scrollHeight - el.clientHeight;
    if (max > 0) setScrollProgress(Math.min(1, el.scrollTop / max));
  }, []);

  // Each element in units[] is UnitWithContent { unit: Unit, content: String }
  const activeIndex = courseData?.units?.findIndex(u => u.unit?.id === activeUnit?.unit?.id) ?? 0;
  const showPdf     = hasPdfSheet(courseData?.courseName);
  // Prefer papers passed from the course listing (CourseDTO includes papers[]);
  // fall back to whatever getUnits returns if the backend happens to include them.
  const papers      = coursePapers.length > 0 ? coursePapers : (courseData?.papers ?? []);
  const mcqPaper          = papers.find(p => p.format === "MCQ");
  const essayPaper        = papers.find(p => p.format === "ESSAY");
  const dataResponsePaper = papers.find(p => p.format === "DATA_RESPONSE");

  // Content is served by the backend; it lives at activeUnit.content
  const summaryText = activeUnit?.content ?? "";

  const articleContent = useMemo(() => {
    if (!activeUnit) return null;
    return (
      <div style={{ background:"#fff", minHeight:"100%" }}>

        {/* Hero banner */}
        <div style={{
          background:`linear-gradient(135deg, #021a1f 0%, ${DARK} 40%, ${BRAND} 75%, #1c94a7 100%)`,
          padding:"40px 80px 48px",
          position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", inset:0, opacity:0.04,
            backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize:"24px 24px", pointerEvents:"none" }} />

          <div style={{ display:"flex", alignItems:"center",
            justifyContent:"space-between", marginBottom:28,
            position:"relative", zIndex:1 }}>
            <span style={{
              fontFamily:SERIF, fontSize:11, fontWeight:700,
              color:"rgba(255,255,255,0.8)", letterSpacing:"0.1em",
              textTransform:"uppercase",
              background:"rgba(255,255,255,0.12)",
              border:"1px solid rgba(255,255,255,0.18)",
              padding:"5px 14px", borderRadius:999,
            }}>
              Unit {activeIndex + 1}
              {courseData?.units?.length
                ? ` of ${courseData.units.length}`
                : ""}
            </span>
            <span style={{ fontFamily:SERIF, fontSize:12,
              color:"rgba(255,255,255,0.4)" }}>
              {calcReadingTime(summaryText)}
            </span>
          </div>

          <h1 style={{
            fontFamily:SERIF,
            fontSize:"clamp(26px,3.5vw,44px)",
            fontWeight:700, color:"#fff",
            lineHeight:1.1, letterSpacing:"-1.5px",
            margin:0, position:"relative", zIndex:1,
          }}>
            {activeUnit.unit?.title}
          </h1>
        </div>

        {/* Mint accent rule */}
        <div style={{ height:3, background:`linear-gradient(90deg, ${MINT}, transparent)` }} />

        {/* Article body */}
        <div style={{ padding:"52px 80px 0" }}>
          <ArticleBody text={summaryText} />
        </div>

        {/* Unit navigation — bottom of article */}
        {courseData?.units && activeIndex < courseData.units.length - 1 && (
          <div style={{ padding:"0 80px 64px",
            display:"flex", justifyContent:"flex-end" }}>
            <button
              onClick={() => setActiveUnit(courseData.units[activeIndex + 1])}
              style={{ display:"flex", alignItems:"center", gap:6,
                background:"none", border:"none", cursor:"pointer",
                fontFamily:SERIF, fontSize:13, color:"#94A3B8",
                padding:"8px 12px", borderRadius:8, transition:"color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = BRAND}
              onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}
            >
              Next unit: {courseData.units[activeIndex + 1].unit?.title}
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
        )}
      </div>
    );
  }, [activeUnit?.unit?.id, activeUnit?.content, activeIndex,
      navigate, courseId, examType, courseData]);

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column",
      background:"#F8FAFC", overflow:"hidden" }}>

      {/* Study header */}
      <header style={{
        height:54, flexShrink:0,
        background:`linear-gradient(90deg, #021a1f 0%, ${DARK} 50%, ${BRAND} 100%)`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 28px", zIndex:10,
        boxShadow:"0 2px 16px rgba(6,47,55,0.3)",
      }}>
        <span style={{ fontFamily:SCRIPT, fontSize:22, color:"#fff", letterSpacing:0.3 }}>
          edusupernova
        </span>
      </header>

      {/* Reading progress bar */}
      <div style={{ height:3, width:"100%",
        background:"rgba(93,202,165,0.12)", flexShrink:0 }}>
        <div style={{ height:"100%",
          width:`${Math.round(scrollProgress * 100)}%`,
          backgroundImage:`linear-gradient(90deg, ${BRAND}, ${MINT})`,
          transition:"width 0.3s ease",
          borderRadius:"0 999px 999px 0",
        }} />
      </div>

      {/* Two-column layout */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* Sidebar */}
        <aside style={{
          width:280, flexShrink:0,
          background:"#fff",
          borderRight:"1px solid #E8F0F4",
          overflowY:"auto",
          display:"flex", flexDirection:"column",
          boxShadow:"2px 0 16px rgba(0,0,0,0.03)",
        }}>
          {/* Sidebar header */}
          <div style={{ padding:"20px 18px 16px",
            borderBottom:"1px solid #F1F5F9" }}>
            <p style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
              color:"#94A3B8", letterSpacing:"0.14em",
              textTransform:"uppercase", margin:0 }}>
              {courseData?.courseName ?? "Course"}
            </p>
          </div>

          <div style={{ flex:1, padding:"12px 12px 16px" }}>
            {showPdf && (
              <button
                onClick={() => window.open(CoursesApi.getFormulaSheet(courseId), "_blank")}
                style={{
                  width:"100%", display:"flex", alignItems:"center", gap:10,
                  background:"#f0fdf4", border:"1px solid #86efac",
                  borderRadius:12, padding:"11px 14px", marginBottom:16,
                  cursor:"pointer", transition:"background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#dcfce7"}
                onMouseLeave={e => e.currentTarget.style.background = "#f0fdf4"}
              >
                <FilePdf size={18} weight="duotone" color="#15803d" />
                <span style={{ fontFamily:SERIF, fontSize:13, fontWeight:700,
                  color:"#15803d", flex:1, textAlign:"left" }}>
                  Formula Sheet PDF
                </span>
              </button>
            )}

            <CollapsibleSection title="UNITS" defaultOpen>
              {courseData?.units?.map((u, idx) => (
                <UnitTab key={u.unit?.id ?? idx} unit={u.unit} index={idx}
                  isActive={activeUnit?.unit?.id === u.unit?.id}
                  onPress={() => activeUnit?.unit?.id !== u.unit?.id && setActiveUnit(u)} />
              ))}
            </CollapsibleSection>
          </div>

          {/* ── Practice buttons ── */}
          <div style={{
            padding:"14px 12px 20px",
            borderTop:"1px solid #F1F5F9",
            display:"flex", flexDirection:"column", gap:8,
          }}>
            <p style={{ fontFamily:SERIF, fontSize:10, fontWeight:700,
              color:"#94A3B8", letterSpacing:"0.12em",
              textTransform:"uppercase", margin:"0 0 4px 4px" }}>
              Practice
            </p>

            {/* MCQ */}
            {mcqPaper && (
              <button
                onClick={() => navigate("/test", {
                  state: { courseId, examType, paperId: mcqPaper.id,
                           sectionName: courseData?.courseName } })}
                style={{
                  width:"100%", display:"flex", alignItems:"center", gap:9,
                  padding:"10px 12px", borderRadius:12, border:"none",
                  background:MINT, cursor:"pointer",
                  fontFamily:SERIF, fontSize:13, fontWeight:700, color:DARK,
                  boxShadow:"0 4px 14px rgba(93,202,165,0.3)",
                  transition:"transform 0.15s, background 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.background = "#3aab87";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.background = MINT;
                }}
              >
                <CheckCircle size={16} weight="bold" />
                Check your knowledge
              </button>
            )}

            {/* Data Response */}
            {dataResponsePaper && (
              <button
                onClick={() => navigate("/test", {
                  state: { courseId, examType, paperId: dataResponsePaper.id,
                           sectionName: courseData?.courseName } })}
                style={{
                  width:"100%", display:"flex", alignItems:"center", gap:9,
                  padding:"10px 12px", borderRadius:12,
                  border:`1.5px solid ${BRAND}`,
                  background:"transparent", cursor:"pointer",
                  fontFamily:SERIF, fontSize:13, fontWeight:700, color:BRAND,
                  transition:"transform 0.15s, background 0.15s, color 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.background = BRAND;
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = BRAND;
                }}
              >
                <ListBullets size={16} weight="bold" />
                Data response · {dataResponsePaper.timeLimitMinutes} min
              </button>
            )}

            {/* Essay */}
            {essayPaper && (
              <button
                onClick={() => navigate("/test", {
                  state: { courseId, examType, paperId: essayPaper.id,
                           sectionName: courseData?.courseName } })}
                style={{
                  width:"100%", display:"flex", alignItems:"center", gap:9,
                  padding:"10px 12px", borderRadius:12,
                  border:"1.5px solid #E2EBF0",
                  background:"transparent", cursor:"pointer",
                  fontFamily:SERIF, fontSize:13, fontWeight:700, color:"#64748B",
                  transition:"transform 0.15s, border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.borderColor = "#94A3B8";
                  e.currentTarget.style.color = "#374151";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.borderColor = "#E2EBF0";
                  e.currentTarget.style.color = "#64748B";
                }}
              >
                <NotePencil size={16} weight="bold" />
                Practice essay · {essayPaper.timeLimitMinutes} min
              </button>
            )}
          </div>
        </aside>

        {/* Article */}
        <div ref={contentRef} onScroll={handleScroll}
          style={{ flex:1, overflowY:"auto", overflowX:"hidden",
            background:"#F8FAFC" }}>
          {articleContent}
          <AppFooter />
        </div>
      </div>
    </div>
  );
};

export default UnitScreen;
