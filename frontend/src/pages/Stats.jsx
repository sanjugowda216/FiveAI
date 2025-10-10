import React from "react";

export default function Stats() {
  return (
    <section style={styles.wrapper}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Stats</h1>
        <p style={styles.subtitle}>
          Track your streaks, accuracy, and progress once practice sessions go
          live. Charts and insights will appear here.
        </p>
      </div>

      <div style={styles.placeholderCard}>
        <p style={styles.placeholderTitle}>Coming soon</p>
        <ul style={styles.placeholderList}>
          <li>Question accuracy over time</li>
          <li>Topic mastery heatmaps</li>
          <li>Confidence tracking and study streaks</li>
        </ul>
      </div>
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
