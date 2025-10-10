import React from "react";

export default function Stats({ stats }) {
  const safeStats = stats ?? { totalQuestions: 0, correct: 0, streak: 0 };
  const hasActivity =
    safeStats.totalQuestions > 0 ||
    safeStats.correct > 0 ||
    safeStats.streak > 0;
  const accuracy = safeStats.totalQuestions
    ? Math.round((safeStats.correct / safeStats.totalQuestions) * 100)
    : 0;

  return (
    <section style={styles.wrapper}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Stats</h1>
        <p style={styles.subtitle}>
          Track your streaks, accuracy, and progress once practice sessions go
          live. Charts and insights will appear here.
        </p>
      </div>

      {hasActivity ? (
        <div style={styles.statGrid}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Questions</p>
            <p style={styles.statValue}>{safeStats.totalQuestions}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Correct Answers</p>
            <p style={styles.statValue}>{safeStats.correct}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Accuracy</p>
            <p style={styles.statValue}>{accuracy}%</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Current Streak</p>
            <p style={styles.statValue}>{safeStats.streak} 🔥</p>
          </div>
        </div>
      ) : (
        <div style={styles.placeholderCard}>
          <p style={styles.placeholderTitle}>Coming soon</p>
          <ul style={styles.placeholderList}>
            <li>Question accuracy over time</li>
            <li>Topic mastery heatmaps</li>
            <li>Confidence tracking and study streaks</li>
          </ul>
        </div>
      )}
    </section>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    maxWidth: "960px",
    margin: "0 auto",
    backgroundColor: "#FFFFFF",
    borderRadius: "1.25rem",
    padding: "2.75rem 3rem",
    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
    boxSizing: "border-box",
  },
  header: {
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#475569",
    margin: 0,
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1.5rem",
  },
  statCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: "0.75rem",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  statLabel: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  statValue: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: 700,
    color: "#0F172A",
  },
  placeholderCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: "0.75rem",
    padding: "1.75rem",
  },
  placeholderTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: "0.75rem",
  },
  placeholderList: {
    margin: 0,
    paddingLeft: "1.25rem",
    color: "#475569",
    lineHeight: 1.6,
  },
};
