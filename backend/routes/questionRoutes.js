import express from 'express';
import { 
  getAvailableUnits as getCedUnits, 
  getUnitContent, 
  hasCourseData,
  getCedHash 
} from '../services/cedParser.js';
import { 
  generateMCQWithRetry 
} from '../services/mcqGenerator.js';
import { 
  getCachedQuestions, 
  cacheQuestions, 
  isCacheValid,
  getAvailableUnits as getCachedUnits 
} from '../services/cacheService.js';

const router = express.Router();

/**
 * GET /api/questions
 * Base endpoint - provides information about available endpoints
 */
router.get('/', (req, res) => {
  res.json({
    message: 'FiveAI MCQ API',
    endpoints: {
      'GET /api/questions/units/:courseId': 'Get available units for a course',
      'GET /api/questions/:courseId/:unitNumber': 'Get MCQ questions for a specific unit',
      'POST /api/questions/regenerate/:courseId/:unitNumber': 'Force regenerate questions for a unit'
    },
    example: {
      'Get units': '/api/questions/units/ap-world-history',
      'Get questions': '/api/questions/ap-world-history/1'
    }
  });
});

/**
 * GET /api/questions/units/:courseId
 * Returns available units for a course
 */
router.get('/units/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Check if course data exists
    if (!hasCourseData(courseId)) {
      return res.status(404).json({
        error: 'Course not found',
        message: `No CED data found for course: ${courseId}. Please ensure the CED PDF is placed in the /backend/ceds/ directory.`
      });
    }
    
    // Get units from CED data
    const units = getCedUnits(courseId);
    
    if (units.length === 0) {
      return res.status(404).json({
        error: 'No units found',
        message: 'No units could be extracted from the CED file.'
      });
    }
    
    // Get cached units for additional info
    const cachedUnits = getCachedUnits(courseId);
    
    const unitInfo = units.map(unitNumber => ({
      number: unitNumber,
      title: `Unit ${unitNumber}`,
      hasQuestions: cachedUnits.includes(unitNumber),
      questionCount: cachedUnits.includes(unitNumber) ? 'Available' : 'Not generated'
    }));
    
    res.json({
      courseId,
      units: unitInfo,
      totalUnits: units.length
    });
    
  } catch (error) {
    console.error('Error getting units:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve course units'
    });
  }
});

/**
 * GET /api/questions/:courseId/:unitNumber
 * Returns MCQ questions for a specific unit (cached or generated)
 */
router.get('/:courseId/:unitNumber', async (req, res) => {
  try {
    const { courseId, unitNumber } = req.params;
    const unitNum = parseInt(unitNumber);
    
    if (isNaN(unitNum) || unitNum < 1) {
      return res.status(400).json({
        error: 'Invalid unit number',
        message: 'Unit number must be a positive integer'
      });
    }
    
    // Check if course data exists
    if (!hasCourseData(courseId)) {
      return res.status(404).json({
        error: 'Course not found',
        message: `No CED data found for course: ${courseId}`
      });
    }
    
    // Get current CED hash for cache validation
    const currentCedHash = getCedHash(courseId);
    
    // Check cache first
    if (isCacheValid(courseId, unitNum, currentCedHash)) {
      const cached = getCachedQuestions(courseId, unitNum);
      if (cached && cached.questions) {
        console.log(`Returning cached questions for ${courseId} Unit ${unitNum}`);
        return res.json({
          courseId,
          unitNumber: unitNum,
          questions: cached.questions,
          source: 'cache',
          generatedAt: cached.generatedAt,
          questionCount: cached.questions.length
        });
      }
    }
    
    // Generate new questions
    console.log(`Generating new questions for ${courseId} Unit ${unitNum}...`);
    
    // Get unit content
    const unitContent = getUnitContent(courseId, unitNum);
    if (!unitContent) {
      return res.status(404).json({
        error: 'Unit not found',
        message: `Unit ${unitNum} not found in course ${courseId}`
      });
    }
    
    // Generate questions
    const questions = await generateMCQWithRetry(
      courseId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Format course name
      unitNum,
      unitContent.title,
      unitContent.content
    );
    
    // Cache the questions
    cacheQuestions(courseId, unitNum, questions, currentCedHash);
    
    res.json({
      courseId,
      unitNumber: unitNum,
      questions,
      source: 'generated',
      generatedAt: new Date().toISOString(),
      questionCount: questions.length
    });
    
  } catch (error) {
    console.error('Error getting questions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate or retrieve questions'
    });
  }
});

/**
 * POST /api/questions/regenerate/:courseId/:unitNumber
 * Force regenerate questions for a unit (admin use)
 */
router.post('/regenerate/:courseId/:unitNumber', async (req, res) => {
  try {
    const { courseId, unitNumber } = req.params;
    const unitNum = parseInt(unitNumber);
    
    if (isNaN(unitNum) || unitNum < 1) {
      return res.status(400).json({
        error: 'Invalid unit number',
        message: 'Unit number must be a positive integer'
      });
    }
    
    // Check if course data exists
    if (!hasCourseData(courseId)) {
      return res.status(404).json({
        error: 'Course not found',
        message: `No CED data found for course: ${courseId}`
      });
    }
    
    // Get unit content
    const unitContent = getUnitContent(courseId, unitNum);
    if (!unitContent) {
      return res.status(404).json({
        error: 'Unit not found',
        message: `Unit ${unitNum} not found in course ${courseId}`
      });
    }
    
    // Force regenerate questions
    console.log(`Force regenerating questions for ${courseId} Unit ${unitNum}...`);
    
    const questions = await generateMCQWithRetry(
      courseId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      unitNum,
      unitContent.title,
      unitContent.content
    );
    
    // Cache the new questions
    const currentCedHash = getCedHash(courseId);
    cacheQuestions(courseId, unitNum, questions, currentCedHash);
    
    res.json({
      courseId,
      unitNumber: unitNum,
      questions,
      source: 'regenerated',
      generatedAt: new Date().toISOString(),
      questionCount: questions.length
    });
    
  } catch (error) {
    console.error('Error regenerating questions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to regenerate questions'
    });
  }
});

export default router;
