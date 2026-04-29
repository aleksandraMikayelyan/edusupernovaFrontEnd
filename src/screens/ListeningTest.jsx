import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate }  from "react-router-dom";
import {
  CaretLeft, CaretRight, PaperPlane,
  SpeakerHigh, ArrowCounterClockwise, Play, Pause,
  Headphones, NotePencil,
} from "@phosphor-icons/react";
import { TestsApi }  from "../api/index.js";
import LoadingScreen from "../components/common/LoadingScreen.jsx";
import TestTopBar    from "../components/test/TestTopBar.jsx";

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_PLAYS = 2;          // TOEFL / IELTS / Cambridge: max 2 listens
const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif";

// ── Helpers ───────────────────────────────────────────────────────────────────

const buildGroups = (questions) => {
  const map = new Map();
  questions.forEach(q => {
    const key = q.groupId ?? `standalone_${q.quizId}`;
    if (!map.has(key)) {
      map.set(key, {
        groupId:         q.groupId,
        groupTitle:      q.groupTitle,
        contextText:     q.contextText,
        contextImageUrl: q.contextImageUrl,
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

const getOptions = (q) =>
  ["A", "B", "C", "D", "E"]
    .map(l => ({ letter: l, text: q[`option${l}`] }))
    .filter(o => o.text);

// Extract the spoken text from an [Audio prompt: ...] marker in questionText
const extractAudioPrompt = (questionText = "") => {
  const m = questionText.match(/\[Audio prompt:\s*(.*?)\]/s);
  return m ? m[1].trim() : questionText;
};

// Remove the [Audio prompt: ...] marker so it doesn't render as question text
const cleanQuestionText = (questionText = "") =>
  questionText.replace(/\[Audio prompt:.*?\]\s*/s, "").trim();

// ── MCQ option card ───────────────────────────────────────────────────────────

const MCQQuestion = ({ q, index, selected, onSelect, locked }) => {
  const options = getOptions(q);
  const text    = cleanQuestionText(q.questionText);

  return (
    <div style={{
      paddingBottom: 28, borderBottom: "1px solid #F1F5F9",
      display: "flex", flexDirection: "column", gap: 14,
      opacity: locked ? 0.38 : 1,
      transition: "opacity 0.4s",
      pointerEvents: locked ? "none" : "auto",
    }}>
      <p style={{
        fontFamily: SERIF, fontSize: 15, lineHeight: 1.65,
        color: "#0F172A", margin: 0,
      }}>
        {text}
        {q.marks && (
          <span style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
            color: "#94A3B8", marginLeft: 8 }}>
            [{q.marks} mark{q.marks !== 1 ? "s" : ""}]
          </span>
        )}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map(({ letter, text: optText }) => {
          const isSelected = selected === letter;
          return (
            <button key={letter} onClick={() => onSelect(q.quizId, letter)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 16px", borderRadius: 14, textAlign: "left",
                border: `2px solid ${isSelected ? BRAND : "#EEF2F7"}`,
                background: isSelected ? "#e8f7f9" : "#FAFBFC",
                cursor: "pointer",
                boxShadow: isSelected ? "0 4px 16px rgba(10,95,110,0.10)" : "none",
                transition: "all 0.18s",
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "#CBD5E1";
                  e.currentTarget.style.background  = "#F1F5F9";
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = "#EEF2F7";
                  e.currentTarget.style.background  = "#FAFBFC";
                }
              }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: isSelected ? BRAND : "#E8EDF2",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.18s",
              }}>
                <span style={{ fontFamily: SERIF, fontSize: 12, fontWeight: 700,
                  color: isSelected ? "#fff" : "#64748B" }}>
                  {letter}
                </span>
              </div>
              <span style={{
                fontFamily: SERIF, fontSize: 14, lineHeight: 1.5, flex: 1,
                color: isSelected ? BRAND : "#374151",
                fontWeight: isSelected ? 600 : 400,
                transition: "color 0.18s",
              }}>
                {optText}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Nav button ────────────────────────────────────────────────────────────────

const NavBtn = ({ onClick, disabled, variant = "secondary", children }) => {
  const isPrimary = variant === "primary";
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
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

// ── Pulsing wave animation for "speaking" state ───────────────────────────────

const SpeakingWave = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 3, height: 20 }}>
    {[0, 1, 2, 3, 4].map(i => (
      <div key={i} style={{
        width: 3, borderRadius: 3,
        background: BRAND,
        animation: `liwave 0.9s ease-in-out ${i * 0.12}s infinite`,
      }} />
    ))}
    <style>{`
      @keyframes liwave {
        0%,100% { height: 4px; }
        50%      { height: 18px; }
      }
    `}</style>
  </div>
);

// ── Audio player card ─────────────────────────────────────────────────────────

const AudioCard = ({
  audioState,   // "idle" | "speaking" | "done"
  playCount,
  onPlay,
  onStop,
  hasContext,
  groupTitle,
}) => {
  const canPlay   = audioState !== "speaking" && playCount < MAX_PLAYS;
  const noneLeft  = playCount >= MAX_PLAYS;
  const isPlaying = audioState === "speaking";

  return (
    <div style={{
      background: "linear-gradient(135deg, #f0f9f7 0%, #e8f3f7 100%)",
      border: "1px solid rgba(10,95,110,0.14)",
      borderRadius: 20, padding: "22px 26px", marginBottom: 28,
    }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 13,
          background: isPlaying ? "#e8f7f9" : BRAND,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.3s", flexShrink: 0,
          border: isPlaying ? `2px solid ${BRAND}` : "none",
        }}>
          {isPlaying
            ? <SpeakerHigh size={20} color={BRAND} weight="fill" />
            : <Headphones size={20} color="#fff" weight="fill" />
          }
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700,
            color: BRAND, margin: 0, lineHeight: 1.3 }}>
            {hasContext ? (groupTitle || "Audio passage") : "Audio prompt"}
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 11, color: "#64748B", margin: "2px 0 0" }}>
            {noneLeft
              ? "No more replays available"
              : isPlaying
                ? "Playing now…"
                : playCount === 0
                  ? "Press play when ready"
                  : `${MAX_PLAYS - playCount} replay${MAX_PLAYS - playCount !== 1 ? "s" : ""} remaining`}
          </p>
        </div>

        {/* Play count dots */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {Array.from({ length: MAX_PLAYS }).map((_, i) => (
            <div key={i} style={{
              width: 9, height: 9, borderRadius: "50%",
              background: i < playCount ? BRAND : "rgba(10,95,110,0.15)",
              transition: "background 0.4s",
            }} />
          ))}
        </div>
      </div>

      {/* Wave animation or play button row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {isPlaying ? (
          <>
            <SpeakingWave />
            <button onClick={onStop}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 18px", borderRadius: 10, border: `1.5px solid ${BRAND}`,
                background: "transparent", color: BRAND,
                fontFamily: SERIF, fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>
              <Pause size={12} weight="fill" /> Stop
            </button>
          </>
        ) : (
          <button onClick={onPlay} disabled={!canPlay}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 22px", borderRadius: 11, border: "none",
              background: !canPlay ? "#E8EDF2" : playCount === 0 ? MINT : "#e8f7f9",
              color: !canPlay ? "#94A3B8" : playCount === 0 ? DARK : BRAND,
              fontFamily: SERIF, fontSize: 13, fontWeight: 700,
              cursor: !canPlay ? "not-allowed" : "pointer",
              boxShadow: canPlay && playCount === 0 ? "0 6px 18px rgba(93,202,165,0.3)" : "none",
              border: canPlay && playCount > 0 ? `1.5px solid ${BRAND}` : "none",
              transition: "all 0.18s",
            }}>
            {playCount === 0
              ? <><Play size={13} weight="fill" /> Play Audio</>
              : <><ArrowCounterClockwise size={13} weight="bold" /> Replay</>
            }
          </button>
        )}
      </div>
    </div>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

const ListeningTest = ({ session }) => {
  const navigate = useNavigate();
  const testId   = session.testId;

  const [groups,     setGroups]     = useState([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [answers,    setAnswers]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Audio state — reset per group
  const [audioState, setAudioState] = useState("idle"); // idle | speaking | done
  const [playCount,  setPlayCount]  = useState(0);
  const [notes,      setNotes]      = useState("");
  const utteranceRef = useRef(null);

  // Load questions
  useEffect(() => {
    TestsApi.getQuestions(testId)
      .then(res => {
        setGroups(buildGroups(res.data));
        const saved = {};
        res.data.forEach(q => { if (q.userResponse) saved[q.quizId] = q.userResponse; });
        setAnswers(saved);
      })
      .catch(err => console.error("Could not load questions:", err))
      .finally(() => setLoading(false));
  }, [testId]);

  // Reset audio and notes whenever group changes
  useEffect(() => {
    window.speechSynthesis.cancel();
    setAudioState("idle");
    setPlayCount(0);
    setNotes("");
  }, [groupIndex]);

  // Cancel TTS on unmount
  useEffect(() => () => window.speechSynthesis.cancel(), []);

  const currentGroup = groups[groupIndex];
  const totalGroups  = groups.length;
  const isLastGroup  = groupIndex === totalGroups - 1;
  const hasContext   = !!(currentGroup?.contextText || currentGroup?.contextImageUrl);

  // Text to speak: passage for grouped, extracted prompt for standalone
  const audioText = hasContext
    ? currentGroup?.contextText
    : extractAudioPrompt(currentGroup?.questions[0]?.questionText);

  // Questions are locked until at least one play (only for grouped questions)
  const questionsLocked = hasContext && audioState === "idle";

  // Label shown in top bar centre
  const groupLabel = hasContext
    ? `Passage ${groupIndex + 1} of ${totalGroups}`
    : `Question ${groupIndex + 1} of ${totalGroups}`;

  // ── Audio controls ───────────────────────────────────────────────────────────

  const handlePlay = useCallback(() => {
    if (audioState === "speaking" || playCount >= MAX_PLAYS || !audioText) return;
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(audioText);
    u.rate = 0.88;
    u.lang = "en-US";
    u.onstart = () => setAudioState("speaking");
    u.onend   = () => {
      setPlayCount(c => c + 1);
      setAudioState("done");
    };
    u.onerror = () => setAudioState(playCount > 0 ? "done" : "idle");
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  }, [audioText, audioState, playCount]);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setAudioState(playCount > 0 ? "done" : "idle");
  }, [playCount]);

  // ── Answer / navigation ───────────────────────────────────────────────────────

  const setAnswer = useCallback((quizId, letter) => {
    setAnswers(prev => ({ ...prev, [quizId]: letter }));
  }, []);

  const saveGroupAnswers = useCallback(async () => {
    if (!currentGroup) return;
    const pending = currentGroup.questions.filter(q => answers[q.quizId]);
    for (const q of pending) {
      await TestsApi.submitAnswer(testId, q.quizId, answers[q.quizId]);
    }
  }, [currentGroup, answers, testId]);

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

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) return <LoadingScreen />;

  if (!currentGroup) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#F7F4EF" }}>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: "#64748B" }}>
        No questions available for this section.
      </p>
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column",
      background: "#F8FAFC", overflow: "hidden" }}>
      <style>{`
        @keyframes lispin { to { transform: rotate(360deg); } }
      `}</style>

      <TestTopBar
        paperName={session.paperName}
        groupLabel={groupLabel}
        remainingSeconds={session.remainingSeconds}
        onLeave={() => navigate("/courses")}
      />

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", justifyContent: "center" }}>
        <div style={{
          width: "100%", maxWidth: 820,
          padding: "32px 36px 48px",
          display: "flex", flexDirection: "column", gap: 0,
        }}>

          {/* Section badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#e8f7f9", borderRadius: 999, padding: "4px 12px",
              border: "1px solid rgba(10,95,110,0.15)",
            }}>
              <SpeakerHigh size={11} color={BRAND} weight="fill" />
              <span style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 700,
                color: BRAND, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                {hasContext ? "Listening — " + (currentGroup.groupTitle || "Audio Passage") : "Listen and Choose a Response"}
              </span>
            </div>
          </div>

          {/* Audio player card */}
          <AudioCard
            audioState={audioState}
            playCount={playCount}
            onPlay={handlePlay}
            onStop={handleStop}
            hasContext={hasContext}
            groupTitle={currentGroup.groupTitle}
          />

          {/* Note-taking area (only for passage-based groups, real TOEFL allows notes) */}
          {hasContext && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <NotePencil size={13} color="#94A3B8" weight="bold" />
                <span style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 700,
                  color: "#94A3B8", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Your notes
                </span>
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Take notes here while listening…"
                rows={3}
                style={{
                  width: "100%", background: "#F8FAFC",
                  border: "1.5px solid #E2EBF0", borderRadius: 14,
                  padding: "12px 16px", fontFamily: SERIF, fontSize: 13,
                  color: "#374151", lineHeight: 1.6, resize: "vertical",
                  outline: "none", boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = BRAND}
                onBlur={e => e.target.style.borderColor = "#E2EBF0"}
              />
            </div>
          )}

          {/* Questions header */}
          <p style={{
            fontFamily: SERIF, fontSize: 10, fontWeight: 700,
            color: "#94A3B8", letterSpacing: "0.14em",
            textTransform: "uppercase", marginBottom: 24,
          }}>
            {questionsLocked
              ? "Listen to unlock the questions"
              : "Choose the best answer"}
          </p>

          {/* Locked overlay message */}
          {questionsLocked && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 12, padding: "36px 24px",
              background: "linear-gradient(135deg, #f0f9f7, #e8f3f7)",
              borderRadius: 20, marginBottom: 28,
              border: "1.5px dashed rgba(10,95,110,0.2)",
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 18,
                background: "#fff", border: `1.5px solid rgba(10,95,110,0.15)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 14px rgba(10,95,110,0.08)",
              }}>
                <Headphones size={26} color={BRAND} weight="duotone" />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700,
                  color: DARK, margin: "0 0 4px" }}>
                  Listen before you answer
                </p>
                <p style={{ fontFamily: SERIF, fontSize: 13, color: "#64748B", margin: 0 }}>
                  Press <strong>Play Audio</strong> above to unlock the questions.
                </p>
              </div>
            </div>
          )}

          {/* Questions list */}
          {!questionsLocked && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {currentGroup.questions.map((q, i) => (
                <MCQQuestion
                  key={q.quizId}
                  q={q}
                  index={i}
                  selected={answers[q.quizId] ?? null}
                  onSelect={setAnswer}
                  locked={false}
                />
              ))}
            </div>
          )}

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

export default ListeningTest;
