import React from "react";

export default function Dashboard({ selectedCourse, onStartPractice }) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to FiveAI 🔥</h1>
        <p style={styles.courseText}>
          Your selected AP course: <strong>{selectedCourse}</strong>
        </p>
        <button style={styles.button} onClick={onStartPractice}>
          Start Practice
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0078C8", // blue background
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: "2rem",
    borderRadius: "1rem",
    width: "400px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    color: "#000000",
  },
  courseText: {
    fontSize: "1.2rem",
    marginBottom: "2rem",
    color: "#000000",
  },
  button: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#0078C8",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "0.5rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
