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

export async function getAllFlashcards() {
  const res = await fetch(`${API_URL}/api/flashcards`);
  if (!res.ok) throw new Error(await res.text() || 'Failed to load flashcards');
  return res.json();
}

export async function createFlashcard(question, answer) {
  const res = await fetch(`${API_URL}/api/flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer })
  });
  if (!res.ok) throw new Error(await res.text() || 'Failed to create flashcard');
  return res.json();
}

export async function updateFlashcard(id, { question, answer }) {
  const res = await fetch(`${API_URL}/api/flashcards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer })
  });
  if (!res.ok) throw new Error(await res.text() || 'Failed to update flashcard');
  return res.json();
}

export async function deleteFlashcard(id) {
  const res = await fetch(`${API_URL}/api/flashcards/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text() || 'Failed to delete flashcard');
  return res.json();
}

export async function getRandomStudyFlashcards(count = 10) {
  const res = await fetch(`${API_URL}/api/flashcards/study/random?count=${count}`);
  if (!res.ok) throw new Error(await res.text() || 'Failed to fetch study flashcards');
  return res.json();
}

async function safeParseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
