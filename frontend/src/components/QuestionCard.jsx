import React, { useState, useEffect } from 'react';

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onNext,
  onPrevious,
  onBackToUnits,
  canGoNext,
  canGoPrevious,
  courseId
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setSubmitted(false);
    setShowExplanation(false);
  }, [question.id, questionNumber]);

  const handleAnswerSelect = (answer) => {
    if (!submitted) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      setSubmitted(true);
      setShowExplanation(true);
      
      // Track stats for this question
      if (courseId) {
        trackQuestionStats(courseId, selectedAnswer === question.correctAnswer);
      }
    }
  };

  const trackQuestionStats = (courseId, isCorrect) => {
    try {
      // Get existing stats
      const existingStats = JSON.parse(localStorage.getItem('mcqStats') || '{}');
      
      // Initialize course stats if not exists
      if (!existingStats[courseId]) {
        existingStats[courseId] = {
          totalQuestions: 0,
          correct: 0,
          recentScores: [],
          sessions: []
        };
      }
      
      // Update stats
      existingStats[courseId].totalQuestions += 1;
      if (isCorrect) {
        existingStats[courseId].correct += 1;
      }
      
      // Add to recent scores (keep last 20)
      const currentScore = isCorrect ? 100 : 0;
      existingStats[courseId].recentScores.push(currentScore);
      if (existingStats[courseId].recentScores.length > 20) {
        existingStats[courseId].recentScores.shift();
      }
      
      // Save back to localStorage
      localStorage.setItem('mcqStats', JSON.stringify(existingStats));
      
      console.log('Updated MCQ stats for', courseId, ':', existingStats[courseId]);
    } catch (error) {
      console.error('Error tracking question stats:', error);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPrevious();
    }
  };

  const isCorrect = submitted && selectedAnswer === question.correctAnswer;

  if (!question) {
    return (
      <div style={styles.container}>
        <p style={styles.errorText}>No question data available</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.progress}>
          <span style={styles.progressText}>
            Question {questionNumber} of {totalQuestions}
          </span>
        </div>
      </div>

      <div style={styles.questionContainer}>
        <h2 style={styles.questionText}>{question.question}</h2>

        <div style={styles.optionsContainer}>
          {question.options.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
            const isSelected = selectedAnswer === optionLetter;
            const isCorrectOption = optionLetter === question.correctAnswer;
            
            let optionStyle = styles.option;
            if (submitted) {
              if (isCorrectOption) {
                optionStyle = { ...optionStyle, ...styles.correctOption };
              } else if (isSelected && !isCorrectOption) {
                optionStyle = { ...optionStyle, ...styles.incorrectOption };
              } else {
                optionStyle = { ...optionStyle, ...styles.disabledOption };
              }
            } else if (isSelected) {
              optionStyle = { ...optionStyle, ...styles.selectedOption };
            }

            return (
              <div
                key={index}
                style={optionStyle}
                onClick={() => handleAnswerSelect(optionLetter)}
              >
                <span style={styles.optionLetter}>{optionLetter}.</span>
                <span style={styles.optionText}>{option}</span>
              </div>
            );
          })}
        </div>

        {!submitted && (
          <button
            style={{
              ...styles.submitButton,
              ...(selectedAnswer ? {} : styles.disabledSubmitButton)
            }}
            onClick={handleSubmit}
            disabled={!selectedAnswer}
          >
            Submit Answer
          </button>
        )}

        {submitted && (
          <div style={styles.resultContainer}>
            <div style={styles.resultHeader}>
              <span style={{
                ...styles.resultText,
                ...(isCorrect ? styles.correctResult : styles.incorrectResult)
              }}>
                {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
              </span>
            </div>

            {showExplanation && (
              <div style={styles.explanationContainer}>
                <h4 style={styles.explanationTitle}>Explanation:</h4>
                <p style={styles.explanationText}>{question.explanation}</p>
              </div>
            )}

            <div style={styles.navigationContainer}>
              <button
                style={{
                  ...styles.navButton,
                  ...styles.secondaryButton,
                  ...(!canGoPrevious ? styles.disabledButton : {})
                }}
                onClick={handlePrevious}
                disabled={!canGoPrevious}
              >
                Previous
              </button>

              <button
                style={{
                  ...styles.navButton,
                  ...styles.primaryButton,
                  ...(!canGoNext ? styles.disabledButton : {})
                }}
                onClick={handleNext}
                disabled={!canGoNext}
              >
                {canGoNext ? 'Next Question' : 'Finish'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <button style={styles.backButton} onClick={onBackToUnits}>
          ← Back to Units
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: "1rem",
    padding: "2rem",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.1)",
    marginBottom: "1.5rem",
  },
  header: {
    marginBottom: "1.5rem",
  },
  progress: {
    textAlign: "center",
  },
  progressText: {
    fontSize: "0.9rem",
    color: "#64748B",
    fontWeight: 600,
  },
  questionContainer: {
    marginBottom: "1.5rem",
  },
  questionText: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#0F172A",
    margin: "0 0 1.5rem 0",
    lineHeight: 1.6,
  },
  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  },
  option: {
    display: "flex",
    alignItems: "flex-start",
    padding: "1rem",
    border: "2px solid #E2E8F0",
    borderRadius: "0.75rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: "#FFFFFF",
  },
  selectedOption: {
    borderColor: "#0078C8",
    backgroundColor: "#F0F9FF",
  },
  correctOption: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
  },
  incorrectOption: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  disabledOption: {
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    cursor: "not-allowed",
    opacity: 0.7,
  },
  optionLetter: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#475569",
    marginRight: "0.75rem",
    minWidth: "1.5rem",
  },
  optionText: {
    fontSize: "1rem",
    color: "#0F172A",
    lineHeight: 1.5,
    flex: 1,
  },
  submitButton: {
    width: "100%",
    padding: "0.875rem 1.5rem",
    backgroundColor: "#0078C8",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "0.75rem",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  disabledSubmitButton: {
    backgroundColor: "#94A3B8",
    cursor: "not-allowed",
  },
  resultContainer: {
    marginTop: "1.5rem",
  },
  resultHeader: {
    textAlign: "center",
    marginBottom: "1rem",
  },
  resultText: {
    fontSize: "1.25rem",
    fontWeight: 700,
  },
  correctResult: {
    color: "#16A34A",
  },
  incorrectResult: {
    color: "#DC2626",
  },
  explanationContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: "0.75rem",
    padding: "1.25rem",
    marginBottom: "1.5rem",
  },
  explanationTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#0F172A",
    margin: "0 0 0.5rem 0",
  },
  explanationText: {
    fontSize: "0.95rem",
    color: "#475569",
    margin: 0,
    lineHeight: 1.6,
  },
  navigationContainer: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
  },
  navButton: {
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "0.75rem",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  primaryButton: {
    backgroundColor: "#0078C8",
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "#E2E8F0",
    color: "#0F172A",
  },
  disabledButton: {
    backgroundColor: "#94A3B8",
    color: "#FFFFFF",
    cursor: "not-allowed",
    opacity: 0.7,
  },
  footer: {
    borderTop: "1px solid #E2E8F0",
    paddingTop: "1rem",
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#64748B",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "underline",
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    fontSize: "1rem",
  },
};