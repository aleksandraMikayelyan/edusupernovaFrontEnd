/**
 * OpenEndedAnswer.jsx — Open-ended answer + AI feedback (WEB)
 *
 * Reads from FeedBackDTO.QuestionFeedbackDTO:
 *   userResponse  — what the student wrote
 *   explanation   — static explanation from DB
 *   aiFeedback    — Groq-generated personalised feedback
 */

const BRAND = "#0a5f6e"; const SERIF = "Newsreader, Georgia, serif";

/** Returns true if AI has not yet scored this question. */
const isPending = (item) =>
  item.aiScore == null ||
  item.aiFeedback === "AI evaluation in progress...";

const Spinner = () => (
  <div style={{
    width: 14, height: 14, borderRadius: "50%",
    border: "2px solid rgba(10,95,110,0.15)",
    borderTopColor: BRAND,
    animation: "oespin 0.7s linear infinite",
    flexShrink: 0,
  }} />
);

const OpenEndedAnswer = ({ item }) => {
  const userAnswer  = item.userResponse ?? "";
  const explanation = item.explanation  ?? "";
  const aiFeedback  = item.aiFeedback   ?? "";
  const pending     = isPending(item);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <style>{`@keyframes oespin { to { transform:rotate(360deg); } }`}</style>

      {userAnswer && (
        <div style={{ background:"#F8FAFC", borderRadius:14, padding:"18px 20px",
          border:"1px solid #E2EBF0" }}>
          <p style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
            color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 }}>
            Your answer
          </p>
          <p style={{ fontFamily:SERIF, fontSize:15, color:"#0F172A", lineHeight:1.7 }}>
            {userAnswer}
          </p>
        </div>
      )}

      {explanation && (
        <div style={{ background:"#F7F4EF", borderRadius:14, padding:"18px 20px",
          border:"1px solid #E2EBF0" }}>
          <p style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
            color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 }}>
            Model answer
          </p>
          <p style={{ fontFamily:SERIF, fontSize:15, color:"#374151", lineHeight:1.7 }}>
            {explanation}
          </p>
        </div>
      )}

      {pending ? (
        <div style={{ background:"#F7F4EF", borderRadius:14, padding:"16px 20px",
          border:"1px dashed #E2EBF0",
          display:"flex", alignItems:"center", gap:10 }}>
          <Spinner />
          <p style={{ fontFamily:SERIF, fontSize:13, color:"#94A3B8",
            fontStyle:"italic", margin:0 }}>
            AI is grading your answer…
          </p>
        </div>
      ) : aiFeedback ? (
        <div style={{ background:"#e8f7f9", borderRadius:16, padding:"20px 22px",
          borderLeft:`4px solid ${BRAND}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:BRAND, flexShrink:0 }} />
            <span style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
              color:BRAND, textTransform:"uppercase", letterSpacing:"0.12em" }}>
              AI Feedback
            </span>
            {item.aiScore != null && item.aiScore >= 0 && (
              <span style={{ fontFamily:SERIF, fontSize:12, fontWeight:700,
                color: item.aiScore >= 6 ? "#15803d" : BRAND,
                marginLeft:"auto" }}>
                {item.aiScore.toFixed(1)}/10
              </span>
            )}
          </div>
          <p style={{ fontFamily:SERIF, fontSize:15, color:"#0a4a57", lineHeight:1.7 }}>
            {aiFeedback}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default OpenEndedAnswer;
