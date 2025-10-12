import { useState, useEffect } from 'react';

export default function Home() {
    const [showFounders, setShowFounders] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const phrases = [
        'Master AP courses with personalized AI tutoring',
        'Ace your exams with instant feedback',
        'Track your progress in real-time',
        'Learn smarter, not harder',
        'Get ready for college with confidence'
    ];

    useEffect(() => {
        const currentPhrase = phrases[phraseIndex];
        const timeout = setTimeout(() => {
            if (!isDeleting) {
                if (typingText.length < currentPhrase.length) {
                    setTypingText(currentPhrase.slice(0, typingText.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            } else {
                if (typingText.length > 0) {
                    setTypingText(currentPhrase.slice(0, typingText.length - 1));
                } else {
                    setIsDeleting(false);
                    setPhraseIndex((prev) => (prev + 1) % phrases.length);
                }
            }
        }, isDeleting ? 50 : 100);

        return () => clearTimeout(timeout);
    }, [typingText, isDeleting, phraseIndex]);

    const handleGetStarted = () => {
        window.location.href = "/login";
    };



    const styles = {
        container: {
            minHeight: '100vh',
            background: '#0078C8',
            color: 'white',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        },
        header: {
            padding: '1.5rem 4rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: '#0078C8',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        logo: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white'
        },
        nav: {
            display: 'flex',
            gap: '2rem',
            alignItems: 'center'
        },
        navLink: {
            color: 'white',
            textDecoration: 'none',
            fontSize: '1rem',
            cursor: 'pointer',
            opacity: 0.9,
            transition: 'opacity 0.2s'
        },
        heroSection: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '8rem 2rem 4rem',
            textAlign: 'center'
        },
        heroContent: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '2rem',
            padding: '3rem 2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            animation: 'fadeInUp 0.8s ease-out'
        },
        heroTitle: {
            fontSize: '4.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
            animation: 'fadeInDown 0.6s ease-out'
        },
        heroSubtitle: {
            fontSize: '1.5rem',
            marginBottom: '1rem',
            opacity: 0.95,
            fontWeight: 300,
            minHeight: '2.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        cursor: {
            display: 'inline-block',
            width: '3px',
            height: '1.5rem',
            background: 'white',
            marginLeft: '4px',
            animation: 'blink 1s infinite'
        },
        heroDescription: {
            fontSize: '1.125rem',
            marginBottom: '3rem',
            opacity: 0.9,
            maxWidth: '800px',
            margin: '0 auto 3rem',
            lineHeight: 1.6,
            animation: 'fadeIn 1s ease-out 0.3s backwards'
        },
        ctaContainer: {
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '0',
            flexWrap: 'wrap',
            animation: 'fadeIn 1s ease-out 0.5s backwards'
        },
        btnPrimary: {
            padding: '1rem 2.5rem',
            fontSize: '1.125rem',
            fontWeight: '600',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            background: 'white',
            color: '#2563eb',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        },
        btnSecondary: {
            padding: '1rem 2.5rem',
            fontSize: '1.125rem',
            fontWeight: '600',
            border: '2px solid white',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            background: 'transparent',
            color: 'white',
            transition: 'all 0.2s'
        },
        featuresSection: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '4rem 2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
        },
        featureCard: {
            background: 'rgba(52, 177, 254, 0.28)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            position: 'relative',
            animation: 'fadeInUp 0.8s ease-out backwards'
        },
        featureIcon: {
            fontSize: '2.5rem',
            marginBottom: '1.5rem',
            display: 'inline-block',
            padding: '1rem',
            background: 'rgba(59, 130, 246, 0.3)',
            borderRadius: '0.75rem',
            border: '1px solid rgba(59, 130, 246, 0.5)'
        },
        featureTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
        },
        featureDescription: {
            fontSize: '0.95rem',
            opacity: 0.85,
            lineHeight: 1.6
        },
        featureButton: {
            marginTop: '1.5rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(59, 130, 246, 0.6)',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        statusBadge: {
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            padding: '0.4rem 0.8rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            background: 'rgba(34, 197, 94, 0.2)',
            color: '#4ade80',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
        },
        foundersSection: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '8rem 2rem 5rem',
            textAlign: 'center'
        },
        sectionTitle: {
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
        },
        sectionSubtitle: {
            fontSize: '1.25rem',
            opacity: 0.9,
            marginBottom: '4rem'
        },
        foundersGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        founderCard: {
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1.5rem',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'left'
        },
        founderImagePlaceholder: {
            width: '100%',
            height: '320px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
            borderRadius: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem'
        },
        founderName: {
            fontSize: '1.75rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
        },
        founderRole: {
            fontSize: '1.125rem',
            opacity: 0.9,
            marginBottom: '1rem'
        },
        founderBio: {
            fontSize: '0.95rem',
            opacity: 0.85,
            lineHeight: 1.6,
            fontStyle: 'italic'
        },
        footer: {
            textAlign: 'center',
            padding: '2rem',
            opacity: 0.8,
            borderTop: '1px solid rgba(255,255,255,0.1)'
        }
    };

    return (
        <div style={styles.container}>
            <style>
                {`
                    @keyframes blink {
                        0%, 50% { opacity: 1; }
                        51%, 100% { opacity: 0; }
                    }
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
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
                    @keyframes fadeInDown {
                        from {
                            opacity: 0;
                            transform: translateY(-30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
            </style>
            {/* Header/Nav */}
            <header style={styles.header}>
                <div style={styles.logo}>FiveAI 🔥</div>
                <nav style={styles.nav}>
                    <a 
                        style={styles.navLink}
                        onMouseOver={(e) => e.target.style.opacity = '1'}
                        onMouseOut={(e) => e.target.style.opacity = '0.9'}
                        onClick={() => setShowFounders(!showFounders)}
                    >
                        {showFounders ? 'Home' : 'About Us'}
                    </a>
                    <a 
                        style={styles.navLink}
                        onMouseOver={(e) => e.target.style.opacity = '1'}
                        onMouseOut={(e) => e.target.style.opacity = '0.9'}
                    >
                    </a>
                </nav>
            </header>

            {!showFounders ? (
                <>
                    {/* Hero Section */}
                    <section style={styles.heroSection}>
                        <div style={styles.heroContent}>
                            <h1 style={styles.heroTitle}>
                                AI that studies you
                            </h1>
                            <p style={styles.heroSubtitle}>
                                {typingText}
                                <span style={styles.cursor}></span>
                            </p>
                            <p style={styles.heroDescription}>
                                Get instant feedback, track your progress, and achieve your academic goals 
                                with our intelligent learning platform designed specifically for AP students.
                            </p>
                            
                            <div style={styles.ctaContainer}>
                                <button
                                    style={styles.btnPrimary}
                                    onClick={handleGetStarted}
                                    onMouseOver={(e) => {
                                        e.target.style.transform = 'translateY(-2px) scale(1.05)';
                                        e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = 'translateY(0) scale(1)';
                                        e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                    }}
                                >
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section style={styles.featuresSection}>
                        <div 
                            style={{...styles.featureCard, animationDelay: '0.2s'}}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={styles.statusBadge}>
                                <span style={{fontSize: '0.6rem'}}>●</span> Live
                            </div>
                            <div style={styles.featureIcon}>🎯</div>
                            <h3 style={styles.featureTitle}>Personalized Learning</h3>
                            <p style={styles.featureDescription}>
                                Our AI adapts to your unique learning style and pace, creating 
                                a customized experience that maximizes your potential.
                            </p>
                            <button 
                                style={styles.featureButton}
                                onMouseOver={(e) => {
                                    e.target.style.background = 'rgba(59, 130, 246, 0.8)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = 'rgba(59, 130, 246, 0.6)';
                                }}
                            >
                                Start Learning <span>→</span>
                            </button>
                        </div>

                        <div 
                            style={{...styles.featureCard, animationDelay: '0.4s'}}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={styles.statusBadge}>
                                <span style={{fontSize: '0.6rem'}}>●</span> Live
                            </div>
                            <div style={styles.featureIcon}>📊</div>
                            <h3 style={styles.featureTitle}>Track Progress</h3>
                            <p style={styles.featureDescription}>
                                Monitor your improvement with detailed analytics and insights 
                                that help you understand your strengths and areas for growth.
                            </p>
                            <button 
                                style={styles.featureButton}
                                onMouseOver={(e) => {
                                    e.target.style.background = 'rgba(59, 130, 246, 0.8)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = 'rgba(59, 130, 246, 0.6)';
                                }}
                            >
                                View Analytics <span>→</span>
                            </button>
                        </div>

                        <div 
                            style={{...styles.featureCard, animationDelay: '0.6s'}}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={styles.statusBadge}>
                                <span style={{fontSize: '0.6rem'}}>●</span> Live
                            </div>
                            <div style={styles.featureIcon}>⚡</div>
                            <h3 style={styles.featureTitle}>Instant Feedback</h3>
                            <p style={styles.featureDescription}>
                                Get immediate, detailed explanations and corrections to help you 
                                learn from mistakes and improve faster.
                            </p>
                            <button 
                                style={styles.featureButton}
                                onMouseOver={(e) => {
                                    e.target.style.background = 'rgba(59, 130, 246, 0.8)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = 'rgba(59, 130, 246, 0.6)';
                                }}
                            >
                                Try It Now <span>→</span>
                            </button>
                        </div>
                    </section>
                </>
            ) : (
                /* Founders Section */
                <section style={styles.foundersSection}>
                    <h2 style={styles.sectionTitle}>Meet the Founders</h2>
                    <p style={styles.sectionSubtitle}>
                        Three passionate students building the future of AI-powered education
                    </p>

                    <div style={styles.foundersGrid}>
                        {/* Vaidehi Akbari */}
                        <div style={styles.founderCard}>
                            <div style={styles.founderImagePlaceholder}>
                                👩‍💻
                            </div>
                            <h3 style={styles.founderName}>Vaidehi Akbari</h3>
                            <p style={styles.founderRole}>Founder</p>
                            <p style={styles.founderBio}>
                                "Hi! I'm Vaidehi Akbari, and I'm proud to be part of SVS. I enjoy 
                                coding with Python and Unity, and helped build DigiMenu, a digital 
                                ordering platform. I've participated in and won several hackathons, 
                                and attended the 2025 GPU Tech Conference. I also practice taekwondo 
                                and serve as vice president of Girls Who Code at my school. I'm 
                                especially interested in machine learning and love combining creativity 
                                with technology!"
                            </p>
                        </div>

                        {/* Sanjana Gowda */}
                        <div style={styles.founderCard}>
                            <div style={styles.founderImagePlaceholder}>
                                👩‍💼
                            </div>
                            <h3 style={styles.founderName}>Sanjana Gowda</h3>
                            <p style={styles.founderRole}>Founder</p>
                            <p style={styles.founderBio}>
                                "Hi! I'm Sanjana Gowda, and I'm thrilled to be part of SVS. I've been 
                                coding in Python, JavaScript, HTML, and CSS for over four years, building 
                                apps like my school's bell schedule and winning multiple hackathons. In 
                                Summer 2025, I attended COSMOS at UC Davis in Cluster 12 for Machine 
                                Learning, which fueled my passion for AI as a rapidly growing field. I'm 
                                also a swimmer, co-president of Girls Who Code, and excited to inspire 
                                young coders through SVS!"
                            </p>
                        </div>

                        {/* Shely Jain */}
                        <div style={styles.founderCard}>
                            <div style={styles.founderImagePlaceholder}>
                                👩‍🔬
                            </div>
                            <h3 style={styles.founderName}>Shely Jain</h3>
                            <p style={styles.founderRole}>Founder</p>
                            <p style={styles.founderBio}>
                                "Hi! I'm Shely Jain, and I'm excited to be part of SVS. I've been coding 
                                for three years and love working with Python, especially in AI and machine 
                                learning. I helped build my school's bell schedule app, won multiple 
                                hackathons, and attended the 2025 GPU Tech Conference. I'm also a volleyball 
                                player and co-president of Girls Who Code. I can't wait to help others grow 
                                their passion for coding!"
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer style={styles.footer}>
                <p>© 2025 FiveAI. Ready to ace your AP exams? Let's get started!</p>
            </footer>
        </div>
    );
}