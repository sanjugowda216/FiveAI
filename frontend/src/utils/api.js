// frontend/src/utils/api.js
export const API_URL = "http://localhost:5001";

export async function getTestMessage() {
  const res = await fetch(`${API_URL}/`); // <-- note the /
  const data = await res.text();
  return data;
}

/**
 * Get available units for a course
 */
export async function getUnitsForCourse(courseId) {
  try {
    if (!courseId) {
      throw new Error('Course ID is required');
    }
    
    console.log(`Fetching units for course: ${courseId}`);
    console.log(`API URL: ${API_URL}/api/questions/units/${courseId}`);
    
    const response = await fetch(`${API_URL}/api/questions/units/${courseId}`);
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.message || `Failed to fetch units for ${courseId}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched units:', data);
    return data;
  } catch (error) {
    console.error('Error fetching units:', error);
    throw error;
  }
}

/**
 * Get MCQ questions for a specific course and unit
 */
export async function getQuestionsForUnit(courseId, unitNumber, isAuthenticated = false) {
  try {
    const url = `${API_URL}/api/questions/${courseId}/${unitNumber}?isAuthenticated=${isAuthenticated}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to fetch questions for ${courseId} Unit ${unitNumber}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

/**
 * Get adaptive practice questions based on previous performance
 */
export async function getAdaptivePracticeQuestions(courseId, unitNumber, previousAnswers = []) {
  try {
    const response = await fetch(`${API_URL}/api/questions/adaptive/${courseId}/${unitNumber}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ previousAnswers })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to generate adaptive questions for ${courseId} Unit ${unitNumber}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating adaptive questions:', error);
    throw error;
  }
}

/**
 * Force regenerate questions for a unit (admin use)
 */
export async function regenerateQuestionsForUnit(courseId, unitNumber) {
  try {
    const response = await fetch(`${API_URL}/api/questions/regenerate/${courseId}/${unitNumber}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to regenerate questions for ${courseId} Unit ${unitNumber}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error regenerating questions:', error);
    throw error;
  }
}

/**
 * Fetch available rubric excerpts for an FRQ course.
 */
export async function getRubricsForCourse(courseId) {
  if (!courseId) {
    throw new Error('Course ID is required to load rubrics.');
  }

  try {
    const response = await fetch(`${API_URL}/api/frq/rubrics/${courseId}`);
    if (!response.ok) {
      const errorData = await safeParseJson(response);
      throw new Error(errorData?.message || `Failed to load rubrics for ${courseId}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching rubrics:', error);
    throw error;
  }
}

/**
 * Submit an FRQ response for rubric-based grading.
 */
export async function submitFrqForGrading(payload) {
  try {
    const response = await fetch(`${API_URL}/api/frq/grade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await safeParseJson(response);
      throw new Error(errorData?.message || 'FRQ grading failed.');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting FRQ for grading:', error);
    throw error;
  }
}

/**
 * Generate AI study plan
 */
export async function generateAIStudyPlan(studyPlanData) {
  try {
    console.log('Sending request to:', `${API_URL}/api/study-plan/generate`);
    console.log('Request data:', studyPlanData);
    
    const response = await fetch(`${API_URL}/api/study-plan/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studyPlanData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.message || 'Failed to generate AI study plan');
    }
    
    const result = await response.json();
    console.log('Success response:', result);
    return result;
  } catch (error) {
    console.error('Error generating AI study plan:', error);
    throw error;
  }
}

/**
 * Generate adaptive study plan based on performance data
 */
export async function generateAdaptiveStudyPlan(studyPlanData) {
  try {
    const response = await fetch(`${API_URL}/api/study-plan/adaptive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studyPlanData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate adaptive study plan');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating adaptive study plan:', error);
    throw error;
  }
}

async function safeParseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
