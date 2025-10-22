import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apCourses } from '../data/apCourses';

const PracticeTest = ({ userProfile }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examFormat, setExamFormat] = useState(null);
  const [testQuestions, setTestQuestions] = useState(null);
  const [currentSection, setCurrentSection] = useState('mcq');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [frqAnswers, setFrqAnswers] = useState({});
  const [gradingResults, setGradingResults] = useState(null);
  const [isGrading, setIsGrading] = useState(false);

  const course = apCourses.find(c => c.id === courseId);

  useEffect(() => {
    if (courseId) {
      generatePracticeTest();
    }
  }, [courseId]);

  const generatePracticeTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get exam format
      const formatResponse = await fetch(`http://localhost:5001/api/practice-test/format/${courseId}`);
      if (!formatResponse.ok) {
        throw new Error('Failed to get exam format');
      }
      const format = await formatResponse.json();
      setExamFormat(format);

      // Generate practice test
      const testResponse = await fetch(`http://localhost:5001/api/practice-test/generate/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAuthenticated: true }),
      });

      if (!testResponse.ok) {
        throw new Error('Failed to generate practice test');
      }
      
      const testData = await testResponse.json();
      if (testData.success) {
        setTestQuestions(testData.practiceTest);
      } else {
        throw new Error(testData.message || 'Failed to generate test');
      }
    } catch (err) {
      console.error('Error generating practice test:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startTest = () => {
    // Start with MCQ if available, otherwise start with FRQ
    const hasMCQ = testQuestions?.mcqQuestions?.length > 0;
    setCurrentSection(hasMCQ ? 'mcq' : 'frq');
    setCurrentQuestionIndex(0);
    setTimer(examFormat?.totalTimeMinutes * 60 || 0);
    setTestStarted(true);
  };

  const nextQuestion = () => {
    const mcqCount = testQuestions?.mcqQuestions?.length || 0;
    const frqCount = testQuestions?.frqQuestions?.length || 0;
    
    if (currentSection === 'mcq' && currentQuestionIndex < (mcqCount - 1)) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSection === 'mcq' && frqCount > 0) {
      setCurrentSection('frq');
      setCurrentQuestionIndex(0);
    } else if (currentSection === 'frq' && currentQuestionIndex < (frqCount - 1)) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    const mcqCount = testQuestions?.mcqQuestions?.length || 0;
    const frqCount = testQuestions?.frqQuestions?.length || 0;
    
    if (currentSection === 'frq' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSection === 'frq' && currentQuestionIndex === 0 && mcqCount > 0) {
      setCurrentSection('mcq');
      setCurrentQuestionIndex(mcqCount - 1);
    } else if (currentSection === 'mcq' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMcqAnswerChange = (questionIndex, answer) => {
    setMcqAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleFrqAnswerChange = (questionIndex, answer) => {
    setFrqAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const gradeTest = async () => {
    setIsGrading(true);
    
    try {
      // Calculate MCQ score
      let mcqScore = 0;
      let mcqTotal = 0;
      const mcqResults = [];
      
      if (testQuestions?.mcqQuestions) {
        testQuestions.mcqQuestions.forEach((question, index) => {
          mcqTotal++;
          const userAnswer = mcqAnswers[index];
          const isCorrect = userAnswer === question.correctAnswer;
          if (isCorrect) mcqScore++;
          
          mcqResults.push({
            question: question.question,
            userAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect,
            explanation: question.explanation
          });
        });
      }

      // Calculate FRQ score (simplified - just check if answer exists)
      let frqScore = 0;
      let frqTotal = 0;
      const frqResults = [];
      
      if (testQuestions?.frqQuestions) {
        testQuestions.frqQuestions.forEach((question, index) => {
          frqTotal++;
          const userAnswer = frqAnswers[index];
          const hasAnswer = userAnswer && userAnswer.trim().length > 0;
          if (hasAnswer) frqScore++;
          
          frqResults.push({
            prompt: question.prompt,
            userAnswer: userAnswer || '',
            hasAnswer,
            questionType: question.questionType,
            points: question.points
          });
        });
      }

      // Calculate overall score
      const totalQuestions = mcqTotal + frqTotal;
      const totalCorrect = mcqScore + frqScore;
      const percentage = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

      // Estimate AP score (1-5 scale)
      let estimatedAPScore = 1;
      if (percentage >= 80) estimatedAPScore = 5;
      else if (percentage >= 65) estimatedAPScore = 4;
      else if (percentage >= 50) estimatedAPScore = 3;
      else if (percentage >= 35) estimatedAPScore = 2;

      const results = {
        mcq: {
          score: mcqScore,
          total: mcqTotal,
          percentage: mcqTotal > 0 ? (mcqScore / mcqTotal) * 100 : 0,
          results: mcqResults
        },
        frq: {
          score: frqScore,
          total: frqTotal,
          percentage: frqTotal > 0 ? (frqScore / frqTotal) * 100 : 0,
          results: frqResults
        },
        overall: {
          score: totalCorrect,
          total: totalQuestions,
          percentage,
          estimatedAPScore
        },
        timeUsed: examFormat?.totalTimeMinutes ? (examFormat.totalTimeMinutes * 60 - timer) : 0
      };

      setGradingResults(results);
      
      // Save to stats
      saveTestResultsToStats(results);
      
    } catch (error) {
      console.error('Error grading test:', error);
      alert('Error grading test. Please try again.');
    } finally {
      setIsGrading(false);
    }
  };

  const saveTestResultsToStats = (results) => {
    try {
      const statsKey = `practiceTestStats_${courseId}`;
      const existingStats = JSON.parse(localStorage.getItem(statsKey) || '[]');
      
      const testResult = {
        timestamp: new Date().toISOString(),
        courseId,
        courseName: course?.name,
        results,
        examFormat
      };
      
      existingStats.unshift(testResult);
      // Keep only the last 10 practice test results
      const updatedStats = existingStats.slice(0, 10);
      
      localStorage.setItem(statsKey, JSON.stringify(updatedStats));
    } catch (error) {
      console.error('Error saving test results:', error);
    }
  };

  // Timer effect
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <h2 style={styles.loadingTitle}>Generating Practice Test</h2>
          <p style={styles.loadingText}>Creating your personalized AP exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>Error Generating Test</h2>
          <p style={styles.errorText}>{error}</p>
          <button style={styles.retryButton} onClick={generatePracticeTest}>
            Try Again
          </button>
          <button style={styles.backButton} onClick={() => navigate(`/course/${courseId}`)}>
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (!examFormat) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>No Exam Format Found</h2>
          <p style={styles.errorText}>Unable to determine exam format for this course.</p>
          <button style={styles.backButton} onClick={() => navigate(`/course/${courseId}`)}>
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  // Show exam format and start button
  if (!testQuestions || !testStarted) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Practice Test - {course?.name}</h1>
          <button style={styles.backButton} onClick={() => navigate(`/course/${courseId}`)}>
            Back to Course
          </button>
        </div>

        <div style={styles.examFormatCard}>
          <h2 style={styles.examFormatTitle}>Exam Format</h2>
          <div style={styles.examFormatGrid}>
            <div style={styles.formatItem}>
              <h3 style={styles.formatLabel}>Multiple Choice</h3>
              <p style={styles.formatValue}>{testQuestions?.mcqQuestions?.length || 0} questions</p>
              <p style={styles.formatTime}>{examFormat.mcqTimeMinutes} minutes</p>
            </div>
            <div style={styles.formatItem}>
              <h3 style={styles.formatLabel}>Free Response</h3>
              <p style={styles.formatValue}>{testQuestions?.frqQuestions?.length || 0} questions</p>
              <p style={styles.formatTime}>{examFormat.frqTimeMinutes} minutes</p>
            </div>
            <div style={styles.formatItem}>
              <h3 style={styles.formatLabel}>Total Time</h3>
              <p style={styles.formatValue}>{formatTime(examFormat.totalTimeMinutes * 60)}</p>
              <p style={styles.formatTime}>Complete exam</p>
            </div>
          </div>
          <button style={styles.startButton} onClick={startTest}>
            Start Practice Test
          </button>
        </div>
      </div>
    );
  }

  // Test is active - show questions
  const currentQuestion = currentSection === 'mcq' 
    ? testQuestions?.mcqQuestions?.[currentQuestionIndex]
    : testQuestions?.frqQuestions?.[currentQuestionIndex];

  // Check if we have any questions at all
  const hasAnyQuestions = (testQuestions?.mcqQuestions?.length > 0) || (testQuestions?.frqQuestions?.length > 0);

  // Debug logging
  console.log('PracticeTest Debug:', {
    testQuestions,
    testStarted,
    currentSection,
    currentQuestionIndex,
    currentQuestion,
    hasAnyQuestions,
    mcqLength: testQuestions?.mcqQuestions?.length,
    frqLength: testQuestions?.frqQuestions?.length
  });

  if (!currentQuestion || !testQuestions || !hasAnyQuestions) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>Test Not Ready</h2>
          <p style={styles.errorText}>The practice test is still loading or failed to generate.</p>
          <button style={styles.retryButton} onClick={generatePracticeTest}>
            Try Again
          </button>
          <button style={styles.backButton} onClick={() => navigate(`/course/${courseId}`)}>
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.testHeader}>
        <div style={styles.testInfo}>
          <h1 style={styles.testTitle}>{course?.name} Practice Test</h1>
          <div style={styles.testMeta}>
            <span style={styles.sectionInfo}>
              {currentSection.toUpperCase()} Section - Question {currentQuestionIndex + 1} of {
                currentSection === 'mcq' ? (testQuestions?.mcqQuestions?.length || 0) : (testQuestions?.frqQuestions?.length || 0)
              }
            </span>
            <span style={styles.timer}>{formatTime(timer)}</span>
          </div>
        </div>
        <button 
          style={styles.gradeButton} 
          onClick={gradeTest}
          disabled={isGrading}
        >
          {isGrading ? 'Grading...' : 'Grade Test'}
        </button>
      </div>

      <div style={styles.questionContainer}>
        {currentSection === 'mcq' ? (
          <div style={styles.mcqQuestion}>
            <h3 style={styles.questionText}>{currentQuestion.question}</h3>
            <div style={styles.optionsContainer}>
              {currentQuestion.options?.map((option, index) => (
                <label key={index} style={styles.optionLabel}>
                  <input
                    type="radio"
                    name={`answer-${currentSection}-${currentQuestionIndex}`}
                    value={String.fromCharCode(65 + index)}
                    checked={mcqAnswers[currentQuestionIndex] === String.fromCharCode(65 + index)}
                    onChange={(e) => handleMcqAnswerChange(currentQuestionIndex, e.target.value)}
                    style={styles.radioInput}
                  />
                  <span style={styles.optionText}>
                    {String.fromCharCode(65 + index)}. {option.replace(/^[A-D]\.\s*/, '')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div style={styles.frqQuestion}>
            <h3 style={styles.questionText}>{currentQuestion.prompt}</h3>
            <textarea
              style={styles.frqTextarea}
              placeholder="Type your response here..."
              rows={10}
              value={frqAnswers[currentQuestionIndex] || ''}
              onChange={(e) => handleFrqAnswerChange(currentQuestionIndex, e.target.value)}
            />
          </div>
        )}
      </div>

      <div style={styles.navigationContainer}>
        <button 
          style={styles.navButton} 
          onClick={prevQuestion}
          disabled={currentSection === 'mcq' && currentQuestionIndex === 0}
        >
          Previous
        </button>
        <button style={styles.navButton} onClick={nextQuestion}>
          {currentSection === 'frq' && currentQuestionIndex === (testQuestions?.frqQuestions?.length - 1) ? 'Finish' : 'Next'}
        </button>
      </div>

      {/* Grading Results */}
      {gradingResults && (
        <div style={styles.resultsContainer}>
          <div style={styles.resultsHeader}>
            <h2 style={styles.resultsTitle}>Test Results</h2>
            <button 
              style={styles.closeResultsButton} 
              onClick={() => setGradingResults(null)}
            >
              ×
            </button>
          </div>
          
          <div style={styles.resultsGrid}>
            {/* Overall Score */}
            <div style={styles.scoreCard}>
              <h3 style={styles.scoreTitle}>Overall Score</h3>
              <div style={styles.scoreValue}>
                {gradingResults.overall.score} / {gradingResults.overall.total}
              </div>
              <div style={styles.scorePercentage}>
                {gradingResults.overall.percentage.toFixed(1)}%
              </div>
              <div style={styles.apScore}>
                Estimated AP Score: <span style={styles.apScoreValue}>{gradingResults.overall.estimatedAPScore}</span>
              </div>
            </div>

            {/* MCQ Score */}
            {gradingResults.mcq.total > 0 && (
              <div style={styles.scoreCard}>
                <h3 style={styles.scoreTitle}>Multiple Choice</h3>
                <div style={styles.scoreValue}>
                  {gradingResults.mcq.score} / {gradingResults.mcq.total}
                </div>
                <div style={styles.scorePercentage}>
                  {gradingResults.mcq.percentage.toFixed(1)}%
                </div>
              </div>
            )}

            {/* FRQ Score */}
            {gradingResults.frq.total > 0 && (
              <div style={styles.scoreCard}>
                <h3 style={styles.scoreTitle}>Free Response</h3>
                <div style={styles.scoreValue}>
                  {gradingResults.frq.score} / {gradingResults.frq.total}
                </div>
                <div style={styles.scorePercentage}>
                  {gradingResults.frq.percentage.toFixed(1)}%
                </div>
              </div>
            )}
          </div>

          {/* Detailed Results */}
          <div style={styles.detailedResults}>
            <h3 style={styles.detailedTitle}>Question Review</h3>
            
            {/* MCQ Review */}
            {gradingResults.mcq.results.length > 0 && (
              <div style={styles.questionReview}>
                <h4 style={styles.reviewSectionTitle}>Multiple Choice Questions</h4>
                {gradingResults.mcq.results.map((result, index) => (
                  <div key={index} style={styles.questionReviewItem}>
                    <div style={styles.questionReviewHeader}>
                      <span style={styles.questionNumber}>Q{index + 1}</span>
                      <span style={{
                        ...styles.correctnessBadge,
                        backgroundColor: result.isCorrect ? '#10b981' : '#ef4444'
                      }}>
                        {result.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <p style={styles.questionReviewText}>{result.question}</p>
                    <div style={styles.answerReview}>
                      <p><strong>Your Answer:</strong> {result.userAnswer || 'No answer'}</p>
                      <p><strong>Correct Answer:</strong> {result.correctAnswer}</p>
                      {result.explanation && (
                        <p><strong>Explanation:</strong> {result.explanation}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FRQ Review */}
            {gradingResults.frq.results.length > 0 && (
              <div style={styles.questionReview}>
                <h4 style={styles.reviewSectionTitle}>Free Response Questions</h4>
                {gradingResults.frq.results.map((result, index) => (
                  <div key={index} style={styles.questionReviewItem}>
                    <div style={styles.questionReviewHeader}>
                      <span style={styles.questionNumber}>Q{index + 1}</span>
                      <span style={{
                        ...styles.correctnessBadge,
                        backgroundColor: result.hasAnswer ? '#10b981' : '#ef4444'
                      }}>
                        {result.hasAnswer ? 'Answered' : 'Not Answered'}
                      </span>
                    </div>
                    <p style={styles.questionReviewText}>{result.prompt}</p>
                    <div style={styles.answerReview}>
                      <p><strong>Your Response:</strong></p>
                      <div style={styles.frqResponse}>
                        {result.userAnswer || 'No response provided'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.resultsActions}>
            <button 
              style={styles.retakeButton} 
              onClick={() => {
                setGradingResults(null);
                setTestStarted(false);
                setMcqAnswers({});
                setFrqAnswers({});
                setCurrentQuestionIndex(0);
                setCurrentSection('mcq');
              }}
            >
              Retake Test
            </button>
            <button 
              style={styles.backToCourseButton} 
              onClick={() => navigate(`/course/${courseId}`)}
            >
              Back to Course
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    padding: '2rem',
    color: 'var(--text-primary)',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid var(--border-color)',
    borderTop: '4px solid #3B82F6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0,
  },
  loadingText: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0,
  },
  errorText: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  retryButton: {
    background: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    margin: '0.5rem',
  },
  backButton: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    margin: '0.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  examFormatCard: {
    background: 'var(--bg-secondary)',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 8px 24px var(--shadow-color)',
    border: '1px solid var(--border-color)',
    maxWidth: '800px',
    margin: '0 auto',
  },
  examFormatTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: '0 0 1.5rem 0',
    textAlign: 'center',
  },
  examFormatGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  formatItem: {
    textAlign: 'center',
    padding: '1rem',
    background: 'var(--bg-primary)',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
  },
  formatLabel: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: '0 0 0.5rem 0',
  },
  formatValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#3B82F6',
    margin: '0 0 0.25rem 0',
  },
  formatTime: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  startButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'block',
    margin: '0 auto',
    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
  },
  testHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '1rem 1.5rem',
    background: 'var(--bg-secondary)',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
    minHeight: '80px',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  gradeButton: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.2s ease',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  testTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0,
  },
  testInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
    minWidth: '200px',
  },
  testMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.25rem',
    flexShrink: 0,
  },
  sectionInfo: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  timer: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#EF4444',
  },
  questionContainer: {
    background: 'var(--bg-secondary)',
    borderRadius: '1rem',
    padding: '2rem',
    marginBottom: '2rem',
    border: '1px solid var(--border-color)',
  },
  questionText: {
    fontSize: '1.2rem',
    fontWeight: 500,
    color: 'var(--text-primary)',
    margin: '0 0 1.5rem 0',
    lineHeight: 1.6,
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  optionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: 'var(--bg-primary)',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  radioInput: {
    margin: 0,
  },
  optionText: {
    fontSize: '1rem',
    color: 'var(--text-primary)',
  },
  frqTextarea: {
    width: '100%',
    minHeight: '200px',
    padding: '1rem',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    color: 'var(--text-primary)',
    resize: 'vertical',
  },
  navigationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    background: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  
  // Grading Results Styles
  resultsContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  resultsTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  },
  closeResultsButton: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  scoreCard: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '1rem',
    padding: '1.5rem',
    textAlign: 'center',
    border: '1px solid var(--border-color)',
  },
  scoreTitle: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: '0 0 1rem 0',
  },
  scoreValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--accent-primary)',
    margin: '0 0 0.5rem 0',
  },
  scorePercentage: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    margin: '0 0 1rem 0',
  },
  apScore: {
    fontSize: '1rem',
    color: 'var(--text-primary)',
    fontWeight: 600,
  },
  apScoreValue: {
    fontSize: '1.5rem',
    color: 'var(--accent-primary)',
    fontWeight: 700,
  },
  detailedResults: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '1rem',
    padding: '2rem',
    marginBottom: '2rem',
    border: '1px solid var(--border-color)',
    maxHeight: '60vh',
    overflowY: 'auto',
  },
  detailedTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: '0 0 1.5rem 0',
  },
  questionReview: {
    marginBottom: '2rem',
  },
  reviewSectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: '0 0 1rem 0',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid var(--border-color)',
  },
  questionReviewItem: {
    backgroundColor: 'var(--bg-primary)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    marginBottom: '1rem',
    border: '1px solid var(--border-color)',
  },
  questionReviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  questionNumber: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  correctnessBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '1rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'white',
  },
  questionReviewText: {
    fontSize: '1rem',
    color: 'var(--text-primary)',
    margin: '0 0 1rem 0',
    lineHeight: 1.5,
  },
  answerReview: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  frqResponse: {
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginTop: '0.5rem',
    border: '1px solid var(--border-color)',
    whiteSpace: 'pre-wrap',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
  },
  resultsActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  retakeButton: {
    padding: '1rem 2rem',
    backgroundColor: 'var(--accent-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  backToCourseButton: {
    padding: '1rem 2rem',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default PracticeTest;