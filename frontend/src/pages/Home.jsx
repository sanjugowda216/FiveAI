// frontend/src/pages/Home.jsx
import { useState, useEffect, useRef, useMemo } from "react";

/**
 * Home.jsx
 * Academic-futuristic landing page using original FiveAI colors:
 * - primary blue: #0078C8
 * - white: #FFFFFF
 * - light grey: #F0F0F0
 * - text: black (#000)
 *
 * - Subtle canvas particle animation behind hero
 * - Navbar includes "Get Started"
 * - Single CED mention in Features copy
 * - Smooth reveal on scroll (IntersectionObserver)
 *
 * Replace your existing Home component with this file.
 */

export default function Home() {
  const [typingText, setTypingText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFounders, setShowFounders] = useState(false);

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howRef = useRef(null);
  const canvasRef = useRef(null);

  // Typing phrases (short, crisp)
  const phrases = useMemo(
    () => [
      "Smarter studying starts here",
      "Your AI companion for every AP course",
      "Instant feedback. Clear explanations.",
      "Built by students, for students",
    ],
    []
  );

  // Typing effect
  useEffect(() => {
    const current = phrases[phraseIndex];
    const delay = isDeleting ? 40 : 90;
    const t = setTimeout(() => {
      if (!isDeleting) {
        if (typingText.length < current.length) {
          setTypingText(current.slice(0, typingText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (typingText.length > 0) {
          setTypingText(current.slice(0, typingText.length - 1));
        } else {
          setIsDeleting(false);
          setPhraseIndex((p) => (p + 1) % phrases.length);
        }
      }
    }, delay);

    return () => clearTimeout(t);
  }, [typingText, isDeleting, phraseIndex, phrases]);

  // Simple particle system for hero background (no external libs)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = canvas.clientWidth);
    let height = (canvas.height = canvas.clientHeight);
    let rafId;
    const particles = [];
    const PARTICLE_COUNT = Math.max(24, Math.floor(width / 60));

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function createParticles() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: rand(0, width),
          y: rand(0, height),
          vx: rand(-0.15, 0.15),
          vy: rand(-0.05, 0.05),
          r: rand(1, 3.5),
          alpha: rand(0.08, 0.22),
        });
      }
    }

    function resize() {
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
      createParticles();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // subtle gradient overlay
      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, "rgba(0,120,200,0.06)");
      g.addColorStop(1, "rgba(0,120,200,0.02)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // gentle wrap
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // subtle connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 9000) {
            const alpha = 0.015 * (1 - d2 / 9000);
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // reveal on scroll using IntersectionObserver (applies inline transforms)
  useEffect(() => {
    const elements = [heroRef.current, howRef.current, featuresRef.current].filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.style.transform = "translateY(0px) scale(1)";
            entry.target.style.opacity = "1";
            entry.target.style.transition = "opacity 650ms ease, transform 650ms ease";
          }
        }
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px) scale(0.995)";
      obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  // navigation handlers
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // styles (kept to your original palette, cleaned)
  const styles = {
    page: {
      minHeight: "100vh",
      background: "linear-gradient(180deg, #EAF6FF 0%, #F0F8FF 40%, #FFFFFF 100%)",
      color: "#000",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      paddingTop: "80px",
    },
    header: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: "72px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      background: "rgba(255,255,255,0.7)",
      backdropFilter: "blur(8px)",
      borderBottom: "1px solid rgba(0,0,0,0.06)",
      zIndex: 1200,
    },
    logo: {
      color: "#0078C8",
      fontWeight: 800,
      fontSize: "20px",
      cursor: "pointer",
      letterSpacing: "-0.5px",
    },
    nav: {
      display: "flex",
      gap: "18px",
      alignItems: "center",
    },
    navLink: {
      color: "#022037",
      fontWeight: 600,
      cursor: "pointer",
      padding: "6px 8px",
    },
    getStartedBtn: {
      background: "linear-gradient(90deg, #0078C8, #2aa3f2)",
      color: "#fff",
      padding: "10px 16px",
      borderRadius: "999px",
      fontWeight: 700,
      border: "none",
      cursor: "pointer",
      boxShadow: "0 6px 20px rgba(0,120,200,0.18)",
      transition: "transform 160ms ease, box-shadow 160ms ease",
    },

    // HERO
    heroWrap: {
      maxWidth: "1100px",
      margin: "0 auto",
      padding: "68px 24px 56px",
      position: "relative",
      overflow: "visible",
    },
    heroCanvas: {
      position: "absolute",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      opacity: 0.55,
    },
    heroCard: {
      position: "relative",
      zIndex: 1,
      borderRadius: "18px",
      background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(250,250,250,0.9))",
      padding: "46px 36px",
      boxShadow: "0 18px 40px rgba(2,24,48,0.08)",
      border: "1px solid rgba(0,0,0,0.04)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "18px",
      textAlign: "center",
    },
    heroTitle: {
      fontSize: "44px",
      lineHeight: 1.03,
      margin: 0,
      fontWeight: 800,
      color: "#022037",
      background: "linear-gradient(90deg, #0078C8, #266fb5)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    heroSubtitle: {
      fontSize: "18px",
      color: "#0b1b2b",
      marginTop: 8,
      minHeight: "26px",
    },
    heroDesc: {
      fontSize: "15px",
      color: "#234456",
      maxWidth: "820px",
      margin: "0 auto",
      lineHeight: 1.6,
    },

    // HOW IT WORKS
    howSection: {
      padding: "64px 20px",
      maxWidth: "1000px",
      margin: "0 auto",
      textAlign: "center",
    },
    howTitle: {
      fontSize: "28px",
      color: "#0078C8",
      marginBottom: "18px",
      fontWeight: 800,
    },
    howGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "18px",
      marginTop: "18px",
    },
    howCard: {
      background: "#fff",
      borderRadius: "12px",
      padding: "18px",
      border: "1px solid rgba(0,0,0,0.04)",
      boxShadow: "0 6px 18px rgba(2,24,48,0.04)",
      color: "#0b1b2b",
      fontWeight: 600,
    },

    // FEATURES
    featuresSection: {
      padding: "64px 20px",
      maxWidth: "1100px",
      margin: "0 auto",
    },
    featuresGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "20px",
    },
    featureCard: {
      background: "linear-gradient(180deg,#fff,#fbfdff)",
      borderRadius: "14px",
      padding: "20px",
      border: "1px solid rgba(0,120,200,0.06)",
      boxShadow: "0 10px 30px rgba(2,24,48,0.04)",
      transition: "transform 220ms ease, box-shadow 220ms ease",
    },
    featureTitle: {
      fontSize: "18px",
      fontWeight: 700,
      color: "#0078C8",
      marginBottom: 8,
    },
    featureText: {
      color: "#123945",
      lineHeight: 1.6,
    },

    // Footer
    footer: {
      padding: "36px 20px",
      textAlign: "center",
      color: "#fff",
      background: "#0078C8",
      marginTop: "40px",
      borderTopLeftRadius: "10px",
      borderTopRightRadius: "10px",
    },
  };

  return (
    <div style={styles.page}>
      {/* Header / Navbar */}
      <header style={styles.header}>
        <div onClick={() => scrollTo("top")} style={styles.logo}>
          FiveAI
        </div>

        <nav style={styles.nav}>
          <div style={styles.navLink} onClick={() => scrollTo("how")}>
            How
          </div>
          <div style={styles.navLink} onClick={() => scrollTo("features")}>
            Features
          </div>
          <div
            style={{ ...styles.navLink, marginRight: 6 }}
            onClick={() => setShowFounders((s) => !s)}
          >
            {showFounders ? "Close" : "Founders"}
          </div>

          <button
            style={styles.getStartedBtn}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            onClick={() => (window.location.href = "/login")}
          >
            Get Started
          </button>
        </nav>
      </header>

      {/* HERO */}
      <main style={styles.heroWrap} id="top">
        <canvas
          ref={canvasRef}
          style={{ ...styles.heroCanvas, width: "100%", height: "320px", top: 0 }}
        />
        <section ref={heroRef} style={styles.heroCard}>
          <h1 style={styles.heroTitle}>Your AI Study Partner</h1>

          <div style={styles.heroSubtitle}>
            <span>{typingText}</span>
            <span
              style={{
                display: "inline-block",
                width: 3,
                height: 18,
                background: "#0078C8",
                marginLeft: 8,
                borderRadius: 2,
                animation: "blink 1s infinite",
              }}
            />
          </div>

          <p style={styles.heroDesc}>
            FiveAI brings smart, exam-focused study tools to AP students — personalized quizzes,
            instant feedback, and progress tracking that helps you level up efficiently.
          </p>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              style={styles.getStartedBtn}
              onClick={() => (window.location.href = "/login")}
            >
              Get Started
            </button>
            <button
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                border: "1px solid rgba(0,120,200,0.12)",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 700,
                color: "#0078C8",
              }}
              onClick={() => scrollTo("features")}
            >
              Explore Features
            </button>
          </div>
        </section>
      </main>

      {/* HOW IT WORKS */}
      <section id="how" ref={howRef} style={styles.howSection}>
        <h3 style={styles.howTitle}>How it works — in three steps</h3>
        <div style={styles.howGrid}>
          <div style={styles.howCard}>Choose a subject & set a study goal</div>
          <div style={styles.howCard}>Practice with targeted questions and FRQs</div>
          <div style={styles.howCard}>Get instant feedback, analytics & next-step guidance</div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" ref={featuresRef} style={styles.featuresSection}>
        <h3 style={{ color: "#022037", fontSize: 24, fontWeight: 800, marginBottom: 18 }}>
          Why FiveAI
        </h3>

        <div style={styles.featuresGrid}>
          <div
            style={styles.featureCard}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-6px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={styles.featureTitle}>Adaptive Practice</div>
            <div style={styles.featureText}>
              The system focuses on your weak areas and reduces repetition for topics you've mastered,
              so every session is efficient and high-impact.
            </div>
          </div>

          <div
            style={styles.featureCard}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-6px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={styles.featureTitle}>AI-Powered Explanations</div>
            <div style={styles.featureText}>
              Get clear, step-by-step explanations for multiple choice and free-response questions,
              written to your level so concepts really stick.
            </div>
          </div>

          <div
            style={styles.featureCard}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-6px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={styles.featureTitle}>Progress & Insights</div>
            <div style={styles.featureText}>
              Track performance over time, identify trending weaknesses, and get a personalized revision plan.
            </div>
          </div>

          <div
            style={styles.featureCard}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-6px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={styles.featureTitle}>Fast, Localized Search</div>
            <div style={styles.featureText}>
              Search topics quickly and get context-aware answers with references. (CED-based source material is used behind the scenes for accuracy.)
            </div>
          </div>

          <div
            style={styles.featureCard}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-6px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={styles.featureTitle}>FRQ Mode & Smart Grading</div>
            <div style={styles.featureText}>
              Practice free-response prompts and receive constructive feedback plus a suggested rubric score to guide improvements.
            </div>
          </div>

          <div
            style={styles.featureCard}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-6px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={styles.featureTitle}>Privacy First</div>
            <div style={styles.featureText}>
              We only store what helps you learn — session data and progress. You control what stays and what’s removed.
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDERS */}
      {showFounders && (
        <section style={{ padding: "56px 20px", maxWidth: 1000, margin: "0 auto" }}>
          <h3 style={{ fontSize: 22, color: "#0078C8", fontWeight: 700, marginBottom: 12 }}>
            Meet the Team
          </h3>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ padding: 18, background: "#fff", borderRadius: 12 }}>
              <strong>Vaidehi Akbari</strong>
              <div style={{ marginTop: 8, color: "#234456" }}>
                Machine learning enthusiast and full-stack developer focused on usable AI for students.
              </div>
            </div>
            <div style={{ padding: 18, background: "#fff", borderRadius: 12 }}>
              <strong>Sanjana Gowda</strong>
              <div style={{ marginTop: 8, color: "#234456" }}>
                Full-stack engineer passionate about educational tools and data-driven learning.
              </div>
            </div>
            <div style={{ padding: 18, background: "#fff", borderRadius: 12 }}>
              <strong>Shely Jain</strong>
              <div style={{ marginTop: 8, color: "#234456" }}>
                AI enthusiast and frontend engineer building polished learning experiences.
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>FiveAI</div>
          <div style={{ opacity: 0.95, fontSize: 13 }}>
            © 2025 FiveAI — Built by students. Powered by curiosity.
          </div>
        </div>
      </footer>
    </div>
  );
}
