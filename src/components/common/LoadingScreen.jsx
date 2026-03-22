/**
 * LoadingScreen.jsx — Full-screen loader (WEB) — redesigned 2026
 * Matches the dark brand aesthetic instead of plain grey.
 */

const BRAND = "#0a5f6e"; const DARK = "#062f37"; const MINT = "#5DCAA5";
const SERIF = "Newsreader, Georgia, serif"; const SCRIPT = "Cookie, cursive";

const LoadingScreen = () => (
  <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"center",
    background:`linear-gradient(160deg, ${DARK} 0%, ${BRAND} 100%)`,
    gap:20 }}>
    <style>{`@keyframes ldspin { to { transform: rotate(360deg); } }`}</style>
    <div style={{ width:52, height:52, borderRadius:"50%",
      border:"3px solid rgba(255,255,255,0.15)",
      borderTopColor:MINT,
      animation:"ldspin 0.8s linear infinite" }} />
    <span style={{ fontFamily:SCRIPT, fontSize:28, color:"#fff", letterSpacing:0.3 }}>
      edusupernova
    </span>
    <p style={{ fontFamily:SERIF, fontSize:14, color:"rgba(255,255,255,0.4)" }}>
      Loading…
    </p>
  </div>
);

export default LoadingScreen;