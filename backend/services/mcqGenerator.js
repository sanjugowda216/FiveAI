import { ChatOpenAI } from '@langchain/openai';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the schema for MCQ questions
const MCQQuestionSchema = z.object({
  question: z.string().describe('The multiple choice question text'),
  options: z.array(z.string()).length(4).describe('Four answer options (A, B, C, D)'),
  correctAnswer: z.string().describe('The correct answer (A, B, C, or D)'),
  explanation: z.string().describe('Brief explanation of why the correct answer is right')
});

const MCQResponseSchema = z.object({
  questions: z.array(MCQQuestionSchema).describe('Array of multiple choice questions')
});

// Initialize the LLM (only if API key is available)
let llm = null;
console.log('API Key check:', {
  hasKey: !!process.env.OPENAI_API_KEY,
  keyLength: process.env.OPENAI_API_KEY?.length,
  keyStart: process.env.OPENAI_API_KEY?.substring(0, 10) + '...',
  isDefault: process.env.OPENAI_API_KEY === 'your_key_here'
});

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_key_here') {
  console.log('Initializing OpenAI LLM...');
  llm = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 1500,
    openAIApiKey: process.env.OPENAI_API_KEY
  });
  console.log('OpenAI LLM initialized successfully');
} else {
  console.log('OpenAI API key not configured or is default value');
}

// Create output parser
const outputParser = StructuredOutputParser.fromZodSchema(MCQResponseSchema);

// Helper function to determine if a course is math-related
function isMathCourse(courseName) {
  const mathKeywords = [
    'calculus', 'statistics', 'algebra', 'geometry', 'trigonometry', 
    'precalculus', 'mathematics', 'math', 'mathematical'
  ];
  const courseLower = courseName.toLowerCase();
  return mathKeywords.some(keyword => courseLower.includes(keyword));
}

// Helper function to determine if a course is statistics
function isStatisticsCourse(courseName) {
  return courseName.toLowerCase().includes('statistics');
}

// Get math-specific instructions
function getMathSpecificInstructions(courseName) {
  if (isMathCourse(courseName)) {
    return `
MATH-SPECIFIC INSTRUCTIONS:
- Create ACTUAL MATH PROBLEMS with calculations, equations, and mathematical concepts
- Include problems that require students to solve equations, find derivatives, integrals, or statistical calculations
- Use real mathematical scenarios and word problems
- Include problems with graphs, functions, and mathematical reasoning
- Avoid questions about CED structure, exam format, or course organization
- Focus on mathematical content: formulas, theorems, problem-solving, and applications
- Include numerical answers that students must calculate
- Use proper mathematical notation and terminology`;
  }
  return '';
}

// Create prompt template
const promptTemplate = new PromptTemplate({
  template: `You are an expert AP exam question writer. Generate {questionCount} high-quality multiple choice questions based on the provided course content.

Course: {courseName}
Unit: {unitNumber} - {unitTitle}

Content:
{content}

Instructions:
- Create questions that test understanding, not just memorization
- Make distractors plausible but clearly incorrect
- Use AP exam question format and difficulty level
- Ensure questions align with the specific unit content provided
- Include a mix of factual recall and analytical thinking questions
- Keep explanations concise but informative

{mathSpecificInstructions}

{format_instructions}`,
  inputVariables: ['courseName', 'unitNumber', 'unitTitle', 'content', 'questionCount', 'mathSpecificInstructions'],
  partialVariables: {
    format_instructions: outputParser.getFormatInstructions()
  }
});

/**
 * Generate MCQ questions for a specific unit
 */
export async function generateMCQQuestions(courseName, unitNumber, unitTitle, content, questionCount = 6) {
  try {
    console.log(`Generating ${questionCount} MCQ questions for ${courseName} Unit ${unitNumber}...`);
    
    // Check if LLM is available
    if (!llm) {
      console.warn('OpenAI API key not configured, returning fallback questions');
      return generateFallbackQuestions(courseName, unitNumber, questionCount);
    }
    
    // Truncate content if too long to stay within token limits
    const maxContentLength = 3000; // Roughly 750 tokens
    const truncatedContent = content.length > maxContentLength 
      ? content.substring(0, maxContentLength) + '...'
      : content;
    
    // Get math-specific instructions
    const mathInstructions = getMathSpecificInstructions(courseName);
    
    // Create the prompt
    const prompt = await promptTemplate.format({
      courseName,
      unitNumber,
      unitTitle,
      content: truncatedContent,
      questionCount,
      mathSpecificInstructions: mathInstructions
    });
    
    // Generate response
    const response = await llm.invoke(prompt);
    
    // Parse the structured output
    const parsedResponse = await outputParser.parse(response.content);
    
    // Validate and clean up the questions
    const questions = parsedResponse.questions.map((q, index) => ({
      id: `q${index + 1}`,
      question: q.question.trim(),
      options: q.options.map(opt => opt.trim()),
      correctAnswer: q.correctAnswer.trim().toUpperCase(),
      explanation: q.explanation.trim()
    }));
    
    console.log(`Generated ${questions.length} MCQ questions for ${courseName} Unit ${unitNumber}`);
    return questions;
    
  } catch (error) {
    console.error('Error generating MCQ questions:', error);
    
    // Return fallback questions if generation fails
    return generateFallbackQuestions(courseName, unitNumber, questionCount);
  }
}

/**
 * Generate fallback questions when AI generation fails
 */
function generateFallbackQuestions(courseName, unitNumber, questionCount = 6) {
  // Check if this is a math course for different fallback questions
  const isMath = isMathCourse(courseName);
  const isStats = isStatisticsCourse(courseName);
  
  const baseQuestions = isStats ? [
    {
      id: 'q1',
      question: `A sample of 25 students has a mean test score of 78 with a standard deviation of 8. What is the 95% confidence interval for the population mean?`,
      options: [
        '74.86 to 81.14',
        '76.32 to 79.68',
        '74.12 to 81.88',
        '75.44 to 80.56'
      ],
      correctAnswer: 'A',
      explanation: 'Using the formula: x̄ ± t*(s/√n). For 95% CI with df=24, t*=2.064. CI = 78 ± 2.064(8/√25) = 78 ± 3.14 = (74.86, 81.14).'
    },
    {
      id: 'q2',
      question: `If the correlation coefficient between two variables is r = 0.85, what percentage of the variation in y is explained by the linear relationship with x?`,
      options: [
        '72.25%',
        '85%',
        '92.5%',
        '15%'
      ],
      correctAnswer: 'A',
      explanation: 'The coefficient of determination is r² = (0.85)² = 0.7225 = 72.25%. This means 72.25% of the variation in y is explained by the linear relationship with x.'
    },
    {
      id: 'q3',
      question: `In a normal distribution with mean μ = 100 and standard deviation σ = 15, what is the probability that a randomly selected value is between 85 and 115?`,
      options: [
        '0.6826',
        '0.9544',
        '0.9974',
        '0.5000'
      ],
      correctAnswer: 'A',
      explanation: 'This is within one standard deviation of the mean (100 ± 15). For a normal distribution, P(μ-σ < X < μ+σ) ≈ 0.6826.'
    }
  ] : isMath ? [
    {
      id: 'q1',
      question: `What is the derivative of f(x) = x² + 3x - 5?`,
      options: [
        '2x + 3',
        'x + 3',
        '2x - 5',
        'x² + 3'
      ],
      correctAnswer: 'A',
      explanation: 'Using the power rule: d/dx(x²) = 2x, d/dx(3x) = 3, d/dx(-5) = 0. So f\'(x) = 2x + 3.'
    },
    {
      id: 'q2',
      question: `If f(x) = 2x³ - 4x + 1, what is f\'(2)?`,
      options: [
        '20',
        '16',
        '24',
        '12'
      ],
      correctAnswer: 'A',
      explanation: 'f\'(x) = 6x² - 4. So f\'(2) = 6(2)² - 4 = 6(4) - 4 = 24 - 4 = 20.'
    },
    {
      id: 'q3',
      question: `What is the limit as x approaches 0 of (sin x)/x?`,
      options: [
        '1',
        '0',
        '∞',
        'undefined'
      ],
      correctAnswer: 'A',
      explanation: 'This is a fundamental limit: lim(x→0) (sin x)/x = 1. This is a standard result in calculus.'
    }
  ] : [
    {
      id: 'q1',
      question: `Based on the content in ${courseName} Unit ${unitNumber}, which of the following best describes the main topic?`,
      options: [
        'A comprehensive overview of the subject matter',
        'An introduction to basic concepts',
        'Advanced applications and analysis',
        'Historical context and background'
      ],
      correctAnswer: 'A',
      explanation: 'This is a fallback question. Please check the CED content and regenerate questions.'
    },
    {
      id: 'q2',
      question: `What is the primary focus of Unit ${unitNumber} in ${courseName}?`,
      options: [
        'Theoretical foundations',
        'Practical applications',
        'Historical development',
        'Contemporary relevance'
      ],
      correctAnswer: 'B',
      explanation: 'This is a fallback question. Please check the CED content and regenerate questions.'
    }
  ];

  // If we need more questions, duplicate and modify them
  const questions = [];
  for (let i = 0; i < questionCount; i++) {
    const baseQuestion = baseQuestions[i % baseQuestions.length];
    questions.push({
      ...baseQuestion,
      id: `q${i + 1}`,
      question: baseQuestion.question.replace('q1', `q${i + 1}`)
    });
  }

  return questions;
}

/**
 * Generate questions with retry logic
 */
export async function generateMCQWithRetry(courseName, unitNumber, unitTitle, content, questionCount = 6, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const questions = await generateMCQQuestions(courseName, unitNumber, unitTitle, content, questionCount);
      
      // Validate that we got reasonable questions
      if (questions && questions.length >= Math.min(3, questionCount)) {
        return questions;
      }
      
      throw new Error(`Generated only ${questions?.length || 0} questions, expected at least ${Math.min(3, questionCount)}`);
      
    } catch (error) {
      lastError = error;
      console.warn(`MCQ generation attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error(`All ${maxRetries} attempts failed, returning fallback questions`);
  return generateFallbackQuestions(courseName, unitNumber, questionCount);
}

/**
 * Estimate token usage for content
 */
export function estimateTokenUsage(content) {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(content.length / 4);
}

/**
 * Generate adaptive practice questions based on previous performance
 */
export async function generateAdaptivePracticeQuestions(courseName, unitNumber, unitTitle, content, previousAnswers = [], questionCount = 6) {
  try {
    console.log(`Generating ${questionCount} adaptive practice questions for ${courseName} Unit ${unitNumber}...`);
    
    // Check if LLM is available
    if (!llm) {
      console.warn('OpenAI API key not configured, returning fallback questions');
      return generateFallbackQuestions(courseName, unitNumber, questionCount);
    }
    
    // Analyze previous performance to identify weak areas
    const performanceAnalysis = analyzePerformance(previousAnswers);
    
    // Truncate content if too long to stay within token limits
    const maxContentLength = 3000; // Roughly 750 tokens
    const truncatedContent = content.length > maxContentLength 
      ? content.substring(0, maxContentLength) + '...'
      : content;
    
    // Create adaptive prompt template
    const adaptivePromptTemplate = new PromptTemplate({
      template: `You are an expert AP exam question writer. Generate {questionCount} high-quality multiple choice questions based on the provided course content, with a focus on areas where the student needs improvement.

Course: {courseName}
Unit: {unitNumber} - {unitTitle}

Content:
{content}

Previous Performance Analysis:
{performanceAnalysis}

Instructions:
- Create questions that test understanding, not just memorization
- Focus on concepts and topics where the student has shown weakness
- Make distractors plausible but clearly incorrect
- Use AP exam question format and difficulty level
- Ensure questions align with the specific unit content provided
- Include a mix of factual recall and analytical thinking questions
- Keep explanations concise but informative
- Prioritize questions that address identified knowledge gaps

{format_instructions}`,
      inputVariables: ['courseName', 'unitNumber', 'unitTitle', 'content', 'questionCount', 'performanceAnalysis'],
      partialVariables: {
        format_instructions: outputParser.getFormatInstructions()
      }
    });
    
    // Create the prompt
    const prompt = await adaptivePromptTemplate.format({
      courseName,
      unitNumber,
      unitTitle,
      content: truncatedContent,
      questionCount,
      performanceAnalysis
    });
    
    // Generate response
    const response = await llm.invoke(prompt);
    
    // Parse the structured output
    const parsedResponse = await outputParser.parse(response.content);
    
    // Validate and clean up the questions
    const questions = parsedResponse.questions.map((q, index) => ({
      id: `adaptive_q${index + 1}`,
      question: q.question.trim(),
      options: q.options.map(opt => opt.trim()),
      correctAnswer: q.correctAnswer.trim().toUpperCase(),
      explanation: q.explanation.trim(),
      isAdaptive: true
    }));
    
    console.log(`Generated ${questions.length} adaptive practice questions for ${courseName} Unit ${unitNumber}`);
    return questions;
    
  } catch (error) {
    console.error('Error generating adaptive practice questions:', error);
    
    // Return fallback questions if generation fails
    return generateFallbackQuestions(courseName, unitNumber, questionCount);
  }
}

/**
 * Analyze previous performance to identify weak areas
 */
function analyzePerformance(previousAnswers) {
  if (!previousAnswers || previousAnswers.length === 0) {
    return "No previous performance data available. Generate general practice questions.";
  }
  
  const totalQuestions = previousAnswers.length;
  const correctAnswers = previousAnswers.filter(answer => answer.isCorrect).length;
  const accuracy = (correctAnswers / totalQuestions) * 100;
  
  // Analyze patterns in incorrect answers
  const incorrectAnswers = previousAnswers.filter(answer => !answer.isCorrect);
  const commonTopics = {};
  
  incorrectAnswers.forEach(answer => {
    if (answer.topic) {
      commonTopics[answer.topic] = (commonTopics[answer.topic] || 0) + 1;
    }
  });
  
  const weakTopics = Object.entries(commonTopics)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([topic, count]) => `${topic} (${count} incorrect)`);
  
  let analysis = `Overall accuracy: ${accuracy.toFixed(1)}% (${correctAnswers}/${totalQuestions} correct). `;
  
  if (weakTopics.length > 0) {
    analysis += `Areas needing improvement: ${weakTopics.join(', ')}. `;
  }
  
  if (accuracy < 60) {
    analysis += "Focus on fundamental concepts and basic understanding.";
  } else if (accuracy < 80) {
    analysis += "Focus on application and analysis questions.";
  } else {
    analysis += "Focus on advanced concepts and complex problem-solving.";
  }
  
  return analysis;
}

/**
 * Validate generated questions
 */
export function validateQuestions(questions) {
  if (!Array.isArray(questions)) {
    return false;
  }
  
  return questions.every(q => 
    q.question && 
    q.options && 
    q.options.length === 4 && 
    q.correctAnswer && 
    q.explanation &&
    ['A', 'B', 'C', 'D'].includes(q.correctAnswer.toUpperCase())
  );
}
