/**
 * SpeakingTest.jsx — TOEFL Speaking section.
 *
 * Two task types, auto-detected from question text prefix:
 *   [Listen and Repeat]  → TTS plays sentence → user records repetition
 *   [Interview …]        → question displayed → 45-second timed recording
 *
 * Recording uses the browser's SpeechRecognition API (Chrome / Edge).
 * The captured transcript is submitted as the answer text; the AI evaluator
 * scores it against the promptia rubric (content accuracy for Repeat,
 * fluency/organisation criteria for Interview).
 *
 * Falls back to a plain textarea on unsupported browsers.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CaretLeft, CaretRight, PaperPlane,
  SpeakerHigh, Microphone, Stop, CheckCircle, WarningCircle,
} from "@phosphor-icons/react";
import { TestsApi }  from "../../api/index.js";
import LoadingScreen from "../../components/common/LoadingScreen.jsx";
import TestTopBar    from "../../components/test/TestTopBar.jsx";

const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif";

const MAX_PLAYS       = 2;
const INTERVIEW_SECS  = 45;
const SR_SUPPORTED    = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

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

// Extract the sentence to repeat from question text
// e.g. "… Repeat: "Welcome to our office kitchen and break area.""
const extractRepeatSentence = (text) => {
  const m = text.match(/Repeat:\s*[""]?(.+?)[""]?\s*\.?\s*$/i);
  return m ? m[1].replace(/^[""]|[""]$/g, "").trim() : null;
};

// Detect task type from question text prefix
const taskType = (text = "") => {
  if (text.startsWith("[Listen and Repeat]")) return "REPEAT";
  if (text.startsWith("[Interview"))          return "INTERVIEW";
  return "INTERVIEW";
};

// ── Subcomponents ─────────────────────────────────────────────────────────────

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
      onMouseEnter={e => { if (!disabled && isPrimary) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.background = "#3aab87"; } }}
      onMouseLeave={e => { if (!disabled && isPrimary) { e.currentTarget.style.transform = "none"; e.currentTarget.style.background = MINT; } }}>
      {children}
    </button>
  );
};

// Pulsing mic animation while recording
const RecordingPulse = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{
      width: 12, height: 12, borderRadius: "50%",
      background: "#ef4444",
      animation: "spk-pulse 1s ease-in-out infinite",
    }} />
    <span style={{ fontFamily: SERIF, fontSize: 13, color: "#ef4444", fontWeight: 700 }}>
      Recording…
    </span>
    <style>{`@keyframes spk-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }`}</style>
  </div>
);

// Countdown ring
const CountdownRing = ({ seconds, total }) => {
  const pct    = seconds / total;
  const r      = 22;
  const circ   = 2 * Math.PI * r;
  const dash   = circ * pct;
  const urgent = seconds <= 10;
  return (
    <div style={{ position: "relative", width: 60, height: 60 }}>
      <svg width={60} height={60} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={30} cy={30} r={r} fill="none" stroke="#E2EBF0" strokeWidth={4} />
        <circle cx={30} cy={30} r={r} fill="none"
          stroke={urgent ? "#ef4444" : MINT} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1s linear, stroke 0.3s" }} />
      </svg>
      <span style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: SERIF, fontSize: 15, fontWeight: 700,
        color: urgent ? "#ef4444" : DARK,
      }}>
        {seconds}
      </span>
    </div>
  );
};

// Play-count dots (filled = used)
const PlayDots = ({ used, total }) => (
  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
    {Array.from({ length: total }, (_, i) => (
      <div key={i} style={{
        width: 8, height: 8, borderRadius: "50%",
        background: i < used ? BRAND : "#E2EBF0",
        transition: "background 0.2s",
      }} />
    ))}
  </div>
);

// ── Repeat task card ──────────────────────────────────────────────────────────

const RepeatCard = ({ q, transcript, onTranscript }) => {
  const [playCount,  setPlayCount]  = useState(0);
  const [audioState, setAudioState] = useState("idle"); // idle | speaking | done
  const [recState,   setRecState]   = useState("idle"); // idle | recording | done | error
  const srRef = useRef(null);

  const sentence = extractRepeatSentence(q.questionText) ?? q.questionText;
  const canPlay  = audioState !== "speaking" && playCount < MAX_PLAYS;
  const canRec   = playCount > 0 && recState !== "recording";

  const playSentence = () => {
    if (!canPlay) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(sentence);
    utt.lang = "en-US";
    utt.rate = 0.92;
    utt.onstart = () => setAudioState("speaking");
    utt.onend   = () => { setAudioState("done"); setPlayCount(c => c + 1); };
    utt.onerror = () => setAudioState("done");
    window.speechSynthesis.speak(utt);
  };

  const startRecording = () => {
    if (!SR_SUPPORTED) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const sr = new SR();
    sr.lang = "en-US";
    sr.continuous = false;
    sr.interimResults = false;
    srRef.current = sr;

    sr.onstart  = () => setRecState("recording");
    sr.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onTranscript(q.quizId, text);
      setRecState("done");
    };
    sr.onerror = () => {
      setRecState("error");
      setTimeout(() => setRecState("idle"), 3000);
    };
    sr.onend   = () => { setRecState(curr => curr === "recording" ? "idle" : curr); };
    sr.start();
  };

  const stopRecording = () => {
    srRef.current?.stop();
    setRecState("idle");
  };

  useEffect(() => () => {
    window.speechSynthesis.cancel();
    srRef.current?.abort();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Listen step */}
      <div style={{
        background: "#F7F4EF", borderRadius: 16, padding: "20px 24px",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
            color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.12em",
            marginBottom: 6 }}>
            Step 1 — Listen
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 13, color: "#64748B", margin: 0 }}>
            Listen to the sentence up to {MAX_PLAYS} times, then repeat it.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <button onClick={playSentence} disabled={!canPlay} style={{
            width: 52, height: 52, borderRadius: "50%",
            border: "none", cursor: canPlay ? "pointer" : "not-allowed",
            background: canPlay ? BRAND : "#E2EBF0",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}>
            {audioState === "speaking"
              ? <Stop size={20} weight="fill" color={canPlay ? "#fff" : "#94A3B8"} />
              : <SpeakerHigh size={20} weight="fill" color={canPlay ? "#fff" : "#94A3B8"} />}
          </button>
          <PlayDots used={playCount} total={MAX_PLAYS} />
        </div>
      </div>

      {/* Record step */}
      <div style={{
        background: "#fff", border: `2px solid ${recState === "done" ? MINT : "#E2EBF0"}`,
        borderRadius: 16, padding: "20px 24px",
        display: "flex", flexDirection: "column", gap: 14,
        opacity: canRec || recState !== "idle" ? 1 : 0.5,
        transition: "opacity 0.2s, border-color 0.2s",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
              color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.12em",
              marginBottom: 6 }}>
              Step 2 — Repeat
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 13, color: "#64748B", margin: 0 }}>
              {playCount === 0
                ? "Listen first, then record your repetition."
                : SR_SUPPORTED
                  ? "Press the mic button and repeat the sentence clearly."
                  : "Type the sentence below (speech not supported in this browser)."}
            </p>
          </div>
          {SR_SUPPORTED && recState !== "done" && (
            recState === "recording" ? (
              <button onClick={stopRecording} style={{
                width: 52, height: 52, borderRadius: "50%", border: "none",
                cursor: "pointer", background: "#ef4444",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Stop size={20} weight="fill" color="#fff" />
              </button>
            ) : (
              <button onClick={startRecording} disabled={!canRec} style={{
                width: 52, height: 52, borderRadius: "50%", border: "none",
                cursor: canRec ? "pointer" : "not-allowed",
                background: canRec ? "#ef4444" : "#E2EBF0",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s",
              }}>
                <Microphone size={20} weight="fill" color={canRec ? "#fff" : "#94A3B8"} />
              </button>
            )
          )}
          {recState === "done" && (
            <CheckCircle size={28} weight="fill" color={MINT} />
          )}
        </div>

        {recState === "recording" && <RecordingPulse />}

        {recState === "error" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8,
            background: "#fee2e2", borderRadius: 8, padding: "10px 12px" }}>
            <WarningCircle size={16} color="#b02020" weight="fill" />
            <p style={{ fontFamily: SERIF, fontSize: 12, color: "#7f1d1d", margin: 0 }}>
              Microphone error — check browser permissions or try again.
            </p>
          </div>
        )}

        {/* Transcript / fallback input */}
        {SR_SUPPORTED ? (
          transcript && (
            <div style={{
              background: "#f0faf7", borderRadius: 10, padding: "12px 14px",
              border: `1px solid rgba(93,202,165,0.3)`,
            }}>
              <p style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
                color: BRAND, textTransform: "uppercase", letterSpacing: "0.1em",
                marginBottom: 4 }}>
                You said
              </p>
              <p style={{ fontFamily: SERIF, fontSize: 14, color: "#0F172A",
                margin: 0, lineHeight: 1.6 }}>
                {transcript}
              </p>
            </div>
          )
        ) : (
          <input
            value={transcript ?? ""}
            onChange={e => onTranscript(q.quizId, e.target.value)}
            placeholder="Type the sentence you heard…"
            disabled={playCount === 0}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "12px 14px", borderRadius: 10,
              border: `2px solid ${transcript ? BRAND : "#E2EBF0"}`,
              fontFamily: SERIF, fontSize: 14, color: "#0F172A",
              background: "#FAFBFC", outline: "none",
            }}
          />
        )}
      </div>
    </div>
  );
};

// ── Interview task card ───────────────────────────────────────────────────────

const InterviewCard = ({ q, transcript, onTranscript }) => {
  const [phase,      setPhase]      = useState("ready");   // ready | recording | done | error
  const [timeLeft,   setTimeLeft]   = useState(INTERVIEW_SECS);
  const srRef    = useRef(null);
  const timerRef = useRef(null);
  const phaseRef = useRef("ready"); // mirror para callbacks del SR (evita closures obsoletos)

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
          if (e.results[i].isFinal) {
            accumulated += e.results[i][0].transcript + " ";
          }
        }
        if (accumulated.trim()) onTranscript(q.quizId, accumulated.trim());
      };
      sr.onerror = (ev) => {
        // "no-speech" no es un error fatal — el onend se encarga de reiniciar
        if (ev.error === "no-speech") return;
        phaseRef.current = "error";
        setPhase("error");
        setTimeout(() => { phaseRef.current = "ready"; setPhase("ready"); }, 3000);
      };
      // Chrome para el SR automáticamente al detectar silencio incluso con continuous=true.
      // Lo reiniciamos mientras el timer siga corriendo para no perder voz.
      sr.onend = () => {
        if (phaseRef.current === "recording") {
          try { sr.start(); } catch { /* ya parado */ }
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
      {/* Question display */}
      <div style={{
        background: "#F7F4EF", borderRadius: 16, padding: "24px",
      }}>
        <p style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
          color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.12em",
          marginBottom: 10 }}>
          Interview question
        </p>
        <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.7,
          color: "#0F172A", margin: 0, fontStyle: "italic" }}>
          {q.questionText.replace(/^\[Interview[^\]]*\]\s*/i, "")}
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
        transition: "border-color 0.3s",
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
              color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.12em",
              marginBottom: 6 }}>
              {phase === "ready" ? "Your turn" : phase === "recording" ? "Speaking" : "Done"}
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 13, color: "#64748B", margin: 0 }}>
              {phase === "ready"
                ? `You have ${INTERVIEW_SECS} seconds to answer.`
                : phase === "recording"
                  ? SR_SUPPORTED ? "Speak clearly. Recording will stop automatically." : "Recording time — type your answer below."
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

        {/* Transcript or text fallback */}
        {!SR_SUPPORTED ? (
          <textarea
            value={transcript ?? ""}
            onChange={e => onTranscript(q.quizId, e.target.value)}
            placeholder="Type your answer here…"
            rows={6}
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
          <div style={{
            background: "#f0faf7", borderRadius: 10, padding: "12px 14px",
            border: "1px solid rgba(93,202,165,0.3)",
          }}>
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

        {/* No SR warning */}
        {!SR_SUPPORTED && (
          <div style={{ display: "flex", alignItems: "center", gap: 8,
            background: "#fff8e6", borderRadius: 8, padding: "10px 12px" }}>
            <WarningCircle size={16} color="#d97706" weight="fill" />
            <p style={{ fontFamily: SERIF, fontSize: 12, color: "#92400e", margin: 0 }}>
              Speech recognition is not supported in this browser. Use Chrome or Edge for the full experience.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const SpeakingTest = ({ session }) => {
  const navigate = useNavigate();
  const testId   = session.testId;

  const [groups,     setGroups]     = useState([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [transcripts, setTranscripts] = useState({});  // quizId → transcript string
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    TestsApi.getQuestions(testId)
      .then(res => {
        if (cancelled) return;
        setGroups(buildGroups(res.data));
        const saved = {};
        res.data.forEach(q => { if (q.userResponse) saved[q.quizId] = q.userResponse; });
        setTranscripts(saved);
      })
      .catch(err => { if (!cancelled) console.error("Could not load questions:", err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
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
      // Don't submit empty answers - user must record/type something
      if (answer.trim()) {
        await TestsApi.submitAnswer(testId, q.quizId, answer);
      }
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
    } catch {
      setSubmitting(false);
    }
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

  const q          = currentGroup.questions[0];
  const mode       = taskType(q?.questionText ?? "");
  const sectionLabel = mode === "REPEAT" ? "Listen and Repeat" : "Take an Interview";
  const groupLabel   = `${sectionLabel} — Question ${groupIndex + 1} of ${totalGroups}`;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column",
      background: "#F8FAFC", overflow: "hidden" }}>

      <TestTopBar
        paperName={session.paperName}
        groupLabel={groupLabel}
        remainingSeconds={session.remainingSeconds}
        onLeave={() => navigate("/courses")}
      />

      {!SR_SUPPORTED && (
        <div style={{
          background: "#fffbeb", borderBottom: "1px solid #fcd34d",
          padding: "10px 24px", display: "flex", alignItems: "center", gap: 10,
        }}>
          <WarningCircle size={18} weight="fill" color="#d97706" />
          <span style={{ fontFamily: SERIF, fontSize: 13, color: "#92400e" }}>
            Voice recording requires <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.
            Your browser is not supported — you can still type your answers in the text fields below.
          </span>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", display: "flex", justifyContent: "center" }}>
        <div style={{
          width: "100%", maxWidth: 720,
          padding: "36px 36px 48px",
          display: "flex", flexDirection: "column", gap: 0,
        }}>
          <p style={{
            fontFamily: SERIF, fontSize: 10, fontWeight: 700,
            color: "#94A3B8", letterSpacing: "0.14em",
            textTransform: "uppercase", marginBottom: 28,
          }}>
            {groupLabel}
          </p>

          {currentGroup.questions.map(q => (
            mode === "REPEAT" ? (
              <RepeatCard
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
              />
            )
          ))}

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

export default SpeakingTest;
