import React from "react";
import APCourse from "../components/APCourse";

export default function Courses({ selectedCourse, onSelectCourse }) {
  return (
    <section style={styles.wrapper}>
      <div style={styles.header}>
        <h1 style={styles.title}>AP Courses</h1>
        <p style={styles.subtitle}>
          {selectedCourse
            ? `Currently focusing on ${selectedCourse}. Pick another course to switch.`
            : "Select an AP subject to tailor practice questions for that topic."}
        </p>
      </div>
      <APCourse onSelectCourse={onSelectCourse} />
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
};
