/**
 * IELTSSpeakingTest.jsx — IELTS Speaking section.
 *
 * Three parts, auto-detected from question text prefix:
 *   [Part 1] / [Interview]  → Introduction & Interview (general questions, ~4-5 min)
 *   [Part 2] / [Cue Card]   → Individual Long Turn: 1 min prep + up to 2 min speak
 *   [Part 3] / [Discussion] → Two-Way Discussion (analytical follow-up, ~4-5 min)
 *
 * All parts recorded via SpeechRecognition API (Chrome/Edge).
 * Part 2 includes a 60-second preparation countdown before recording.
 * Falls back to a plain textarea on unsupported browsers.
 *
 * Assessed on: Fluency & Coherence · Lexical Resource ·
 *              Grammatical Range & Accuracy · Pronunciation
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CaretLeft, CaretRight, PaperPlane,
  Microphone, Stop, CheckCircle, WarningCircle, Timer,
  NotePencil, ChatCircle,
} from "@phosphor-icons/react";
import { TestsApi }  from "../../api/index.js";
import LoadingScreen from "../../components/common/LoadingScreen.jsx";
import TestTopBar    from "../../components/test/TestTopBar.jsx";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif";

const PREP_SECS    = 60;   // 1 minute preparation for cue card
const SPEAK_SECS   = 120;  // 2 minutes to speak for cue card
const INTERVIEW_SECS = 45; // per-question recording for Parts 1 & 3

const SR_SUPPORTED = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

// ── Helpers ───────────────────────────────────────────────────────────────────

const buildGroups = (questions) => {
  const map = new Map();
  questions.forEach(q => {
    const key = q.groupId ?? `standalone_${q.quizId}`;
    if (!map.has(key)) {
      map.set(key, {
        groupId: q.groupId,
        minQuestionNumber: q.questionNumber ?? 9999,
        questions: [],
      });
    }
    const g = map.get(key);
    if ((q.questionNumber ?? 9999) < g.minQuestionNumber)
      g.minQuestionNumber = q.questionNumber ?? 9999;
    g.questions.push(q);
  });
  map.forEach(g => {
    g.questions.sort((a, b) => (a.groupOrderIndex ?? 0) - (b.groupOrderIndex ?? 0));
  });
  return [...map.values()].sort((a, b) => a.minQuestionNumber - b.minQuestionNumber);
};

// Determine speaking part from question text prefix
const detectPart = (text = "") => {
  const t = text.toLowerCase();
  if (t.startsWith("[part 2]") || t.startsWith("[cue card]")) return "CUE_CARD";
  if (t.startsWith("[part 3]") || t.startsWith("[discussion]")) return "DISCUSSION";
  return "INTERVIEW"; // Part 1 default
};

// Strip the part prefix from displayed question text
const cleanText = (text = "") =>
  text.replace(/^\[(part \d|cue card|interview|discussion)[^\]]*\]\s*/i, "").trim();

// ── Shared components ─────────────────────────────────────────────────────────

const NavBtn = ({ onClick, disabled, variant = "secondary", children }) => {
  const isPrimary = variant === "primary";
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "13px 28px", borderRadius: 12,
      fontFamily: SERIF, fontSize: 14, fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      background: disabled ? "#E8EDF2" : isPrimary ? MINT : "transparent",
      color: disabled ? "#94A3B8" : isPrimary ? DARK : BRAND,
      border: isPrimary ? "none" : `2px solid ${disabled ? "#E2EBF0" : BRAND}`,
      boxShadow: isPrimary && !disabled ? "0 8px 24px rgba(93,202,165,0.3)" : "none",
      transition: "all 0.18s",
    }}
      onMouseEnter={e => {
        if (!disabled && isPrimary) {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.background = "#3aab87";
        }
      }}
      onMouseLeave={e => {
        if (!disabled && isPrimary) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.background = MINT;
        }
      }}>
      {children}
    </button>
  );
};

const RecordingPulse = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{
      width: 12, height: 12, borderRadius: "50%",
      background: "#ef4444",
      animation: "ieltsSpeakPulse 1s ease-in-out infinite",
    }} />
    <span style={{ fontFamily: SERIF, fontSize: 13, color: "#ef4444", fontWeight: 700 }}>
      Recording…
    </span>
    <style>{`@keyframes ieltsSpeakPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }`}</style>
  </div>
);

// SVG countdown ring
const CountdownRing = ({ seconds, total, color }) => {
  const r    = 22;
  const circ = 2 * Math.PI * r;
  const dash = circ * (seconds / total);
  const ringColor = color ?? (seconds <= 10 ? "#ef4444" : MINT);

  return (
    <div style={{ position: "relative", width: 60, height: 60 }}>
      <svg width={60} height={60} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={30} cy={30} r={r} fill="none" stroke="#E2EBF0" strokeWidth={4} />
        <circle cx={30} cy={30} r={r} fill="none"
          stroke={ringColor} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1s linear, stroke 0.3s" }} />
      </svg>
      <span style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: SERIF, fontSize: 15, fontWeight: 700,
        color: seconds <= 10 ? "#ef4444" : DARK,
      }}>
        {seconds}
      </span>
    </div>
  );
};

// ── Part 1 & 3: Interview / Discussion card ───────────────────────────────────

const InterviewCard = ({ q, transcript, onTranscript, partLabel }) => {
  const [phase,    setPhase]    = useState("ready");
  const [timeLeft, setTimeLeft] = useState(INTERVIEW_SECS);
  const srRef    = useRef(null);
  const timerRef = useRef(null);
  const phaseRef = useRef("ready");

  const stop = useCallback(() => {
    clearInterval(timerRef.current);
    phaseRef.current = "done";
    srRef.current?.stop();
    setPhase("done");
  }, []);

  const startRecording = () => {
    phaseRef.current = "recording";
    setPhase("recording");
    setTimeLeft(INTERVIEW_SECS);

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { stop(); return 0; }
        return t - 1;
      });
    }, 1000);

    if (SR_SUPPORTED) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const sr = new SR();
      sr.lang = "en-US";
      sr.continuous = true;
      sr.interimResults = true;
      srRef.current = sr;

      let accumulated = "";
      sr.onresult = (e) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) accumulated += e.results[i][0].transcript + " ";
        }
        if (accumulated.trim()) onTranscript(q.quizId, accumulated.trim());
      };
      sr.onerror = (ev) => {
        if (ev.error === "no-speech") return;
        phaseRef.current = "error";
        setPhase("error");
        setTimeout(() => { phaseRef.current = "ready"; setPhase("ready"); }, 3000);
      };
      sr.onend = () => {
        if (phaseRef.current === "recording") {
          try { sr.start(); } catch {}
        }
      };
      sr.start();
    }
  };

  useEffect(() => () => {
    clearInterval(timerRef.current);
    srRef.current?.abort();
  }, []);

  const displayText = cleanText(q.questionText);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Question */}
      <div style={{ background: "#F7F4EF", borderRadius: 16, padding: "24px" }}>
        <p style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
          color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.12em",
          marginBottom: 10 }}>
          {partLabel}
        </p>
        <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.7,
          color: "#0F172A", margin: 0, fontStyle: "italic" }}>
          {displayText}
        </p>
        {q.marks && (
          <span style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
            color: "#94A3B8", display: "block", marginTop: 8 }}>
            [{q.marks} mark{q.marks !== 1 ? "s" : ""}]
          </span>
        )}
      </div>

      {/* Recording controls */}
      <div style={{
        background: "#fff", borderRadius: 16, padding: "24px",
        border: `2px solid ${phase === "done" ? MINT : phase === "recording" ? "#ef4444" : "#E2EBF0"}`,
        transition: "border-color 0.3s", display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
              color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.12em",
              marginBottom: 6 }}>
              {phase === "ready" ? "Your turn" : phase === "recording" ? "Speaking" : phase === "error" ? "Error" : "Answered"}
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 13, color: "#64748B", margin: 0 }}>
              {phase === "ready"
                ? `You have ${INTERVIEW_SECS} seconds to answer.`
                : phase === "recording"
                  ? SR_SUPPORTED ? "Speak clearly. Recording stops automatically." : "Recording — type your answer below."
                  : phase === "error"
                    ? "Microphone error — check browser permissions and try again."
                    : "Your answer has been captured."}
            </p>
          </div>

          {phase === "ready" && (
            <button onClick={startRecording} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 22px", borderRadius: 12, border: "none",
              cursor: "pointer", background: "#ef4444",
              fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: "#fff",
            }}>
              <Microphone size={16} weight="fill" /> Start recording
            </button>
          )}

          {phase === "recording" && (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <RecordingPulse />
              <CountdownRing seconds={timeLeft} total={INTERVIEW_SECS} />
              <button onClick={stop} style={{
                padding: "10px 18px", borderRadius: 10, border: "none",
                cursor: "pointer", background: "#F1F5F9",
                fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: "#64748B",
              }}>
                <Stop size={14} weight="bold" style={{ marginRight: 6 }} /> Stop
              </button>
            </div>
          )}

          {phase === "done" && <CheckCircle size={28} weight="fill" color={MINT} />}
        </div>

        {!SR_SUPPORTED ? (
          <textarea
            value={transcript ?? ""}
            onChange={e => onTranscript(q.quizId, e.target.value)}
            placeholder="Type your answer here…"
            rows={5}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "12px 14px", borderRadius: 10,
              border: `2px solid ${transcript ? BRAND : "#E2EBF0"}`,
              fontFamily: SERIF, fontSize: 14, lineHeight: 1.65,
              color: "#0F172A", background: "#FAFBFC",
              outline: "none", resize: "vertical",
            }}
          />
        ) : transcript ? (
          <div style={{ background: "#f0faf7", borderRadius: 10, padding: "12px 14px",
            border: "1px solid rgba(93,202,165,0.3)" }}>
            <p style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
              color: BRAND, textTransform: "uppercase", letterSpacing: "0.1em",
              marginBottom: 4 }}>
              Your answer
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 14, color: "#0F172A",
              margin: 0, lineHeight: 1.65 }}>
              {transcript}
            </p>
          </div>
        ) : null}

        {!SR_SUPPORTED && (
          <div style={{ display: "flex", alignItems: "center", gap: 8,
            background: "#fff8e6", borderRadius: 8, padding: "10px 12px" }}>
            <WarningCircle size={16} color="#d97706" weight="fill" />
            <p style={{ fontFamily: SERIF, fontSize: 12, color: "#92400e", margin: 0 }}>
              Speech recognition is not supported. Use Chrome or Edge for full experience.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Part 2: Cue Card (1 min prep + 2 min speaking) ───────────────────────────

const CueCardCard = ({ q, transcript, onTranscript }) => {
  const [phase,     setPhase]     = useState("prep");  // prep | speak | done
  const [prepLeft,  setPrepLeft]  = useState(PREP_SECS);
  const [speakLeft, setSpeakLeft] = useState(SPEAK_SECS);
  const [notes,     setNotes]     = useState("");

  const srRef     = useRef(null);
  const timerRef  = useRef(null);
  const phaseRef  = useRef("prep");

  const cueText = cleanText(q.questionText);

  // Prep countdown
  useEffect(() => {
    if (phase !== "prep") return;
    timerRef.current = setInterval(() => {
      setPrepLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const stopSpeaking = useCallback(() => {
    clearInterval(timerRef.current);
    phaseRef.current = "done";
    srRef.current?.stop();
    setPhase("done");
  }, []);

  const startSpeaking = () => {
    clearInterval(timerRef.current);
    phaseRef.current = "speak";
    setPhase("speak");

    // Speaking countdown
    timerRef.current = setInterval(() => {
      setSpeakLeft(t => {
        if (t <= 1) {
          stopSpeaking();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // Start SR
    if (SR_SUPPORTED) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const sr = new SR();
      sr.lang = "en-US";
      sr.continuous = true;
      sr.interimResults = true;
      srRef.current = sr;

      let accumulated = "";
      sr.onresult = (e) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) accumulated += e.results[i][0].transcript + " ";
        }
        if (accumulated.trim()) onTranscript(q.quizId, accumulated.trim());
      };
      sr.onerror = (ev) => {
        if (ev.error === "no-speech") return;
      };
      sr.onend = () => {
        if (phaseRef.current === "speak") {
          try { sr.start(); } catch {}
        }
      };
      sr.start();
    }
  };

  useEffect(() => () => {
    clearInterval(timerRef.current);
    srRef.current?.abort();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Cue card display */}
      <div style={{
        background: "linear-gradient(135deg, #F7F4EF 0%, #fdf8f0 100%)",
        borderRadius: 18, padding: "28px 32px",
        border: "1.5px solid rgba(10,95,110,0.1)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
      }}>
        <p style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
          color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.12em",
          marginBottom: 12 }}>
          Part 2 — Cue Card
        </p>
        <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.75,
          color: "#0F172A", margin: 0, whiteSpace: "pre-line" }}>
          {cueText}
        </p>
        {q.marks && (
          <span style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
            color: "#94A3B8", display: "block", marginTop: 10 }}>
            [{q.marks} mark{q.marks !== 1 ? "s" : ""}]
          </span>
        )}
      </div>

      {/* Prep phase */}
      {phase === "prep" && (
        <div style={{
          background: "#fff", borderRadius: 16, padding: "24px",
          border: "2px solid #E2EBF0",
          display: "flex", flexDirection: "column", gap: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700,
                color: DARK, marginBottom: 4 }}>
                Preparation Time
              </p>
              <p style={{ fontFamily: SERIF, fontSize: 13, color: "#64748B", margin: 0 }}>
                Use this time to organise your thoughts. Make notes below.
                <br />You may begin speaking at any time.
              </p>
            </div>
            <CountdownRing seconds={prepLeft} total={PREP_SECS}
              color={prepLeft <= 15 ? "#F59E0B" : BRAND} />
          </div>

          {/* Notes area (not submitted) */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <NotePencil size={13} color="#94A3B8" weight="bold" />
              <span style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 700,
                color: "#94A3B8", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Preparation notes (not scored)
              </span>
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Jot down key points, vocabulary, structure…"
              rows={4}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "#F8FAFC", border: "1.5px solid #E2EBF0",
                borderRadius: 12, padding: "12px 16px",
                fontFamily: SERIF, fontSize: 13, color: "#374151",
                lineHeight: 1.6, resize: "vertical", outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = BRAND}
              onBlur={e => e.target.style.borderColor = "#E2EBF0"}
            />
          </div>

          <button onClick={startSpeaking} style={{
            alignSelf: "flex-start",
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 26px", borderRadius: 12, border: "none",
            background: "#ef4444", cursor: "pointer",
            fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: "#fff",
            boxShadow: "0 6px 18px rgba(239,68,68,0.3)",
            transition: "all 0.18s",
          }}>
            <Microphone size={16} weight="fill" />
            {prepLeft > 0
              ? `Start speaking (${prepLeft}s prep remaining)`
              : "Start speaking"}
          </button>
        </div>
      )}

      {/* Speaking phase */}
      {phase === "speak" && (
        <div style={{
          background: "#fff", borderRadius: 16, padding: "24px",
          border: "2px solid #ef4444",
          display: "flex", flexDirection: "column", gap: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <RecordingPulse />
              <p style={{ fontFamily: SERIF, fontSize: 13, color: "#64748B",
                margin: "8px 0 0" }}>
                {SR_SUPPORTED
                  ? "Speak clearly. Recording stops automatically after 2 minutes."
                  : "Describe the topic below. Your notes are visible for reference."}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <CountdownRing seconds={speakLeft} total={SPEAK_SECS} />
              <button onClick={stopSpeaking} style={{
                padding: "10px 18px", borderRadius: 10, border: "none",
                cursor: "pointer", background: "#F1F5F9",
                fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: "#64748B",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <Stop size={14} weight="bold" /> Stop
              </button>
            </div>
          </div>

          {/* Fallback textarea / live transcript */}
          {!SR_SUPPORTED ? (
            <textarea
              value={transcript ?? ""}
              onChange={e => onTranscript(q.quizId, e.target.value)}
              placeholder="Type your response here…"
              rows={8}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "12px 14px", borderRadius: 10,
                border: `2px solid ${transcript ? BRAND : "#E2EBF0"}`,
                fontFamily: SERIF, fontSize: 14, lineHeight: 1.65,
                color: "#0F172A", background: "#FAFBFC",
                outline: "none", resize: "vertical",
              }}
            />
          ) : transcript ? (
            <div style={{ background: "#f0faf7", borderRadius: 10, padding: "12px 14px",
              border: "1px solid rgba(93,202,165,0.3)" }}>
              <p style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
                color: BRAND, textTransform: "uppercase", letterSpacing: "0.1em",
                marginBottom: 4 }}>
                Captured so far
              </p>
              <p style={{ fontFamily: SERIF, fontSize: 14, color: "#0F172A",
                margin: 0, lineHeight: 1.65 }}>
                {transcript}
              </p>
            </div>
          ) : null}
        </div>
      )}

      {/* Done */}
      {phase === "done" && (
        <div style={{
          background: "#f0fdf4", borderRadius: 16, padding: "24px",
          border: `2px solid ${MINT}`,
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CheckCircle size={28} weight="fill" color={MINT} />
            <div>
              <p style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700,
                color: "#15803d", margin: 0 }}>
                Long turn completed
              </p>
              <p style={{ fontFamily: SERIF, fontSize: 12, color: "#64748B", margin: "2px 0 0" }}>
                Your response has been captured.
              </p>
            </div>
          </div>

          {transcript && (
            <div style={{ background: "#fff", borderRadius: 10, padding: "12px 14px",
              border: "1px solid #86efac" }}>
              <p style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
                color: BRAND, textTransform: "uppercase", letterSpacing: "0.1em",
                marginBottom: 4 }}>
                Your answer
              </p>
              <p style={{ fontFamily: SERIF, fontSize: 14, color: "#0F172A",
                margin: 0, lineHeight: 1.65 }}>
                {transcript}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const IELTSSpeakingTest = ({ session }) => {
  const navigate = useNavigate();
  const testId   = session.testId;

  const [groups,      setGroups]      = useState([]);
  const [groupIndex,  setGroupIndex]  = useState(0);
  const [transcripts, setTranscripts] = useState({});
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);

  useEffect(() => {
    TestsApi.getQuestions(testId)
      .then(res => {
        setGroups(buildGroups(res.data));
        const saved = {};
        res.data.forEach(q => { if (q.userResponse) saved[q.quizId] = q.userResponse; });
        setTranscripts(saved);
      })
      .catch(err => console.error("Could not load questions:", err))
      .finally(() => setLoading(false));
  }, [testId]);

  const currentGroup = groups[groupIndex];
  const totalGroups  = groups.length;
  const isLastGroup  = groupIndex === totalGroups - 1;

  const setTranscript = useCallback((quizId, text) => {
    setTranscripts(prev => ({ ...prev, [quizId]: text }));
  }, []);

  const saveGroupAnswers = useCallback(async () => {
    if (!currentGroup) return;
    for (const q of currentGroup.questions) {
      const answer = transcripts[q.quizId] ?? "";
      if (answer.trim())
        await TestsApi.submitAnswer(q.testId ?? testId, q.quizId, answer);
    }
  }, [currentGroup, transcripts, testId]);

  const handleNext = async () => {
    await saveGroupAnswers();
    setGroupIndex(i => i + 1);
    window.scrollTo(0, 0);
  };

  const handlePrev = () => {
    setGroupIndex(i => i - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await saveGroupAnswers();
      navigate("/feedback", { state: { testId }, replace: true });
    } catch { setSubmitting(false); }
  };

  if (loading) return <LoadingScreen />;

  if (!currentGroup) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#F7F4EF" }}>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: "#64748B" }}>
        No questions available for this section.
      </p>
    </div>
  );

  const firstQ   = currentGroup.questions[0];
  const part     = detectPart(firstQ?.questionText ?? "");

  const partMeta = {
    INTERVIEW:  { label: "Part 1 — Introduction & Interview", hint: "Answer naturally. You have 45 s per question.", badge: "1" },
    CUE_CARD:   { label: "Part 2 — Individual Long Turn",     hint: "1 min to prepare, then speak for up to 2 minutes.", badge: "2" },
    DISCUSSION: { label: "Part 3 — Two-Way Discussion",       hint: "Explain and justify your views in depth.", badge: "3" },
  }[part];

  const groupLabel = `${partMeta.label} (${groupIndex + 1} / ${totalGroups})`;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column",
      background: "#F8FAFC", overflow: "hidden" }}>

      <TestTopBar
        paperName={session.paperName}
        groupLabel={groupLabel}
        remainingSeconds={session.remainingSeconds}
        onLeave={() => navigate("/courses")}
      />

      <div style={{ flex: 1, overflowY: "auto", display: "flex", justifyContent: "center" }}>
        <div style={{
          width: "100%", maxWidth: 720,
          padding: "36px 36px 48px",
          display: "flex", flexDirection: "column",
        }}>

          {/* Part header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14, marginBottom: 28,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: BRAND, display: "flex", alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 800,
                color: "#fff" }}>
                {partMeta.badge}
              </span>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ChatCircle size={13} color={BRAND} weight="fill" />
                <span style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 700,
                  color: BRAND, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  IELTS Speaking
                </span>
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700,
                color: DARK, margin: "2px 0 0" }}>
                {partMeta.label}
              </p>
              <p style={{ fontFamily: SERIF, fontSize: 12, color: "#64748B", margin: "2px 0 0" }}>
                {partMeta.hint}
              </p>
            </div>
          </div>

          {/* Assessment criteria badge */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28,
          }}>
            {["Fluency & Coherence", "Lexical Resource", "Grammar", "Pronunciation"].map(c => (
              <span key={c} style={{
                fontFamily: SERIF, fontSize: 10, fontWeight: 700,
                color: "#64748B", background: "#F1F5F9",
                borderRadius: 999, padding: "3px 10px",
                border: "1px solid #E2EBF0",
              }}>
                {c}
              </span>
            ))}
          </div>

          {/* Question cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {currentGroup.questions.map(q => (
              part === "CUE_CARD" ? (
                <CueCardCard
                  key={q.quizId}
                  q={q}
                  transcript={transcripts[q.quizId] ?? null}
                  onTranscript={setTranscript}
                />
              ) : (
                <InterviewCard
                  key={q.quizId}
                  q={q}
                  transcript={transcripts[q.quizId] ?? null}
                  onTranscript={setTranscript}
                  partLabel={part === "DISCUSSION" ? "Part 3 — Discussion" : "Part 1 — Interview"}
                />
              )
            ))}
          </div>

          {/* Navigation */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginTop: 36,
            paddingTop: 24, borderTop: "1px solid #F1F5F9",
          }}>
            <NavBtn onClick={handlePrev} disabled={groupIndex === 0}>
              <CaretLeft size={15} weight="bold" /> Previous
            </NavBtn>
            {isLastGroup ? (
              <NavBtn onClick={handleSubmit} disabled={submitting} variant="primary">
                <PaperPlane size={15} weight="bold" />
                {submitting ? "Submitting…" : "Submit test"}
              </NavBtn>
            ) : (
              <NavBtn onClick={handleNext} variant="primary">
                Next <CaretRight size={15} weight="bold" />
              </NavBtn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IELTSSpeakingTest;
