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
export async function getQuestionsForUnit(courseId, unitNumber) {
  try {
    const response = await fetch(`${API_URL}/api/questions/${courseId}/${unitNumber}`);
    
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
