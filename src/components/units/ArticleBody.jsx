/**
 * ArticleBody.jsx — Renders parsed exam notes beautifully (WEB)
 *
 * Uses INLINE STYLES ONLY — no Tailwind.
 * Units.jsx uses inline styles throughout, so Tailwind utility
 * classes are not reliably applied inside that screen.
 *
 * Renders all block types from parseUnitText v4:
 *   heading, subheading, definition, bullet, body, callout, divider, spacer
 */

import { useMemo } from "react";
import parseUnitText  from "./parseUnitText.js";
import InlineText     from "./InlineText.jsx";
import CalloutBox     from "./CalloutBox.jsx";
import SectionHeading from "./SectionHeading.jsx";

const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif";

// ── Definition block ─────────────────────────────────────────────────────────
// "TERM: body explanation" — styled as a key-value row with a teal term pill

const DefinitionBlock = ({ term, body, depth = 0 }) => (
  <div style={{
    display: "flex", gap: 12, alignItems: "flex-start",
    marginBottom: 10,
    paddingLeft: depth === 0 ? 0 : depth === 1 ? 16 : 32,
  }}>
    {/* Term pill */}
    <span style={{
      fontFamily: SERIF, fontSize: 12, fontWeight: 700,
      color: BRAND, background: "#e8f7f9",
      border: "1px solid rgba(10,95,110,0.15)",
      borderRadius: 6, padding: "3px 10px",
      whiteSpace: "nowrap", flexShrink: 0,
      letterSpacing: "0.02em", lineHeight: 1.6,
      marginTop: 2,
    }}>
      {term}
    </span>
    {/* Body */}
    <span style={{
      fontFamily: SERIF, fontSize: 16, color: "#374151",
      lineHeight: 1.7, flex: 1,
    }}>
      {body}
    </span>
  </div>
);

// ── Bullet block ─────────────────────────────────────────────────────────────

const BulletBlock = ({ text, depth = 0 }) => {
  const paddingLeft = depth === 0 ? 0 : depth === 1 ? 20 : 40;
  const dotColor    = depth === 0 ? BRAND : depth === 1 ? MINT : "#94A3B8";
  const dotSize     = depth === 0 ? 7 : 5;

  return (
    <div style={{ display: "flex", alignItems: "flex-start",
      marginBottom: 8, paddingLeft }}>
      <div style={{
        width: dotSize, height: dotSize, borderRadius: "50%",
        background: dotColor, marginTop: 10, marginRight: 12, flexShrink: 0,
      }} />
      <span style={{ fontFamily: SERIF, fontSize: 16,
        color: "#4B5563", lineHeight: 1.7, flex: 1 }}>
        {text}
      </span>
    </div>
  );
};

// ── Divider ───────────────────────────────────────────────────────────────────

const Divider = () => (
  <div style={{
    height: 1, background: "linear-gradient(90deg, #e2f4f7, transparent)",
    margin: "32px 0 8px",
  }} />
);

// ── ArticleBody ───────────────────────────────────────────────────────────────

const ArticleBody = ({ text }) => {
  const blocks = useMemo(() => parseUnitText(text), [text]);

  return (
    <div style={{ padding: "48px 80px 32px", maxWidth: "100%", boxSizing: "border-box" }}>
      {blocks.map((block, idx) => {
        switch (block.type) {

          case "divider":
            return <Divider key={idx} />;

          case "heading":
            return <SectionHeading key={idx} text={block.text} number={block.number} />;

          case "subheading":
            return (
              <h3 key={idx} style={{
                fontFamily: SERIF, fontSize: 18, fontWeight: 600,
                color: "#374151", marginTop: 24, marginBottom: 12,
                letterSpacing: "-0.2px", lineHeight: 1.4,
              }}>
                {block.text}
              </h3>
            );

          case "definition":
            return (
              <DefinitionBlock
                key={idx}
                term={block.term}
                body={block.body}
                depth={block.depth ?? 0}
              />
            );

          case "bullet":
            return (
              <BulletBlock
                key={idx}
                text={block.text}
                depth={block.depth ?? 0}
              />
            );

          case "body":
            return (
              <InlineText
                key={idx}
                text={block.text}
                style={{ fontFamily: SERIF, fontSize: 17, color: "#4B5563",
                  lineHeight: 1.75, marginBottom: 12, display: "block" }}
                emStyle={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700,
                  color: BRAND }}
              />
            );

          case "callout":
            return (
              <CalloutBox key={idx} keyword={block.keyword} text={block.text} />
            );

          case "spacer":
            return <div key={idx} style={{ height: 12 }} />;

          default:
            return null;
        }
      })}
    </div>
  );
};

export default ArticleBody;