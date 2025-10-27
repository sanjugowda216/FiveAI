import React, { useState, useEffect } from "react";
import { apCourses } from "../data/apCourses.js";

export default function Stats({ stats, userProfile }) {
  const [courseStats, setCourseStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  const isLoggedIn = userProfile && userProfile.uid;

  // Get real stats from localStorage and API
  useEffect(() => {
    const loadRealStats = async () => {
      const realStats = {};
      
      // Check localStorage for MCQ practice data
      const mcqData = JSON.parse(localStorage.getItem('mcqStats') || '{}');
      
      // Check localStorage for FRQ submission data  
      const frqData = JSON.parse(localStorage.getItem('frqSubmissions') || '{}');
      
      // Process each course to see if there's any activity
      apCourses.forEach(course => {
        const courseId = course.id;
        const hasMcqData = mcqData[courseId] && (
          mcqData[courseId].totalQuestions > 0 || 
          mcqData[courseId].correct > 0 ||
          mcqData[courseId].sessions?.length > 0
        );
        
        const hasFrqData = frqData[courseId] && frqData[courseId].length > 0;
        
        // Only add course if there's actual activity
        if (hasMcqData || hasFrqData) {
          realStats[courseId] = {
            courseName: course.name,
            subject: course.subject,
            mcqStats: hasMcqData ? {
              totalQuestions: mcqData[courseId].totalQuestions || 0,
              correct: mcqData[courseId].correct || 0,
              averageScore: mcqData[courseId].totalQuestions > 0 
                ? Math.round((mcqData[courseId].correct / mcqData[courseId].totalQuestions) * 100 * 10) / 10
                : 0,
              recentScores: mcqData[courseId].recentScores || [],
              sessions: mcqData[courseId].sessions || []
            } : null,
            frqStats: hasFrqData ? {
              totalSubmissions: frqData[courseId].length,
              submissions: frqData[courseId],
              averageScore: frqData[courseId].length > 0 
                ? Math.round(frqData[courseId].reduce((sum, sub) => sum + (sub.grade?.overallScore || 0), 0) / frqData[courseId].length * 10) / 10
                : 0,
              maxScore: 7
            } : null
          };
        }
      });
      
      setTimeout(() => {
        setCourseStats(realStats);
        setLoading(false);
      }, 500);
    };
    
    loadRealStats();
  }, []);

  const calculatePredictedScore = (courseId) => {
    const stats = courseStats[courseId];
    if (!stats) return null;
    
    let mcqWeight = 0;
    let frqWeight = 0;
    
    if (stats.mcqStats && stats.mcqStats.totalQuestions > 0) {
      mcqWeight = stats.mcqStats.averageScore / 100; // Convert percentage to 0-1
    }
    
    if (stats.frqStats && stats.frqStats.totalSubmissions > 0) {
      frqWeight = stats.frqStats.averageScore / 7; // Convert 1-7 to 0-1
    }
    
    if (mcqWeight === 0 && frqWeight === 0) return null;
    
    // Weighted average: 60% MCQ, 40% FRQ
    const combinedScore = (mcqWeight * 0.6 + frqWeight * 0.4);
    
    // Convert to 1-5 AP scale
    return Math.round(combinedScore * 4 + 1);
  };

  const getScoreColor = (score, maxScore = 5) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "#10B981"; // Green
    if (percentage >= 60) return "#F59E0B"; // Yellow
    if (percentage >= 40) return "#EF4444"; // Red
    return "#6B7280"; // Gray
  };

  const getPerformanceLevel = (score, maxScore = 5) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "Exemplary";
    if (percentage >= 60) return "Proficient";
    if (percentage >= 40) return "Developing";
    return "Needs Improvement";
  };

  if (loading) {
    return (
      <section style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Stats</h1>
          <p style={styles.subtitle}>Loading your performance data...</p>
        </div>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
        </div>
      </section>
    );
  }

  const coursesWithStats = Object.keys(courseStats);
  
  if (coursesWithStats.length === 0) {
    return (
      <section style={styles.wrapper}>
        {!isLoggedIn && (
          <div style={styles.guestBanner}>
            <div style={styles.guestBannerContent}>
              <span style={styles.guestBannerText}>
                <strong>Login to save your progress!</strong> Your stats are only saved locally while browsing as a guest.
              </span>
              <div style={styles.guestBannerButtons}>
                <a href="/login" style={styles.guestBannerButton}>
                  Login
                </a>
                <button onClick={() => { localStorage.setItem('isGuest', 'true'); window.location.href = '/dashboard'; }} style={styles.guestButton}>
                  Continue as Guest
                </button>
              </div>
            </div>
          </div>
        )}
        <div style={styles.header}>
          <h1 style={styles.title}>My Stats</h1>
          <p style={styles.subtitle}>
            Your performance data will appear here once you start practicing.
          </p>
        </div>
        <div style={styles.placeholderCard}>
          <p style={styles.placeholderTitle}>No data yet</p>
          <p style={styles.placeholderText}>
            Complete some MCQ practice sessions or submit FRQ responses to see your stats.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section style={styles.wrapper}>
      {!isLoggedIn && (
        <div style={styles.guestBanner}>
          <div style={styles.guestBannerContent}>
            <span style={styles.guestBannerText}>
              <strong>Login to save your progress!</strong> Your stats are only saved locally while browsing as a guest.
            </span>
            <div style={styles.guestBannerButtons}>
              <a href="/login" style={styles.guestBannerButton}>
                Login
              </a>
              <button onClick={() => { localStorage.setItem('isGuest', 'true'); window.location.href = '/dashboard'; }} style={styles.guestButton}>
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={styles.header}>
        <h1 style={styles.title}>My Stats</h1>
        <p style={styles.subtitle}>
          Track your progress across AP courses you've practiced on.
        </p>
      </div>

      <div style={styles.coursesContainer}>
        {coursesWithStats.map(courseId => {
          const stats = courseStats[courseId];
          const predictedScore = calculatePredictedScore(courseId);
          
          return (
            <div key={courseId} style={styles.courseCard}>
              <div style={styles.courseHeader}>
                <div>
                  <h3 style={styles.courseTitle}>{stats.courseName}</h3>
                  <p style={styles.courseSubject}>{stats.subject}</p>
                </div>
                <div style={styles.predictedScoreContainer}>
                  <div style={styles.predictedScore}>
                    <span style={styles.predictedScoreValue}>{predictedScore || "N/A"}</span>
                    <span style={styles.predictedScoreLabel}>Predicted Score</span>
                  </div>
                </div>
              </div>

              <div style={styles.statsGrid}>
                {/* MCQ Section */}
                {stats.mcqStats && (
                  <div style={styles.statSection}>
                    <h4 style={styles.sectionTitle}>MCQ Performance</h4>
                    <div style={styles.mcqStats}>
                      <div style={styles.statItem}>
                        <span style={styles.statValue}>{stats.mcqStats.averageScore}%</span>
                        <span style={styles.statLabel}>Average</span>
                      </div>
                      <div style={styles.statItem}>
                        <span style={styles.statValue}>{stats.mcqStats.correct}/{stats.mcqStats.totalQuestions}</span>
                        <span style={styles.statLabel}>Correct</span>
                      </div>
                    </div>
                    
                    {/* MCQ Chart - only show if we have recent scores */}
                    {stats.mcqStats.recentScores && stats.mcqStats.recentScores.length > 0 && (
                      <div style={styles.chartContainer}>
                        <h5 style={styles.chartTitle}>Recent Performance</h5>
                        <div style={styles.lineChart}>
                          {stats.mcqStats.recentScores.slice(-7).map((score, index) => (
                            <div key={index} style={styles.chartBar}>
                              <div 
                                style={{
                                  ...styles.chartBarFill,
                                  height: `${score}%`,
                                  backgroundColor: getScoreColor(score, 100)
                                }}
                              ></div>
                              <span style={styles.chartBarLabel}>{score}%</span>
                            </div>
                          ))}
                        </div>
          </div>
                    )}
          </div>
                )}

                {/* FRQ Section */}
                {stats.frqStats && (
                  <div style={styles.statSection}>
                    <h4 style={styles.sectionTitle}>FRQ Performance</h4>
                    <div style={styles.frqStats}>
                      <div style={styles.statItem}>
                        <span style={styles.statValue}>{stats.frqStats.averageScore}/{stats.frqStats.maxScore}</span>
                        <span style={styles.statLabel}>Average</span>
          </div>
                      <div style={styles.statItem}>
                        <span style={styles.statValue}>{stats.frqStats.totalSubmissions}</span>
                        <span style={styles.statLabel}>Submissions</span>
          </div>
        </div>
                    
                    {/* FRQ Recent Grades */}
                    <div style={styles.recentGrades}>
                      <h5 style={styles.chartTitle}>Recent Grades</h5>
                      {stats.frqStats.submissions.slice(-5).map((submission, index) => (
                        <div key={index} style={styles.gradeItem}>
                          <div style={styles.gradeScore}>
                            <span style={{
                              ...styles.gradeValue,
                              color: getScoreColor(submission.grade?.overallScore || 0, submission.grade?.maxScore || 7)
                            }}>
                              {submission.grade?.overallScore || 0}/{submission.grade?.maxScore || 7}
                            </span>
                            <span style={styles.gradeLevel}>
                              {submission.grade?.performanceLevel || 'Pending'}
                            </span>
                          </div>
                          <span style={styles.gradeDate}>
                            {new Date(submission.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
        </div>
      )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "var(--bg-secondary)",
    borderRadius: "1.25rem",
    padding: "2rem",
    boxShadow: "0 12px 32px var(--shadow-color)",
    boxSizing: "border-box",
    minHeight: "80vh",
    color: "var(--text-primary)",
    transition: "background-color 0.3s ease, color 0.3s ease",
  },
  header: {
    marginBottom: "2rem",
    textAlign: "center",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "0.5rem",
    transition: "color 0.3s ease",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "var(--text-secondary)",
    margin: 0,
    transition: "color 0.3s ease",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid var(--border-color)",
    borderTop: "4px solid #3B82F6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  coursesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    maxHeight: "70vh",
    overflowY: "auto",
    paddingRight: "0.5rem",
  },
  courseCard: {
    backgroundColor: "var(--bg-primary)",
    borderRadius: "1rem",
    padding: "1.5rem",
    boxShadow: "0 4px 12px var(--shadow-color)",
    border: "1px solid var(--border-color)",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },
  courseHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "2px solid var(--border-color)",
    transition: "border-color 0.3s ease",
  },
  courseTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
    transition: "color 0.3s ease",
  },
  courseSubject: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
    margin: "0.25rem 0 0 0",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    transition: "color 0.3s ease",
  },
  predictedScoreContainer: {
    display: "flex",
    alignItems: "center",
  },
  predictedScore: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "var(--bg-secondary)",
    borderRadius: "0.75rem",
    padding: "1rem",
    boxShadow: "0 2px 8px var(--shadow-color)",
    minWidth: "120px",
    border: "1px solid var(--border-color)",
    transition: "all 0.3s ease",
  },
  predictedScoreValue: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#3B82F6",
    margin: 0,
  },
  predictedScoreLabel: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    margin: "0.25rem 0 0 0",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    transition: "color 0.3s ease",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  statSection: {
    backgroundColor: "var(--bg-primary)",
    borderRadius: "0.75rem",
    padding: "1.25rem",
    boxShadow: "0 2px 8px var(--shadow-color)",
    border: "1px solid var(--border-color)",
    transition: "all 0.3s ease",
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "var(--text-primary)",
    margin: "0 0 1rem 0",
    paddingBottom: "0.5rem",
    borderBottom: "1px solid var(--border-color)",
    transition: "color 0.3s ease, border-color 0.3s ease",
  },
  mcqStats: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
  },
  frqStats: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
    transition: "color 0.3s ease",
  },
  statLabel: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    margin: "0.25rem 0 0 0",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    transition: "color 0.3s ease",
  },
  chartContainer: {
    marginTop: "1rem",
  },
  chartTitle: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
    margin: "0 0 0.75rem 0",
    transition: "color 0.3s ease",
  },
  lineChart: {
    display: "flex",
    alignItems: "end",
    gap: "0.5rem",
    height: "120px",
    padding: "0.5rem 0",
  },
  chartBar: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    height: "100%",
  },
  chartBarFill: {
    width: "100%",
    borderRadius: "0.25rem 0.25rem 0 0",
    minHeight: "4px",
    transition: "all 0.3s ease",
  },
  chartBarLabel: {
    fontSize: "0.7rem",
    color: "var(--text-secondary)",
    marginTop: "0.25rem",
    fontWeight: 500,
    transition: "color 0.3s ease",
  },
  recentGrades: {
    marginTop: "1rem",
  },
  gradeItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem",
    backgroundColor: "var(--bg-primary)",
    borderRadius: "0.5rem",
    marginBottom: "0.5rem",
    border: "1px solid var(--border-color)",
    transition: "all 0.3s ease",
  },
  gradeScore: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  gradeValue: {
    fontSize: "1.1rem",
    fontWeight: 700,
    margin: 0,
    color: "var(--text-primary)",
    transition: "color 0.3s ease",
  },
  gradeLevel: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    margin: "0.25rem 0 0 0",
    transition: "color 0.3s ease",
  },
  gradeDate: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    transition: "color 0.3s ease",
  },
  placeholderCard: {
    backgroundColor: "var(--bg-primary)",
    borderRadius: "0.75rem",
    padding: "2rem",
    textAlign: "center",
    border: "1px solid var(--border-color)",
    transition: "all 0.3s ease",
  },
  placeholderTitle: {
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "0.5rem",
    transition: "color 0.3s ease",
  },
  placeholderText: {
    fontSize: "1rem",
    color: "var(--text-secondary)",
    margin: 0,
    transition: "color 0.3s ease",
  },
  guestBanner: {
    backgroundColor: "#FEF3C7",
    border: "2px solid #F59E0B",
    borderRadius: "0.75rem",
    padding: "1rem 1.5rem",
    marginBottom: "2rem",
    transition: "all 0.3s ease",
  },
  guestBannerContent: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  guestBannerText: {
    flex: 1,
    color: "#92400E",
    fontSize: "0.95rem",
  },
  guestBannerButton: {
    backgroundColor: "#F59E0B",
    color: "#fff",
    padding: "0.5rem 1.5rem",
    borderRadius: "0.5rem",
    textDecoration: "none",
    fontWeight: 600,
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
  guestBannerButtons: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
  },
  guestButton: {
    background: "transparent",
    border: "2px solid #F59E0B",
    color: "#F59E0B",
    padding: "0.5rem 1.5rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
};