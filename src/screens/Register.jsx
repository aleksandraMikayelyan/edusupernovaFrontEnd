/**
 * Register.jsx — Registration screen (WEB) — redesigned 2026
 * Same split-screen pattern as LogIn, mirrored (form left, brand right)
 * SOLID: SRP + DIP — form state only, API via AuthApi
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Star } from "@phosphor-icons/react";
import { AuthApi } from "../api/index.js";
import useAuth from "../hooks/useAuth.js";
import logoIcon from "../assets/iconoEdusupernovaSinFondo.png";

const DARK  = "#062f37"; const BRAND = "#0a5f6e"; const MINT = "#5DCAA5";
const CREAM = "#F7F4EF"; const SERIF = "Newsreader, Georgia, serif";
const SCRIPT= "Cookie, cursive";

const Spinner = () => (
  <div style={{ width:20, height:20, borderRadius:"50%",
    border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff",
    animation:"rspin 0.7s linear infinite" }} />
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

const RegisterScreen = () => {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [username,   setUsername]   = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  const handleRegister = async () => {
    setError("");
    if (!username.trim() || !email.trim() || !password.trim()) { setError("All fields are required."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const { data } = await AuthApi.register(username, email, password);
      const token = data.accessToken || data.token || data.access_token || data.jwt;
      const rol   = data.rol || data.role || "STUDENT";
      if (token) { await saveSession(token, rol); navigate("/courses", { replace:true }); }
      else navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Server connection error.");
    } finally { setLoading(false); }
  };

  const handleKeyDown = e => { if (e.key === "Enter") handleRegister(); };

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <style>{`
        @keyframes rspin { to { transform: rotate(360deg); } }
        @keyframes rfadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .rbtn:hover { background: #3aab87 !important; transform: translateY(-1px); }
        .rbtn { transition: background 0.18s, transform 0.18s !important; }
      `}</style>

      {/* Left — form panel */}
      <div style={{ flex:1, background:"#fff", display:"flex",
        flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 56px" }}>
        <div style={{ width:"100%", maxWidth:400 }}>
          <h2 style={{ fontFamily:SERIF, fontSize:28, fontWeight:700,
            color:"#0F172A", marginBottom:6, letterSpacing:"-0.5px" }}>Create your account</h2>
          <p style={{ fontFamily:SERIF, fontSize:14, color:"#94A3B8", marginBottom:32 }}>
            Already registered?{" "}
            <Link to="/login" style={{ color:BRAND, textDecoration:"none", fontWeight:600 }}>Sign in</Link>
          </p>
          {error && (
            <div style={{ background:"#fff0f0", border:"1px solid #e74c3c", borderRadius:12,
              padding:"12px 16px", marginBottom:20, fontFamily:SERIF, fontSize:13, color:"#b02020" }}>
              {error}
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
            <Field type="text"     placeholder="Username"         value={username}  onChange={e=>setUsername(e.target.value)}  onKeyDown={handleKeyDown} autoComplete="username" />
            <Field type="email"    placeholder="Email address"    value={email}     onChange={e=>setEmail(e.target.value)}     onKeyDown={handleKeyDown} autoComplete="email" />
            <Field type="password" placeholder="Password"         value={password}  onChange={e=>setPassword(e.target.value)}  onKeyDown={handleKeyDown} autoComplete="new-password" />
            <Field type="password" placeholder="Confirm password" value={confirm}   onChange={e=>setConfirm(e.target.value)}   onKeyDown={handleKeyDown} autoComplete="new-password" />
          </div>
          <button className="rbtn" onClick={handleRegister} disabled={loading}
            style={{ width:"100%", height:52, background:loading?"#94A3B8":MINT,
              border:"none", borderRadius:14, fontFamily:SERIF, fontSize:16, fontWeight:700,
              color:DARK, cursor:loading?"not-allowed":"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:loading?"none":"0 12px 40px rgba(93,202,165,0.35)" }}>
            {loading ? <Spinner /> : <> Create account <ArrowRight size={18} weight="bold" /> </>}
          </button>
          <p style={{ fontFamily:SERIF, fontSize:12, color:"#CBD5E1", textAlign:"center", marginTop:16 }}>
            Free forever. No credit card required.
          </p>
        </div>
      </div>

      {/* Right — dark brand panel */}
      <div style={{ width:"42%", flexShrink:0,
        background:`linear-gradient(160deg, ${BRAND} 0%, ${DARK} 100%)`,
        display:"flex", flexDirection:"column", justifyContent:"center",
        padding:"60px 56px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, opacity:0.05,
          backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize:"28px 28px", pointerEvents:"none" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:56 }}>
            <img src={logoIcon} alt="logo" style={{ width:40, height:40, objectFit:"contain" }} />
            <span style={{ fontFamily:SCRIPT, fontSize:28, color:"#fff" }}>edusupernova</span>
          </div>
          <h2 style={{ fontFamily:SERIF, fontSize:34, fontWeight:700, color:"#fff",
            lineHeight:1.15, letterSpacing:"-0.8px", marginBottom:16,
            animation:"rfadeUp 0.7s ease both 100ms" }}>
            Join students who stopped guessing and started{" "}
            <span style={{ color:MINT }}>scoring.</span>
          </h2>
          <p style={{ fontFamily:SERIF, fontSize:14, color:"rgba(255,255,255,0.5)",
            lineHeight:1.7, marginBottom:40, animation:"rfadeUp 0.7s ease both 220ms" }}>
            Real exam questions. Real AI feedback. Real results.
          </p>
          {[
            { icon:"🎯", text:"Personalised to your exact exam" },
            { icon:"⚡", text:"Instant feedback — no waiting" },
            { icon:"📈", text:"+25% grade improvement on average" },
          ].map(({icon, text}) => (
            <div key={text} style={{ display:"flex", alignItems:"center", gap:12,
              marginBottom:14, animation:"rfadeUp 0.7s ease both 340ms" }}>
              <span style={{ fontSize:18 }}>{icon}</span>
              <span style={{ fontFamily:SERIF, fontSize:13, color:"rgba(255,255,255,0.6)" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;