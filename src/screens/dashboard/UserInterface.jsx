/**
 * UserInterface.jsx — Course Dashboard
 * Premium desktop design: dark hero strip, warm cream body, elevated course cards.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Books } from "@phosphor-icons/react";
import { CoursesApi } from "../../api/index.js";
import useAuth               from "../../hooks/useAuth.js";
import AppHeader             from "../../components/common/appHeader.jsx";
import AppFooter             from "../../components/common/appFooter.jsx";
import ExamCard              from "../../components/userInterface/ExamCard.jsx";
import CourseCard            from "../../components/userInterface/CourseCard.jsx";
import ALevelSectionToggle   from "../../components/ALevelSectionToggle.jsx";
import useInView             from "../../hooks/useInView.js";

const isALevels = (exam) =>
  exam?.examname?.toUpperCase().replace(/[\s_-]/g, "").includes("ALEVEL");

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
  const { userId } = useAuth();
  const [coursesRef, coursesInView] = useInView(0.1);

  const [exams,          setExams]          = useState([]);
  const [selectedExam,   setSelectedExam]   = useState(null);
  const [courses,        setCourses]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [networkError,   setNetworkError]   = useState(false);
  const [aLevelSection,  setALevelSection]  = useState("AS");

  // ── Enrollment state ──────────────────────────────────────────────────────
  const [isEnrolled,    setIsEnrolled]    = useState(false);
  const [enrollChecked, setEnrollChecked] = useState(false); // true once status fetched
  const [enrolling,     setEnrolling]     = useState(false);
  const [enrollError,   setEnrollError]   = useState(null);

  // ── A-Level per-course subject selection (localStorage-backed) ────────────
  const [myALevelCourses,    setMyALevelCourses]    = useState(new Set());
  const [showMySubjectsOnly, setShowMySubjectsOnly] = useState(false);

  useEffect(() => {
    if (!userId) return;
    try {
      const saved = localStorage.getItem(`alevel_courses_${userId}`);
      if (saved) setMyALevelCourses(new Set(JSON.parse(saved)));
    } catch {}
  }, [userId]);

  const toggleALevelCourse = (e, courseId) => {
    e.stopPropagation();
    if (!userId) return;
    setMyALevelCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      localStorage.setItem(`alevel_courses_${userId}`, JSON.stringify([...next]));
      return next;
    });
  };

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

  const fetchCourses = async (exam, section = null) => {
    setCourses([]);
    setLoadingCourses(true);
    try {
      const sectionParam = isALevels(exam) ? section : null;
      const [coursesRes, statusRes] = await Promise.allSettled([
        CoursesApi.getCoursesByExam(exam.id, sectionParam),
        userId ? CoursesApi.checkEnrollment(exam.id, userId) : Promise.resolve({ data: false }),
      ]);

      if (coursesRes.status === "fulfilled" && Array.isArray(coursesRes.value.data)) {
        const seen = new Set();
        setCourses(coursesRes.value.data.filter(c => {
          const key = c.coursename?.toLowerCase();
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        }));
      }

      if (statusRes.status === "fulfilled") {
        setIsEnrolled(!!statusRes.value.data);
      }
    } catch {}
    finally {
      setLoadingCourses(false);
      setEnrollChecked(true);
    }
  };

  const handleSectionChange = (newSection) => {
    setALevelSection(newSection);
    if (selectedExam) fetchCourses(selectedExam, newSection);
  };

  const handleSelectExam = (exam) => {
    if (!exam?.id || selectedExam?.id === exam.id) return;
    setSelectedExam(exam);
    setEnrollChecked(false);
    setEnrollError(null);
    if (!isALevels(exam)) setShowMySubjectsOnly(false);
    fetchCourses(exam, isALevels(exam) ? aLevelSection : null);
  };

  const handleEnroll = async () => {
    if (!selectedExam?.id || !userId || enrolling) return;
    setEnrolling(true);
    setEnrollError(null);
    try {
      await CoursesApi.enroll(selectedExam.id, userId);
      setIsEnrolled(true);
    } catch (err) {
      setEnrollError(err.message ?? "Enrollment failed. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!selectedExam?.id || !userId || enrolling) return;
    if (!window.confirm(`Unenroll from ${selectedExam.examname}? Your progress data will be kept.`)) return;
    setEnrolling(true);
    try {
      await CoursesApi.unenroll(selectedExam.id, userId);
      setIsEnrolled(false);
    } catch {}
    finally { setEnrolling(false); }
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

            {/* ── Enrollment banner ── */}
            {enrollChecked && (
              <div style={{
                marginBottom: 24,
                animation: "fadeUp 0.4s ease both",
              }}>
                {isEnrolled ? (
                  /* Enrolled state */
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", flexWrap: "wrap", gap: 12,
                    background: "linear-gradient(135deg, #f0fdf4, #e8f7f0)",
                    border: "1.5px solid rgba(21,128,61,0.2)",
                    borderRadius: 16, padding: "14px 20px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%",
                        background: "#15803d", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        flexShrink: 0, fontSize: 12, color: "#fff", fontWeight: 700,
                      }}>
                        ✓
                      </div>
                      <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700,
                        color: "#15803d" }}>
                        Enrolled in {selectedExam.examname}
                      </span>
                      <span style={{ fontFamily: SERIF, fontSize: 13, color: "#16a34a" }}>
                        — your progress is being tracked
                      </span>
                    </div>
                    <button onClick={handleUnenroll} disabled={enrolling}
                      style={{
                        fontFamily: SERIF, fontSize: 12, fontWeight: 700,
                        color: "#94A3B8", background: "none", border: "none",
                        cursor: "pointer", textDecoration: "underline",
                        opacity: enrolling ? 0.5 : 1,
                      }}>
                      Unenroll
                    </button>
                  </div>
                ) : (
                  /* Not enrolled — prompt to enroll */
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", flexWrap: "wrap", gap: 12,
                    background: "#fff",
                    border: `1.5px solid ${enrollError ? "#fca5a5" : "#E2EBF0"}`,
                    borderRadius: 16, padding: "14px 20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}>
                    <div>
                      <p style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700,
                        color: "#0F172A", margin: 0 }}>
                        Track your progress in {selectedExam.examname}
                      </p>
                      <p style={{ fontFamily: SERIF, fontSize: 13, color: "#64748B", margin: 0 }}>
                        Enroll to save your scores and see analytics in your profile.
                      </p>
                      {enrollError && (
                        <p style={{ fontFamily: SERIF, fontSize: 12, color: "#b02020", margin: "4px 0 0" }}>
                          {enrollError}
                        </p>
                      )}
                    </div>
                    <button onClick={handleEnroll} disabled={enrolling}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "11px 24px", borderRadius: 12, border: "none",
                        fontFamily: SERIF, fontSize: 14, fontWeight: 700,
                        cursor: enrolling ? "not-allowed" : "pointer",
                        background: enrolling ? "#E8EDF2" : MINT,
                        color: enrolling ? "#94A3B8" : DARK,
                        boxShadow: enrolling ? "none" : "0 6px 20px rgba(93,202,165,0.35)",
                        transition: "all 0.18s", flexShrink: 0,
                      }}
                      onMouseEnter={e => { if (!enrolling) {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.background = "#3aab87";
                      }}}
                      onMouseLeave={e => { if (!enrolling) {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.background = MINT;
                      }}}
                    >
                      {enrolling ? (
                        <>
                          <div style={{
                            width: 14, height: 14, borderRadius: "50%",
                            border: "2px solid rgba(6,47,55,0.15)",
                            borderTopColor: DARK,
                            animation: "uispin 0.7s linear infinite", flexShrink: 0,
                          }} />
                          Enrolling…
                        </>
                      ) : "Enroll now"}
                    </button>
                  </div>
                )}
              </div>
            )}

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
                <div style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
                  <h2 style={{ fontFamily:SERIF, fontSize:28, fontWeight:700,
                    color:"#0F172A", letterSpacing:"-0.8px", margin:0 }}>
                    {selectedExam.examname}
                  </h2>
                  {isALevels(selectedExam) && (
                    <ALevelSectionToggle
                      section={aLevelSection}
                      onChange={handleSectionChange}
                    />
                  )}
                </div>
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
              <>
                {/* ── A-Level subject filter bar ── */}
                {isALevels(selectedExam) && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    marginBottom: 20, flexWrap: "wrap",
                  }}>
                    {myALevelCourses.size > 0 ? (
                      <>
                        <button
                          onClick={() => setShowMySubjectsOnly(false)}
                          style={{
                            fontFamily: SERIF, fontSize: 12, fontWeight: 700,
                            padding: "6px 16px", borderRadius: 99, cursor: "pointer",
                            border: `1.5px solid ${!showMySubjectsOnly ? BRAND : "#E2EBF0"}`,
                            background: !showMySubjectsOnly ? "#e8f7f9" : "#fff",
                            color: !showMySubjectsOnly ? BRAND : "#94A3B8",
                            transition: "all 0.18s",
                          }}
                        >
                          All subjects ({courses.length})
                        </button>
                        <button
                          onClick={() => setShowMySubjectsOnly(true)}
                          style={{
                            fontFamily: SERIF, fontSize: 12, fontWeight: 700,
                            padding: "6px 16px", borderRadius: 99, cursor: "pointer",
                            border: `1.5px solid ${showMySubjectsOnly ? BRAND : "#E2EBF0"}`,
                            background: showMySubjectsOnly ? "#e8f7f9" : "#fff",
                            color: showMySubjectsOnly ? BRAND : "#94A3B8",
                            transition: "all 0.18s",
                          }}
                        >
                          My subjects ({myALevelCourses.size})
                        </button>
                      </>
                    ) : (
                      <p style={{ fontFamily: SERIF, fontSize: 13,
                        color: "#94A3B8", margin: 0, fontStyle: "italic" }}>
                        Click + on a subject to add it to your personal list
                      </p>
                    )}
                  </div>
                )}

                {/* ── Course cards grid ── */}
                {(() => {
                  const displayed = isALevels(selectedExam) && showMySubjectsOnly
                    ? courses.filter(c => myALevelCourses.has(c.id))
                    : courses;

                  if (displayed.length === 0) return (
                    <div style={{ display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 14, padding: "48px 0" }}>
                      <p style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700,
                        color: "#0F172A", margin: 0 }}>
                        No subjects in your list for this section.
                      </p>
                      <button
                        onClick={() => setShowMySubjectsOnly(false)}
                        style={{
                          fontFamily: SERIF, fontSize: 13, fontWeight: 700,
                          color: BRAND, background: "#e8f7f9",
                          border: "1px solid rgba(10,95,110,0.15)",
                          borderRadius: 10, padding: "9px 20px", cursor: "pointer",
                        }}
                      >
                        Show all subjects
                      </button>
                    </div>
                  );

                  return (
                    <div style={{ display:"grid",
                      gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",
                      gap:16 }}>
                      {displayed.map((course, i) => (
                        <div key={course.id} style={{
                          position: "relative",
                          animation:`fadeUp 0.5s ease both ${i * 55}ms`,
                          opacity:1,
                        }}>
                          {/* A-Level subject pin toggle */}
                          {isALevels(selectedExam) && (
                            <button
                              onClick={(e) => toggleALevelCourse(e, course.id)}
                              title={myALevelCourses.has(course.id)
                                ? "Remove from my subjects"
                                : "Add to my subjects"}
                              style={{
                                position: "absolute", top: 10, right: 10, zIndex: 2,
                                width: 28, height: 28, borderRadius: "50%",
                                border: "none",
                                background: myALevelCourses.has(course.id)
                                  ? MINT : "rgba(255,255,255,0.95)",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer",
                                fontSize: 15, fontWeight: 700,
                                color: myALevelCourses.has(course.id) ? DARK : "#94A3B8",
                                transition: "all 0.18s",
                              }}
                              onMouseEnter={e => {
                                if (!myALevelCourses.has(course.id)) {
                                  e.currentTarget.style.background = MINT;
                                  e.currentTarget.style.color = DARK;
                                }
                              }}
                              onMouseLeave={e => {
                                if (!myALevelCourses.has(course.id)) {
                                  e.currentTarget.style.background = "rgba(255,255,255,0.95)";
                                  e.currentTarget.style.color = "#94A3B8";
                                }
                              }}
                            >
                              {myALevelCourses.has(course.id) ? "✓" : "+"}
                            </button>
                          )}
                          <CourseCard course={course}
                            onPress={() => handleSelectCourse(course)} />
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </>
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
              <Books size={32} weight="duotone" color={BRAND} />
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
