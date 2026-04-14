/**
 * ContextPanel — scrollable reading passage panel.
 *
 * Used by Paper 2 (Data Response) left column and future IELTS Reading.
 *
 * Props:
 *   title           string   e.g. "Extract: The Global Coffee Market"
 *   contextText     string   the passage body
 *   contextImageUrl string | null
 *   style           object   extra styles for the outer wrapper (e.g. height)
 */

const BRAND = "#0a5f6e";
const SERIF = "Newsreader, Georgia, serif";

const ContextPanel = ({ title, contextText, contextImageUrl, style = {} }) => (
  <div style={{
    overflowY: "auto",
    background: "#F7F4EF",
    borderRight: "1px solid #E2EBF0",
    padding: "32px 36px",
    display: "flex", flexDirection: "column", gap: 20,
    ...style,
  }}>
    {/* Title */}
    {title && (
      <div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "#e8f7f9", borderRadius: 999, padding: "4px 12px",
          marginBottom: 12,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%",
            background: BRAND, flexShrink: 0 }} />
          <span style={{ fontFamily: SERIF, fontSize: 10, fontWeight: 700,
            color: BRAND, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Source material
          </span>
        </div>
        <h2 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700,
          color: "#0F172A", lineHeight: 1.3, letterSpacing: "-0.3px", margin: 0 }}>
          {title}
        </h2>
      </div>
    )}

    {/* Optional chart / table image */}
    {contextImageUrl && (
      <img src={contextImageUrl} alt="Context diagram"
        style={{ width: "100%", borderRadius: 12, border: "1px solid #E2EBF0",
          objectFit: "contain", maxHeight: 280 }} />
    )}

    {/* Passage text */}
    {contextText && (
      <div style={{
        fontFamily: SERIF, fontSize: 15, lineHeight: 1.85,
        color: "#1e293b", whiteSpace: "pre-wrap",
        letterSpacing: "0.01em",
      }}>
        {contextText}
      </div>
    )}
  </div>
);

export default ContextPanel;
