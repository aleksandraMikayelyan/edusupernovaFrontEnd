/**
 * ErrorScreen.jsx — Full-screen error state (WEB) — redesigned 2026
 * Dark brand aesthetic consistent with LoadingScreen.
 */

import { WarningCircle } from "@phosphor-icons/react";

const DARK  = "#062f37"; const BRAND = "#0a5f6e";
const MINT  = "#5DCAA5"; const SERIF = "Newsreader, Georgia, serif";

const ErrorScreen = ({ message = "Something went wrong.", onRetry }) => (
  <div style={{ minHeight:"100vh", display:"flex", alignItems:"center",
    justifyContent:"center", padding:24,
    background:`linear-gradient(160deg, ${DARK} 0%, ${BRAND} 100%)` }}>
    <div style={{ background:"rgba(255,255,255,0.06)",
      border:"1px solid rgba(255,255,255,0.12)",
      borderRadius:24, padding:"48px 40px",
      display:"flex", flexDirection:"column", alignItems:"center",
      maxWidth:400, width:"100%", backdropFilter:"blur(8px)" }}>
      <WarningCircle size={48} weight="duotone" color="#e74c3c" />
      <h2 style={{ fontFamily:SERIF, fontSize:22, fontWeight:700,
        color:"#fff", marginBottom:10, marginTop:20, letterSpacing:"-0.3px" }}>
        Connection Error
      </h2>
      {message && (
        <p style={{ fontFamily:SERIF, fontSize:14, color:"rgba(255,255,255,0.5)",
          textAlign:"center", lineHeight:1.7, marginBottom:28 }}>
          {message}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          style={{ background:MINT, border:"none", borderRadius:12,
            padding:"14px 32px", fontFamily:SERIF, fontSize:15,
            fontWeight:700, color:DARK, cursor:"pointer",
            boxShadow:"0 8px 24px rgba(93,202,165,0.3)",
            transition:"transform 0.18s, background 0.18s" }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.background="#3aab87"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="none";            e.currentTarget.style.background=MINT; }}
        >
          Try again
        </button>
      )}
    </div>
  </div>
);

export default ErrorScreen;