/**
 * Home.jsx — redesigned landing page
 *
 * Design direction: "Premium exam coach"
 *   Dark cinematic hero (deep teal) → warm cream body → white sections
 *   Editorial oversized serif typography
 *   CSS entrance animations (staggered fade-up)
 *   Counting stats, bold social proof, strong CTA
 *
 * All navigation logic identical to original.
 * Assets identical — same imports.
 */

import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle, BookOpen, Brain, Trophy } from "@phosphor-icons/react";
import heroImg     from "../assets/portadaFirstPage.png";
import peacockIcon from "../assets/iconoEdusupernovaSinFondo.png";

// ─── Animated counter hook ────────────────────────────────────────────────────
const useCounter = (target, duration = 1800, start = false) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return value;
};

// ─── Intersection observer for scroll reveals ─────────────────────────────────
const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ value, suffix, label, delay, start }) => {
  const count = useCounter(value, 1600, start);
  return (
    <div style={{
      animation: start ? `fadeUp 0.7s ease both ${delay}ms` : "none",
      opacity: start ? undefined : 0,
    }}>
      <p style={{
        fontFamily: "Newsreader, Georgia, serif",
        fontSize: "clamp(48px, 7vw, 80px)",
        fontWeight: 700,
        color: "#0a5f6e",
        lineHeight: 1,
        letterSpacing: "-2px",
        margin: 0,
      }}>
        {count}{suffix}
      </p>
      <p style={{
        fontFamily: "Newsreader, Georgia, serif",
        fontSize: 14,
        color: "#94A3B8",
        marginTop: 6,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}>
        {label}
      </p>
    </div>
  );
};

// ─── Step card ────────────────────────────────────────────────────────────────
const Step = ({ number, Icon, title, body, delay, inView }) => (
  <div style={{
    animation: inView ? `fadeUp 0.6s ease both ${delay}ms` : "none",
    opacity: inView ? undefined : 0,
    background: "#fff",
    borderRadius: 20,
    padding: "28px 28px 24px",
    border: "1px solid #E2EBF0",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{
        fontFamily: "Newsreader, Georgia, serif",
        fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
        color: "#0a5f6e", textTransform: "uppercase",
      }}>
        Step {number}
      </span>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: "#e8f7f9",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginLeft: "auto",
      }}>
        <Icon size={18} weight="duotone" color="#0a5f6e" />
      </div>
    </div>
    <p style={{
      fontFamily: "Newsreader, Georgia, serif",
      fontSize: 18, fontWeight: 700, color: "#0F172A", margin: 0, lineHeight: 1.3,
    }}>
      {title}
    </p>
    <p style={{
      fontFamily: "Newsreader, Georgia, serif",
      fontSize: 14, color: "#64748B", margin: 0, lineHeight: 1.7,
    }}>
      {body}
    </p>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const [statsRef, statsInView] = useInView(0.3);
  const [stepsRef, stepsInView] = useInView(0.2);
  const [ctaRef,   ctaInView]   = useInView(0.3);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", overflowX: "hidden" }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cta-btn:hover { transform: scale(1.04); background: #085041 !important; }
        .cta-btn { transition: transform 0.18s, background 0.18s; }
        .nav-btn:hover { background: rgba(255,255,255,0.15) !important; }
        .exam-pill:hover { background: #e8f7f9 !important; border-color: #0a5f6e !important; }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "92vh",
        background: "linear-gradient(160deg, #062f37 0%, #0a5f6e 55%, #0e7a8a 100%)",
        display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
      }}>

        {/* Background pattern — subtle grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }} />

        {/* Hero image — right side, faded */}
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0,
          width: "45%", opacity: 0.12,
          backgroundImage: `url(${heroImg})`,
          backgroundSize: "cover", backgroundPosition: "center",
          maskImage: "linear-gradient(to left, rgba(0,0,0,0.8), transparent)",
          WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.8), transparent)",
          pointerEvents: "none",
        }} />

        {/* Nav */}
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 40px", flexShrink: 0, position: "relative", zIndex: 2,
          animation: heroLoaded ? "slideDown 0.6s ease both 100ms" : "none",
          opacity: heroLoaded ? undefined : 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={peacockIcon} alt="logo" style={{ width: 36, height: 36, objectFit: "contain" }} />
            <span style={{
              fontFamily: "Cookie, cursive", fontSize: 26,
              color: "#fff", letterSpacing: 0.3,
            }}>
              edusupernova
            </span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="nav-btn"
              onClick={() => navigate("/login")}
              style={{
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", padding: "9px 22px", borderRadius: 999,
                fontFamily: "Newsreader, Georgia, serif", fontSize: 14, cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              Log in
            </button>
            <button
              className="cta-btn"
              onClick={() => navigate("/register")}
              style={{
                background: "#fff", border: "none",
                color: "#0a5f6e", padding: "9px 22px", borderRadius: 999,
                fontFamily: "Newsreader, Georgia, serif", fontSize: 14,
                fontWeight: 700, cursor: "pointer",
              }}
            >
              Get started free
            </button>
          </div>
        </nav>

        {/* Hero copy */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "0 40px 60px", maxWidth: 760, position: "relative", zIndex: 2,
        }}>
          <div style={{
            animation: heroLoaded ? "fadeUp 0.7s ease both 200ms" : "none",
            opacity: heroLoaded ? undefined : 0,
          }}>
            <span style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.9)", padding: "5px 14px", borderRadius: 999,
              fontFamily: "Newsreader, Georgia, serif", fontSize: 12,
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 24,
            }}>
              A Levels · SAT · IELTS · ACT · TOEFL
            </span>
          </div>

          <h1 style={{
            fontFamily: "Newsreader, Georgia, serif",
            fontSize: "clamp(42px, 6.5vw, 80px)",
            fontWeight: 700, color: "#ffffff",
            lineHeight: 1.08, letterSpacing: "-2px",
            margin: "0 0 24px",
            animation: heroLoaded ? "fadeUp 0.7s ease both 320ms" : "none",
            opacity: heroLoaded ? undefined : 0,
          }}>
            Stop studying.<br />
            <span style={{ color: "rgba(255,255,255,0.45)" }}>Start</span>{" "}
            <em style={{ fontStyle: "italic", color: "#5DCAA5" }}>dominating.</em>
          </h1>

          <p style={{
            fontFamily: "Newsreader, Georgia, serif",
            fontSize: "clamp(15px, 1.8vw, 18px)",
            color: "rgba(255,255,255,0.65)", lineHeight: 1.7,
            margin: "0 0 40px", maxWidth: 520,
            animation: heroLoaded ? "fadeUp 0.7s ease both 440ms" : "none",
            opacity: heroLoaded ? undefined : 0,
          }}>
            Real past questions. Instant AI feedback. The exact method that
            top students use to add a full grade in 6 weeks.
          </p>

          <div style={{
            display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap",
            animation: heroLoaded ? "fadeUp 0.7s ease both 560ms" : "none",
            opacity: heroLoaded ? undefined : 0,
          }}>
            <button
              className="cta-btn"
              onClick={() => navigate("/register")}
              style={{
                background: "#5DCAA5", border: "none", color: "#062f37",
                padding: "16px 36px", borderRadius: 999,
                fontFamily: "Newsreader, Georgia, serif",
                fontSize: 16, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 8px 32px rgba(93,202,165,0.4)",
              }}
            >
              Start in 10 seconds
              <ArrowRight size={18} weight="bold" />
            </button>
            <span style={{
              fontFamily: "Newsreader, Georgia, serif",
              fontSize: 13, color: "rgba(255,255,255,0.45)",
            }}>
              Free forever · No credit card
            </span>
          </div>

          {/* Quick trust signals */}
          <div style={{
            display: "flex", gap: 24, marginTop: 48, flexWrap: "wrap",
            animation: heroLoaded ? "fadeUp 0.7s ease both 680ms" : "none",
            opacity: heroLoaded ? undefined : 0,
          }}>
            {["500+ real exam questions", "AI feedback on every answer", "Results in 6 weeks"].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <CheckCircle size={15} weight="fill" color="#5DCAA5" />
                <span style={{
                  fontFamily: "Newsreader, Georgia, serif",
                  fontSize: 13, color: "rgba(255,255,255,0.6)",
                }}>
                  {t}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, lineHeight: 0, zIndex: 2 }}>
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }}>
            <path d="M0 60 C360 0 1080 60 1440 20 L1440 60 Z" fill="#F7F4EF"/>
          </svg>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section ref={statsRef} style={{
        background: "#F7F4EF", padding: "72px 40px 80px",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <p style={{
            fontFamily: "Newsreader, Georgia, serif",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
            color: "#94A3B8", textTransform: "uppercase", textAlign: "center",
            marginBottom: 52,
            animation: statsInView ? "fadeIn 0.5s ease both" : "none",
            opacity: statsInView ? undefined : 0,
          }}>
            What students achieve with EduSupernova
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 48, textAlign: "center",
          }}>
            <StatCard value={25} suffix="%" label="Average grade increase" delay={0}   start={statsInView} />
            <StatCard value={70} suffix="%" label="Fewer repeated mistakes" delay={150} start={statsInView} />
            <StatCard value={500} suffix="+"  label="Real questions per exam" delay={300} start={statsInView} />
            <StatCard value={6}  suffix="wk"  label="To see real results" delay={450} start={statsInView} />
          </div>
        </div>
      </section>

      {/* ── EXAM TYPES ────────────────────────────────────────────────────── */}
      <section style={{ background: "#fff", padding: "72px 40px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontFamily: "Newsreader, Georgia, serif",
            fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700,
            color: "#0F172A", lineHeight: 1.15, letterSpacing: "-1px",
            marginBottom: 14,
          }}>
            Built for the exams<br />that define your future
          </h2>
          <p style={{
            fontFamily: "Newsreader, Georgia, serif",
            fontSize: 16, color: "#64748B", lineHeight: 1.7, marginBottom: 40,
          }}>
            Every question is sourced from real past papers. No filler.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {["A Levels", "SAT", "IELTS", "ACT", "TOEFL"].map((exam) => (
              <span
                key={exam}
                className="exam-pill"
                style={{
                  fontFamily: "Newsreader, Georgia, serif",
                  fontSize: 15, fontWeight: 700,
                  background: "#F7F4EF", border: "1.5px solid #E8E3DB",
                  color: "#1A1714", padding: "10px 22px", borderRadius: 999,
                  cursor: "default", transition: "all 0.15s",
                  userSelect: "none",
                }}
              >
                {exam}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section ref={stepsRef} style={{ background: "#F7F4EF", padding: "80px 40px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{
              fontFamily: "Newsreader, Georgia, serif",
              fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 700,
              color: "#0F172A", letterSpacing: "-0.8px", margin: 0,
            }}>
              Three steps to your best grade
            </h2>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}>
            <Step
              number="01" Icon={BookOpen} delay={0} inView={stepsInView}
              title="Read the unit summary"
              body="Each topic is distilled into a crisp, exam-focused summary. Read it once — grasp the essentials."
            />
            <Step
              number="02" Icon={Brain} delay={150} inView={stepsInView}
              title="Take a randomised test"
              body="20 questions drawn from 500+ real past papers. No two tests are the same. Active recall, not passive re-reading."
            />
            <Step
              number="03" Icon={Trophy} delay={300} inView={stepsInView}
              title="Get instant AI feedback"
              body="Every answer — right or wrong — gets a personalised explanation. Understand your mistake and never repeat it."
            />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section ref={ctaRef} style={{
        background: "linear-gradient(135deg, #062f37 0%, #0a5f6e 100%)",
        padding: "100px 40px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.05,
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px", pointerEvents: "none",
        }} />
        <div style={{
          position: "relative", zIndex: 1,
          animation: ctaInView ? "fadeUp 0.7s ease both" : "none",
          opacity: ctaInView ? undefined : 0,
        }}>
          <span style={{
            fontFamily: "Cookie, cursive", fontSize: 52, color: "#fff",
            display: "block", marginBottom: 8,
          }}>
            edusupernova
          </span>
          <p style={{
            fontFamily: "Newsreader, Georgia, serif",
            fontSize: "clamp(22px, 3.5vw, 38px)", fontWeight: 700,
            color: "#fff", lineHeight: 1.2, marginBottom: 12, letterSpacing: "-0.5px",
          }}>
            Your best grade is waiting.
          </p>
          <p style={{
            fontFamily: "Newsreader, Georgia, serif",
            fontSize: 16, color: "rgba(255,255,255,0.55)", marginBottom: 40,
          }}>
            Join thousands of students who stopped guessing and started scoring.
          </p>
          <button
            className="cta-btn"
            onClick={() => navigate("/register")}
            style={{
              background: "#5DCAA5", border: "none", color: "#062f37",
              padding: "18px 48px", borderRadius: 999,
              fontFamily: "Newsreader, Georgia, serif",
              fontSize: 18, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 12px 40px rgba(93,202,165,0.35)",
              display: "inline-flex", alignItems: "center", gap: 10,
            }}
          >
            START IN JUST 10s — FREE
            <ArrowRight size={20} weight="bold" />
          </button>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer style={{
        background: "#062f37", padding: "24px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", gap: 24 }}>
          {["Contact", "About Us", "Terms"].map((l) => (
            <span key={l} style={{
              fontFamily: "Newsreader, Georgia, serif",
              fontSize: 12, color: "rgba(255,255,255,0.35)", cursor: "pointer",
            }}>
              {l}
            </span>
          ))}
        </div>
        <span style={{
          fontFamily: "Newsreader, Georgia, serif",
          fontSize: 12, color: "rgba(255,255,255,0.25)",
        }}>
          © 2026 EduSupernova
        </span>
      </footer>

    </div>
  );
};

export default Home;