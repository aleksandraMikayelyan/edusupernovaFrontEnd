/**
 * TestHistoryPage.jsx — List of all completed tests with retake option.
 * Route: /history
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowClockwise, Trophy, Clock, CheckSquare, Play } from "@phosphor-icons/react";
import { TestsApi } from "../../api/index.js";
import AppHeader     from "../../components/common/appHeader.jsx";
import AppFooter     from "../../components/common/appFooter.jsx";
import LoadingScreen from "../../components/common/LoadingScreen.jsx";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const CREAM = "#F7F4EF";
const SERIF = "Newsreader, Georgia, serif";

const gradeColor = (grade) => {
  if (!grade) return "#94A3B8";
  if (["A*", "A"].includes(grade)) return "#15803d";
  if (grade === "B") return "#1d4ed8";
  if (grade === "C") return "#b45309";
  return "#94A3B8";
};

const gradeBg = (grade) => {
  if (!grade) return "#F1F5F9";
  if (["A*", "A"].includes(grade)) return "#dcfce7";
  if (grade === "B") return "#dbeafe";
  if (grade === "C") return "#fef3c7";
  return "#F1F5F9";
};

const statusConfig = (status) => {
  switch ((status ?? "COMPLETED").toUpperCase()) {
    case "IN_PROGRESS": return { label: "In Progress", color: "#d97706", bg: "#fffbeb", border: "#fcd34d" };
    case "ABANDONED":   return { label: "Abandoned",   color: "#94A3B8", bg: "#F8FAFC", border: "#E2EBF0" };
    default:            return { label: "Completed",   color: "#15803d", bg: "#f0fdf4", border: "#86efac" };
  }
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric",
  });
};

const formatDuration = (secs) => {
  if (!secs) return "0m";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s > 0 ? s + "s" : ""}`.trim() : `${s}s`;
};

// ── Single row ────────────────────────────────────────────────────────────────

const HistoryRow = ({ test, onRetake, onResume, onReview }) => {
  const score   = test.finalScore != null ? Math.round(test.finalScore) : null;
  const status  = (test.status ?? "COMPLETED").toUpperCase();
  const sConf   = statusConfig(status);
  const isInProgress = status === "IN_PROGRESS";

  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "20px 24px",
      border: "1px solid #E8EDF4",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      display: "flex", alignItems: "center", gap: 20,
      marginBottom: 12,
      flexWrap: "wrap",
    }}>
      {/* Grade badge */}
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: gradeBg(test.grade),
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 800, color: gradeColor(test.grade) }}>
          {test.grade ?? "—"}
        </span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: DARK, margin: "0 0 4px" }}>
          {test.paperName ?? test.courseName}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <p style={{ fontFamily: SERIF, fontSize: 12, color: "#64748B", margin: 0 }}>
            {test.courseName}
            {test.paperName && test.courseName !== test.paperName ? ` · ${test.paperName}` : ""}
          </p>
          <span style={{
            fontFamily: SERIF, fontSize: 11, fontWeight: 700,
            color: sConf.color, background: sConf.bg,
            border: `1px solid ${sConf.border}`,
            borderRadius: 6, padding: "2px 8px",
          }}>
            {sConf.label}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: BRAND, margin: 0 }}>
            {score != null ? `${score}%` : "—"}
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 10, color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
            Score
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: DARK, margin: 0 }}>
            {test.totalCorrect ?? 0}/{test.totalQuestions ?? 0}
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 10, color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
            Correct
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: "#64748B", margin: 0 }}>
            {formatDuration(test.durationSeconds)}
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 10, color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
            Time
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: SERIF, fontSize: 12, color: "#94A3B8", margin: 0 }}>
            {formatDate(test.completedAt ?? test.startedAt)}
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 10, color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
            Date
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {!isInProgress && (
          <button onClick={() => onReview(test.testId)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 10, border: "1.5px solid #E2EBF0",
              background: "transparent", cursor: "pointer",
              fontFamily: SERIF, fontSize: 13, fontWeight: 600, color: "#64748B",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND; e.currentTarget.style.color = BRAND; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2EBF0"; e.currentTarget.style.color = "#64748B"; }}>
            <CheckSquare size={14} /> Review
          </button>
        )}
        {isInProgress && test.courseId && (
          <button onClick={() => onResume(test)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 10, border: "none",
              background: "#d97706", cursor: "pointer",
              fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: "#fff",
              boxShadow: "0 4px 12px rgba(217,119,6,0.3)",
              transition: "background 0.15s, transform 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#b45309"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#d97706"; e.currentTarget.style.transform = "none"; }}>
            <Play size={14} weight="fill" /> Resume
          </button>
        )}
        {!isInProgress && test.paperId && (
          <button onClick={() => onRetake(test)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 10, border: "none",
              background: MINT, cursor: "pointer",
              fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: DARK,
              boxShadow: "0 4px 12px rgba(93,202,165,0.3)",
              transition: "background 0.15s, transform 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#3aab87"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = MINT; e.currentTarget.style.transform = "none"; }}>
            <ArrowClockwise size={14} weight="bold" /> Retake
          </button>
        )}
      </div>
    </div>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const TestHistoryPage = () => {
  const navigate = useNavigate();
  const [tests,   setTests]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    TestsApi.getHistory()
      .then(res => setTests(res.data))
      .catch(err => setError(err.message ?? "Could not load test history."))
      .finally(() => setLoading(false));
  }, []);

  const handleRetake = (test) => {
    navigate("/test", { state: { courseId: test.courseId, paperId: test.paperId } });
  };

  const handleResume = (test) => {
    navigate("/test", { state: { courseId: test.courseId, paperId: test.paperId } });
  };

  const handleReview = (testId) => {
    navigate("/feedback", { state: { testId } });
  };

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", flexDirection: "column" }}>
      <AppHeader />

      {/* Hero */}
      <div style={{
        background: `linear-gradient(145deg, #021a1f 0%, ${DARK} 40%, ${BRAND} 100%)`,
        padding: "40px 48px 56px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px", pointerEvents: "none" }} />

        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <button onClick={() => navigate(-1)}
            style={{ display: "flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10, padding: "8px 16px", cursor: "pointer",
              fontFamily: SERIF, fontSize: 13, color: "rgba(255,255,255,0.7)",
              marginBottom: 28 }}>
            <ArrowLeft size={14} /> Back
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Trophy size={32} weight="fill" color={MINT} />
            <div>
              <h1 style={{ fontFamily: SERIF, fontSize: "clamp(28px,4vw,42px)",
                fontWeight: 700, color: "#fff", letterSpacing: "-1px",
                lineHeight: 1.1, margin: 0 }}>
                Test History
              </h1>
              <p style={{ fontFamily: SERIF, fontSize: 14,
                color: "rgba(255,255,255,0.45)", margin: "6px 0 0" }}>
                {tests.length} test{tests.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, maxWidth: 900, margin: "0 auto",
        width: "100%", padding: "32px 32px 60px", boxSizing: "border-box" }}>

        {error && (
          <div style={{ background: "#fff0f0", border: "1px solid #fca5a5",
            borderRadius: 12, padding: "14px 20px", marginBottom: 20,
            fontFamily: SERIF, fontSize: 14, color: "#b02020" }}>
            {error}
          </div>
        )}

        {tests.length === 0 && !error ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Trophy size={48} color="#E2EBF0" weight="fill" style={{ marginBottom: 16 }} />
            <p style={{ fontFamily: SERIF, fontSize: 18, color: "#94A3B8", fontWeight: 600 }}>
              No completed tests yet.
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 14, color: "#CBD5E1" }}>
              Complete your first test to see your history here.
            </p>
            <button onClick={() => navigate("/courses")}
              style={{ marginTop: 24, padding: "12px 32px", borderRadius: 12,
                background: MINT, border: "none", cursor: "pointer",
                fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: DARK,
                boxShadow: "0 8px 24px rgba(93,202,165,0.35)" }}>
              Start a test
            </button>
          </div>
        ) : (
          tests.map(test => (
            <HistoryRow
              key={test.testId}
              test={test}
              onRetake={handleRetake}
              onResume={handleResume}
              onReview={handleReview}
            />
          ))
        )}
      </div>

      <AppFooter />
    </div>
  );
};

export default TestHistoryPage;
