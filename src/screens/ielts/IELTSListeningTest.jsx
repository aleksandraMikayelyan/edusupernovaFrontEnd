/**
 * IELTSListeningTest.jsx — IELTS Listening section.
 *
 * 4 parts with increasing difficulty:
 *   Parts 1–2: Social / everyday contexts
 *   Parts 3–4: Educational / academic contexts
 *
 * Audio simulated via Web Speech API (SpeechSynthesis). Max 2 plays.
 * Questions locked until audio plays at least once.
 * Supports both MCQ and SHORT_ANSWER (fill-in-the-blank) question types.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  SpeakerHigh, ArrowCounterClockwise, Play, Pause,
  Headphones, NotePencil,
} from "@phosphor-icons/react";
import { TestsApi }    from "../../api/index.js";
import LoadingScreen   from "../../components/common/LoadingScreen.jsx";
import TestTopBar      from "../../components/test/TestTopBar.jsx";
import MCQQuestionCard from "../../components/test/MCQQuestionCard.jsx";
import TestNavBar      from "../../components/test/TestNavBar.jsx";
import { buildGroups } from "../../utils/buildGroups.js";

const MAX_PLAYS = 2;
const DARK  = "#062f37";
const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif";

const extractAudioPrompt = (text = "") => {
  const m = text.match(/\[Audio prompt:\s*(.*?)\]/s);
  return m ? m[1].trim() : text;
};

const cleanQuestionText = (text = "") =>
  text.replace(/\[Audio prompt:.*?\]\s*/s, "").trim();

// ── Animated wave during playback ─────────────────────────────────────────────

const SpeakingWave = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 3, height: 20 }}>
    {[0, 1, 2, 3, 4].map(i => (
      <div key={i} style={{
        width: 3, borderRadius: 3, background: BRAND,
        animation: `ieltsLiWave 0.9s ease-in-out ${i * 0.12}s infinite`,
      }} />
    ))}
    <style>{`@keyframes ieltsLiWave { 0%,100%{height:4px} 50%{height:18px} }`}</style>
  </div>
);

// ── Audio player card ─────────────────────────────────────────────────────────

const AudioCard = ({ audioState, playCount, onPlay, onStop, hasContext, groupTitle }) => {
  const canPlay   = audioState !== "speaking" && playCount < MAX_PLAYS;
  const noneLeft  = playCount >= MAX_PLAYS;
  const isPlaying = audioState === "speaking";

  return (
    <div style={{
      background: "linear-gradient(135deg, #f0f9f7 0%, #e8f3f7 100%)",
      border: "1px solid rgba(10,95,110,0.14)",
      borderRadius: 20, padding: "22px 26px", marginBottom: 28,
    }}>
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
            : <Headphones  size={20} color="#fff"  weight="fill" />}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700,
            color: BRAND, margin: 0, lineHeight: 1.3 }}>
            {hasContext ? (groupTitle || "Audio passage") : "Audio prompt"}
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 11, color: "#64748B", margin: "2px 0 0" }}>
            {noneLeft
              ? "No more replays available"
              : isPlaying ? "Playing now…"
              : playCount === 0 ? "Press play when ready"
              : `${MAX_PLAYS - playCount} replay${MAX_PLAYS - playCount !== 1 ? "s" : ""} remaining`}
          </p>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: MAX_PLAYS }).map((_, i) => (
            <div key={i} style={{
              width: 9, height: 9, borderRadius: "50%",
              background: i < playCount ? BRAND : "rgba(10,95,110,0.15)",
              transition: "background 0.4s",
            }} />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {isPlaying ? (
          <>
            <SpeakingWave />
            <button onClick={onStop} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 18px", borderRadius: 10,
              border: `1.5px solid ${BRAND}`, background: "transparent",
              color: BRAND, fontFamily: SERIF, fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>
              <Pause size={12} weight="fill" /> Stop
            </button>
          </>
        ) : (
          <button onClick={onPlay} disabled={!canPlay} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 22px", borderRadius: 11,
            border: canPlay && playCount > 0 ? `1.5px solid ${BRAND}` : "none",
            background: !canPlay ? "#E8EDF2" : playCount === 0 ? MINT : "#e8f7f9",
            color: !canPlay ? "#94A3B8" : playCount === 0 ? DARK : BRAND,
            fontFamily: SERIF, fontSize: 13, fontWeight: 700,
            cursor: !canPlay ? "not-allowed" : "pointer",
            boxShadow: canPlay && playCount === 0 ? "0 6px 18px rgba(93,202,165,0.3)" : "none",
            transition: "all 0.18s",
          }}>
            {playCount === 0
              ? <><Play size={13} weight="fill" /> Play Audio</>
              : <><ArrowCounterClockwise size={13} weight="bold" /> Replay</>}
          </button>
        )}
      </div>
    </div>
  );
};

// ── Locked overlay (before first play) ───────────────────────────────────────

const LockedOverlay = () => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 12, padding: "36px 24px",
    background: "linear-gradient(135deg, #f0f9f7, #e8f3f7)",
    borderRadius: 20, marginBottom: 28,
    border: "1.5px dashed rgba(10,95,110,0.2)",
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: 18,
      background: "#fff", border: "1.5px solid rgba(10,95,110,0.15)",
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
);

// ── Fill-in-the-blank card ────────────────────────────────────────────────────

const ShortAnswerCard = ({ q, index, value, onChange }) => (
  <div style={{
    background: "#fff", border: "1px solid #E8F0F4",
    borderRadius: 16, padding: "20px 24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    animation: `ieltsLiFade 0.3s ${index * 40}ms ease both`,
  }}>
    <style>{`@keyframes ieltsLiFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginTop: 2,
        background: "#e8f7f9", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 11, fontWeight: 700, color: BRAND }}>
          {q.questionNumber ?? index + 1}
        </span>
      </div>
      <p style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.65,
        color: "#0F172A", margin: 0, flex: 1 }}>
        {q.questionText}
      </p>
    </div>
    <input
      value={value ?? ""}
      onChange={e => onChange(q.quizId, e.target.value)}
      placeholder="Write your answer here…"
      style={{
        width: "100%", boxSizing: "border-box",
        padding: "11px 14px", borderRadius: 10,
        border: `2px solid ${value ? BRAND : "#E2EBF0"}`,
        fontFamily: SERIF, fontSize: 14, color: "#0F172A",
        background: value ? "#f0faf7" : "#FAFBFC",
        outline: "none", transition: "border 0.18s, background 0.18s",
      }}
      onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.background = "#f0faf7"; }}
      onBlur={e => {
        if (!value) {
          e.target.style.borderColor = "#E2EBF0";
          e.target.style.background = "#FAFBFC";
        }
      }}
    />
  </div>
);

// ── Main screen ───────────────────────────────────────────────────────────────

const IELTSListeningTest = ({ session }) => {
  const navigate = useNavigate();
  const testId   = session.testId;

  const [groups,     setGroups]     = useState([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [answers,    setAnswers]    = useState({});
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [audioState, setAudioState] = useState("idle");
  const [playCount,  setPlayCount]  = useState(0);
  const [notes,      setNotes]      = useState("");
  const utteranceRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    TestsApi.getQuestions(testId)
      .then(res => {
        if (cancelled) return;
        setGroups(buildGroups(res.data));
        const saved = {};
        res.data.forEach(q => { if (q.userResponse) saved[q.quizId] = q.userResponse; });
        setAnswers(saved);
      })
      .catch(err => { if (!cancelled) console.error("Could not load questions:", err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [testId]);

  useEffect(() => {
    window.speechSynthesis.cancel();
    setAudioState("idle");
    setPlayCount(0);
    setNotes("");
  }, [groupIndex]);

  useEffect(() => () => window.speechSynthesis.cancel(), []);

  const currentGroup = groups[groupIndex];
  const totalGroups  = groups.length;
  const isLastGroup  = groupIndex === totalGroups - 1;
  const hasContext   = !!(currentGroup?.contextText || currentGroup?.contextImageUrl);

  const audioText = hasContext
    ? currentGroup?.contextText
    : extractAudioPrompt(currentGroup?.questions[0]?.questionText);

  const questionsLocked = hasContext && audioState === "idle";

  const partLabel = `Part ${groupIndex + 1} of ${totalGroups}`;

  const handlePlay = useCallback(() => {
    if (audioState === "speaking" || playCount >= MAX_PLAYS || !audioText) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(audioText);
    u.rate = 0.88;
    u.lang = "en-US";
    u.onstart = () => setAudioState("speaking");
    u.onend   = () => { setPlayCount(c => c + 1); setAudioState("done"); };
    u.onerror = () => setAudioState(playCount > 0 ? "done" : "idle");
    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  }, [audioText, audioState, playCount]);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setAudioState(playCount > 0 ? "done" : "idle");
  }, [playCount]);

  const setAnswer = useCallback((quizId, value) => {
    setAnswers(prev => ({ ...prev, [quizId]: value }));
  }, []);

  const saveGroupAnswers = useCallback(async () => {
    if (!currentGroup) return;
    const pending = currentGroup.questions.filter(q => answers[q.quizId]);
    for (const q of pending)
      await TestsApi.submitAnswer(q.testId ?? testId, q.quizId, answers[q.quizId]);
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

  const displayQuestions = hasContext
    ? currentGroup.questions
    : currentGroup.questions.map(q => ({
        ...q,
        questionText: cleanQuestionText(q.questionText),
      }));

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column",
      background: "#F8FAFC", overflow: "hidden" }}>

      <TestTopBar
        paperName={session.paperName}
        groupLabel={partLabel}
        remainingSeconds={session.remainingSeconds}
        onLeave={() => navigate("/courses")}
      />

      <div style={{ flex: 1, overflowY: "auto", display: "flex", justifyContent: "center" }}>
        <div style={{
          width: "100%", maxWidth: 820,
          padding: "32px 36px 48px",
          display: "flex", flexDirection: "column",
        }}>

          {/* IELTS section badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#e8f7f9", borderRadius: 999, padding: "4px 12px",
            border: "1px solid rgba(10,95,110,0.15)", marginBottom: 20,
            alignSelf: "flex-start",
          }}>
            <SpeakerHigh size={11} color={BRAND} weight="fill" />
            <span style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 700,
              color: BRAND, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              IELTS Listening — {hasContext
                ? (currentGroup.groupTitle || partLabel)
                : partLabel}
            </span>
          </div>

          <AudioCard
            audioState={audioState}
            playCount={playCount}
            onPlay={handlePlay}
            onStop={handleStop}
            hasContext={hasContext}
            groupTitle={currentGroup.groupTitle}
          />

          {/* Note-taking area for passage-based groups */}
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

          <p style={{
            fontFamily: SERIF, fontSize: 10, fontWeight: 700,
            color: "#94A3B8", letterSpacing: "0.14em",
            textTransform: "uppercase", marginBottom: 24,
          }}>
            {questionsLocked ? "Listen to unlock the questions" : "Choose or write the best answer"}
          </p>

          {questionsLocked && <LockedOverlay />}

          {!questionsLocked && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {displayQuestions.map((q, i) => {
                const qType = q.type?.toUpperCase();
                if (qType === "SHORT_ANSWER" || qType === "COMPLETION") {
                  return (
                    <ShortAnswerCard
                      key={q.quizId}
                      q={q}
                      index={i}
                      value={answers[q.quizId] ?? ""}
                      onChange={setAnswer}
                    />
                  );
                }
                return (
                  <MCQQuestionCard
                    key={q.quizId}
                    q={q}
                    index={i}
                    selected={answers[q.quizId] ?? null}
                    onSelect={setAnswer}
                    locked={false}
                  />
                );
              })}
            </div>
          )}

          <TestNavBar
            onPrev={handlePrev}
            onNext={handleNext}
            onSubmit={handleSubmit}
            canPrev={groupIndex > 0}
            isLast={isLastGroup}
            submitting={submitting}
            nextLabel={hasContext ? "Next part" : "Next"}
          />
        </div>
      </div>
    </div>
  );
};

export default IELTSListeningTest;
