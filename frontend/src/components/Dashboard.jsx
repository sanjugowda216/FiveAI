import React from "react";

export default function Dashboard({
  selectedCourse,
  onStartPractice,
  onSelectCourse,
}) {
  const hasCourseSelected = Boolean(selectedCourse);

  return (
    <section style={styles.wrapper}>
      <h1 style={styles.heading}>Welcome to FiveAI 🔥</h1>
      <p style={styles.subheading}>
        {hasCourseSelected
          ? `You're currently set to ${selectedCourse}.`
          : "Pick a course to personalize your practice sessions."}
      </p>

      <div style={styles.ctaRow}>
        <button style={styles.secondaryCta} onClick={onSelectCourse}>
          Browse AP Courses
        </button>
        <button
          style={{
            ...styles.primaryCta,
            ...(hasCourseSelected ? {} : styles.disabledCta),
          }}
          onClick={onStartPractice}
          disabled={!hasCourseSelected}
        >
          Start Practice
        </button>
      </div>

      <div style={styles.tips}>
        <p style={styles.tipTitle}>Quick tips</p>
        <ul style={styles.tipList}>
          <li>Review your streaks and accuracy under “My Stats”.</li>
          <li>Switch courses any time from the AP Courses tab.</li>
          <li>
            New to FiveAI? Start with a few warm-up questions to get calibrated.
          </li>
        </ul>
      </div>
    </section>
  );
}

const styles = {
  wrapper: {
    backgroundColor: "#F3F4F6",
    borderRadius: "1.25rem",
    padding: "2.75rem 3rem",
    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
    width: "100%",
    maxWidth: "960px",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  heading: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: "0.5rem",
  },
  subheading: {
    fontSize: "1.1rem",
    color: "#334155",
    marginBottom: "1.5rem",
  },
  ctaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "2rem",
  },
  primaryCta: {
    padding: "0.85rem 1.75rem",
    backgroundColor: "#0078C8",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "0.75rem",
    fontWeight: 700,
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  secondaryCta: {
    padding: "0.85rem 1.75rem",
    backgroundColor: "#E2E8F0",
    color: "#0F172A",
    border: "none",
    borderRadius: "0.75rem",
    fontWeight: 600,
    fontSize: "1rem",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  },
  disabledCta: {
    backgroundColor: "#94A3B8",
    cursor: "not-allowed",
    opacity: 0.7,
  },
  tips: {
    backgroundColor: "#FFFFFF",
    borderRadius: "0.75rem",
    padding: "1.5rem",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
  },
  tipTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#0F172A",
    marginBottom: "0.75rem",
  },
  tipList: {
    margin: 0,
    paddingLeft: "1.25rem",
    color: "#475569",
    lineHeight: 1.7,
  },
};
