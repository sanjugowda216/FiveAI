import React from "react";
import { apCourses } from "../data/apCourses";

const featuredCourses = apCourses.slice(0, 4);

export default function Dashboard({
  userEmail,
  selectedCourse,
  onStartPractice,
  onBrowseCourses,
  onOpenCourse,
}) {
  const hasCourseSelected = Boolean(selectedCourse?.id);
  const selectedCourseName = selectedCourse?.name ?? "an AP course";

  return (
    <section style={styles.wrapper}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.heading}>
            {userEmail ? `Welcome back, ${userEmail}!` : "Welcome to FiveAI 🔥"}
          </h1>
          <p style={styles.subheading}>
            {hasCourseSelected
              ? `You're currently locked in on ${selectedCourseName}.`
              : "Pick a course to personalize your FiveAI practice journey."}
          </p>
        </div>
        <button style={styles.secondaryCta} onClick={onBrowseCourses}>
          Browse All AP Courses
        </button>
      </header>

      <div style={styles.callout}>
        <div>
          <p style={styles.calloutTitle}>Jump back in</p>
          <p style={styles.calloutBody}>
            {hasCourseSelected
              ? `Spin up a new practice set for ${selectedCourseName} right away.`
              : "Select a course to unlock adaptive MCQs and rubric-aligned FRQs."}
          </p>
        </div>
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

      <section>
        <p style={styles.featureTitle}>Popular AP Tracks</p>
        <div style={styles.featureGrid}>
          {featuredCourses.map((course) => (
            <button
              key={course.id}
              type="button"
              style={styles.featureCard}
              onClick={() => onOpenCourse?.(course)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow =
                  "0 14px 32px rgba(15, 23, 42, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = styles.featureCard.boxShadow;
              }}
            >
              <p style={styles.cardLabel}>{course.name}</p>
              <span style={styles.cardPill}>{course.subject}</span>
            </button>
          ))}
        </div>
      </section>

      <div style={styles.tips}>
        <p style={styles.tipTitle}>Roadmap</p>
        <ul style={styles.tipList}>
          <li>Review growth in “My Stats” after each practice session.</li>
          <li>
            Submit essays or upload FRQs in the Course Options workspace for AI
            feedback (coming soon).
          </li>
          <li>
            Switching subjects? FiveAI saves your progress per course
            automatically.
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
    display: "flex",
    flexDirection: "column",
    gap: "2.5rem",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  heading: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#0F172A",
    margin: 0,
  },
  subheading: {
    fontSize: "1.1rem",
    color: "#334155",
    marginTop: "0.25rem",
    marginBottom: 0,
  },
  callout: {
    backgroundColor: "#FFFFFF",
    borderRadius: "1rem",
    padding: "1.75rem",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1.5rem",
  },
  calloutTitle: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#475569",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  calloutBody: {
    fontSize: "1.05rem",
    color: "#0F172A",
    marginTop: "0.5rem",
    marginBottom: 0,
    maxWidth: "560px",
    lineHeight: 1.6,
  },
  primaryCta: {
    padding: "0.9rem 1.9rem",
    backgroundColor: "#0078C8",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "0.85rem",
    fontWeight: 700,
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  secondaryCta: {
    padding: "0.85rem 1.5rem",
    backgroundColor: "#E2E8F0",
    color: "#0F172A",
    border: "none",
    borderRadius: "0.85rem",
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
  featureTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#475569",
    marginBottom: "1rem",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.25rem",
  },
  featureCard: {
    padding: "1.5rem",
    borderRadius: "1rem",
    border: "1px solid rgba(15,23,42,0.08)",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.75rem",
    cursor: "pointer",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
  },
  cardLabel: {
    margin: 0,
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#0F172A",
  },
  cardPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.35rem 0.75rem",
    borderRadius: "999px",
    backgroundColor: "#EFF6FF",
    color: "#1D4ED8",
    fontSize: "0.85rem",
    fontWeight: 600,
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
