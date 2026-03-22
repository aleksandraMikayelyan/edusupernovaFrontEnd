/**
 * MultipleChoiceAnswer.jsx — MC answer display (WEB)
 *
 * FIX: correctAnswer is stored as a letter ("D") but userResponse is the
 * full option text ("D) The opportunity cost...").
 * Normalise both sides before comparing:
 *   extract the leading letter from userResponse → "D) ..." → "D"
 *   then compare with correctAnswer letter.
 */

const SERIF = "Newsreader, Georgia, serif";

/** Extracts the leading letter from an option string.
 *  "D) Some text" → "D"
 *  "D"            → "D"
 *  "Some text"    → "Some text"  (unchanged if no letter prefix)
 */
const extractLetter = (str = "") => {
  const match = str.trim().match(/^([A-D])[)\.\s]/i);
  return match ? match[1].toUpperCase() : str.trim();
};

const MultipleChoiceAnswer = ({ item }) => {
  const userResponse  = item.userResponse    ?? item.userAnswer    ?? "";
  const correctAnswer = item.correctResponse ?? item.correctAnswer ?? "";

  // Normalise: compare letters only
  const userLetter    = extractLetter(userResponse);
  const correctLetter = extractLetter(correctAnswer);
  const isCorrect     = userLetter === correctLetter;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>

      {/* Wrong answer — only shown when incorrect */}
      {!isCorrect && (
        <div style={{ display:"flex", alignItems:"flex-start", gap:12,
          padding:"14px 16px", borderRadius:12,
          background:"#fff0f0", border:"1.5px solid #e74c3c" }}>
          <span style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
            letterSpacing:"0.1em", textTransform:"uppercase",
            color:"#b02020", flexShrink:0, paddingTop:2 }}>
            Your answer
          </span>
          <span style={{ fontFamily:SERIF, fontSize:15,
            color:"#b02020", lineHeight:1.6, flex:1 }}>
            {userResponse || "No answer provided"}
          </span>
        </div>
      )}

      {/* Correct answer — always shown */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:12,
        padding:"14px 16px", borderRadius:12,
        background:"#f0fdf4", border:"1.5px solid #86efac" }}>
        <span style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
          letterSpacing:"0.1em", textTransform:"uppercase",
          color:"#15803d", flexShrink:0, paddingTop:2 }}>
          Correct
        </span>
        <span style={{ fontFamily:SERIF, fontSize:15,
          color:"#15803d", lineHeight:1.6, flex:1 }}>
          {correctAnswer || "Not available"}
        </span>
      </div>

      {/* Correct indicator */}
      {isCorrect && (
        <div style={{ display:"flex", alignItems:"center", gap:10,
          padding:"10px 14px", background:"#f0fdf4", borderRadius:10 }}>
          <div style={{ width:20, height:20, borderRadius:"50%",
            background:"#15803d", display:"flex",
            alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ color:"#fff", fontSize:11, fontWeight:700 }}>✓</span>
          </div>
          <span style={{ fontFamily:SERIF, fontSize:13,
            fontWeight:600, color:"#15803d" }}>
            You got this one right!
          </span>
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceAnswer;