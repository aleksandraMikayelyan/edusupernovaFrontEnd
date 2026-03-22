/**
 * UserInterface.jsx — Course Dashboard (WEB) — redesigned 2026
 *
 * SOLID:
 *   SRP  — screen only manages selection state. Data fetching → CoursesApi
 *   DIP  — depends on CoursesApi, not axios directly
 *   OCP  — exam pills + course cards are data-driven, no hardcoding
 *
 * Design: dark header strip → warm cream body → white course cards
 * Entrance animations on scroll via IntersectionObserver
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, MagnifyingGlass } from "@phosphor-icons/react";
import { CoursesApi } from "../api/index.js";
import AppHeader  from "../components/common/appHeader.jsx";
import AppFooter  from "../components/common/appFooter.jsx";
import ExamCard   from "../components/userInterface/ExamCard.jsx";
import CourseCard from "../components/userInterface/CourseCard.jsx";
import useInView  from "../hooks/useInView.js";

const DARK  = "#062f37"; const BRAND = "#0a5f6e"; const MINT = "#5DCAA5";
const CREAM = "#F7F4EF"; const SERIF = "Newsreader, Georgia, serif";

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const Skeleton = () => (
  <div style={{ minHeight:"100vh", background:CREAM, display:"flex",
    flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
    <div style={{ width:48, height:48, borderRadius:"50%",
      border:`3px solid rgba(10,95,110,0.15)`, borderTopColor:BRAND,
      animation:"uispin 0.7s linear infinite" }} />
    <p style={{ fontFamily:SERIF, fontSize:16, color:BRAND }}>Loading your dashboard…</p>
    <style>{`@keyframes uispin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
const UserInterface = () => {
  const navigate = useNavigate();
  const [coursesRef, coursesInView] = useInView(0.1);

  const [exams,        setExams]        = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [courses,      setCourses]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    CoursesApi.getExams()
      .then(res => { if (Array.isArray(res.data)) setExams(res.data); })
      .catch(() => setNetworkError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectExam = async (exam) => {
    if (!exam?.id || selectedExam?.id === exam.id) return;
    setSelectedExam(exam);
    setCourses([]);
    setLoadingCourses(true);
    try {
      const res = await CoursesApi.getCoursesByExam(exam.id);
      if (Array.isArray(res.data)) setCourses(res.data);
    } catch {}
    finally { setLoadingCourses(false); }
  };

  const handleSelectCourse = (course) => {
    navigate("/units", { state: { courseId: course.id, examType: selectedExam?.examname } });
  };

  if (loading) return <Skeleton />;

  return (
    <div style={{ minHeight:"100vh", background:CREAM, display:"flex", flexDirection:"column" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .exam-pill:hover { border-color: ${BRAND} !important; background: #e8f7f9 !important; }
        .exam-pill { transition: all 0.15s !important; }
      `}</style>

      <AppHeader />

      {/* ── Hero strip ── */}
      <div style={{
        background:`linear-gradient(135deg, ${DARK} 0%, ${BRAND} 100%)`,
        padding:"48px 40px 56px", position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", inset:0, opacity:0.05,
          backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize:"28px 28px", pointerEvents:"none" }} />
        <div style={{ maxWidth:960, margin:"0 auto", position:"relative", zIndex:1 }}>
          <span style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
            letterSpacing:"0.12em", textTransform:"uppercase",
            color:"rgba(255,255,255,0.45)", display:"block", marginBottom:10 }}>
            Your dashboard
          </span>
          <h1 style={{ fontFamily:SERIF, fontSize:"clamp(32px,5vw,52px)", fontWeight:700,
            color:"#fff", lineHeight:1.1, letterSpacing:"-1.5px", marginBottom:12 }}>
            What are you<br />
            <span style={{ color:MINT }}>preparing for?</span>
          </h1>
          <p style={{ fontFamily:SERIF, fontSize:15, color:"rgba(255,255,255,0.5)", lineHeight:1.6 }}>
            Select your exam type below, then choose your subject.
          </p>
        </div>

        {/* Wave */}
        <div style={{ position:"absolute", bottom:-1, left:0, right:0, lineHeight:0 }}>
          <svg viewBox="0 0 1440 40" fill="none" style={{ display:"block", width:"100%" }}>
            <path d="M0 40 C480 0 960 40 1440 15 L1440 40 Z" fill={CREAM}/>
          </svg>
        </div>
      </div>

      <main style={{ flex:1, padding:"40px 40px 80px", maxWidth:1000, margin:"0 auto", width:"100%", boxSizing:"border-box" }}>

        {/* ── Exam selector ── */}
        <div style={{ marginBottom:40 }}>
          <p style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
            letterSpacing:"0.12em", textTransform:"uppercase",
            color:"#94A3B8", marginBottom:14 }}>
            Exam type
          </p>
          {networkError ? (
            <p style={{ fontFamily:SERIF, fontSize:14, color:"#b02020" }}>
              Connection error. Please check the server.
            </p>
          ) : (
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {exams.length > 0 ? exams.map((exam) => (
                <ExamCard key={exam.id} exam={exam}
                  isActive={selectedExam?.id === exam.id}
                  onPress={() => handleSelectExam(exam)} />
              )) : (
                <p style={{ fontFamily:SERIF, fontSize:14, color:"#94A3B8", fontStyle:"italic" }}>
                  No exams found in the database.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Course grid ── */}
        {selectedExam && (
          <div ref={coursesRef}>
            {/* Section header */}
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between",
              marginBottom:20, paddingBottom:16,
              borderBottom:`1px solid #E2EBF0`,
              animation: coursesInView ? "fadeUp 0.5s ease both" : "none",
              opacity: coursesInView ? undefined : 0 }}>
              <div>
                <p style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
                  letterSpacing:"0.12em", textTransform:"uppercase",
                  color:BRAND, marginBottom:4 }}>
                  Subjects available
                </p>
                <h2 style={{ fontFamily:SERIF, fontSize:26, fontWeight:700,
                  color:"#0F172A", letterSpacing:"-0.5px" }}>
                  {selectedExam.examname}
                </h2>
              </div>
              {courses.length > 0 && (
                <span style={{ fontFamily:SERIF, fontSize:13, color:"#94A3B8" }}>
                  {courses.length} {courses.length === 1 ? "subject" : "subjects"}
                </span>
              )}
            </div>

            {/* Grid */}
            {loadingCourses ? (
              <div style={{ display:"flex", justifyContent:"center", padding:"40px 0" }}>
                <div style={{ width:32, height:32, borderRadius:"50%",
                  border:`2px solid rgba(10,95,110,0.15)`, borderTopColor:BRAND,
                  animation:"uispin 0.7s linear infinite" }} />
              </div>
            ) : courses.length > 0 ? (
              <div style={{ display:"grid",
                gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",
                gap:16 }}>
                {courses.map((course, i) => (
                  <div key={course.id} style={{
                    animation: `fadeUp 0.5s ease both ${i * 60}ms`, opacity: 1,
                  }}>
                    <CourseCard course={course} onPress={() => handleSelectCourse(course)} />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily:SERIF, fontSize:14, color:"#94A3B8", fontStyle:"italic" }}>
                Loading subjects…
              </p>
            )}
          </div>
        )}

        {/* Pre-selection prompt */}
        {!selectedExam && !networkError && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", padding:"60px 0", gap:16 }}>
            <div style={{ width:64, height:64, borderRadius:20,
              background:"#e8f7f9", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <BookOpen size={28} weight="duotone" color={BRAND} />
            </div>
            <p style={{ fontFamily:SERIF, fontSize:16, color:"#94A3B8", textAlign:"center" }}>
              Select an exam type above<br />to see its subjects.
            </p>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
};

export default UserInterface;