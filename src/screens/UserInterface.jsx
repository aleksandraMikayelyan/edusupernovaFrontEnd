/**
 * UserInterface.jsx — Course Dashboard
 * Premium desktop design: dark hero strip, warm cream body, elevated course cards.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "@phosphor-icons/react";
import { CoursesApi } from "../api/index.js";
import AppHeader  from "../components/common/appHeader.jsx";
import AppFooter  from "../components/common/appFooter.jsx";
import ExamCard   from "../components/userInterface/ExamCard.jsx";
import CourseCard from "../components/userInterface/CourseCard.jsx";
import useInView  from "../hooks/useInView.js";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const CREAM = "#F7F4EF";
const SERIF = "Newsreader, Georgia, serif";

// ─── Skeleton loader ──────────────────────────────────────────────────────────

const Skeleton = () => (
  <div style={{ minHeight:"100vh", background:CREAM,
    display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"center", gap:18 }}>
    <div style={{ width:52, height:52, borderRadius:"50%",
      border:`3px solid rgba(10,95,110,0.12)`, borderTopColor:BRAND,
      animation:"uispin 0.7s linear infinite" }} />
    <p style={{ fontFamily:SERIF, fontSize:15, color:BRAND, opacity:0.7 }}>
      Loading your dashboard…
    </p>
    <style>{`@keyframes uispin { to { transform:rotate(360deg); } }`}</style>
  </div>
);

// ─── Course grid skeleton ─────────────────────────────────────────────────────

const CardSkeleton = () => (
  <div style={{ display:"grid",
    gridTemplateColumns:"repeat(auto-fill, minmax(190px, 1fr))", gap:16 }}>
    {[...Array(6)].map((_, i) => (
      <div key={i} style={{
        height:140, borderRadius:20,
        background:"linear-gradient(90deg, #E2EBF0 25%, #EEF2F7 50%, #E2EBF0 75%)",
        backgroundSize:"400% 100%",
        animation:`shimmer 1.4s ease ${i * 0.1}s infinite`,
      }} />
    ))}
    <style>{`
      @keyframes shimmer {
        0%   { background-position: 100% 0; }
        100% { background-position: -100% 0; }
      }
    `}</style>
  </div>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const UserInterface = () => {
  const navigate = useNavigate();
  const [coursesRef, coursesInView] = useInView(0.1);

  const [exams,          setExams]          = useState([]);
  const [selectedExam,   setSelectedExam]   = useState(null);
  const [courses,        setCourses]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [networkError,   setNetworkError]   = useState(false);

  useEffect(() => {
    CoursesApi.getExams()
      .then(res => {
        if (Array.isArray(res.data)) {
          // Deduplicate by name — DB may have duplicate rows with different IDs
          const seen = new Set();
          setExams(res.data.filter(e => {
            const key = e.examname?.toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          }));
        }
      })
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
      if (Array.isArray(res.data)) {
        const seen = new Set();
        setCourses(res.data.filter(c => {
          const key = c.coursename?.toLowerCase();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        }));
      }
    } catch {}
    finally { setLoadingCourses(false); }
  };

  const handleSelectCourse = (course) =>
    navigate("/units", { state: { courseId: course.id, examType: selectedExam?.examname, papers: course.papers ?? [] } });

  if (loading) return <Skeleton />;

  return (
    <div style={{ minHeight:"100vh", background:CREAM, display:"flex", flexDirection:"column" }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes uispin  { to{transform:rotate(360deg)} }
      `}</style>

      <AppHeader />

      {/* ── Hero strip ── */}
      <div style={{
        background:`linear-gradient(145deg, #021a1f 0%, ${DARK} 40%, ${BRAND} 100%)`,
        padding:"56px 48px 72px", position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", inset:0, opacity:0.04,
          backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize:"28px 28px", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-30%", right:"-5%",
          width:400, height:400, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(93,202,165,0.1) 0%, transparent 70%)",
          pointerEvents:"none" }} />

        <div style={{ maxWidth:1000, margin:"0 auto", position:"relative", zIndex:1 }}>
          <span style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
            letterSpacing:"0.14em", textTransform:"uppercase",
            color:"rgba(255,255,255,0.4)", display:"block", marginBottom:12 }}>
            Your dashboard
          </span>
          <h1 style={{
            fontFamily:SERIF, fontSize:"clamp(32px,4.5vw,56px)", fontWeight:700,
            color:"#fff", lineHeight:1.08, letterSpacing:"-2px", marginBottom:14,
          }}>
            What are you<br />
            <em style={{ fontStyle:"italic", color:MINT }}>preparing for?</em>
          </h1>
          <p style={{ fontFamily:SERIF, fontSize:15,
            color:"rgba(255,255,255,0.45)", lineHeight:1.7, maxWidth:400 }}>
            Select your exam type below, then choose your subject.
          </p>
        </div>

        {/* Wave */}
        <div style={{ position:"absolute", bottom:-1, left:0, right:0, lineHeight:0 }}>
          <svg viewBox="0 0 1440 48" fill="none" style={{ display:"block", width:"100%" }}>
            <path d="M0 48 C480 0 960 48 1440 18 L1440 48 Z" fill={CREAM}/>
          </svg>
        </div>
      </div>

      <main style={{ flex:1, padding:"44px 48px 96px",
        maxWidth:1048, margin:"0 auto", width:"100%", boxSizing:"border-box" }}>

        {/* ── Exam selector ── */}
        <div style={{ marginBottom:48 }}>
          <p style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
            letterSpacing:"0.14em", textTransform:"uppercase",
            color:"#94A3B8", marginBottom:16 }}>
            Exam type
          </p>

          {networkError ? (
            <div style={{ background:"#fff0f0", border:"1px solid #fca5a5",
              borderRadius:16, padding:"16px 20px",
              fontFamily:SERIF, fontSize:14, color:"#b02020" }}>
              Connection error — please check the server is running.
            </div>
          ) : (
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {exams.length > 0 ? exams.map(exam => (
                <ExamCard key={exam.id} exam={exam}
                  isActive={selectedExam?.id === exam.id}
                  onPress={() => handleSelectExam(exam)} />
              )) : (
                <p style={{ fontFamily:SERIF, fontSize:14,
                  color:"#94A3B8", fontStyle:"italic" }}>
                  No exams found in the database.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Course grid ── */}
        {selectedExam && (
          <div ref={coursesRef}>
            <div style={{
              display:"flex", alignItems:"flex-end",
              justifyContent:"space-between", marginBottom:24,
              paddingBottom:18, borderBottom:`1px solid #E2EBF0`,
              animation: coursesInView ? "fadeUp 0.5s ease both" : "none",
              opacity: coursesInView ? undefined : 0,
            }}>
              <div>
                <p style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
                  letterSpacing:"0.14em", textTransform:"uppercase",
                  color:BRAND, marginBottom:4 }}>
                  Subjects available
                </p>
                <h2 style={{ fontFamily:SERIF, fontSize:28, fontWeight:700,
                  color:"#0F172A", letterSpacing:"-0.8px" }}>
                  {selectedExam.examname}
                </h2>
              </div>
              {courses.length > 0 && (
                <span style={{ fontFamily:SERIF, fontSize:13, color:"#94A3B8" }}>
                  {courses.length} {courses.length === 1 ? "subject" : "subjects"}
                </span>
              )}
            </div>

            {loadingCourses ? (
              <CardSkeleton />
            ) : courses.length > 0 ? (
              <div style={{ display:"grid",
                gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",
                gap:16 }}>
                {courses.map((course, i) => (
                  <div key={course.id} style={{
                    animation:`fadeUp 0.5s ease both ${i * 55}ms`,
                    opacity:1,
                  }}>
                    <CourseCard course={course}
                      onPress={() => handleSelectCourse(course)} />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily:SERIF, fontSize:14,
                color:"#94A3B8", fontStyle:"italic" }}>
                No subjects found for this exam.
              </p>
            )}
          </div>
        )}

        {/* Pre-selection prompt */}
        {!selectedExam && !networkError && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", padding:"80px 0", gap:20 }}>
            <div style={{ width:72, height:72, borderRadius:24,
              background:"#e8f7f9",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 8px 24px rgba(10,95,110,0.12)" }}>
              <BookOpen size={32} weight="duotone" color={BRAND} />
            </div>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontFamily:SERIF, fontSize:18, fontWeight:700,
                color:"#0F172A", marginBottom:8 }}>
                Choose your exam type
              </p>
              <p style={{ fontFamily:SERIF, fontSize:14, color:"#94A3B8" }}>
                Select one of the options above to see available subjects.
              </p>
            </div>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
};

export default UserInterface;
