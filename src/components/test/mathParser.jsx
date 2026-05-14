/**
 * Math.jsx — render mixed text + LaTeX strings.
 *
 * Parses any string containing `$...$` (inline) or `$$...$$` (display)
 * delimiters and renders the math segments with KaTeX, leaving the rest
 * as plain text. If parsing or rendering a segment fails, that segment
 * falls back to its raw source so the question is never blanked out by
 * a single malformed expression.
 *
 * Usage:
 *   <Math>{question.questionText}</Math>
 *   <Math inline>{option.text}</Math>   // forces inline-only fallback
 *
 * The KaTeX stylesheet must be imported once at the app root
 * (see main.jsx / index.jsx).
 */

import { useMemo } from "react";
import katex from "katex";

// Matches $$...$$ (greedy-safe, non-greedy inner) OR $...$ on a single segment.
// Display ($$...$$) is checked first so it isn't misparsed as two inline pairs.
const SEGMENT_REGEX = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;

const renderTex = (tex, displayMode) => {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,    // KaTeX emits a styled error span instead of throwing
      strict:       "ignore", // don't reject odd-but-common LaTeX
      output:       "html",
    });
  } catch {
    return null; // signal fallback to raw
  }
};

const MathSegment = ({ tex, raw, displayMode }) => {
  const html = useMemo(() => renderTex(tex, displayMode), [tex, displayMode]);
  if (!html) return <span>{raw}</span>;
  // displayMode → block element; otherwise inline span.
  const Tag = displayMode ? "div" : "span";
  return <Tag dangerouslySetInnerHTML={{ __html: html }} />;
};

const Math = ({ children, inline = false }) => {
  if (children == null || children === "") return null;
  const source = String(children);

  // Fast path: no $ at all → just text. Avoids any regex/render cost on
  // the 95 % of strings that aren't math.
  if (!source.includes("$")) return <>{source}</>;

  const parts = source.split(SEGMENT_REGEX).filter(p => p !== "");

  return (
    <>
      {parts.map((part, i) => {
        // Display math: $$...$$
        if (part.startsWith("$$") && part.endsWith("$$") && part.length >= 4) {
          const tex = part.slice(2, -2).trim();
          // When called from an inline context (e.g. inside <p>), demote
          // display math to inline so we don't violate HTML nesting.
          return (
            <MathSegment
              key={i}
              tex={tex}
              raw={part}
              displayMode={!inline}
            />
          );
        }
        // Inline math: $...$
        if (part.startsWith("$") && part.endsWith("$") && part.length >= 2) {
          const tex = part.slice(1, -1).trim();
          return (
            <MathSegment
              key={i}
              tex={tex}
              raw={part}
              displayMode={false}
            />
          );
        }
        // Plain text segment
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

export default Math;