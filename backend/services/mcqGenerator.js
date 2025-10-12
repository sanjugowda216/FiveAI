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
  questions: z.array(MCQQuestionSchema).describe('Array of 5-8 multiple choice questions')
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

// Create prompt template
const promptTemplate = new PromptTemplate({
  template: `You are an expert AP exam question writer. Generate 5-8 high-quality multiple choice questions based on the provided course content.

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

{format_instructions}`,
  inputVariables: ['courseName', 'unitNumber', 'unitTitle', 'content'],
  partialVariables: {
    format_instructions: outputParser.getFormatInstructions()
  }
});

/**
 * Generate MCQ questions for a specific unit
 */
export async function generateMCQQuestions(courseName, unitNumber, unitTitle, content) {
  try {
    console.log(`Generating MCQ questions for ${courseName} Unit ${unitNumber}...`);
    
    // Check if LLM is available
    if (!llm) {
      console.warn('OpenAI API key not configured, returning fallback questions');
      return generateFallbackQuestions(courseName, unitNumber);
    }
    
    // Truncate content if too long to stay within token limits
    const maxContentLength = 3000; // Roughly 750 tokens
    const truncatedContent = content.length > maxContentLength 
      ? content.substring(0, maxContentLength) + '...'
      : content;
    
    // Create the prompt
    const prompt = await promptTemplate.format({
      courseName,
      unitNumber,
      unitTitle,
      content: truncatedContent
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
    return generateFallbackQuestions(courseName, unitNumber);
  }
}

/**
 * Generate fallback questions when AI generation fails
 */
function generateFallbackQuestions(courseName, unitNumber) {
  return [
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
}

/**
 * Generate questions with retry logic
 */
export async function generateMCQWithRetry(courseName, unitNumber, unitTitle, content, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const questions = await generateMCQQuestions(courseName, unitNumber, unitTitle, content);
      
      // Validate that we got reasonable questions
      if (questions && questions.length >= 3) {
        return questions;
      }
      
      throw new Error(`Generated only ${questions?.length || 0} questions, expected at least 3`);
      
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
  return generateFallbackQuestions(courseName, unitNumber);
}

/**
 * Estimate token usage for content
 */
export function estimateTokenUsage(content) {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(content.length / 4);
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
