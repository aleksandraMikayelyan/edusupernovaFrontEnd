/**
 * Units.jsx — Unit reading screen (WEB) — redesigned 2026
 *
 * SOLID:
 *   SRP  — screen manages unit selection + scroll progress only
 *   DIP  — data fetching via CoursesApi, not axios directly
 *   OCP  — PDF detection is a pure function, add keywords without touching render
 *
 * Design changes:
 *   - Dark teal study header (distraction-free, no global nav)
 *   - Teal gradient hero banner per unit
 *   - Sidebar: clean white with active unit highlighted in mint
 *   - Reading progress bar: 3px mint green
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FilePdf, CheckCircle, CaretDown, CaretRight } from "@phosphor-icons/react";
import { CoursesApi } from "../api/index.js";
import AppFooter          from "../components/common/appFooter.jsx";
import LoadingScreen      from "../components/common/LoadingScreen.jsx";
import ArticleBody        from "../components/units/ArticleBody.jsx";
import CollapsibleSection from "../components/units/CollapsibleSection.jsx";
import UnitTab            from "../components/units/UnitTab.jsx";

const DARK  = "#062f37"; const BRAND = "#0a5f6e"; const MINT = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif"; const SCRIPT = "Cookie, cursive";

// ─── Pure helpers (SRP) ───────────────────────────────────────────────────────

const PDF_KEYWORDS = ["act science","act math","a level","a-level","economy","economics","math"];
const hasPdfSheet  = (name = "") => PDF_KEYWORDS.some(kw => name.toLowerCase().includes(kw));

const calcReadingTime = (text) => {
  if (!text) return "1 min";
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const UnitScreen = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { courseId, examType } = location.state || {};

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

  const activeIndex = courseData?.units?.findIndex(u => u.id === activeUnit?.id) ?? 0;
  const showPdf     = hasPdfSheet(courseData?.courseName);

  const articleContent = useMemo(() => {
    if (!activeUnit) return null;
    return (
      <div style={{ background:"#fff", minHeight:"100%" }}>
        {/* Hero banner */}
        <div style={{
          background:`linear-gradient(135deg, ${DARK} 0%, ${BRAND} 45%, #1c94a7 80%, #2bbacf 100%)`,
          padding:"32px 80px" }}>
          <div style={{ display:"flex", alignItems:"center",
            justifyContent:"space-between", marginBottom:24 }}>
            <span style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
              color:"rgba(255,255,255,0.85)", letterSpacing:"0.1em",
              textTransform:"uppercase", background:"rgba(255,255,255,0.12)",
              border:"1px solid rgba(255,255,255,0.2)",
              padding:"5px 14px", borderRadius:999 }}>
              Unit {activeIndex + 1}
            </span>
            <span style={{ fontFamily:SERIF, fontSize:12,
              color:"rgba(255,255,255,0.5)" }}>
              {calcReadingTime(activeUnit.summary_path)}
            </span>
          </div>
        </div>

        {/* Title */}
        <div style={{ padding:"56px 80px 0", background:"#fff" }}>
          <h1 style={{ fontFamily:SERIF, fontSize:46, fontWeight:700,
            color:"#0F172A", lineHeight:1.1, letterSpacing:"-1.5px", marginBottom:20 }}>
            {activeUnit.title}
          </h1>
          <div style={{ height:4, width:56, background:MINT, borderRadius:999 }} />
        </div>

        {/* Body */}
        <ArticleBody text={activeUnit.summary_path} />

        {/* CTA */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
          padding:"0 80px 80px" }}>
          <div style={{ width:"100%", height:1, background:"#E2EBF0", marginBottom:44 }} />
          <p style={{ fontFamily:SERIF, fontSize:14, color:"#94A3B8",
            marginBottom:24, letterSpacing:"0.03em" }}>
            Ready to test what you've learned?
          </p>
          <button
            onClick={() => navigate("/test", {
              state: { courseId, examType, sectionName: courseData?.courseName } })}
            style={{ background:MINT, border:"none", borderRadius:14,
              padding:"17px 48px", fontFamily:SERIF, fontSize:16, fontWeight:700,
              color:DARK, cursor:"pointer", display:"flex", alignItems:"center", gap:10,
              boxShadow:"0 12px 40px rgba(93,202,165,0.35)",
              transition:"transform 0.18s, background 0.18s" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.background="#3aab87"}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.background=MINT}}
          >
            <CheckCircle size={20} weight="bold" />
            Check your knowledge
          </button>
        </div>
      </div>
    );
  }, [activeUnit?.id, activeUnit?.summary_path, activeIndex,
      navigate, courseId, examType, courseData?.courseName]);

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column",
      background:"#F7F4EF", overflow:"hidden" }}>

      {/* Study header — distraction-free, logo + course name only */}
      <header style={{ height:52, flexShrink:0,
        background:`linear-gradient(90deg, ${DARK} 0%, ${BRAND} 100%)`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 28px", zIndex:10,
        boxShadow:"0 2px 12px rgba(10,95,110,0.20)" }}>
        <span style={{ fontFamily:SCRIPT, fontSize:22, color:"#fff", letterSpacing:0.3 }}>
          edusupernova
        </span>
        {courseData?.courseName && (
          <span style={{ fontFamily:SERIF, fontSize:12,
            color:"rgba(255,255,255,0.45)", letterSpacing:"0.03em" }}>
            {courseData.courseName}
          </span>
        )}
      </header>

      {/* Reading progress bar — 3px mint */}
      <div style={{ height:3, width:"100%", background:"rgba(93,202,165,0.15)", flexShrink:0 }}>
        <div style={{ height:"100%", background:MINT,
          width:`${Math.round(scrollProgress * 100)}%`,
          transition:"width 0.3s ease",
          backgroundImage:`linear-gradient(90deg, ${BRAND}, ${MINT})` }} />
      </div>

      {/* Two-column layout */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* Sidebar */}
        <aside style={{ width:272, flexShrink:0, background:"#fff",
          borderRight:"1px solid #E2EBF0", overflowY:"auto",
          paddingTop:24, paddingLeft:14, paddingRight:14, paddingBottom:16,
          boxShadow:"2px 0 12px rgba(0,0,0,0.04)" }}>

          {showPdf && (
            <button
              onClick={() => window.open(CoursesApi.getFormulaSheet(courseId), "_blank")}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10,
                background:"#f0fdf4", border:"1px solid #86efac",
                borderRadius:12, padding:"11px 14px", marginBottom:20,
                cursor:"pointer", transition:"background 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#dcfce7"}
              onMouseLeave={e=>e.currentTarget.style.background="#f0fdf4"}
            >
              <FilePdf size={18} weight="duotone" color="#15803d" />
              <span style={{ fontFamily:SERIF, fontSize:13, fontWeight:700,
                color:"#15803d", flex:1, textAlign:"left", letterSpacing:"0.02em" }}>
                Formula Sheet PDF
              </span>
            </button>
          )}

          <CollapsibleSection title="COURSE UNITS" defaultOpen>
            {courseData?.units?.map((u, idx) => (
              <UnitTab key={u.id} unit={u} index={idx}
                isActive={activeUnit?.id === u.id}
                onPress={() => activeUnit?.id !== u.id && setActiveUnit(u)} />
            ))}
          </CollapsibleSection>
        </aside>

        {/* Article content */}
        <div ref={contentRef} onScroll={handleScroll}
          style={{ flex:1, overflowY:"auto", overflowX:"hidden", background:"#F7F4EF" }}>
          {articleContent}
          <AppFooter />
        </div>
      </div>
    </div>
  );
};

export default UnitScreen;