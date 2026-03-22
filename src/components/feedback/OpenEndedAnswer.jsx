/**
 * OpenEndedAnswer.jsx — Open-ended answer + AI feedback (WEB) — field names fixed
 *
 * Backend DTO fields:
 *   userResponse (student's answer)
 *   feedbackIa   (Groq AI feedback text)
 */

const BRAND = "#0a5f6e"; const SERIF = "Newsreader, Georgia, serif";

const OpenEndedAnswer = ({ item }) => {
  const userAnswer = item.userResponse ?? item.userAnswer ?? "";
  const aiFeedback = item.feedbackIa   ?? item.aiCorrection ?? item.feedback ?? "";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
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
      {aiFeedback && (
        <div style={{ background:"#e8f7f9", borderRadius:16, padding:"20px 22px",
          borderLeft:`4px solid ${BRAND}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:BRAND, flexShrink:0 }} />
            <span style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
              color:BRAND, textTransform:"uppercase", letterSpacing:"0.12em" }}>
              AI Feedback
            </span>
          </div>
          <p style={{ fontFamily:SERIF, fontSize:15, color:"#0a4a57", lineHeight:1.7 }}>
            {aiFeedback}
          </p>
        </div>
      )}
      {!aiFeedback && (
        <div style={{ background:"#F7F4EF", borderRadius:14, padding:"16px 20px",
          border:"1px dashed #E2EBF0" }}>
          <p style={{ fontFamily:SERIF, fontSize:13, color:"#94A3B8", fontStyle:"italic" }}>
            AI feedback is being generated — check back shortly.
          </p>
        </div>
      )}
    </div>
  );
};

export default OpenEndedAnswer;