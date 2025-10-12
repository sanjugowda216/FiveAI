import fs from 'fs';
import path from 'path';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { generateFileHash } from './cacheService.js';

const CEDS_DIR = path.join(process.cwd(), 'ceds');

// Store parsed CED content in memory
const cedContent = new Map();

/**
 * Discover all CED PDF files in the ceds directory
 */
export function discoverCedFiles() {
  try {
    if (!fs.existsSync(CEDS_DIR)) {
      console.log('CEDs directory does not exist, creating it...');
      fs.mkdirSync(CEDS_DIR, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(CEDS_DIR)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => ({
        filename: file,
        courseId: extractCourseId(file),
        filepath: path.join(CEDS_DIR, file)
      }))
      .filter(file => file.courseId); // Only include files with valid course IDs

    console.log(`Discovered ${files.length} CED files:`, files.map(f => f.filename));
    return files;
  } catch (error) {
    console.error('Error discovering CED files:', error);
    return [];
  }
}

/**
 * Extract course ID from filename (e.g., "ap-world-history.pdf" -> "ap-world-history")
 */
function extractCourseId(filename) {
  const match = filename.match(/^(.+)\.pdf$/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Parse a single CED PDF file and extract unit structure
 */
export async function parseCedFile(filepath) {
  try {
    console.log(`Parsing CED file: ${filepath}`);
    
    // Load PDF
    const loader = new PDFLoader(filepath);
    const docs = await loader.load();
    
    // Combine all pages into one text
    const fullText = docs.map(doc => doc.pageContent).join('\n\n');
    
    // Split into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1500,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', '']
    });
    
    const chunks = await textSplitter.splitText(fullText);
    
    // Extract unit structure
    const units = extractUnits(chunks);
    
    console.log(`Parsed ${chunks.length} chunks, found ${units.size} units`);
    return {
      chunks,
      units,
      fullText,
      hash: generateFileHash(filepath)
    };
  } catch (error) {
    console.error(`Error parsing CED file ${filepath}:`, error);
    throw error;
  }
}

/**
 * Extract unit structure from text chunks
 */
function extractUnits(chunks) {
  const units = new Map();
  
  // Common unit patterns in AP CEDs
  const unitPatterns = [
    /unit\s+(\d+)[\s:]/gi,
    /chapter\s+(\d+)[\s:]/gi,
    /part\s+(\d+)[\s:]/gi,
    /section\s+(\d+)[\s:]/gi
  ];
  
  chunks.forEach((chunk, index) => {
    for (const pattern of unitPatterns) {
      const matches = [...chunk.matchAll(pattern)];
      
      matches.forEach(match => {
        const unitNumber = parseInt(match[1]);
        if (unitNumber >= 1 && unitNumber <= 15) { // Reasonable unit range
          const unitKey = `unit-${unitNumber}`;
          
          if (!units.has(unitKey)) {
            units.set(unitKey, {
              number: unitNumber,
              chunks: [],
              title: extractUnitTitle(chunk, match.index)
            });
          }
          
          // Add this chunk to the unit
          units.get(unitKey).chunks.push({
            content: chunk,
            index
          });
        }
      });
    }
  });
  
  // If no units found, create default units based on chunk distribution
  if (units.size === 0) {
    console.log('No unit structure found, creating default units...');
    return createDefaultUnits(chunks);
  }
  
  return units;
}

/**
 * Extract unit title from chunk text
 */
function extractUnitTitle(chunk, matchIndex) {
  const lines = chunk.split('\n');
  const matchLine = lines.find(line => 
    line.toLowerCase().includes('unit') && 
    line.toLowerCase().includes(matchIndex.toString())
  );
  
  if (matchLine) {
    // Clean up the title
    return matchLine
      .replace(/unit\s+\d+[\s:]*/gi, '')
      .trim()
      .substring(0, 100); // Limit length
  }
  
  return 'Unit Content';
}

/**
 * Create default units when no structure is found
 */
function createDefaultUnits(chunks) {
  const units = new Map();
  const chunksPerUnit = Math.ceil(chunks.length / 9); // Assume 9 units max
  
  for (let i = 1; i <= 9; i++) {
    const startIndex = (i - 1) * chunksPerUnit;
    const endIndex = Math.min(i * chunksPerUnit, chunks.length);
    
    if (startIndex < chunks.length) {
      const unitChunks = chunks.slice(startIndex, endIndex).map((content, index) => ({
        content,
        index: startIndex + index
      }));
      
      units.set(`unit-${i}`, {
        number: i,
        chunks: unitChunks,
        title: `Unit ${i}`
      });
    }
  }
  
  return units;
}

/**
 * Get unit content for a specific course and unit
 */
export function getUnitContent(courseId, unitNumber) {
  const courseData = cedContent.get(courseId);
  if (!courseData) {
    return null;
  }
  
  const unitKey = `unit-${unitNumber}`;
  const unit = courseData.units.get(unitKey);
  
  if (!unit) {
    return null;
  }
  
  // Combine all chunks for this unit
  const content = unit.chunks
    .map(chunk => chunk.content)
    .join('\n\n');
  
  return {
    content,
    title: unit.title,
    chunkCount: unit.chunks.length
  };
}

/**
 * Get all available units for a course
 */
export function getAvailableUnits(courseId) {
  const courseData = cedContent.get(courseId);
  if (!courseData) {
    return [];
  }
  
  return Array.from(courseData.units.keys())
    .map(key => parseInt(key.replace('unit-', '')))
    .sort((a, b) => a - b);
}

/**
 * Initialize CED parsing for all discovered files
 */
export async function initializeCedParsing() {
  console.log('Initializing CED parsing...');
  
  const cedFiles = discoverCedFiles();
  
  if (cedFiles.length === 0) {
    console.log('No CED files found. Place PDF files in the /backend/ceds/ directory.');
    return;
  }
  
  for (const cedFile of cedFiles) {
    try {
      const parsedData = await parseCedFile(cedFile.filepath);
      cedContent.set(cedFile.courseId, parsedData);
      console.log(`Successfully parsed CED for ${cedFile.courseId}`);
    } catch (error) {
      console.error(`Failed to parse CED for ${cedFile.courseId}:`, error);
    }
  }
  
  console.log(`CED parsing complete. Loaded ${cedContent.size} courses.`);
}

/**
 * Get CED hash for cache invalidation
 */
export function getCedHash(courseId) {
  const courseData = cedContent.get(courseId);
  return courseData ? courseData.hash : null;
}

/**
 * Check if a course has been parsed
 */
export function hasCourseData(courseId) {
  return cedContent.has(courseId);
}
