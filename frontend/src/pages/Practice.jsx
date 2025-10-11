import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCourseById } from "../data/apCourses";

export default function Practice({
  selectedCourse,
  onEnsureCourseSelection,
  onBackToDashboard,
}) {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const courseFromRoute = courseId ? getCourseById(courseId) : null;
  const selectedCourseId = selectedCourse?.id ?? null;
  const routeCourseId = courseFromRoute?.id ?? null;
  const activeCourse = courseFromRoute ?? selectedCourse ?? null;
  const courseName = activeCourse?.name ?? "your AP course";

  useEffect(() => {
    if (!courseFromRoute || !onEnsureCourseSelection) return;
    if (selectedCourseId === routeCourseId) return;
    onEnsureCourseSelection(courseFromRoute);
  }, [courseFromRoute, onEnsureCourseSelection, selectedCourseId, routeCourseId]);

  return (
    <section style={styles.wrapper}>
      <div style={styles.header}>
        <h1 style={styles.title}>Practice Hub</h1>
        {activeCourse ? (
          <p style={styles.subtitle}>
            We are prepping custom question sets for <strong>{courseName}</strong>.
            Choose your mode below, then get feedback in “My Stats”.
          </p>
        ) : (
          <p style={styles.subtitle}>
            Pick a course before jumping into practice. Head to AP Courses to get
            set up, or open a course workspace to start.
          </p>
        )}
      </div>

      <div style={styles.body}>
        <p style={styles.placeholder}>
          The interactive practice experience is on the roadmap. For now, use this
          space to shape what you want to see: timed drills, flashcards, FRQs with
          rubrics, or something else? Drop your wishlist so we can wire up the AI
          flows next.
        </p>

        <div style={styles.buttonRow}>
          <button
            style={{
              ...styles.primaryButton,
              ...(activeCourse ? {} : styles.disabledButton),
            }}
            onClick={() =>
              activeCourse ? navigate(`/course/${activeCourse.id}`) : null
            }
            disabled={!activeCourse}
          >
            Open Course Workspace
          </button>
          <button style={styles.secondaryButton} onClick={onBackToDashboard}>
            Back to Dashboard
          </button>
        </div>
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
  body: {
    backgroundColor: "#F8FAFC",
    borderRadius: "0.75rem",
    padding: "1.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  placeholder: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
  },
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
  },
  primaryButton: {
    alignSelf: "flex-start",
    padding: "0.85rem 1.75rem",
    backgroundColor: "#0078C8",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#CBD5F5",
    color: "#0F172A",
    border: "none",
    borderRadius: "0.75rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  disabledButton: {
    backgroundColor: "#94A3B8",
    cursor: "not-allowed",
    opacity: 0.7,
  },
};
