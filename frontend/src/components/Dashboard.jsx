import React from "react";
import { apCourses } from "../data/apCourses";

const featuredCourses = apCourses.slice(0, 4);

export default function Dashboard({
  userName,
  userEmail,
  selectedCourse,
  pinnedCourses = [],
  onStartPractice,
  onBrowseCourses,
  onOpenCourse,
}) {
  const hasCourseSelected = Boolean(selectedCourse?.id);
  const selectedCourseName = selectedCourse?.name ?? "an AP course";
  const hasPinnedCourses = pinnedCourses.length > 0;

  return (
    <section style={styles.wrapper}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.heading}>
            {userName ? `Welcome back, ${userName}!` : "Welcome to FiveAI 🔥"}
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

      <section style={styles.pinnedSection}>
        <div style={styles.pinnedHeader}>
          <p style={styles.pinnedEyebrow}>My AP Dashboard</p>
          <p style={styles.pinnedCopy}>
            {hasPinnedCourses
              ? "Quick launch your pinned courses."
              : "Pin courses on the AP Courses page to build your personal list."}
          </p>
        </div>
        {hasPinnedCourses ? (
          <div style={styles.pinnedGrid}>
            {pinnedCourses.map((course) => (
              <button
                key={course.id}
                type="button"
                style={{
                  ...styles.pinnedCard,
                  ...(selectedCourse?.id === course.id
                    ? styles.activePinnedCard
                    : {}),
                }}
                onClick={() => onOpenCourse?.(course)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 14px 32px rgba(15, 23, 42, 0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    selectedCourse?.id === course.id
                      ? styles.activePinnedCard.boxShadow
                      : styles.pinnedCard.boxShadow;
                }}
              >
                <div style={styles.pinnedCardHeader}>
                  <p style={styles.cardLabel}>{course.name}</p>
                  <span style={styles.cardPill}>{course.subject}</span>
                </div>
                <p style={styles.pinnedMeta}>
                  {course.submissionMode === "essay"
                    ? "Typed + image FRQs"
                    : "Image/PDF FRQ uploads"}
                </p>
                <span style={styles.pinnedActionHint}>
                  Open workspace →
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p style={styles.pinnedEmpty}>
            Nothing pinned yet. Use the checkbox on each AP card to add it here.
          </p>
        )}
      </section>

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
  pinnedSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: "1rem",
    padding: "1.75rem",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  pinnedHeader: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  pinnedEyebrow: {
    margin: 0,
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  pinnedCopy: {
    margin: 0,
    fontSize: "1rem",
    color: "#1F2937",
  },
  pinnedGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1rem",
  },
  pinnedCard: {
    position: "relative",
    padding: "1.5rem",
    borderRadius: "1rem",
    border: "1px solid rgba(15,23,42,0.08)",
    backgroundColor: "#F8FAFC",
    boxShadow: "0 6px 16px rgba(15, 23, 42, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "0.65rem",
    textAlign: "left",
    cursor: "pointer",
    transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
  },
  activePinnedCard: {
    borderColor: "#0078C8",
    boxShadow: "0 12px 28px rgba(0,120,200,0.25)",
  },
  pinnedCardHeader: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  pinnedMeta: {
    margin: 0,
    color: "#4B5563",
    fontSize: "0.95rem",
  },
  pinnedActionHint: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#0078C8",
  },
  pinnedEmpty: {
    margin: 0,
    color: "#64748B",
    fontSize: "0.95rem",
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
