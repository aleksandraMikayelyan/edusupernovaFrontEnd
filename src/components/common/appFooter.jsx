/**
 * appFooter.jsx — Shared footer 2026
 * Matches the dark tone of home page footer.
 * Used on authenticated screens (FeedbackPage, UserInterface, Units).
 */

import { InstagramLogo, LinkedinLogo, TiktokLogo } from "@phosphor-icons/react";

const SERIF = "Newsreader, Georgia, serif";

const AppFooter = () => (
  <footer style={{ flexShrink:0, background:"#fff",
    borderTop:"1px solid rgba(0,0,0,0.06)", padding:"12px 32px" }}>
    <div style={{ display:"flex", alignItems:"center",
      justifyContent:"space-between", maxWidth:1200, margin:"0 auto" }}>
      <div style={{ display:"flex", gap:20 }}>
        {["Contact","Terms","About"].map(l => (
          <button key={l} style={{ fontFamily:SERIF, fontSize:12,
            color:"#CBD5E1", background:"none", border:"none",
            cursor:"pointer", padding:0, transition:"color 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.color="#64748B"}
            onMouseLeave={e=>e.currentTarget.style.color="#CBD5E1"}
          >{l}</button>
        ))}
      </div>
      <div style={{ display:"flex", gap:10 }}>
        {[InstagramLogo, LinkedinLogo, TiktokLogo].map((Icon, i) => (
          <button key={i} style={{ width:28, height:28, borderRadius:"50%",
            background:"none", border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#CBD5E1", transition:"color 0.15s, background 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.color="#64748B";e.currentTarget.style.background="#F1F5F9"}}
            onMouseLeave={e=>{e.currentTarget.style.color="#CBD5E1";e.currentTarget.style.background="none"}}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>
      <span style={{ fontFamily:SERIF, fontSize:12, color:"#E2EBF0" }}>
        © 2026 EduSupernova
      </span>
    </div>
  </footer>
);

export default AppFooter;