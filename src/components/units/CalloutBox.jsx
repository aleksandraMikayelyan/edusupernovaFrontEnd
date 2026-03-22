/**
 * CalloutBox.jsx — Styled callout box for unit summaries (WEB)
 * Inline styles only — no Tailwind dependency.
 * Uses @phosphor-icons/react (already installed).
 */

import {
  Lightbulb, WarningCircle, PushPin,
  PencilSimple, BookOpen, Lightning
} from "@phosphor-icons/react";

const CALLOUT_CFG = {
  "KEY CONCEPT": { Icon: Lightbulb,      color: "#0369a1", bg: "#eff8ff", border: "#3b82f6" },
  "IMPORTANT":   { Icon: WarningCircle,  color: "#b45309", bg: "#fffbeb", border: "#f59e0b" },
  "NOTE":        { Icon: PushPin,        color: "#6d28d9", bg: "#f5f3ff", border: "#8b5cf6" },
  "EXAMPLE":     { Icon: PencilSimple,   color: "#065f46", bg: "#ecfdf5", border: "#10b981" },
  "DEFINITION":  { Icon: BookOpen,       color: "#9f1239", bg: "#fff1f2", border: "#f43f5e" },
  "REMEMBER":    { Icon: Lightning,      color: "#1c94a7", bg: "#e8f7f9", border: "#1c94a7" },
};

const CalloutBox = ({ keyword, text }) => {
  const cfg = CALLOUT_CFG[keyword] || CALLOUT_CFG["NOTE"];
  const { Icon, color, bg, border } = cfg;

  return (
    <div style={{
      background: bg, borderRadius: 14,
      borderLeft: `4px solid ${border}`,
      padding: "18px 22px", margin: "24px 0",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Icon size={17} weight="duotone" color={color} />
        <span style={{
          fontFamily: "Newsreader, Georgia, serif",
          fontSize: 11, fontWeight: 700, color,
          textTransform: "uppercase", letterSpacing: "0.12em",
        }}>
          {keyword}
        </span>
      </div>
      {!!text && (
        <p style={{
          fontFamily: "Newsreader, Georgia, serif",
          fontSize: 16, color: "#374151", lineHeight: 1.7, margin: 0,
        }}>
          {text}
        </p>
      )}
    </div>
  );
};

export default CalloutBox;