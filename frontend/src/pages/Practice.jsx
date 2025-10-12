import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCourseById } from "../data/apCourses";
import { getUnitsForCourse, getQuestionsForUnit } from "../utils/api";
import QuestionCard from "../components/QuestionCard";

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

  // Debug logging
  console.log('Practice component debug:', {
    courseId,
    courseFromRoute,
    selectedCourse,
    activeCourse,
    courseName
  });

  // State for unit selection and questions
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    if (!courseFromRoute || !onEnsureCourseSelection) return;
    if (selectedCourseId === routeCourseId) return;
    onEnsureCourseSelection(courseFromRoute);
  }, [courseFromRoute, onEnsureCourseSelection, selectedCourseId, routeCourseId]);

  // Load units when course is available
  useEffect(() => {
    if (activeCourse?.id) {
      console.log('Loading units for course:', activeCourse.id);
      loadUnits();
    } else {
      console.log('No active course found, not loading units');
    }
  }, [activeCourse?.id]);

  const loadUnits = async () => {
    if (!activeCourse?.id) {
      console.log('No active course ID found');
      return;
    }
    
    console.log('Loading units for course:', activeCourse.id);
    setLoading(true);
    setError(null);
    
    try {
      const response = await getUnitsForCourse(activeCourse.id);
      setUnits(response.units || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load units:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnitSelect = async (unit) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getQuestionsForUnit(activeCourse.id, unit.number);
      setQuestions(response.questions || []);
      setSelectedUnit(unit);
      setCurrentQuestionIndex(0);
      setShowQuestions(true);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToUnits = () => {
    setShowQuestions(false);
    setSelectedUnit(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (!activeCourse) {
    return (
      <section style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>Practice Hub</h1>
          <p style={styles.subtitle}>
            Pick a course before jumping into practice. Head to AP Courses to get
            set up, or open a course workspace to start.
          </p>
        </div>
        <div style={styles.buttonRow}>
          <button style={styles.secondaryButton} onClick={onBackToDashboard}>
            Back to Dashboard
          </button>
        </div>
      </section>
    );
  }

  if (showQuestions && questions.length > 0) {
    return (
      <section style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>{courseName} - Unit {selectedUnit.number}</h1>
          <p style={styles.subtitle}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        <QuestionCard
          question={questions[currentQuestionIndex]}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          onNext={handleNextQuestion}
          onPrevious={handlePreviousQuestion}
          onBackToUnits={handleBackToUnits}
          canGoNext={currentQuestionIndex < questions.length - 1}
          canGoPrevious={currentQuestionIndex > 0}
        />
      </section>
    );
  }

  return (
    <section style={styles.wrapper}>
      <div style={styles.header}>
        <h1 style={styles.title}>Practice Hub</h1>
        <p style={styles.subtitle}>
          Choose a unit to practice with AI-generated questions for <strong>{courseName}</strong>.
        </p>
      </div>

      {loading && (
        <div style={styles.loadingContainer}>
          <p style={styles.loadingText}>Loading units...</p>
        </div>
      )}

      {error && (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
          <button style={styles.retryButton} onClick={loadUnits}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && units.length > 0 && (
        <div style={styles.unitsGrid}>
          {units.map((unit) => (
            <div
              key={unit.number}
              style={styles.unitCard}
              onClick={() => handleUnitSelect(unit)}
            >
              <h3 style={styles.unitTitle}>Unit {unit.number}</h3>
              <p style={styles.unitSubtitle}>{unit.title}</p>
              <div style={styles.unitStatus}>
                <span style={{
                  ...styles.statusBadge,
                  ...(unit.hasQuestions ? styles.statusAvailable : styles.statusPending)
                }}>
                  {unit.hasQuestions ? 'Questions Ready' : 'Generate Questions'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && units.length === 0 && (
        <div style={styles.noUnitsContainer}>
          <p style={styles.noUnitsText}>
            No units found for this course. Please ensure the CED PDF is placed in the backend.
          </p>
        </div>
      )}

      <div style={styles.buttonRow}>
        <button style={styles.secondaryButton} onClick={onBackToDashboard}>
          Back to Dashboard
        </button>
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
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
  },
  loadingText: {
    fontSize: "1.1rem",
    color: "#64748B",
    margin: 0,
  },
  errorContainer: {
    backgroundColor: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: "0.75rem",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  errorText: {
    color: "#DC2626",
    margin: "0 0 1rem 0",
    fontSize: "1rem",
  },
  retryButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#DC2626",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "0.5rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  unitsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  unitCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: "1rem",
    padding: "1.5rem",
    border: "2px solid transparent",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
  },
  unitTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#0F172A",
    margin: "0 0 0.5rem 0",
  },
  unitSubtitle: {
    fontSize: "0.95rem",
    color: "#64748B",
    margin: "0 0 1rem 0",
  },
  unitStatus: {
    display: "flex",
    justifyContent: "flex-end",
  },
  statusBadge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "1rem",
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  statusAvailable: {
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  noUnitsContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: "0.75rem",
    padding: "2rem",
    textAlign: "center",
    marginBottom: "1.5rem",
  },
  noUnitsText: {
    color: "#64748B",
    margin: 0,
    fontSize: "1rem",
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
