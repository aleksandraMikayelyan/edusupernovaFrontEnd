/**
 * ExamCard.jsx — Exam type selector pill (WEB) — redesigned 2026
 * Active: mint green + dark text. Inactive: cream + muted.
 */

const DARK = "#062f37"; const BRAND = "#0a5f6e";
const MINT = "#5DCAA5"; const SERIF = "Newsreader, Georgia, serif";

const ExamCard = ({ exam, isActive, onPress }) => (
  <button
    onClick={onPress}
    style={{
      height:44, padding:"0 22px",
      background: isActive ? MINT : "#EDE8DF",
      border: `1.5px solid ${isActive ? MINT : "transparent"}`,
      borderRadius:999,
      fontFamily:SERIF, fontSize:14, fontWeight:700,
      color: isActive ? DARK : "#4A4540",
      cursor:"pointer", whiteSpace:"nowrap",
      boxShadow: isActive ? "0 8px 24px rgba(93,202,165,0.30)" : "none",
      transform: isActive ? "scale(1.04)" : "scale(1)",
      transition:"all 0.18s ease",
    }}
    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor=BRAND; e.currentTarget.style.background="#e8f7f9"; }}}
    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor="transparent"; e.currentTarget.style.background="#EDE8DF"; }}}
  >
    {exam.examname}
  </button>
);

export default ExamCard;