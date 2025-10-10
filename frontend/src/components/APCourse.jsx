// frontend/src/components/APCourse.jsx
import React from "react";

export default function APCourse({ onSelectCourse }) {
  // List of AP courses
  const courses = ["AP Calculus", "AP Physics", "AP Biology", "AP Chemistry"];

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Choose Your AP Course</h2>
      <div style={styles.grid}>
        {courses.map((course) => (
          <button
            key={course}
            onClick={() => onSelectCourse(course)}
            style={styles.card}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0D8ADB")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#0078C8")}
          >
            {course}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  heading: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#0F172A",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
  },
  card: {
    padding: "1rem 1.25rem",
    backgroundColor: "#0078C8",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "0.75rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.2s ease",
    textAlign: "left",
  },
};
