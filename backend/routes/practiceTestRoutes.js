import express from 'express';
import { analyzeAPExamFormat, generateAdaptivePracticeQuestions, generateMCQWithRetry } from '../services/mcqGenerator.js';
import { getRubricSegments, mapCourseIdToCedId, getUnitContent, hasCourseData, getAvailableUnits } from '../services/cedParser.js';
import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const openai = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o-mini",
  temperature: 0.7,
});

// Route to get AP exam format
router.get('/format/:courseId', async (req, res) => {
  const { courseId } = req.params;
  console.log(`Getting exam format for course: ${courseId}`);
  try {
    const format = await analyzeAPExamFormat(courseId);
    res.json(format);
  } catch (error) {
    console.error('Error getting exam format:', error);
    res.status(500).json({ success: false, message: 'Failed to get exam format' });
  }
});

/**
 * Generate a full practice test
 */
router.post('/generate/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { isAuthenticated = true } = req.body;
    
    console.log(`Generating practice test for course: ${courseId}`);
    
    // Get exam format
    const examFormat = await analyzeAPExamFormat(courseId);
    
    // Generate content-focused, multi-unit MCQ questions
    let mcqQuestions = [];
    if (examFormat.mcqCount > 0) {
      try {
        console.log(`Generating content-focused MCQ questions for practice test...`);
        mcqQuestions = await generateContentFocusedMCQs(courseId, examFormat);
        console.log(`Successfully generated ${mcqQuestions.length} content-focused MCQ questions`);
      } catch (mcqError) {
        console.error('Error generating content-focused MCQ questions:', mcqError);
        // Continue without MCQ questions
      }
    }
    
    // Generate FRQ questions
    let frqQuestions = [];
    if (examFormat.frqCount > 0) {
      try {
        frqQuestions = await generateFRQQuestions(courseId, examFormat);
      } catch (frqError) {
        console.error('Error generating FRQ questions:', frqError);
        // Continue without FRQ questions
      }
    }
    
    const practiceTest = {
      courseId,
      examFormat,
      mcqQuestions,
      frqQuestions,
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      practiceTest
    });

  } catch (error) {
    console.error('Error generating practice test:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate practice test',
      error: error.message 
    });
  }
});

/**
 * Generate content-focused, multi-unit MCQ questions for practice test
 */
async function generateContentFocusedMCQs(courseId, examFormat) {
  try {
    const cedId = mapCourseIdToCedId(courseId);
    
    // Get content from multiple units to create comprehensive questions
    const allUnitsContent = [];
    const availableUnits = await getAvailableUnits(cedId);
    
    // Collect content from all units
    for (let i = 1; i <= Math.min(availableUnits.length, 9); i++) {
      try {
        const unitContent = await getUnitContent(cedId, i);
        if (unitContent && unitContent.content) {
          allUnitsContent.push({
            unitNumber: i,
            title: unitContent.title,
            content: unitContent.content
          });
        }
      } catch (unitError) {
        console.log(`Could not get content for unit ${i}:`, unitError.message);
      }
    }
    
    if (allUnitsContent.length === 0) {
      console.log(`No unit content found for ${courseId}`);
      return [];
    }
    
    // Create comprehensive content context (truncated to avoid token limits)
    const comprehensiveContent = allUnitsContent
      .map(unit => `Unit ${unit.unitNumber}: ${unit.title}\n${unit.content.substring(0, 1000)}`)
      .join('\n\n');
    
    // Determine if this course uses stimulus (charts, graphs, documents, etc.)
    const stimulusCourses = [
      'ap-world-history', 'ap-united-states-history', 'ap-european-history',
      'ap-human-geography', 'ap-macroeconomics', 'ap-microeconomics',
      'ap-psychology', 'ap-biology', 'ap-chemistry', 'ap-physics',
      'ap-statistics', 'ap-calculus-ab', 'ap-calculus-bc'
    ];
    
    const usesStimulus = stimulusCourses.some(course => courseId.includes(course));
    
    const prompt = `Generate EXACTLY ${examFormat.mcqCount} authentic AP-style Multiple Choice Questions for AP ${courseId} practice test.

CRITICAL REQUIREMENTS - READ CAREFULLY:
- You MUST generate EXACTLY ${examFormat.mcqCount} questions - NO MORE, NO LESS
- This is a FULL-LENGTH practice test, not a short quiz
- Focus on ACTUAL COURSE CONTENT, not CED structure
- Mix content from multiple units to test comprehensive understanding
- Use authentic AP exam question formats and difficulty level
- Make questions HARDER than typical unit practice (like real AP exam)
- Use TEXT-BASED stimulus descriptions instead of referencing missing charts/maps
- Test deep understanding, not just memorization
- Use proper AP question stems and high-quality distractors
- Do NOT include letter prefixes (A., B., C., D.) in options - letters will be added automatically

Course: ${courseId}
Total Questions REQUIRED: ${examFormat.mcqCount} (This is NOT optional - generate exactly this many)
Time Limit: ${examFormat.mcqTimeMinutes} minutes
Uses Stimulus: ${usesStimulus ? 'YES - Include text-based stimulus descriptions' : 'NO - Focus on conceptual questions'}

COURSE CONTENT FROM ALL UNITS:
${comprehensiveContent}

QUESTION GENERATION GUIDELINES:
1. Create questions that test actual AP exam knowledge and skills
2. Mix content from different units in single questions when appropriate
3. Use authentic AP question formats:
   - "Which of the following best explains..."
   - "Based on the information provided..."
   - "The primary purpose of... was to..."
4. Include stimulus materials (charts, graphs, documents) for applicable subjects
5. Create plausible but incorrect distractors based on common misconceptions
6. Test higher-order thinking skills (analysis, synthesis, evaluation)
7. Ensure questions are challenging but fair

${usesStimulus ? `
TEXT-BASED STIMULUS REQUIREMENTS:
- Instead of referencing charts/maps, provide text-based stimulus descriptions
- Example: "Based on the following data: 'Population of London grew from 1 million in 1800 to 6 million in 1900'"
- Example: "Given this information: 'Trade routes connected Europe, Asia, and Africa through the Indian Ocean'"
- Include relevant data, statistics, or historical context in the question text
- Base questions on the provided stimulus content
` : ''}

Return ONLY a JSON array with this exact format:
[
  {
    "question": "Question text (include stimulus reference if applicable)",
    "options": [
      "Option A text",
      "Option B text", 
      "Option C text",
      "Option D text"
    ],
    "correctAnswer": "A",
    "explanation": "Detailed explanation of why the correct answer is right and others are wrong"
  }
]`;

    // Generate questions in batches to ensure we get the full count
    let allQuestions = [];
    const batchSize = Math.min(20, examFormat.mcqCount); // Generate in batches of 20
    const numBatches = Math.ceil(examFormat.mcqCount / batchSize);
    
    for (let batch = 0; batch < numBatches; batch++) {
      const remainingQuestions = examFormat.mcqCount - allQuestions.length;
      const currentBatchSize = Math.min(batchSize, remainingQuestions);
      
      if (currentBatchSize <= 0) break;
      
      console.log(`Generating batch ${batch + 1}/${numBatches}: ${currentBatchSize} questions`);
      
      const batchPrompt = `Generate EXACTLY ${currentBatchSize} authentic AP-style Multiple Choice Questions for AP ${courseId} practice test.

CRITICAL REQUIREMENTS - READ CAREFULLY:
- You MUST generate EXACTLY ${currentBatchSize} questions - NO MORE, NO LESS
- This is batch ${batch + 1} of ${numBatches} for a FULL-LENGTH practice test
- Focus on ACTUAL COURSE CONTENT, not CED structure
- Mix content from multiple units to test comprehensive understanding
- Use authentic AP exam question formats and difficulty level
- Make questions HARDER than typical unit practice (like real AP exam)
- Use TEXT-BASED stimulus descriptions instead of referencing missing charts/maps
- Test deep understanding, not just memorization
- Use proper AP question stems and high-quality distractors
- Do NOT include letter prefixes (A., B., C., D.) in options - letters will be added automatically

Course: ${courseId}
Total Questions REQUIRED: ${currentBatchSize} (This is NOT optional - generate exactly this many)
Time Limit: ${examFormat.mcqTimeMinutes} minutes
Uses Stimulus: ${usesStimulus ? 'YES - Include text-based stimulus descriptions' : 'NO - Focus on conceptual questions'}

COURSE CONTENT FROM ALL UNITS:
${comprehensiveContent}

QUESTION GENERATION GUIDELINES:
1. Create questions that test actual AP exam knowledge and skills
2. Mix content from different units in single questions when appropriate
3. Use authentic AP question formats:
   - "Which of the following best explains..."
   - "Based on the information provided..."
   - "The primary purpose of... was to..."
4. Include stimulus materials (charts, graphs, documents) for applicable subjects
5. Create plausible but incorrect distractors based on common misconceptions
6. Test higher-order thinking skills (analysis, synthesis, evaluation)
7. Ensure questions are challenging but fair

${usesStimulus ? `
TEXT-BASED STIMULUS REQUIREMENTS:
- Instead of referencing charts/maps, provide text-based stimulus descriptions
- Example: "Based on the following data: 'Population of London grew from 1 million in 1800 to 6 million in 1900'"
- Example: "Given this information: 'Trade routes connected Europe, Asia, and Africa through the Indian Ocean'"
- Include relevant data, statistics, or historical context in the question text
- Base questions on the provided stimulus content
` : ''}

Return ONLY a JSON array with this exact format:
[
  {
    "question": "Question text (include stimulus reference if applicable)",
    "options": [
      "Option A text",
      "Option B text", 
      "Option C text",
      "Option D text"
    ],
    "correctAnswer": "A",
    "explanation": "Detailed explanation of why the correct answer is right and others are wrong"
  }
]`;

      const response = await openai.invoke(batchPrompt);
      
      // Clean JSON content to remove markdown code blocks
      const cleanJsonContent = (content) => {
        if (typeof content !== 'string') return content;
        return content
          .replace(/^```json\s*/i, '')
          .replace(/\s*```\s*$/i, '')
          .trim();
      };
      
      const cleanedContent = cleanJsonContent(response.content);
      const batchQuestions = JSON.parse(cleanedContent);
      
      if (batchQuestions && batchQuestions.length > 0) {
        allQuestions = [...allQuestions, ...batchQuestions];
        console.log(`Batch ${batch + 1} generated ${batchQuestions.length} questions (total: ${allQuestions.length})`);
      }
    }
    
    // Trim to exact count if we have more than needed
    if (allQuestions.length > examFormat.mcqCount) {
      allQuestions = allQuestions.slice(0, examFormat.mcqCount);
    }
    
    console.log(`Final result: Generated ${allQuestions.length} questions (requested: ${examFormat.mcqCount})`);
    return allQuestions || [];
  } catch (error) {
    console.error('Error generating content-focused MCQ questions:', error);
    return [];
  }
}

/**
 * Generate FRQ questions for practice test
 */
async function generateFRQQuestions(courseId, examFormat) {
  try {
    const cedId = mapCourseIdToCedId(courseId);
    const rubrics = await getRubricSegments(cedId);
    
    if (!rubrics || rubrics.length === 0) {
      console.log(`No rubrics found for ${courseId}`);
      return [];
    }

    const prompt = `Generate ${examFormat.frqCount} Free Response Questions (FRQs) for AP ${courseId} practice test.

Course: ${courseId}
Available Question Types: ${examFormat.questionTypes.join(', ')}
Total Time: ${examFormat.frqTimeMinutes} minutes

Based on the available rubrics, create realistic FRQ questions that match the exam format.

Return ONLY a JSON array with this exact format:
[
  {
    "prompt": "Question prompt text",
    "questionType": "type from questionTypes array",
    "estimatedTime": "time in minutes",
    "points": "point value"
  }
]`;

    const response = await openai.invoke(prompt);
    
    // Clean JSON content to remove markdown code blocks
    const cleanJsonContent = (content) => {
      if (typeof content !== 'string') return content;
      return content
        .replace(/^```json\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();
    };
    
    const cleanedContent = cleanJsonContent(response.content);
    const questions = JSON.parse(cleanedContent);
    
    return questions || [];
  } catch (error) {
    console.error('Error generating FRQ questions:', error);
    return [];
  }
}

export default router;
