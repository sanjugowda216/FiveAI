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
  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [typingText, setTypingText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFounders, setShowFounders] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
      paddingTop: isMobile ? "80px" : "88px",
    },
    header: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: isMobile ? "72px" : "80px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: isMobile ? "0 20px" : "0 32px",
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(0,120,200,0.08)",
      zIndex: 1200,
      boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      transition: "all 200ms ease",
    },
    logoIcon: {
      width: "32px",
      height: "32px",
      borderRadius: "8px",
      background: "linear-gradient(135deg, #0078C8 0%, #266fb5 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
      color: "#fff",
      fontWeight: "bold",
      boxShadow: "0 4px 12px rgba(0, 120, 200, 0.3)",
    },
    logoText: {
      color: "#0078C8",
      fontWeight: 900,
      fontSize: "22px",
      letterSpacing: "-0.5px",
      background: "linear-gradient(135deg, #0078C8 0%, #266fb5 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      transition: "all 200ms ease",
    },
    nav: {
      display: "flex",
      gap: isMobile ? "16px" : "24px",
      alignItems: "center",
    },
    navLink: {
      color: "#022037",
      fontWeight: 600,
      cursor: "pointer",
      padding: isMobile ? "6px 10px" : "8px 12px",
      borderRadius: "8px",
      transition: "all 200ms ease",
      fontSize: isMobile ? "14px" : "15px",
    },
    getStartedBtn: {
      background: "linear-gradient(135deg, #0078C8 0%, #2aa3f2 100%)",
      color: "#fff",
      padding: "14px 28px",
      borderRadius: "16px",
      fontWeight: 700,
      border: "none",
      cursor: "pointer",
      boxShadow: "0 8px 32px rgba(0,120,200,0.25)",
      transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
      fontSize: "16px",
      position: "relative",
      overflow: "hidden",
    },
    secondaryBtn: {
      background: "rgba(255,255,255,0.9)",
      color: "#0078C8",
      padding: "14px 28px",
      borderRadius: "16px",
      fontWeight: 700,
      border: "2px solid rgba(0,120,200,0.2)",
      cursor: "pointer",
      transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
      fontSize: "16px",
      backdropFilter: "blur(10px)",
    },

    // HERO
    heroWrap: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: isMobile ? "60px 20px" : "80px 24px 80px",
      position: "relative",
      overflow: "visible",
    },
    heroCanvas: {
      position: "absolute",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      opacity: 0.6,
    },
    heroCard: {
      position: "relative",
      zIndex: 1,
      borderRadius: "24px",
      background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)",
      padding: isMobile ? "48px 24px" : "64px 48px",
      boxShadow: "0 32px 64px rgba(2,24,48,0.12), 0 0 0 1px rgba(0,120,200,0.08)",
      border: "1px solid rgba(0,0,0,0.04)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "24px",
      textAlign: "center",
      backdropFilter: "blur(20px)",
    },
    heroTitle: {
      fontSize: "clamp(36px, 5vw, 56px)",
      lineHeight: 1.1,
      margin: 0,
      fontWeight: 900,
      color: "#022037",
      background: "linear-gradient(135deg, #0078C8 0%, #266fb5 50%, #1e5a8a 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: "-0.02em",
      textShadow: "0 4px 8px rgba(0,120,200,0.1)",
    },
    heroSubtitle: {
      fontSize: "clamp(16px, 2.5vw, 20px)",
      color: "#0b1b2b",
      marginTop: 12,
      minHeight: "28px",
      fontWeight: 600,
      opacity: 0.9,
    },
    heroDesc: {
      fontSize: "clamp(14px, 1.8vw, 17px)",
      color: "#234456",
      maxWidth: "680px",
      margin: "0 auto",
      lineHeight: 1.7,
      fontWeight: 400,
    },

    // HOW IT WORKS
    howSection: {
      padding: "80px 20px",
      maxWidth: "1200px",
      margin: "0 auto",
      textAlign: "center",
      background: "linear-gradient(180deg, rgba(248,250,252,0.6) 0%, rgba(255,255,255,0.8) 100%)",
      borderRadius: "32px",
      marginTop: "40px",
    },
    howTitle: {
      fontSize: "clamp(28px, 4vw, 36px)",
      color: "#022037",
      marginBottom: 16,
      fontWeight: 800,
      background: "linear-gradient(135deg, #0078C8 0%, #266fb5 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    howSubtitle: {
      fontSize: "18px",
      color: "#234456",
      marginBottom: 48,
      maxWidth: "600px",
      margin: "0 auto 48px",
      lineHeight: 1.6,
    },
    howGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
      gap: isMobile ? "20px" : "24px",
      marginTop: "24px",
    },
    howCard: {
      background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)",
      borderRadius: "20px",
      padding: "32px 24px",
      border: "1px solid rgba(0,120,200,0.08)",
      boxShadow: "0 16px 40px rgba(2,24,48,0.06), 0 0 0 1px rgba(255,255,255,0.8)",
      color: "#022037",
      fontWeight: 600,
      fontSize: "16px",
      lineHeight: 1.5,
      position: "relative",
      transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    },

    // FEATURES
    featuresSection: {
      padding: "80px 20px",
      maxWidth: "1200px",
      margin: "0 auto",
      background: "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.4) 100%)",
      borderRadius: "32px",
      marginTop: "40px",
    },
    featuresTitle: {
      fontSize: "clamp(28px, 4vw, 36px)",
      fontWeight: 800,
      color: "#022037",
      marginBottom: 16,
      textAlign: "center",
      background: "linear-gradient(135deg, #0078C8 0%, #266fb5 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    featuresSubtitle: {
      fontSize: "18px",
      color: "#234456",
      textAlign: "center",
      marginBottom: 48,
      maxWidth: "600px",
      margin: "0 auto 48px",
      lineHeight: 1.6,
    },
    featuresGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))",
      gap: isMobile ? "20px" : "24px",
    },
    featureCard: {
      background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)",
      borderRadius: "20px",
      padding: "32px 24px",
      border: "1px solid rgba(0,120,200,0.08)",
      boxShadow: "0 16px 40px rgba(2,24,48,0.06), 0 0 0 1px rgba(255,255,255,0.8)",
      transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden",
      backdropFilter: "blur(20px)",
    },
    featureIcon: {
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      background: "linear-gradient(135deg, #0078C8 0%, #2aa3f2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "20px",
      fontSize: "20px",
      color: "#fff",
      fontWeight: "bold",
    },
    featureTitle: {
      fontSize: "20px",
      fontWeight: 700,
      color: "#022037",
      marginBottom: 12,
      lineHeight: 1.3,
    },
    featureText: {
      color: "#234456",
      lineHeight: 1.6,
      fontSize: "15px",
    },

    // Footer
    footer: {
      padding: "48px 20px",
      textAlign: "center",
      color: "#fff",
      background: "linear-gradient(135deg, #0078C8 0%, #266fb5 100%)",
      marginTop: "60px",
      borderTopLeftRadius: "24px",
      borderTopRightRadius: "24px",
      boxShadow: "0 -8px 32px rgba(0,120,200,0.15)",
    },
    footerContent: {
      maxWidth: "1000px",
      margin: "0 auto",
    },
    footerBrand: {
      marginBottom: 12,
      fontWeight: 800,
      fontSize: "20px",
      letterSpacing: "-0.5px",
    },
    footerTagline: {
      opacity: 0.9,
      fontSize: "14px",
      lineHeight: 1.6,
    },
  };

  return (
    <div style={styles.page}>
      {/* Header / Navbar */}
      <header style={styles.header}>
        <div 
          onClick={() => scrollTo("top")} 
          style={styles.logoContainer}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <div style={styles.logoIcon}>✋</div>
          <span style={styles.logoText}>FiveAI</span>
        </div>

        <nav style={styles.nav}>
          <div 
            style={styles.navLink} 
            onClick={() => scrollTo("how")}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,120,200,0.1)";
              e.currentTarget.style.color = "#0078C8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#022037";
            }}
          >
            How
          </div>
          <div 
            style={styles.navLink} 
            onClick={() => scrollTo("features")}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,120,200,0.1)";
              e.currentTarget.style.color = "#0078C8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#022037";
            }}
          >
            Features
          </div>
          <div
            style={{ ...styles.navLink, marginRight: 8 }}
            onClick={() => setShowFounders((s) => !s)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,120,200,0.1)";
              e.currentTarget.style.color = "#0078C8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#022037";
            }}
          >
            {showFounders ? "Close" : "Founders"}
          </div>

          <button
            style={{...styles.getStartedBtn, padding: "12px 24px", fontSize: "14px"}}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,120,200,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,120,200,0.18)";
            }}
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

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              style={styles.getStartedBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,120,200,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,120,200,0.25)";
              }}
              onClick={() => (window.location.href = "/login")}
            >
              Get Started
            </button>
            <button
              style={styles.secondaryBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = "rgba(0,120,200,0.4)";
                e.currentTarget.style.background = "rgba(255,255,255,1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(0,120,200,0.2)";
                e.currentTarget.style.background = "rgba(255,255,255,0.9)";
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
        <p style={styles.howSubtitle}>
          Get started with FiveAI in minutes and see immediate improvements in your AP exam preparation.
        </p>
        <div style={styles.howGrid}>
          <div 
            style={styles.howCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 20px 50px rgba(2,24,48,0.1), 0 0 0 1px rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 16px 40px rgba(2,24,48,0.06), 0 0 0 1px rgba(255,255,255,0.8)";
            }}
          >
            <div style={{ 
              position: "absolute", 
              top: "-12px", 
              left: "50%", 
              transform: "translateX(-50%)",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0078C8 0%, #2aa3f2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "14px"
            }}>
              1
            </div>
            Choose a subject & set a study goal
          </div>
          <div 
            style={styles.howCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 20px 50px rgba(2,24,48,0.1), 0 0 0 1px rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 16px 40px rgba(2,24,48,0.06), 0 0 0 1px rgba(255,255,255,0.8)";
            }}
          >
            <div style={{ 
              position: "absolute", 
              top: "-12px", 
              left: "50%", 
              transform: "translateX(-50%)",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0078C8 0%, #2aa3f2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "14px"
            }}>
              2
            </div>
            Practice with targeted questions and FRQs
          </div>
          <div 
            style={styles.howCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 20px 50px rgba(2,24,48,0.1), 0 0 0 1px rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 16px 40px rgba(2,24,48,0.06), 0 0 0 1px rgba(255,255,255,0.8)";
            }}
          >
            <div style={{ 
              position: "absolute", 
              top: "-12px", 
              left: "50%", 
              transform: "translateX(-50%)",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0078C8 0%, #2aa3f2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "14px"
            }}>
              3
            </div>
            Get instant feedback, analytics & next-step guidance
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" ref={featuresRef} style={styles.featuresSection}>
        <h3 style={styles.featuresTitle}>
          Why FiveAI
        </h3>
        <p style={styles.featuresSubtitle}>
          Powerful AI-driven tools designed specifically for AP students to maximize learning efficiency and exam success.
        </p>

        <div style={styles.featuresGrid}>
          <div
            style={styles.featureCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 24px 60px rgba(2,24,48,0.12), 0 0 0 1px rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 16px 40px rgba(2,24,48,0.06), 0 0 0 1px rgba(255,255,255,0.8)";
            }}
          >
            <div style={styles.featureIcon}>🧠</div>
            <div style={styles.featureTitle}>Adaptive Practice</div>
            <div style={styles.featureText}>
              The system focuses on your weak areas and reduces repetition for topics you've mastered,
              so every session is efficient and high-impact.
            </div>
          </div>

          <div
            style={styles.featureCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 24px 60px rgba(2,24,48,0.12), 0 0 0 1px rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 16px 40px rgba(2,24,48,0.06), 0 0 0 1px rgba(255,255,255,0.8)";
            }}
          >
            <div style={styles.featureIcon}>💡</div>
            <div style={styles.featureTitle}>AI-Powered Explanations</div>
            <div style={styles.featureText}>
              Get clear, step-by-step explanations for multiple choice and free-response questions,
              written to your level so concepts really stick.
            </div>
          </div>

          <div
            style={styles.featureCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 24px 60px rgba(2,24,48,0.12), 0 0 0 1px rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 16px 40px rgba(2,24,48,0.06), 0 0 0 1px rgba(255,255,255,0.8)";
            }}
          >
            <div style={styles.featureIcon}>📊</div>
            <div style={styles.featureTitle}>Progress & Insights</div>
            <div style={styles.featureText}>
              Track performance over time, identify trending weaknesses, and get a personalized revision plan.
            </div>
          </div>

          <div
            style={styles.featureCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 24px 60px rgba(2,24,48,0.12), 0 0 0 1px rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 16px 40px rgba(2,24,48,0.06), 0 0 0 1px rgba(255,255,255,0.8)";
            }}
          >
            <div style={styles.featureIcon}>🔍</div>
            <div style={styles.featureTitle}>Fast, Localized Search</div>
            <div style={styles.featureText}>
              Search topics quickly and get context-aware answers with references. (CED-based source material is used behind the scenes for accuracy.)
            </div>
          </div>

          <div
            style={styles.featureCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 24px 60px rgba(2,24,48,0.12), 0 0 0 1px rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 16px 40px rgba(2,24,48,0.06), 0 0 0 1px rgba(255,255,255,0.8)";
            }}
          >
            <div style={styles.featureIcon}>✍️</div>
            <div style={styles.featureTitle}>FRQ Mode & Smart Grading</div>
            <div style={styles.featureText}>
              Practice free-response prompts and receive constructive feedback plus a suggested rubric score to guide improvements.
            </div>
          </div>

          <div
            style={styles.featureCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 24px 60px rgba(2,24,48,0.12), 0 0 0 1px rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 16px 40px rgba(2,24,48,0.06), 0 0 0 1px rgba(255,255,255,0.8)";
            }}
          >
            <div style={styles.featureIcon}>🔒</div>
            <div style={styles.featureTitle}>Privacy First</div>
            <div style={styles.featureText}>
              We only store what helps you learn — session data and progress. You control what stays and what's removed.
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
        <div style={styles.footerContent}>
          <div style={styles.footerBrand}>FiveAI</div>
          <div style={styles.footerTagline}>
            © 2025 FiveAI — Built by students. Powered by curiosity.
          </div>
        </div>
      </footer>
    </div>
  );
}
