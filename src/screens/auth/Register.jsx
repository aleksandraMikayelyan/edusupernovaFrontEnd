/**
 * Register.jsx — Registration screen
 * Form left, dark brand panel right (mirrored from Login).
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Eye, EyeSlash } from "@phosphor-icons/react";
import useWindowWidth from "../../hooks/useWindowWidth.js";
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
    animation:"rspin 0.7s linear infinite" }} />
);

const RegisterScreen = () => {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const width = useWindowWidth();
  const isMobile = width < 768;

  // ── Step 1: registration form ─────────────────────────────────────────────
  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,      setLoading]     = useState(false);
  const [error,        setError]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  // ── Step 2: OTP verification ──────────────────────────────────────────────
  const [step,         setStep]         = useState("form"); // "form" | "verify"
  const [pendingEmail, setPendingEmail] = useState("");
  const [otp,          setOtp]          = useState("");
  const [otpLoading,   setOtpLoading]   = useState(false);
  const [otpError,     setOtpError]     = useState("");

  const handleRegister = async () => {
    setError("");
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address (e.g. you@example.com).");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await AuthApi.register(username, email, password);
      setPendingEmail(email);
      setStep("verify");
    } catch (err) {
      setError(err.message || "Server connection error.");
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    setOtpError("");
    if (otp.length !== 6) { setOtpError("Please enter the full 6-digit code."); return; }
    setOtpLoading(true);
    try {
      const { data } = await AuthApi.verifyEmail(pendingEmail, otp);
      saveSession(data);
      navigate("/courses", { replace: true });
    } catch (err) {
      setOtpError(err.message || "Invalid or expired code. Please try again.");
    } finally { setOtpLoading(false); }
  };

  const handleKeyDown = e => { if (e.key === "Enter") handleRegister(); };

  const handleGoogleSuccess = async ({ credential }) => {
    setError("");
    setLoading(true);
    try {
      const { data } = await AuthApi.googleAuth(credential);
      if (data.accessToken) { saveSession(data); navigate("/courses", { replace: true }); }
      else setError("Google sign-up succeeded but no token received.");
    } catch (err) {
      setError(err.message || "Google sign-up failed. Please try again.");
    } finally { setLoading(false); }
  };

  const baseFieldStyle = {
    width:"100%", height:52,
    background:"#F8FAFC",
    border:"1.5px solid #E2EBF0",
    borderRadius:14,
    fontFamily:SERIF, fontSize:15, color:"#0F172A",
    outline:"none", boxSizing:"border-box",
    transition:"border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row", minHeight:"100vh" }}>
      <style>{`
        @keyframes rspin   { to { transform: rotate(360deg); } }
        @keyframes rfadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        .r-field:focus {
          border-color: ${BRAND} !important;
          box-shadow: 0 0 0 3px rgba(10,95,110,0.1) !important;
        }
        .r-btn-primary:hover:not(:disabled) {
          background: #3aab87 !important;
          transform: translateY(-1px);
          box-shadow: 0 16px 48px rgba(93,202,165,0.5) !important;
        }
        .r-btn-primary { transition: background 0.18s, transform 0.18s, box-shadow 0.18s !important; }
      `}</style>

      {/* ── Left panel — form ── */}
      <div style={{
        flex:1, background:"#fff",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding: isMobile ? "36px 20px 48px" : "60px 64px",
      }}>
        <div style={{ width:"100%", maxWidth:400 }}>

        {/* ── OTP verification step ── */}
        {step === "verify" && (
          <div style={{ animation:"rfadeUp 0.5s ease both" }}>
            <div style={{
              width:56, height:56, borderRadius:18,
              background:"#e8f7f9",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:26, marginBottom:20,
            }}>✉️</div>
            <h2 style={{ fontFamily:SERIF, fontSize:26, fontWeight:700,
              color:"#0F172A", marginBottom:8, letterSpacing:"-0.6px" }}>
              Check your email
            </h2>
            <p style={{ fontFamily:SERIF, fontSize:14, color:"#64748B", marginBottom:16, lineHeight:1.7 }}>
              We sent a 6-digit code to <strong style={{ color:"#0F172A" }}>{pendingEmail}</strong>.<br />
              Enter it below to activate your account.
            </p>

            {/* Render free-tier email delay warning */}
            <div style={{
              background:"#fffbeb", border:"1px solid #fcd34d",
              borderRadius:12, padding:"12px 16px", marginBottom:24,
              display:"flex", gap:10, alignItems:"flex-start",
            }}>
              <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>⚠️</span>
              <p style={{ fontFamily:SERIF, fontSize:13, color:"#92400e", lineHeight:1.65, margin:0 }}>
                <strong>Email may take a few minutes to arrive</strong> — and some providers may filter it as spam.
                Please check your spam/junk folder. If you still don't see it after 2–3 minutes, tap <em>Resend code</em> below.
              </p>
            </div>

            <input
              className="r-field"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={e => { if (e.key === "Enter") handleVerify(); }}
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
              autoFocus
              style={{
                width:"100%", height:64,
                background:"#F8FAFC",
                border:`1.5px solid ${otpError ? "#fca5a5" : "#E2EBF0"}`,
                borderRadius:14, padding:"0 20px",
                fontFamily:SERIF, fontSize:32,
                fontWeight:700, letterSpacing:14,
                textAlign:"center", color:"#062f37",
                outline:"none", boxSizing:"border-box",
                marginBottom:12,
                transition:"border-color 0.15s",
              }}
            />

            {otpError && (
              <p style={{ fontFamily:SERIF, fontSize:13, color:"#b02020",
                marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
                <span>⚠</span> {otpError}
              </p>
            )}

            <button
              className="r-btn-primary"
              onClick={handleVerify}
              disabled={otpLoading || otp.length < 6}
              style={{
                width:"100%", height:54,
                background: (otpLoading || otp.length < 6) ? "#94A3B8" : MINT,
                border:"none", borderRadius:14,
                fontFamily:SERIF, fontSize:16, fontWeight:700,
                color: (otpLoading || otp.length < 6) ? "#fff" : DARK,
                cursor: (otpLoading || otp.length < 6) ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center",
                justifyContent:"center", gap:8,
                boxShadow: (otpLoading || otp.length < 6) ? "none" : "0 12px 40px rgba(93,202,165,0.35)",
                marginBottom:16,
              }}>
              {otpLoading ? <Spinner /> : <> Verify & continue <ArrowRight size={18} weight="bold" /> </>}
            </button>

            <p style={{ fontFamily:SERIF, fontSize:13, color:"#94A3B8", textAlign:"center" }}>
              Didn't receive it?{" "}
              <span
                onClick={async () => {
                  setOtpError("");
                  try { await AuthApi.register(username, email, password); }
                  catch {}
                }}
                style={{ color:BRAND, cursor:"pointer", fontWeight:700 }}>
                Resend code
              </span>
            </p>
          </div>
        )}

        {/* ── Registration form (hidden once OTP step starts) ── */}
        {step === "form" && <>

          <h2 style={{ fontFamily:SERIF, fontSize:30, fontWeight:700,
            color:"#0F172A", marginBottom:6, letterSpacing:"-0.8px" }}>
            Create your account
          </h2>
          <p style={{ fontFamily:SERIF, fontSize:14,
            color:"#94A3B8", marginBottom:36 }}>
            Already registered?{" "}
            <Link to="/login" style={{ color:BRAND,
              textDecoration:"none", fontWeight:700 }}>
              Sign in
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

          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
            <input className="r-field" type="text" placeholder="Username"
              value={username} onChange={e=>setUsername(e.target.value)}
              onKeyDown={handleKeyDown} autoComplete="username"
              style={{ ...baseFieldStyle, padding:"0 20px" }} />
            <input className="r-field" type="email" placeholder="Email address"
              value={email} onChange={e=>setEmail(e.target.value)}
              onKeyDown={handleKeyDown} autoComplete="email"
              style={{ ...baseFieldStyle, padding:"0 20px" }} />
            {/* Password with toggle */}
            <div style={{ position:"relative" }}>
              <input className="r-field"
                type={showPassword ? "text" : "password"} placeholder="Password"
                value={password} onChange={e=>setPassword(e.target.value)}
                onKeyDown={handleKeyDown} autoComplete="new-password"
                style={{ ...baseFieldStyle, padding:"0 48px 0 20px" }} />
              <button type="button" onClick={() => setShowPassword(v=>!v)}
                style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer", padding:0,
                  display:"flex", color:"#94A3B8", lineHeight:0 }}>
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Confirm password with toggle */}
            <div style={{ position:"relative" }}>
              <input className="r-field"
                type={showConfirm ? "text" : "password"} placeholder="Confirm password"
                value={confirm} onChange={e=>setConfirm(e.target.value)}
                onKeyDown={handleKeyDown} autoComplete="new-password"
                style={{ ...baseFieldStyle, padding:"0 48px 0 20px" }} />
              <button type="button" onClick={() => setShowConfirm(v=>!v)}
                style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer", padding:0,
                  display:"flex", color:"#94A3B8", lineHeight:0 }}>
                {showConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            className="r-btn-primary"
            onClick={handleRegister}
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
              : <> Create account <ArrowRight size={18} weight="bold" /> </>
            }
          </button>

          {/* ── Divider ── */}
          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"16px 0" }}>
            <div style={{ flex:1, height:1, background:"#E2EBF0" }} />
            <span style={{ fontFamily:SERIF, fontSize:13, color:"#94A3B8", whiteSpace:"nowrap" }}>or continue with</span>
            <div style={{ flex:1, height:1, background:"#E2EBF0" }} />
          </div>

          {/* ── Google button ── */}
          <div style={{ display:"flex", justifyContent:"center" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google sign-up was cancelled or failed.")}
              theme="outline"
              size="large"
              shape="rectangular"
              width="400"
              text="signup_with"
            />
          </div>

          <p style={{ fontFamily:SERIF, fontSize:12,
            color:"#CBD5E1", textAlign:"center", marginTop:16 }}>
            Free forever · No credit card required
          </p>
        </>}

        </div>
      </div>

      {/* ── Right panel — dark brand (hidden on mobile) ── */}
      {!isMobile && <div style={{
        width:"44%", flexShrink:0,
        background:`linear-gradient(155deg, ${BRAND} 0%, ${DARK} 60%, #021a1f 100%)`,
        display:"flex", flexDirection:"column", justifyContent:"space-between",
        padding:"48px 56px",
        position:"relative", overflow:"hidden",
      }}>
        {/* Dot pattern */}
        <div style={{ position:"absolute", inset:0, opacity:0.05,
          backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize:"28px 28px", pointerEvents:"none" }} />

        {/* Ambient glow */}
        <div style={{ position:"absolute", top:"-15%", left:"-10%",
          width:400, height:400, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(93,202,165,0.12) 0%, transparent 70%)",
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
          <h2 style={{
            fontFamily:SERIF, fontSize:"clamp(28px,3vw,44px)", fontWeight:700,
            color:"#fff", lineHeight:1.1, letterSpacing:"-1.2px",
            margin:"0 0 20px",
            animation:"rfadeUp 0.7s ease both 100ms",
          }}>
            Join students who stopped<br />guessing and started{" "}
            <em style={{ fontStyle:"italic", color:MINT }}>scoring.</em>
          </h2>
          <p style={{ fontFamily:SERIF, fontSize:15,
            color:"rgba(255,255,255,0.45)", lineHeight:1.8,
            maxWidth:300, margin:"0 0 48px",
            animation:"rfadeUp 0.7s ease both 220ms",
          }}>
            Real exam questions. Real AI feedback. Real results.
          </p>

          <div style={{ display:"flex", flexDirection:"column", gap:14,
            animation:"rfadeUp 0.7s ease both 340ms" }}>
            {[
              { icon:"🎯", text:"Personalised to your exact exam" },
              { icon:"⚡", text:"Instant feedback — no waiting"   },
              { icon:"📈", text:"+25% grade improvement on average" },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display:"flex", alignItems:"center", gap:14 }}>
                <span style={{
                  width:36, height:36, borderRadius:10, flexShrink:0,
                  background:"rgba(255,255,255,0.08)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:16,
                }}>{icon}</span>
                <span style={{ fontFamily:SERIF, fontSize:14,
                  color:"rgba(255,255,255,0.6)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontFamily:SERIF, fontSize:12,
          color:"rgba(255,255,255,0.2)",
          position:"relative", zIndex:1 }}>
          © 2026 EduSupernova · Free forever
        </p>
      </div>}
    </div>
  );
};

export default RegisterScreen;
