import React, { useMemo } from "react";
import { apCourses } from "../data/apCourses";

const containerStyle = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
};

const headingStyle = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#0F172A",
  margin: 0,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "1rem",
};

const cardWrapperStyle = {
  position: "relative",
};

const subjectSectionStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const subjectHeadingStyle = {
  fontSize: "1.15rem",
  fontWeight: 700,
  color: "#1F2937",
  margin: "0.5rem 0 0",
};

const cardBaseStyle = {
  padding: "1.25rem 1.5rem",
  borderRadius: "0.85rem",
  border: "1px solid rgba(15,23,42,0.08)",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
  backgroundColor: "#FFFFFF",
  cursor: "pointer",
  transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
  gap: "0.45rem",
};

const labelStyle = {
  fontSize: "1rem",
  fontWeight: 700,
  color: "#0F172A",
  margin: 0,
};

const detailStyle = {
  fontSize: "0.9rem",
  color: "#3F4C6B",
  margin: 0,
};

const emptyStateStyle = {
  margin: "0.5rem 0 0",
  color: "#6B7280",
  fontSize: "0.95rem",
};

const favoriteToggleStyle = {
  position: "absolute",
  top: "0.75rem",
  right: "0.75rem",
  width: "1.75rem",
  height: "1.75rem",
  borderRadius: "0.5rem",
  border: "1px solid rgba(15,23,42,0.15)",
  backgroundColor: "#FFFFFF",
  color: "#64748B",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1rem",
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.18s ease",
  boxShadow: "0 6px 12px rgba(15, 23, 42, 0.08)",
  zIndex: 2,
};

const favoriteToggleActiveStyle = {
  borderColor: "#0078C8",
  backgroundColor: "#0078C8",
  color: "#FFFFFF",
  boxShadow: "0 8px 18px rgba(0,120,200,0.35)",
};

const pinnedBadgeStyle = {
  alignSelf: "flex-start",
  padding: "0.25rem 0.6rem",
  borderRadius: "999px",
  backgroundColor: "#E0F2FE",
  color: "#0369A1",
  fontSize: "0.75rem",
  fontWeight: 700,
  marginTop: "0.35rem",
};

const submissionModeLabels = {
  essay: "Typed FRQ or essay response",
  upload: "Image/PDF-based submission",
};

export default function APCourse({
  onSelectCourse,
  selectedCourseId,
  courses = apCourses,
  favoriteCourseIds = [],
  onToggleFavorite,
}) {
  const groupedCourses = useMemo(() => {
    const buckets = new Map();
    const order = [];

    courses.forEach((course) => {
      if (!buckets.has(course.subject)) {
        buckets.set(course.subject, []);
        order.push(course.subject);
      }
      buckets.get(course.subject).push(course);
    });

    return order.map((subject) => ({
      subject,
      courses: buckets
        .get(subject)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [courses]);

  if (!groupedCourses.length) {
    return <p style={emptyStateStyle}>No AP courses match your search yet.</p>;
  }

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Choose Your AP Course</h2>
      {groupedCourses.map(({ subject, courses: subjectCourses }) => (
        <section key={subject} style={subjectSectionStyle}>
          <h3 style={subjectHeadingStyle}>{subject}</h3>
          <div style={gridStyle}>
            {subjectCourses.map((course) => {
              const isActive = course.id === selectedCourseId;
              const isPinned = favoriteCourseIds.includes(course.id);
              const activeShadow = "0 12px 28px rgba(0,120,200,0.25)";
              const pinnedShadow = "0 12px 24px rgba(16,185,129,0.25)";
              const restingShadow = isActive
                ? activeShadow
                : isPinned
                ? pinnedShadow
                : cardBaseStyle.boxShadow;
              const restingBorder = isActive
                ? "#0078C8"
                : isPinned
                ? "#10B981"
                : cardBaseStyle.border;

              return (
                <div key={course.id} style={cardWrapperStyle}>
                  <button
                    type="button"
                    style={{
                      ...cardBaseStyle,
                      borderColor: restingBorder,
                      boxShadow: restingShadow,
                    }}
                    onClick={() => onSelectCourse?.(course)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = isPinned
                        ? "0 16px 32px rgba(16,185,129,0.3)"
                        : "0 14px 32px rgba(15, 23, 42, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = restingShadow;
                    }}
                  >
                    <p style={labelStyle}>{course.name}</p>
                    <p style={detailStyle}>
                      {submissionModeLabels[course.submissionMode] ?? "Mixed-format FRQs"}
                    </p>
                    {isPinned && <span style={pinnedBadgeStyle}>Pinned</span>}
                  </button>
                  <button
                    type="button"
                    aria-label={
                      isPinned
                        ? `Remove ${course.name} from My AP Dashboard`
                        : `Add ${course.name} to My AP Dashboard`
                    }
                    aria-pressed={isPinned}
                    style={{
                      ...favoriteToggleStyle,
                      ...(isPinned ? favoriteToggleActiveStyle : {}),
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleFavorite?.(course);
                    }}
                  >
                    {isPinned ? "✓" : ""}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
