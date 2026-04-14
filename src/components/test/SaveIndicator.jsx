/**
 * SaveIndicator — tiny badge showing autosave state.
 *
 * Props:
 *   saveState  "idle" | "saving" | "saved" | "error"
 *   savedAt    Date | null
 */

const SERIF = "Newsreader, Georgia, serif";

const fmt = (date) => {
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const SaveIndicator = ({ saveState, savedAt }) => {
  if (saveState === "idle") return null;

  const config = {
    saving: { text: "Saving…",                        color: "#94A3B8", dot: "#94A3B8" },
    saved:  { text: `Saved at ${fmt(savedAt)}`,        color: "#15803d", dot: "#5DCAA5" },
    error:  { text: "Couldn't save — retrying…",       color: "#b02020", dot: "#fca5a5" },
  }[saveState];

  if (!config) return null;

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontFamily: SERIF, fontSize: 11, color: config.color,
      transition: "opacity 0.2s",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: config.dot, flexShrink: 0,
        animation: saveState === "saving" ? "sipulse 1s ease-in-out infinite" : "none",
      }} />
      {config.text}
      <style>{`
        @keyframes sipulse {
          0%,100% { opacity:1; } 50% { opacity:0.3; }
        }
      `}</style>
    </div>
  );
};

export default SaveIndicator;
