// frontend/src/components/APCourse.jsx
import React from "react";

export default function APCourse({ onSelectCourse }) {
  // List of AP courses
  const courses = ["AP Calculus", "AP Physics", "AP Biology", "AP Chemistry"];

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        padding: "2rem",
        borderRadius: "1rem",
        width: "350px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        textAlign: "center",
        margin: "2rem auto",
      }}
    >
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#000000", marginBottom: "1rem" }}>
        Choose Your AP Course
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {courses.map((course) => (
          <button
            key={course}
            onClick={() => onSelectCourse(course)}
            style={{
              padding: "0.75rem",
              backgroundColor: "#0078C8",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#005fa3")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#0078C8")}
          >
            {course}
          </button>
        ))}
      </div>
    </div>
  );
}
