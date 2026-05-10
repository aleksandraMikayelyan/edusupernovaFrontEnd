/**
 * AiFeedbackDisplay.jsx
 *
 * Renders structured AI feedback (strengths / areas to improve / next steps).
 * Accepts either a JSON string (new format) or a plain string (legacy fallback).
 */

const BRAND = "#0a5f6e";
const SERIF = "Newsreader, Georgia, serif";

// ── Section components ────────────────────────────────────────────────────────

const Section = ({ bg, border, children }) => (
  <div style={{
    background: bg, borderRadius: 12, padding: "14px 18px",
    border: `1px solid ${border}`, display: "flex", flexDirection: "column", gap: 8,
  }}>
    {children}
  </div>
);

const Label = ({ color, children }) => (
  <p style={{
    fontFamily: SERIF, fontSize: 10, fontWeight: 800, letterSpacing: "0.13em",
    textTransform: "uppercase", color, margin: 0,
  }}>
    {children}
  </p>
);

const Body = ({ color = "#0F172A", children }) => (
  <p style={{ fontFamily: SERIF, fontSize: 14, color, lineHeight: 1.75, margin: 0 }}>
    {children}
  </p>
);

// ── Structured layout ─────────────────────────────────────────────────────────

const StructuredFeedback = ({ data }) => {
  const criteriaEntries = data.criteria ? Object.entries(data.criteria) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Strengths */}
      {data.strengths && (
        <Section bg="#f0fdf4" border="#86efac">
          <Label color="#15803d">What you did well</Label>
          <Body color="#14532d">{data.strengths}</Body>
        </Section>
      )}

      {/* Criteria weaknesses */}
      {criteriaEntries.length > 0 && (
        <Section bg="#fefce8" border="#fde68a">
          <Label color="#92400e">Areas to improve</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
            {criteriaEntries.map(([criterion, detail]) => (
              <div key={criterion}>
                <p style={{
                  fontFamily: SERIF, fontSize: 12, fontWeight: 700,
                  color: "#78350f", margin: "0 0 3px",
                }}>
                  {criterion}
                </p>
                <Body color="#92400e">{detail}</Body>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Next steps */}
      {data.nextSteps && (
        <Section bg="#e8f7f9" border="#99d9e4">
          <Label color={BRAND}>Next steps</Label>
          <Body color="#0a4a57">{data.nextSteps}</Body>
        </Section>
      )}
    </div>
  );
};

// ── Main export ───────────────────────────────────────────────────────────────

const AiFeedbackDisplay = ({ feedback }) => {
  if (!feedback) return null;

  // Try parsing as structured JSON
  if (feedback.trim().startsWith("{")) {
    try {
      const data = JSON.parse(feedback);
      if (data.strengths || data.criteria || data.nextSteps) {
        return <StructuredFeedback data={data} />;
      }
    } catch {
      // fall through to plain text
    }
  }

  // Legacy plain-text fallback
  return (
    <Body color="#0a4a57">{feedback}</Body>
  );
};

export default AiFeedbackDisplay;
