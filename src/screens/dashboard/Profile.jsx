/**
 * Profile.jsx — Student Profile & Analytics Dashboard
 *
 * Shows:
 *   • User identity (username, email) from AuthContext
 *   • Per-exam progress sections with one CourseProgressCard per course
 *   • Each card: course name/icon, progress bar, Pass%, and key stats
 *
 * Pass% formula (computed backend-side):
 *   Pass% = (Completed Lessons / Total Lessons) × Average Quiz Score
 *
 * API: GET /api/progress/me → List<ExamProgressDTO>
 *   ExamProgressDTO { examId, examName, examIcon, courses: CourseProgressDTO[] }
 *   CourseProgressDTO { courseId, courseName, courseIcon, totalLessons,
 *                       completedLessons, averageQuizScore, passPercentage }
 */

import { useState, useEffect } from "react";
import { useNavigate }  from "react-router-dom";
import { BookOpen, ChartBar, Trophy, SignOut, CheckCircle, ArrowRight, GraduationCap, ArrowSquareOut } from "@phosphor-icons/react";
import { ProgressApi }  from "../../api/index.js";
import useAuth          from "../../hooks/useAuth.js";
import AppHeader        from "../../components/common/appHeader.jsx";
import AppFooter        from "../../components/common/appFooter.jsx";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const CREAM = "#F7F4EF";
const SERIF = "Newsreader, Georgia, serif";

// ── Helpers ───────────────────────────────────────────────────────────────────

const gradeColor = (pct) => {
  if (pct >= 80) return "#15803d";
  if (pct >= 60) return BRAND;
  if (pct >= 40) return "#b45309";
  return "#94A3B8";
};

const gradeLabel = (pct) => {
  if (pct >= 80) return "A";
  if (pct >= 60) return "B";
  if (pct >= 40) return "C";
  if (pct >= 20) return "D";
  return "U";
};

// ── Progress bar ──────────────────────────────────────────────────────────────

const ProgressBar = ({ value, color = MINT }) => (
  <div style={{
    height: 8, borderRadius: 99,
    background: "#E2EBF0", overflow: "hidden",
  }}>
    <div style={{
      height: "100%",
      width: `${Math.min(100, Math.max(0, value))}%`,
      background: color,
      borderRadius: 99,
      transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
    }} />
  </div>
);

// ── Course progress card ──────────────────────────────────────────────────────

const CourseProgressCard = ({ course, index, examName }) => {
  const navigate = useNavigate();
  const pass        = course.passPercentage ?? 0;
  const color       = gradeColor(pass);
  const grade       = gradeLabel(pass);
  const isCompleted = course.totalLessons > 0 && course.completedLessons >= course.totalLessons;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      border: "1px solid #E8F0F4",
      padding: "24px 28px",
      display: "flex", flexDirection: "column", gap: 16,
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      animation: `profFadeUp 0.45s ease ${index * 70}ms both`,
    }}>
      {/* Course header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14, flexShrink: 0,
          background: "#e8f7f9",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <BookOpen size={22} weight="duotone" color={BRAND} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: SERIF, fontSize: 15, fontWeight: 700,
            color: "#0F172A", margin: 0, letterSpacing: "-0.2px",
          }}>
            {course.courseName}
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 12, color: "#94A3B8", margin: 0 }}>
            {course.completedLessons} / {course.totalLessons} lessons
          </p>
        </div>

        {/* Grade badge */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `1.5px solid ${color}30`,
        }}>
          <span style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color }}>
            {grade}
          </span>
        </div>
      </div>

      {/* Completed badge */}
      {isCompleted && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          alignSelf: "flex-start",
          background: "rgba(21,128,61,0.08)",
          border: "1px solid rgba(21,128,61,0.22)",
          borderRadius: 8, padding: "4px 10px",
        }}>
          <CheckCircle size={13} weight="fill" color="#15803d" />
          <span style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 700, color: "#15803d" }}>
            Completed
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "baseline", marginBottom: 8 }}>
          <span style={{ fontFamily: SERIF, fontSize: 12, color: "#64748B" }}>
            Pass %
          </span>
          <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color }}>
            {pass.toFixed(1)}%
          </span>
        </div>
        <ProgressBar value={pass} color={color === "#94A3B8" ? "#CBD5E1" : color} />
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 16 }}>
        <StatPill
          label="Avg. Score"
          value={`${course.averageQuizScore.toFixed(1)}%`}
          icon={<ChartBar size={13} weight="bold" color={BRAND} />}
        />
        <StatPill
          label="Lessons done"
          value={`${course.completedLessons} / ${course.totalLessons}`}
          icon={<Trophy size={13} weight="bold" color={BRAND} />}
        />
      </div>

      {/* Retake / study again button */}
      <button
        onClick={() => navigate("/units", { state: { courseId: course.courseId, examType: examName } })}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          fontFamily: SERIF, fontSize: 13, fontWeight: 700,
          color: BRAND, background: "#e8f7f9",
          border: "1px solid rgba(10,95,110,0.15)",
          borderRadius: 10, padding: "9px 0",
          cursor: "pointer", transition: "all 0.18s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = BRAND;
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "#e8f7f9";
          e.currentTarget.style.color = BRAND;
        }}
      >
        {isCompleted ? "Study again" : "Continue studying"}
        <ArrowRight size={13} weight="bold" />
      </button>
    </div>
  );
};

const StatPill = ({ label, value, icon }) => (
  <div style={{
    flex: 1, display: "flex", alignItems: "center", gap: 8,
    background: "#F8FAFC", borderRadius: 10, padding: "8px 12px",
    border: "1px solid #E8F0F4",
  }}>
    {icon}
    <div>
      <p style={{ fontFamily: SERIF, fontSize: 10, color: "#94A3B8", margin: 0,
        fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}
      </p>
      <p style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: "#0F172A", margin: 0 }}>
        {value}
      </p>
    </div>
  </div>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────

const SkeletonCard = ({ i }) => (
  <div style={{
    height: 160, borderRadius: 20,
    background: "linear-gradient(90deg, #E2EBF0 25%, #EEF2F7 50%, #E2EBF0 75%)",
    backgroundSize: "400% 100%",
    animation: `shimmer 1.4s ease ${i * 0.1}s infinite`,
  }} />
);

// ── Main screen ───────────────────────────────────────────────────────────────

const Profile = () => {
  const navigate = useNavigate();
  const { username, userId, clearSession } = useAuth();

  const handleLogout = () => { clearSession(); navigate("/login"); };

  const [examProgress,    setExamProgress]    = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(false);
  const [myALevelCourses, setMyALevelCourses] = useState(new Set());

  useEffect(() => {
    ProgressApi.getMyProgress()
      .then(res => {
        if (Array.isArray(res.data)) setExamProgress(res.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!userId) return;
    try {
      const saved = localStorage.getItem(`alevel_courses_${userId}`);
      if (saved) setMyALevelCourses(new Set(JSON.parse(saved)));
    } catch {}
  }, [userId]);

  const totalCourses   = examProgress.flatMap(e => e.courses).length;
  const totalCompleted = examProgress
    .flatMap(e => e.courses)
    .reduce((acc, c) => acc + c.completedLessons, 0);
  const overallAvg     = totalCourses === 0 ? 0 :
    examProgress.flatMap(e => e.courses)
      .reduce((acc, c) => acc + c.averageQuizScore, 0) / totalCourses;

  // ── A-Level enrolled subjects ─────────────────────────────────────────────
  const isALevelExam = (name = "") =>
    name.toUpperCase().replace(/[\s_-]/g, "").includes("ALEVEL");
  const aLevelExams  = examProgress.filter(e => isALevelExam(e.examName));
  const aLevelExamName = aLevelExams[0]?.examName ?? "A-Level";
  // Courses with progress that the student pinned
  const aLevelPinnedWithProgress = aLevelExams
    .flatMap(e => e.courses)
    .filter(c => myALevelCourses.has(c.courseId));
  // How many pinned IDs have NO progress data yet
  const aLevelPinnedWithoutProgress =
    myALevelCourses.size - aLevelPinnedWithProgress.length;

  return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes profFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }
      `}</style>

      <AppHeader />

      {/* ── Hero strip ── */}
      <div style={{
        background: `linear-gradient(145deg, #021a1f 0%, ${DARK} 40%, ${BRAND} 100%)`,
        padding: "56px 48px 80px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px", pointerEvents: "none" }} />

        {/* Logout button — absolute top-right */}
        <button
          onClick={handleLogout}
          style={{
            position: "absolute", top: 24, right: 24, zIndex: 2,
            display: "flex", alignItems: "center", gap: 8,
            fontFamily: SERIF, fontSize: 13, fontWeight: 700,
            color: "rgba(255,255,255,0.7)",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 12, padding: "10px 18px",
            cursor: "pointer", transition: "all 0.18s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "rgba(255,255,255,0.7)";
          }}
        >
          <SignOut size={16} weight="bold" />
          Sign out
        </button>

        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Avatar circle */}
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(93,202,165,0.2)",
            border: "2px solid rgba(93,202,165,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20,
          }}>
            <span style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700,
              color: MINT, textTransform: "uppercase" }}>
              {username?.[0] ?? "S"}
            </span>
          </div>

          <span style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 8 }}>
            Student profile
          </span>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(28px,4vw,48px)", fontWeight: 700,
            color: "#fff", lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 8 }}>
            {username ?? "Student"}
          </h1>

          {/* Overall stats pills */}
          {!loading && !error && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
              {[
                { label: "Exams enrolled", value: examProgress.length },
                { label: "Courses", value: totalCourses },
                { label: "Lessons completed", value: totalCompleted },
                { label: "Overall avg. score", value: `${overallAvg.toFixed(1)}%` },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12, padding: "8px 16px",
                }}>
                  <p style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 700,
                    color: "rgba(255,255,255,0.45)", margin: 0,
                    letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {label}
                  </p>
                  <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700,
                    color: "#fff", margin: 0 }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wave */}
        <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 48" fill="none" style={{ display: "block", width: "100%" }}>
            <path d="M0 48 C480 0 960 48 1440 18 L1440 48 Z" fill={CREAM} />
          </svg>
        </div>
      </div>

      {/* ── Main content ── */}
      <main style={{ flex: 1, padding: "44px 48px 96px",
        maxWidth: 1048, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

        {/* ── My A-Level Subjects ── */}
        {!loading && !error && myALevelCourses.size > 0 && (
          <section style={{ marginBottom: 56 }}>
            {/* Section header */}
            <div style={{ marginBottom: 24, paddingBottom: 18,
              borderBottom: "1px solid #E2EBF0",
              display: "flex", alignItems: "flex-end",
              justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <p style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: MINT, marginBottom: 4 }}>
                  My enrolled subjects
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <GraduationCap size={26} weight="duotone" color={BRAND} />
                  <h2 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700,
                    color: "#0F172A", letterSpacing: "-0.6px", margin: 0 }}>
                    {aLevelExamName}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => navigate("/courses")}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontFamily: SERIF, fontSize: 13, fontWeight: 700,
                  color: BRAND, background: "#e8f7f9",
                  border: "1px solid rgba(10,95,110,0.15)",
                  borderRadius: 10, padding: "8px 16px",
                  cursor: "pointer", transition: "all 0.18s", flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = BRAND; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#e8f7f9"; e.currentTarget.style.color = BRAND; }}
              >
                Manage subjects
                <ArrowSquareOut size={13} weight="bold" />
              </button>
            </div>

            {aLevelPinnedWithProgress.length > 0 ? (
              <>
                <div style={{ display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {aLevelPinnedWithProgress.map((course, ci) => (
                    <CourseProgressCard
                      key={course.courseId}
                      course={course}
                      index={ci}
                      examName={aLevelExamName}
                    />
                  ))}
                </div>
                {aLevelPinnedWithoutProgress > 0 && (
                  <p style={{ fontFamily: SERIF, fontSize: 13, color: "#94A3B8",
                    marginTop: 14, fontStyle: "italic" }}>
                    {aLevelPinnedWithoutProgress} more subject{aLevelPinnedWithoutProgress !== 1 ? "s" : ""} selected — no tests started yet.
                  </p>
                )}
              </>
            ) : (
              /* All selected subjects have no progress yet */
              <div style={{
                background: "#fff", border: "1px solid #E8F0F4",
                borderRadius: 16, padding: "28px 28px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between", flexWrap: "wrap", gap: 16,
              }}>
                <div>
                  <p style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700,
                    color: "#0F172A", margin: 0, marginBottom: 4 }}>
                    {myALevelCourses.size} subject{myALevelCourses.size !== 1 ? "s" : ""} enrolled
                  </p>
                  <p style={{ fontFamily: SERIF, fontSize: 13, color: "#94A3B8", margin: 0 }}>
                    You haven't started any tests in your selected subjects yet.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/courses")}
                  style={{
                    fontFamily: SERIF, fontSize: 13, fontWeight: 700,
                    background: MINT, color: DARK, border: "none",
                    borderRadius: 10, padding: "10px 22px",
                    cursor: "pointer", flexShrink: 0,
                    boxShadow: "0 4px 16px rgba(93,202,165,0.3)",
                  }}
                >
                  Start studying
                </button>
              </div>
            )}
          </section>
        )}

        {loading ? (
          <div style={{ display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} i={i} />)}
          </div>
        ) : error ? (
          <div style={{ background: "#fff0f0", border: "1px solid #fca5a5",
            borderRadius: 16, padding: "20px 24px",
            fontFamily: SERIF, fontSize: 14, color: "#b02020" }}>
            Could not load progress data. Please check the server is running.
          </div>
        ) : examProgress.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: 24, background: "#e8f7f9",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 24px rgba(10,95,110,0.12)" }}>
              <BookOpen size={32} weight="duotone" color={BRAND} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700,
                color: "#0F172A", marginBottom: 8 }}>
                No courses enrolled yet
              </p>
              <p style={{ fontFamily: SERIF, fontSize: 14, color: "#94A3B8" }}>
                Head to the dashboard and select an exam to start.
              </p>
            </div>
            <button onClick={() => navigate("/courses")}
              style={{ background: MINT, border: "none", borderRadius: 14,
                padding: "14px 32px", fontFamily: SERIF, fontSize: 15, fontWeight: 700,
                color: DARK, cursor: "pointer", boxShadow: "0 8px 24px rgba(93,202,165,0.3)" }}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          examProgress
            .filter(e => !(myALevelCourses.size > 0 && isALevelExam(e.examName)))
            .map((exam, ei) => (
            <section key={exam.examId} style={{ marginBottom: 52 }}>
              {/* Exam heading */}
              <div style={{ marginBottom: 24, paddingBottom: 18,
                borderBottom: "1px solid #E2EBF0" }}>
                <p style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: BRAND, marginBottom: 4 }}>
                  Enrolled exam
                </p>
                <h2 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 700,
                  color: "#0F172A", letterSpacing: "-0.6px", margin: 0 }}>
                  {exam.examName}
                </h2>
              </div>

              {/* Course cards grid */}
              {exam.courses.length === 0 ? (
                <p style={{ fontFamily: SERIF, fontSize: 14,
                  color: "#94A3B8", fontStyle: "italic" }}>
                  No courses found for this exam.
                </p>
              ) : (
                <div style={{ display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {exam.courses.map((course, ci) => (
                    <CourseProgressCard
                      key={course.courseId}
                      course={course}
                      index={ei * 10 + ci}
                      examName={exam.examName}
                    />
                  ))}
                </div>
              )}
            </section>
          ))
        )}
      </main>

      <AppFooter />
    </div>
  );
};

export default Profile;
