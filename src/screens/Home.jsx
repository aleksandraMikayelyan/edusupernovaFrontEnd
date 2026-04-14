/**
 * Home.jsx — Landing page
 * Desktop-first premium design. Responsive as a safety net.
 */

import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle, BookOpen, Brain, Trophy, ChartBar, Lightning, Exam } from "@phosphor-icons/react";
import peacockIcon from "../assets/iconoEdusupernovaSinFondo.png";

const SERIF  = "Newsreader, Georgia, serif";
const SCRIPT = "Cookie, cursive";
const BRAND  = "#0a5f6e";
const DARK   = "#062f37";
const MINT   = "#5DCAA5";
const CREAM  = "#F7F4EF";

// ─── Hooks ────────────────────────────────────────────────────────────────────

const useCounter = (target, duration = 1800, start = false) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setValue(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return value;
};

const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

// ─── Product preview mock (hero right column) ─────────────────────────────────

const ProductPreview = () => (
  <div style={{
    position: "relative",
    width: "100%", maxWidth: 420,
  }}>
    {/* Glow behind card */}
    <div style={{
      position: "absolute", inset: -40,
      background: "radial-gradient(ellipse at center, rgba(93,202,165,0.18) 0%, transparent 70%)",
      pointerEvents: "none",
    }} />

    {/* Main question card */}
    <div style={{
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(32px)",
      WebkitBackdropFilter: "blur(32px)",
      border: "1px solid rgba(255,255,255,0.13)",
      borderRadius: 24,
      padding: "28px 28px 24px",
      boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)",
      transform: "perspective(1200px) rotateY(-4deg) rotateX(2deg)",
      transformOrigin: "right center",
    }}>
      {/* Progress */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
        <span style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
          color:"rgba(255,255,255,0.45)", letterSpacing:"0.1em", textTransform:"uppercase" }}>
          Question 3 of 20
        </span>
        <span style={{ fontFamily:SERIF, fontSize:11, color:MINT, fontWeight:600 }}>
          15% done
        </span>
      </div>
      <div style={{ height:4, background:"rgba(255,255,255,0.08)", borderRadius:999, marginBottom:22 }}>
        <div style={{ width:"15%", height:"100%", borderRadius:999,
          background:`linear-gradient(90deg, ${BRAND}, ${MINT})` }} />
      </div>

      {/* Question text */}
      <p style={{ fontFamily:SERIF, fontSize:15, color:"rgba(255,255,255,0.88)",
        lineHeight:1.65, marginBottom:18 }}>
        Which best explains the concept of <em>opportunity cost</em>?
      </p>

      {/* Options */}
      {[
        { l:"A", t:"The total monetary cost of a decision",        sel:false },
        { l:"B", t:"The value of the next best alternative foregone", sel:true  },
        { l:"C", t:"The average cost per unit of production",       sel:false },
      ].map(({ l, t, sel }) => (
        <div key={l} style={{
          display:"flex", alignItems:"center", gap:11,
          padding:"10px 13px", borderRadius:12, marginBottom:8,
          background: sel ? "rgba(93,202,165,0.14)" : "rgba(255,255,255,0.04)",
          border:`1.5px solid ${sel ? "rgba(93,202,165,0.45)" : "rgba(255,255,255,0.07)"}`,
        }}>
          <div style={{ width:28, height:28, borderRadius:8, flexShrink:0,
            background: sel ? MINT : "rgba(255,255,255,0.08)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
              color: sel ? DARK : "rgba(255,255,255,0.4)" }}>{l}</span>
          </div>
          <span style={{ fontFamily:SERIF, fontSize:13, lineHeight:1.5,
            color: sel ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
            fontWeight: sel ? 600 : 400, flex:1 }}>{t}</span>
        </div>
      ))}

      {/* AI feedback strip */}
      <div style={{
        marginTop:16,
        background:"rgba(10,95,110,0.45)",
        border:"1px solid rgba(93,202,165,0.25)",
        borderRadius:14, padding:"12px 16px",
        display:"flex", gap:10, alignItems:"flex-start",
      }}>
        <div style={{ width:20, height:20, borderRadius:6, background:MINT, flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center", marginTop:1 }}>
          <span style={{ fontSize:10, color:DARK, fontWeight:900 }}>✓</span>
        </div>
        <p style={{ fontFamily:SERIF, fontSize:12, color:"rgba(255,255,255,0.7)",
          lineHeight:1.6, margin:0 }}>
          <span style={{ color:MINT, fontWeight:700 }}>AI Feedback: </span>
          Correct! Opportunity cost is the value of the best foregone alternative — a core principle examined heavily in Paper 2.
        </p>
      </div>
    </div>

    {/* Floating score badge */}
    <div style={{
      position:"absolute", top:-16, right:-20,
      background:"#fff",
      borderRadius:999, padding:"8px 16px",
      boxShadow:"0 8px 32px rgba(0,0,0,0.25)",
      display:"flex", alignItems:"center", gap:8,
    }}>
      <Trophy size={16} weight="fill" color="#f5a623" />
      <span style={{ fontFamily:SERIF, fontSize:13, fontWeight:700, color:"#0F172A" }}>
        +25% avg grade
      </span>
    </div>

    {/* Floating question count badge */}
    <div style={{
      position:"absolute", bottom:-14, left:-16,
      background:MINT,
      borderRadius:999, padding:"7px 14px",
      boxShadow:"0 8px 24px rgba(93,202,165,0.4)",
      display:"flex", alignItems:"center", gap:7,
    }}>
      <Exam size={14} weight="bold" color={DARK} />
      <span style={{ fontFamily:SERIF, fontSize:12, fontWeight:700, color:DARK }}>
        500+ real questions
      </span>
    </div>
  </div>
);

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({ value, suffix, label, delay, start }) => {
  const count = useCounter(value, 1600, start);
  return (
    <div style={{
      textAlign:"center",
      animation: start ? `fadeUp 0.7s ease both ${delay}ms` : "none",
      opacity: start ? undefined : 0,
    }}>
      <p style={{ fontFamily:SERIF, fontSize:"clamp(52px,6vw,80px)", fontWeight:700,
        color:BRAND, lineHeight:1, letterSpacing:"-3px", margin:0 }}>
        {count}{suffix}
      </p>
      <p style={{ fontFamily:SERIF, fontSize:13, color:"#94A3B8",
        marginTop:8, letterSpacing:"0.06em", textTransform:"uppercase" }}>
        {label}
      </p>
    </div>
  );
};

// ─── Feature card ─────────────────────────────────────────────────────────────

const Feature = ({ Icon, title, body, accent, delay, inView }) => (
  <div style={{
    animation: inView ? `fadeUp 0.6s ease both ${delay}ms` : "none",
    opacity: inView ? undefined : 0,
    background:"#fff",
    borderRadius:24,
    padding:"32px 28px",
    border:"1px solid #E8F0F4",
    boxShadow:"0 2px 12px rgba(0,0,0,0.04)",
    display:"flex", flexDirection:"column", gap:16,
    transition:"transform 0.2s, box-shadow 0.2s",
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(10,95,110,0.12)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; }}
  >
    <div style={{ width:48, height:48, borderRadius:16,
      background: accent ?? "#e8f7f9",
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Icon size={22} weight="duotone" color={BRAND} />
    </div>
    <p style={{ fontFamily:SERIF, fontSize:19, fontWeight:700,
      color:"#0F172A", lineHeight:1.25, margin:0 }}>
      {title}
    </p>
    <p style={{ fontFamily:SERIF, fontSize:14, color:"#64748B",
      lineHeight:1.75, margin:0 }}>
      {body}
    </p>
  </div>
);

// ─── Step ─────────────────────────────────────────────────────────────────────

const Step = ({ number, Icon, title, body, delay, inView }) => (
  <div style={{
    animation: inView ? `fadeUp 0.6s ease both ${delay}ms` : "none",
    opacity: inView ? undefined : 0,
    position:"relative", overflow:"hidden",
    background:"#fff", borderRadius:24,
    padding:"32px 28px 28px",
    border:"1px solid #E8F0F4",
  }}>
    {/* Ghost number */}
    <span style={{
      position:"absolute", top:-8, right:16,
      fontFamily:SERIF, fontSize:96, fontWeight:700,
      color:"rgba(10,95,110,0.05)", lineHeight:1,
      userSelect:"none", pointerEvents:"none",
    }}>
      {number}
    </span>
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, position:"relative" }}>
      <div style={{ width:40, height:40, borderRadius:12,
        background:"#e8f7f9",
        display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon size={20} weight="duotone" color={BRAND} />
      </div>
      <span style={{ fontFamily:SERIF, fontSize:11, fontWeight:700,
        color:BRAND, letterSpacing:"0.14em", textTransform:"uppercase" }}>
        Step {number}
      </span>
    </div>
    <p style={{ fontFamily:SERIF, fontSize:18, fontWeight:700,
      color:"#0F172A", margin:"0 0 12px", lineHeight:1.3, position:"relative" }}>
      {title}
    </p>
    <p style={{ fontFamily:SERIF, fontSize:14, color:"#64748B",
      margin:0, lineHeight:1.75, position:"relative" }}>
      {body}
    </p>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const Home = () => {
  const navigate = useNavigate();
  const [statsRef,    statsInView]    = useInView(0.3);
  const [featuresRef, featuresInView] = useInView(0.2);
  const [stepsRef,    stepsInView]    = useInView(0.2);
  const [ctaRef,      ctaInView]      = useInView(0.3);
  const [heroLoaded, setHeroLoaded]   = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:"#fff", overflowX:"hidden" }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes float {
          0%,100% { transform:perspective(1200px) rotateY(-4deg) rotateX(2deg) translateY(0); }
          50%     { transform:perspective(1200px) rotateY(-4deg) rotateX(2deg) translateY(-10px); }
        }
        .hero-card { animation: float 6s ease-in-out infinite; }
        .nav-pill-btn:hover { background:rgba(255,255,255,0.15) !important; }
        .cta-primary:hover  { transform:scale(1.04) !important; background:#3aab87 !important; }
        .cta-primary        { transition:transform 0.18s, background 0.18s !important; }
        .cta-ghost:hover    { background:rgba(255,255,255,0.1) !important; border-color:rgba(255,255,255,0.35) !important; }
        .exam-pill:hover    { background:#e8f7f9 !important; border-color:${BRAND} !important; color:${BRAND} !important; }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════════ */}
      <section style={{
        minHeight:"100vh",
        background:`linear-gradient(145deg, #021a1f 0%, ${DARK} 35%, ${BRAND} 75%, #0e7a8a 100%)`,
        display:"flex", flexDirection:"column",
        position:"relative", overflow:"hidden",
      }}>

        {/* Dot grid */}
        <div style={{ position:"absolute", inset:0, opacity:0.04,
          backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize:"32px 32px", pointerEvents:"none" }} />

        {/* Ambient glow bottom-left */}
        <div style={{ position:"absolute", bottom:"-20%", left:"-10%",
          width:600, height:600, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(93,202,165,0.12) 0%, transparent 70%)",
          pointerEvents:"none" }} />

        {/* ── Nav ── */}
        <nav style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"20px 48px", flexShrink:0, position:"relative", zIndex:10,
          animation: heroLoaded ? "slideDown 0.6s ease both 100ms" : "none",
          opacity: heroLoaded ? undefined : 0,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <img src={peacockIcon} alt="logo" style={{ width:34, height:34, objectFit:"contain" }} />
            <span style={{ fontFamily:SCRIPT, fontSize:26, color:"#fff", letterSpacing:0.3 }}>
              edusupernova
            </span>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="nav-pill-btn cta-ghost"
              onClick={() => navigate("/login")}
              style={{ background:"rgba(255,255,255,0.07)",
                border:"1px solid rgba(255,255,255,0.15)",
                color:"rgba(255,255,255,0.85)", padding:"9px 24px", borderRadius:999,
                fontFamily:SERIF, fontSize:14, cursor:"pointer",
                transition:"all 0.15s" }}>
              Log in
            </button>
            <button className="cta-primary"
              onClick={() => navigate("/register")}
              style={{ background:"#fff", border:"none",
                color:BRAND, padding:"9px 24px", borderRadius:999,
                fontFamily:SERIF, fontSize:14, fontWeight:700, cursor:"pointer" }}>
              Get started — it's free
            </button>
          </div>
        </nav>

        {/* ── Hero body ── */}
        <div style={{
          flex:1, display:"flex", alignItems:"center",
          padding:"20px 48px 80px",
          gap:60, position:"relative", zIndex:2,
        }}>

          {/* Left column */}
          <div style={{ flex:"0 0 auto", maxWidth:560 }}>
            <div style={{
              animation: heroLoaded ? "fadeUp 0.7s ease both 200ms" : "none",
              opacity: heroLoaded ? undefined : 0,
              marginBottom:24,
            }}>
              <span style={{
                display:"inline-flex", alignItems:"center", gap:8,
                background:"rgba(93,202,165,0.15)",
                border:"1px solid rgba(93,202,165,0.3)",
                color:MINT, padding:"5px 14px", borderRadius:999,
                fontFamily:SERIF, fontSize:12, fontWeight:700,
                letterSpacing:"0.08em", textTransform:"uppercase",
              }}>
                <span style={{ width:6, height:6, borderRadius:"50%",
                  background:MINT, display:"inline-block" }} />
                A Levels · SAT · IELTS · ACT · TOEFL
              </span>
            </div>

            <h1 style={{
              fontFamily:SERIF,
              fontSize:"clamp(44px, 5.5vw, 76px)",
              fontWeight:700, color:"#ffffff",
              lineHeight:1.06, letterSpacing:"-2.5px",
              margin:"0 0 24px",
              animation: heroLoaded ? "fadeUp 0.7s ease both 320ms" : "none",
              opacity: heroLoaded ? undefined : 0,
            }}>
              Stop studying.<br />
              <span style={{ color:"rgba(255,255,255,0.38)" }}>Start</span>{" "}
              <em style={{ fontStyle:"italic", color:MINT }}>dominating.</em>
            </h1>

            <p style={{
              fontFamily:SERIF,
              fontSize:"clamp(15px,1.5vw,18px)",
              color:"rgba(255,255,255,0.6)", lineHeight:1.75,
              margin:"0 0 44px", maxWidth:480,
              animation: heroLoaded ? "fadeUp 0.7s ease both 440ms" : "none",
              opacity: heroLoaded ? undefined : 0,
            }}>
              Real past questions. Instant AI feedback on every answer.
              The exact method that top students use to add a full grade in 6 weeks.
            </p>

            <div style={{
              display:"flex", gap:14, alignItems:"center", flexWrap:"wrap",
              animation: heroLoaded ? "fadeUp 0.7s ease both 560ms" : "none",
              opacity: heroLoaded ? undefined : 0,
            }}>
              <button className="cta-primary"
                onClick={() => navigate("/register")}
                style={{
                  background:MINT, border:"none", color:DARK,
                  padding:"16px 36px", borderRadius:999,
                  fontFamily:SERIF, fontSize:16, fontWeight:700, cursor:"pointer",
                  display:"flex", alignItems:"center", gap:8,
                  boxShadow:`0 8px 32px rgba(93,202,165,0.4)`,
                }}>
                Start in 10 seconds
                <ArrowRight size={18} weight="bold" />
              </button>
              <span style={{ fontFamily:SERIF, fontSize:13,
                color:"rgba(255,255,255,0.35)" }}>
                Free forever · No credit card
              </span>
            </div>

            {/* Trust signals */}
            <div style={{
              display:"flex", gap:28, marginTop:52, flexWrap:"wrap",
              animation: heroLoaded ? "fadeUp 0.7s ease both 680ms" : "none",
              opacity: heroLoaded ? undefined : 0,
            }}>
              {[
                "500+ real exam questions",
                "AI feedback on every answer",
                "Results in 6 weeks",
              ].map((t) => (
                <div key={t} style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <CheckCircle size={15} weight="fill" color={MINT} />
                  <span style={{ fontFamily:SERIF, fontSize:13,
                    color:"rgba(255,255,255,0.55)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — product preview */}
          <div style={{
            flex:1, display:"flex", justifyContent:"center", alignItems:"center",
            animation: heroLoaded ? "fadeUp 0.9s ease both 500ms" : "none",
            opacity: heroLoaded ? undefined : 0,
          }}>
            <div className="hero-card" style={{ width:"100%", maxWidth:420 }}>
              <ProductPreview />
            </div>
          </div>
        </div>

        {/* Wave */}
        <div style={{ position:"absolute", bottom:-1, left:0, right:0, lineHeight:0, zIndex:2 }}>
          <svg viewBox="0 0 1440 64" fill="none" style={{ display:"block", width:"100%" }}>
            <path d="M0 64 C360 0 1080 64 1440 24 L1440 64 Z" fill={CREAM}/>
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════════════════════════ */}
      <section ref={statsRef} style={{ background:CREAM, padding:"88px 48px 96px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <p style={{
            fontFamily:SERIF, fontSize:12, fontWeight:700, letterSpacing:"0.14em",
            color:"#94A3B8", textTransform:"uppercase", textAlign:"center",
            marginBottom:64,
            animation: statsInView ? "fadeIn 0.6s ease both" : "none",
            opacity: statsInView ? undefined : 0,
          }}>
            What students consistently achieve with EduSupernova
          </p>

          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(4,1fr)",
            gap:0,
          }}>
            {[
              { value:25,  suffix:"%",  label:"Average grade increase", delay:0   },
              { value:70,  suffix:"%",  label:"Fewer repeated mistakes", delay:120 },
              { value:500, suffix:"+",  label:"Real questions per exam",  delay:240 },
              { value:6,   suffix:" wk",label:"To see real results",      delay:360 },
            ].map((s, i, arr) => (
              <div key={s.label} style={{
                textAlign:"center", padding:"0 24px",
                borderRight: i < arr.length - 1 ? "1px solid #E2EBF0" : "none",
              }}>
                <StatCard {...s} start={statsInView} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════════════════════════ */}
      <section ref={featuresRef} style={{ background:"#fff", padding:"96px 48px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <p style={{ fontFamily:SERIF, fontSize:12, fontWeight:700,
              color:BRAND, letterSpacing:"0.14em", textTransform:"uppercase",
              marginBottom:14,
              animation: featuresInView ? "fadeIn 0.5s ease both" : "none",
              opacity: featuresInView ? undefined : 0 }}>
              Why it works
            </p>
            <h2 style={{
              fontFamily:SERIF, fontSize:"clamp(28px,3.5vw,44px)", fontWeight:700,
              color:"#0F172A", letterSpacing:"-1px", lineHeight:1.15,
              margin:0,
              animation: featuresInView ? "fadeUp 0.6s ease both 100ms" : "none",
              opacity: featuresInView ? undefined : 0,
            }}>
              Built differently from every<br />other revision tool
            </h2>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            <Feature
              Icon={Exam} accent="#e8f7f9"
              title="Real past-paper questions"
              body="Every question comes from actual past papers. No filler, no made-up scenarios — only the exact question types that will appear on your exam."
              delay={0} inView={featuresInView}
            />
            <Feature
              Icon={Lightning} accent="#fff8e6"
              title="Instant AI feedback"
              body="Submit an answer and receive a personalised explanation in seconds. AI identifies exactly why you were right or wrong and what to do next time."
              delay={120} inView={featuresInView}
            />
            <Feature
              Icon={ChartBar} accent="#f0fdf4"
              title="Track every mistake"
              body="Every result is logged. See which topics trip you up, how your accuracy improves over time, and where to focus your remaining revision sessions."
              delay={240} inView={featuresInView}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════════════════ */}
      <section ref={stepsRef} style={{ background:CREAM, padding:"96px 48px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <p style={{ fontFamily:SERIF, fontSize:12, fontWeight:700,
              color:BRAND, letterSpacing:"0.14em", textTransform:"uppercase",
              marginBottom:14,
              animation: stepsInView ? "fadeIn 0.5s ease both" : "none",
              opacity: stepsInView ? undefined : 0 }}>
              The method
            </p>
            <h2 style={{
              fontFamily:SERIF, fontSize:"clamp(28px,3.5vw,44px)", fontWeight:700,
              color:"#0F172A", letterSpacing:"-1px", lineHeight:1.15, margin:0,
              animation: stepsInView ? "fadeUp 0.6s ease both 100ms" : "none",
              opacity: stepsInView ? undefined : 0,
            }}>
              Three steps to your best grade
            </h2>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            <Step number="01" Icon={BookOpen} delay={0}   inView={stepsInView}
              title="Read the unit summary"
              body="Each topic is distilled into a concise, exam-focused summary. Read it once — grasp the essentials without wading through a textbook." />
            <Step number="02" Icon={Brain}    delay={150} inView={stepsInView}
              title="Take a randomised test"
              body="20 questions drawn from 500+ real past papers. No two tests are the same. Active recall, not passive re-reading — this is what sticks." />
            <Step number="03" Icon={Trophy}   delay={300} inView={stepsInView}
              title="Get instant AI feedback"
              body="Every answer — right or wrong — gets a personalised explanation. Understand your mistake once and never repeat it." />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          EXAM TYPES
      ══════════════════════════════════════════════════════════════════════════ */}
      <section style={{ background:"#fff", padding:"96px 48px" }}>
        <div style={{ maxWidth:700, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{
            fontFamily:SERIF, fontSize:"clamp(28px,3.5vw,44px)", fontWeight:700,
            color:"#0F172A", letterSpacing:"-1px", lineHeight:1.15, marginBottom:16,
          }}>
            Built for the exams that<br />define your future
          </h2>
          <p style={{ fontFamily:SERIF, fontSize:16, color:"#64748B",
            lineHeight:1.75, marginBottom:44 }}>
            Every question is sourced from official past papers.<br />No filler, no guessing what's in scope.
          </p>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            {["A Levels", "SAT", "IELTS", "ACT", "TOEFL"].map((exam) => (
              <span key={exam} className="exam-pill" style={{
                fontFamily:SERIF, fontSize:15, fontWeight:700,
                background:CREAM, border:`1.5px solid #E8E3DB`,
                color:"#374151", padding:"11px 28px", borderRadius:999,
                cursor:"default", transition:"all 0.18s", userSelect:"none",
                display:"inline-block",
              }}>
                {exam}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════════════════════ */}
      <section ref={ctaRef} style={{
        background:`linear-gradient(145deg, #021a1f 0%, ${DARK} 45%, ${BRAND} 100%)`,
        padding:"120px 48px", textAlign:"center",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", inset:0, opacity:0.05,
          backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize:"28px 28px", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translateX(-50%)",
          width:600, height:600, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(93,202,165,0.08) 0%, transparent 70%)",
          pointerEvents:"none" }} />

        <div style={{
          position:"relative", zIndex:1,
          animation: ctaInView ? "fadeUp 0.7s ease both" : "none",
          opacity: ctaInView ? undefined : 0,
        }}>
          <span style={{ fontFamily:SCRIPT, fontSize:56, color:"#fff",
            display:"block", marginBottom:16, opacity:0.9 }}>
            edusupernova
          </span>
          <h2 style={{
            fontFamily:SERIF,
            fontSize:"clamp(28px,4vw,52px)",
            fontWeight:700, color:"#fff",
            lineHeight:1.1, marginBottom:16, letterSpacing:"-1.5px",
          }}>
            Your best grade is waiting.
          </h2>
          <p style={{ fontFamily:SERIF, fontSize:17,
            color:"rgba(255,255,255,0.5)", marginBottom:48, lineHeight:1.7 }}>
            Join thousands of students who stopped guessing and started scoring.
          </p>
          <button className="cta-primary"
            onClick={() => navigate("/register")}
            style={{
              background:MINT, border:"none", color:DARK,
              padding:"20px 56px", borderRadius:999,
              fontFamily:SERIF, fontSize:18, fontWeight:700, cursor:"pointer",
              boxShadow:"0 16px 48px rgba(93,202,165,0.4)",
              display:"inline-flex", alignItems:"center", gap:10,
            }}>
            START IN JUST 10s — FREE
            <ArrowRight size={20} weight="bold" />
          </button>
          <p style={{ fontFamily:SERIF, fontSize:13,
            color:"rgba(255,255,255,0.3)", marginTop:20 }}>
            No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════════════ */}
      <footer style={{
        background:"#021a1f",
        padding:"28px 48px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        borderTop:"1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <img src={peacockIcon} alt="logo"
            style={{ width:22, height:22, objectFit:"contain", opacity:0.5 }} />
          <span style={{ fontFamily:SCRIPT, fontSize:18,
            color:"rgba(255,255,255,0.3)" }}>edusupernova</span>
        </div>
        <div style={{ display:"flex", gap:28 }}>
          {["Contact", "About Us", "Terms", "Privacy"].map((l) => (
            <span key={l} style={{ fontFamily:SERIF, fontSize:12,
              color:"rgba(255,255,255,0.3)", cursor:"pointer",
              transition:"color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}
            >{l}</span>
          ))}
        </div>
        <span style={{ fontFamily:SERIF, fontSize:12,
          color:"rgba(255,255,255,0.2)" }}>
          © 2026 EduSupernova
        </span>
      </footer>

    </div>
  );
};

export default Home;
