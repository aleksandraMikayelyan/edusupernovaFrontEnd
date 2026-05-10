/**
 * parseUnitText.js — Smart exam-notes parser v4 (final)
 *
 * Block types:
 *   heading     — ALL-CAPS section title, also handles "CAPS (Mixed case)" form
 *   subheading  — short mixed-case line ending with colon (≤ 80 chars)
 *   definition  — TERM: explanation  (term is ALL-CAPS, body is any text)
 *   bullet      — { text, depth: 0|1|2 }, handles "- text" and "-text" forms
 *   body        — paragraph text; consecutive body lines are merged
 *   callout     — KEY CONCEPT / IMPORTANT / NOTE / EXAMPLE / DEFINITION / REMEMBER
 *   divider     — auto-inserted before every heading
 *   spacer      — blank line separator
 */

const CALLOUT_KEYWORDS = [
  "KEY CONCEPT", "IMPORTANT", "NOTE", "EXAMPLE", "DEFINITION", "REMEMBER",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const getIndent   = (line) => line.match(/^(\s*)/)[1].length;
const indentDepth = (ind)  => ind < 4 ? 0 : ind < 8 ? 1 : 2;

/**
 * TRUE HEADING — two accepted patterns, both at indent 0:
 *   1. Pure ALL-CAPS:  "FACTORS OF PRODUCTION (RESOURCES)"  — no lowercase
 *   2. CAPS + (Mixed): "PRIVATE GOODS (Pure Private)"       — uppercase main word(s)
 *      followed by optional (Mixed Case) suffix in parentheses
 */
const isTrueHeading = (trimmed, indent) => {
  if (indent > 0 || trimmed.length < 3) return false;
  // Lines ending with ":" are subheadings (they introduce content below), not section titles
  if (trimmed.endsWith(":")) return false;

  // Pattern 1: zero lowercase letters in the entire string
  const letters = trimmed.replace(/[^a-zA-Z]/g, "");
  if (letters.length >= 3 && !/[a-z]/.test(letters)) return true;

  // Pattern 2: "ALL-CAPS WORDS (optional mixed-case clarifier)"
  // The part before the first "(" must be all-caps
  const mainPart = trimmed.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const mainLetters = mainPart.replace(/[^a-zA-Z]/g, "");
  if (mainLetters.length >= 3 && !/[a-z]/.test(mainPart) && trimmed.includes("(")) {
    return true;
  }

  return false;
};

/**
 * DEFINITION — "ALL-CAPS TERM (optional brackets): rest of description"
 * Term may contain: uppercase letters, spaces, hyphens, slashes, parentheses.
 */
const isDefinition = (trimmed) => {
  const m = trimmed.match(/^([A-Z][A-Z\s\-/]*(?:\([^)]+\))?[A-Z\s\-/]*):\s+(.+)$/);
  if (!m) return null;
  const term = m[1].trim();
  if (term.length < 2 || !/^[A-Z]/.test(term)) return null;
  // Must have at least one all-caps word (not just articles)
  if (!/[A-Z]{2,}/.test(term)) return null;
  return { term, body: m[2].trim() };
};

const detectCallout = (trimmed) =>
  CALLOUT_KEYWORDS.find(
    (kw) =>
      trimmed.toUpperCase().startsWith(kw + ":") ||
      trimmed.toUpperCase() === kw
  ) || null;

/**
 * BULLET detection — handles both "- text" and "-text" (no space) forms.
 * Also handles numbered bullets: "1. text", "1) text"
 */
const isBulletLine = (trimmed) =>
  /^[-•*▸→]\s/.test(trimmed) ||   // "- text"
  /^-[A-Za-z]/.test(trimmed) ||   // "-text" (no space, common in pasted notes)
  /^\d+[.)]\s/.test(trimmed);     // "1. text"

const extractBulletText = (trimmed) =>
  trimmed.replace(/^[-•*▸→\d.)]\s*/, "").trim();

// ── Main parser ───────────────────────────────────────────────────────────────

const parseUnitText = (raw) => {
  if (!raw) return [];

  const rawLines = raw.split("\n");

  // ── Pass 1: merge continuation lines ─────────────────────────────────────
  // Continuation: high indent, no special markers, lowercase (not all-caps)
  const lines = [];
  for (let j = 0; j < rawLines.length; j++) {
    const line    = rawLines[j];
    const trimmed = line.trim();
    const indent  = getIndent(line);

    if (!trimmed) { lines.push(line); continue; }

    const isAllCaps  = !/[a-z]/.test(trimmed) && /[A-Z]/.test(trimmed);
    const isBullet   = isBulletLine(trimmed);
    const isDef      = !!isDefinition(trimmed);
    const isCallout  = !!detectCallout(trimmed);
    const isHeading  = isTrueHeading(trimmed, indent);

    const isContinuation =
      indent >= 4 && !isBullet && !isAllCaps && !isDef && !isCallout && !isHeading;

    if (isContinuation && lines.length > 0) {
      let merged = false;
      for (let k = lines.length - 1; k >= 0; k--) {
        if (lines[k].trim()) {
          const prevTrim  = lines[k].trim();
          const prevIdx   = getIndent(lines[k]);
          const prevIsH   = isTrueHeading(prevTrim, prevIdx);
          const prevIsSubH = prevIdx === 0 && prevTrim.endsWith(":") && prevTrim.length <= 80;
          if (!prevIsH && !prevIsSubH && !isBulletLine(prevTrim)) {
            lines[k] = lines[k].trimEnd() + " " + trimmed;
            merged = true;
          }
          break;
        }
      }
      if (!merged) lines.push(line);
    } else {
      lines.push(line);
    }
  }

  // ── Pass 2: classify into blocks ─────────────────────────────────────────
  const blocks      = [];
  let sectionCount  = 0;
  let i             = 0;
  let lastBodyIdx   = -1;

  const push = (block) => {
    blocks.push(block);
    lastBodyIdx = block.type === "body" ? blocks.length - 1 : -1;
  };

  while (i < lines.length) {
    const line    = lines[i];
    const trimmed = line.trim();
    const indent  = getIndent(line);

    // Blank line
    if (!trimmed) {
      lastBodyIdx = -1;
      if (blocks.length > 0 && blocks[blocks.length - 1].type !== "spacer") {
        blocks.push({ type: "spacer" });
      }
      i++; continue;
    }

    // Callout
    const calloutKw = detectCallout(trimmed);
    if (calloutKw) {
      const rest      = trimmed.slice(calloutKw.length).replace(/^:\s*/, "");
      const bodyParts = rest ? [rest] : [];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() &&
        !detectCallout(lines[i].trim()) &&
        !isTrueHeading(lines[i].trim(), getIndent(lines[i]))
      ) {
        bodyParts.push(lines[i].trim());
        i++;
      }
      push({ type: "callout", keyword: calloutKw, text: bodyParts.join(" ") });
      continue;
    }

    // True heading (including "CAPS (Mixed)" form)
    if (isTrueHeading(trimmed, indent)) {
      const last = blocks[blocks.length - 1];
      if (last && last.type !== "divider" && last.type !== "spacer") {
        blocks.push({ type: "divider" });
        lastBodyIdx = -1;
      }
      sectionCount++;
      push({ type: "heading", text: trimmed, number: sectionCount });
      i++; continue;
    }

    // Definition
    const defMatch = isDefinition(trimmed);
    if (defMatch) {
      push({ type: "definition", term: defMatch.term, body: defMatch.body, depth: indentDepth(indent) });
      i++; continue;
    }

    // ALL-CAPS at non-zero indent that isn't a definition or bullet → sub-section label
    if (
      indent > 0 &&
      !/[a-z]/.test(trimmed) &&
      /[A-Z]{2,}/.test(trimmed) &&
      !isBulletLine(trimmed)
    ) {
      push({ type: "subheading", text: trimmed.replace(/:$/, "") });
      i++; continue;
    }

    // Subheading: ends with colon, SHORT (≤ 90 chars, so long sentences are excluded)
    // Applies to both mixed-case AND ALL-CAPS lines (ALL-CAPS with ":" are section intros, not titles)
    if (
      indent === 0 &&
      trimmed.endsWith(":") &&
      trimmed.length <= 90 &&
      trimmed.length > 5
    ) {
      push({ type: "subheading", text: trimmed.replace(/:$/, "") });
      i++; continue;
    }

    // Bullet
    if (isBulletLine(trimmed)) {
      const text      = extractBulletText(trimmed);
      const depth     = indentDepth(indent);
      const bulletDef = isDefinition(text);
      if (bulletDef) {
        push({ type: "definition", term: bulletDef.term, body: bulletDef.body, depth });
      } else {
        push({ type: "bullet", text, depth });
      }
      i++; continue;
    }

    // Body — merge consecutive lines into the same paragraph
    if (lastBodyIdx >= 0 && blocks[lastBodyIdx]) {
      blocks[lastBodyIdx].text += " " + trimmed;
    } else {
      blocks.push({ type: "body", text: trimmed });
      lastBodyIdx = blocks.length - 1;
    }
    i++;
  }

  // ── Post-process: demote consecutive headings ────────────────────────────
  // If a heading has only spacers/dividers between it and the previous
  // heading/subheading (no body, bullet, definition, or callout), it is
  // a sub-section label, not a top-level section title.
  for (let pi = 0; pi < blocks.length; pi++) {
    if (blocks[pi].type !== "heading") continue;
    for (let pj = pi - 1; pj >= 0; pj--) {
      const bt = blocks[pj].type;
      if (bt === "spacer" || bt === "divider") continue;
      if (bt === "heading" || bt === "subheading") {
        blocks[pi] = { ...blocks[pi], type: "subheading" };
      }
      break;
    }
  }

  // Renumber the surviving headings sequentially
  let n = 0;
  for (const b of blocks) {
    if (b.type === "heading") b.number = ++n;
  }

  return blocks;
};

export default parseUnitText;