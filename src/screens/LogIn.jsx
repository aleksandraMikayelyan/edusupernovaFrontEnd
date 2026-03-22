/**
 * LogIn.jsx — Login screen (WEB) — redesigned 2026
 *
 * SOLID:
 *   SRP  — only manages form state + navigation. Auth logic → useAuth, API → AuthApi
 *   DIP  — depends on AuthApi abstraction, not axios directly
 *
 * Design: split screen — dark brand panel left, clean form right
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { AuthApi } from "../api/index.js";
import useAuth from "../hooks/useAuth.js";
import logoIcon from "../assets/iconoEdusupernovaSinFondo.png";

const DARK   = "#062f37";
const BRAND  = "#0a5f6e";
const MINT   = "#5DCAA5";
const CREAM  = "#F7F4EF";
const SERIF  = "Newsreader, Georgia, serif";
const SCRIPT = "Cookie, cursive";

const Spinner = () => (
  <div style={{ width:20, height:20, borderRadius:"50%",
    border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff",
    animation:"espin 0.7s linear infinite" }} />
);

const Field = ({ type, placeholder, value, onChange, onKeyDown, autoComplete }) => (
  <input type={type} placeholder={placeholder} value={value}
    onChange={onChange} onKeyDown={onKeyDown} autoComplete={autoComplete}
    style={{ width:"100%", height:52, background:CREAM, border:"1.5px solid #E2EBF0",
      borderRadius:14, padding:"0 20px", fontFamily:SERIF, fontSize:15,
      color:"#0F172A", outline:"none", boxSizing:"border-box", transition:"border-color 0.15s" }}
    onFocus={e=>e.target.style.borderColor=BRAND}
    onBlur={e=>e.target.style.borderColor="#E2EBF0"}
  />
);

const LoginScreen = () => {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please enter your email and password."); return; }
    setLoading(true);
    try {
      const { data } = await AuthApi.login(email, password);
      const token = data.accessToken || data.token || data.access_token || data.jwt;
      const rol   = data.rol || data.role || data.userRole || "STUDENT";
      if (!token) { setError("Login succeeded but no token received."); return; }
      await saveSession(token, rol);
      navigate(rol?.trim().toUpperCase() === "ADMIN" ? "/admin" : "/courses", { replace: true });
    } catch (err) {
      const s = err.response?.status;
      if (s === 401 || s === 403) setError("Incorrect credentials.");
      else if (err.response) setError(`Server error ${s}.`);
      else setError("Connection error. Is the backend running?");
    } finally { setLoading(false); }
  };

  const handleKeyDown = e => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <style>{`
        @keyframes espin { to { transform: rotate(360deg); } }
        @keyframes efadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .lbtn:hover { background: #3aab87 !important; transform: translateY(-1px); }
        .lbtn { transition: background 0.18s, transform 0.18s !important; }
      `}</style>

      {/* Left — dark brand panel */}
      <div style={{ width:"45%", flexShrink:0,
        background:`linear-gradient(160deg, ${DARK} 0%, ${BRAND} 100%)`,
        display:"flex", flexDirection:"column", justifyContent:"center",
        padding:"60px 56px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, opacity:0.05,
          backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize:"28px 28px", pointerEvents:"none" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:56 }}>
            <img src={logoIcon} alt="logo" style={{ width:40, height:40, objectFit:"contain" }} />
            <span style={{ fontFamily:SCRIPT, fontSize:28, color:"#fff", letterSpacing:0.3 }}>edusupernova</span>
          </div>
          <h1 style={{ fontFamily:SERIF, fontSize:38, fontWeight:700, color:"#fff",
            lineHeight:1.1, letterSpacing:"-1px", marginBottom:16,
            animation:"efadeUp 0.7s ease both 100ms" }}>
            Welcome back.<br /><span style={{ color:MINT }}>Let's dominate.</span>
          </h1>
          <p style={{ fontFamily:SERIF, fontSize:15, color:"rgba(255,255,255,0.5)",
            lineHeight:1.7, marginBottom:48, animation:"efadeUp 0.7s ease both 220ms" }}>
            Your next grade upgrade is waiting on the other side of this login.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:12,
            animation:"efadeUp 0.7s ease both 340ms" }}>
            {["500+ real past exam questions","Instant AI feedback on every answer","Results in as little as 6 weeks"].map(t=>(
              <div key={t} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <CheckCircle size={15} weight="fill" color={MINT} />
                <span style={{ fontFamily:SERIF, fontSize:13, color:"rgba(255,255,255,0.55)" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div style={{ flex:1, background:"#fff", display:"flex",
        flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 56px" }}>
        <div style={{ width:"100%", maxWidth:380 }}>
          <h2 style={{ fontFamily:SERIF, fontSize:28, fontWeight:700,
            color:"#0F172A", marginBottom:6, letterSpacing:"-0.5px" }}>Log in</h2>
          <p style={{ fontFamily:SERIF, fontSize:14, color:"#94A3B8", marginBottom:36 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color:BRAND, textDecoration:"none", fontWeight:600 }}>Register free</Link>
          </p>

          {error && (
            <div style={{ background:"#fff0f0", border:"1px solid #e74c3c", borderRadius:12,
              padding:"12px 16px", marginBottom:20, fontFamily:SERIF, fontSize:13, color:"#b02020" }}>
              {error}
            </div>
          )}

          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
            <Field type="email"    placeholder="Email address"    value={email}    onChange={e=>setEmail(e.target.value)}    onKeyDown={handleKeyDown} autoComplete="email" />
            <Field type="password" placeholder="Password"         value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={handleKeyDown} autoComplete="current-password" />
          </div>

          <button className="lbtn" onClick={handleLogin} disabled={loading}
            style={{ width:"100%", height:52, background:loading?"#94A3B8":MINT,
              border:"none", borderRadius:14, fontFamily:SERIF, fontSize:16, fontWeight:700,
              color:DARK, cursor:loading?"not-allowed":"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:loading?"none":"0 12px 40px rgba(93,202,165,0.35)" }}>
            {loading ? <Spinner /> : <> Sign in <ArrowRight size={18} weight="bold" /> </>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;