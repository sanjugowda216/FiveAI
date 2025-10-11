import React, { useMemo, useState } from "react";
import APCourse from "../components/APCourse";
import { apCourses } from "../data/apCourses";

export default function Courses({ selectedCourse, onSelectCourse }) {
  const selectedCourseName = selectedCourse?.name ?? "";
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = useMemo(() => {
    const trimmed = searchTerm.trim().toLowerCase();
    if (!trimmed) return apCourses;
    return apCourses.filter((course) => {
      const haystacks = [
        course.name,
        course.subject,
        ...(course.aliases ?? []),
      ]
        .filter(Boolean)
        .map((text) => text.toLowerCase());
      return haystacks.some((text) => text.includes(trimmed));
    });
  }, [searchTerm]);

  return (
    <section style={styles.wrapper}>
      <div style={styles.header}>
        <h1 style={styles.title}>AP Courses</h1>
        <p style={styles.subtitle}>
          {selectedCourseName
            ? `Currently focusing on ${selectedCourseName}. Pick another course to switch.`
            : "Select an AP subject to tailor practice questions for that topic."}
        </p>
      </div>
      <div style={styles.searchRow}>
        <input
          type="search"
          placeholder="Search AP courses…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
          aria-label="Search AP courses"
        />
        {searchTerm && (
          <button style={styles.clearButton} onClick={() => setSearchTerm("")}>
            Clear
          </button>
        )}
      </div>
      <p style={styles.resultMeta}>
        Showing {filteredCourses.length} course{filteredCourses.length === 1 ? "" : "s"}
      </p>
      <APCourse
        selectedCourseId={selectedCourse?.id}
        onSelectCourse={onSelectCourse}
        courses={filteredCourses}
      />
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
  searchRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "0.75rem",
  },
  searchInput: {
    flex: 1,
    padding: "0.75rem 1rem",
    borderRadius: "0.75rem",
    border: "1px solid rgba(15,23,42,0.12)",
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box",
  },
  clearButton: {
    padding: "0.55rem 1rem",
    borderRadius: "0.65rem",
    border: "1px solid rgba(15,23,42,0.12)",
    backgroundColor: "#F8FAFC",
    color: "#475569",
    fontWeight: 600,
    cursor: "pointer",
  },
  resultMeta: {
    fontSize: "0.95rem",
    color: "#6B7280",
    margin: "0 0 1.5rem",
  },
};
