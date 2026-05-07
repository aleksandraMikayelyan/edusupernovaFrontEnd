/**
 * LogIn.jsx — Login screen
 * Premium split-screen: dark editorial left panel + clean form right.
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { GoogleLogin } from "@react-oauth/google";
import { AuthApi } from "../../api/index.js";
import useAuth from "../../hooks/useAuth.js";
import logoIcon from "../../assets/iconoEdusupernovaSinFondo.png";

const DARK   = "#062f37";
const BRAND  = "#0a5f6e";
const MINT   = "#5DCAA5";
const SERIF  = "Newsreader, Georgia, serif";
const SCRIPT = "Cookie, cursive";

const Spinner = () => (
  <div style={{ width:20, height:20, borderRadius:"50%",
    border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff",
    animation:"lspin 0.7s linear infinite" }} />
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
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await AuthApi.login(email, password);
      if (!data.accessToken) { setError("Login succeeded but no token received."); return; }
      saveSession(data);
      navigate(data.rol?.trim().toUpperCase() === "ADMIN" ? "/admin" : "/courses", { replace: true });
    } catch (err) {
      const s = err.status;
      if (s === 401 || s === 403) setError("Incorrect email or password.");
      else if (s) setError(err.message || `Server error ${s}.`);
      else setError("Connection error. Is the backend running?");
    } finally { setLoading(false); }
  };

  const handleKeyDown = e => { if (e.key === "Enter") handleLogin(); };

  const handleGoogleSuccess = async ({ credential }) => {
    setError("");
    setLoading(true);
    try {
      const { data } = await AuthApi.googleAuth(credential);
      if (!data.accessToken) { setError("Google login succeeded but no token received."); return; }
      saveSession(data);
      navigate(data.rol?.trim().toUpperCase() === "ADMIN" ? "/admin" : "/courses", { replace: true });
    } catch (err) {
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>
      <style>{`
        @keyframes lspin { to { transform: rotate(360deg); } }
        @keyframes lfadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        .l-field:focus {
          border-color: ${BRAND} !important;
          box-shadow: 0 0 0 3px rgba(10,95,110,0.1) !important;
        }
        .l-btn-primary:hover:not(:disabled) {
          background: #3aab87 !important;
          transform: translateY(-1px);
          box-shadow: 0 16px 48px rgba(93,202,165,0.5) !important;
        }
        .l-btn-primary { transition: background 0.18s, transform 0.18s, box-shadow 0.18s !important; }
      `}</style>

      {/* ── Left panel — dark brand ── */}
      <div style={{
        width:"46%", flexShrink:0,
        background:`linear-gradient(155deg, #021a1f 0%, ${DARK} 40%, ${BRAND} 100%)`,
        display:"flex", flexDirection:"column", justifyContent:"space-between",
        padding:"48px 56px",
        position:"relative", overflow:"hidden",
      }}>
        {/* Dot pattern */}
        <div style={{ position:"absolute", inset:0, opacity:0.05,
          backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize:"28px 28px", pointerEvents:"none" }} />

        {/* Ambient glow */}
        <div style={{ position:"absolute", bottom:"-15%", right:"-15%",
          width:400, height:400, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(93,202,165,0.15) 0%, transparent 70%)",
          pointerEvents:"none" }} />

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12,
          position:"relative", zIndex:1 }}>
          <img src={logoIcon} alt="logo"
            style={{ width:36, height:36, objectFit:"contain" }} />
          <span style={{ fontFamily:SCRIPT, fontSize:26,
            color:"#fff", letterSpacing:0.3 }}>
            edusupernova
          </span>
        </div>

        {/* Main copy */}
        <div style={{ position:"relative", zIndex:1 }}>
          <h1 style={{
            fontFamily:SERIF, fontSize:"clamp(32px,3.2vw,48px)", fontWeight:700,
            color:"#fff", lineHeight:1.1, letterSpacing:"-1.5px",
            margin:"0 0 20px",
            animation:"lfadeUp 0.7s ease both 100ms",
          }}>
            Welcome back.<br />
            <em style={{ fontStyle:"italic", color:MINT }}>Let's dominate.</em>
          </h1>
          <p style={{ fontFamily:SERIF, fontSize:15,
            color:"rgba(255,255,255,0.45)", lineHeight:1.8,
            maxWidth:320, margin:"0 0 48px",
            animation:"lfadeUp 0.7s ease both 220ms",
          }}>
            Your next grade upgrade is one session away.
          </p>

          {/* Proof points */}
          <div style={{ display:"flex", flexDirection:"column", gap:14,
            animation:"lfadeUp 0.7s ease both 340ms" }}>
            {[
              "500+ real past exam questions",
              "Instant AI feedback on every answer",
              "Results in as little as 6 weeks",
            ].map(t => (
              <div key={t} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:20, height:20, borderRadius:6,
                  background:"rgba(93,202,165,0.2)",
                  border:"1px solid rgba(93,202,165,0.4)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  flexShrink:0 }}>
                  <span style={{ fontSize:10, color:MINT, fontWeight:900 }}>✓</span>
                </div>
                <span style={{ fontFamily:SERIF, fontSize:13,
                  color:"rgba(255,255,255,0.5)" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p style={{ fontFamily:SERIF, fontSize:12,
          color:"rgba(255,255,255,0.2)",
          position:"relative", zIndex:1 }}>
          © 2026 EduSupernova · Free forever
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        flex:1, background:"#fff",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding:"60px 64px",
      }}>
        <div style={{ width:"100%", maxWidth:380 }}>

          <h2 style={{ fontFamily:SERIF, fontSize:30, fontWeight:700,
            color:"#0F172A", marginBottom:6, letterSpacing:"-0.8px" }}>
            Log in
          </h2>
          <p style={{ fontFamily:SERIF, fontSize:14,
            color:"#94A3B8", marginBottom:40 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color:BRAND,
              textDecoration:"none", fontWeight:700 }}>
              Register free
            </Link>
          </p>

          {error && (
            <div style={{
              background:"#fff0f0", border:"1px solid #fca5a5",
              borderRadius:14, padding:"13px 18px", marginBottom:24,
              fontFamily:SERIF, fontSize:14, color:"#b02020",
              display:"flex", alignItems:"center", gap:10,
            }}>
              <span style={{ fontSize:16 }}>⚠</span>
              {error}
            </div>
          )}

          <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:28 }}>
            {[
              { type:"email",    placeholder:"Email address",  value:email,    onChange:e=>setEmail(e.target.value),    autoComplete:"email"            },
              { type:"password", placeholder:"Password",       value:password, onChange:e=>setPassword(e.target.value), autoComplete:"current-password" },
            ].map(({ type, placeholder, value, onChange, autoComplete }) => (
              <input key={type}
                className="l-field"
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                autoComplete={autoComplete}
                style={{
                  width:"100%", height:54,
                  background:"#F8FAFC",
                  border:"1.5px solid #E2EBF0",
                  borderRadius:14, padding:"0 20px",
                  fontFamily:SERIF, fontSize:15, color:"#0F172A",
                  outline:"none", boxSizing:"border-box",
                  transition:"border-color 0.15s, box-shadow 0.15s",
                }}
              />
            ))}
          </div>

          <button
            className="l-btn-primary"
            onClick={handleLogin}
            disabled={loading}
            style={{
              width:"100%", height:54,
              background: loading ? "#94A3B8" : MINT,
              border:"none", borderRadius:14,
              fontFamily:SERIF, fontSize:16, fontWeight:700,
              color: loading ? "#fff" : DARK,
              cursor: loading ? "not-allowed" : "pointer",
              display:"flex", alignItems:"center",
              justifyContent:"center", gap:8,
              boxShadow: loading ? "none" : "0 12px 40px rgba(93,202,165,0.35)",
            }}>
            {loading
              ? <Spinner />
              : <> Sign in <ArrowRight size={18} weight="bold" /> </>
            }
          </button>

          {/* ── Divider ── */}
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
            <div style={{ flex:1, height:1, background:"#E2EBF0" }} />
            <span style={{ fontFamily:SERIF, fontSize:13, color:"#94A3B8", whiteSpace:"nowrap" }}>or continue with</span>
            <div style={{ flex:1, height:1, background:"#E2EBF0" }} />
          </div>

          {/* ── Google button ── */}
          <div style={{ display:"flex", justifyContent:"center" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google sign-in was cancelled or failed.")}
              theme="outline"
              size="large"
              shape="rectangular"
              width="380"
              text="continue_with"
            />
          </div>

          <p style={{ fontFamily:SERIF, fontSize:12,
            color:"#CBD5E1", textAlign:"center", marginTop:16 }}>
            By signing in you agree to our{" "}
            <span style={{ color:"#94A3B8", cursor:"pointer" }}>Terms of Service</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
