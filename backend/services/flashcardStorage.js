import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const { promises: fsPromises } = fs;

const DATA_DIR = path.join(process.cwd(), 'data');
const FLASHCARDS_PATH = path.join(DATA_DIR, 'flashcards.json');

export async function getAllFlashcards(userId = null) {
  await ensureDataFile();
  const raw = await fsPromises.readFile(FLASHCARDS_PATH, 'utf-8');
  const allFlashcards = JSON.parse(raw);
  
  // If userId is provided, filter by user
  if (userId) {
    return allFlashcards.filter(card => card.userId === userId);
  }
  
  return allFlashcards;
}

export async function addFlashcard({ question, answer, userId }) {
  if (!question || !answer) {
    throw new Error('Both question and answer are required');
  }
  if (!userId) {
    throw new Error('User ID is required');
  }
  const flashcards = await getAllFlashcards();
  const newCard = {
    id: randomUUID(),
    question,
    answer,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: null
  };
  flashcards.push(newCard);
  await fsPromises.writeFile(FLASHCARDS_PATH, JSON.stringify(flashcards, null, 2), 'utf-8');
  return newCard;
}

export async function updateFlashcard(id, { question, answer, userId }) {
  if (!id) throw new Error('Flashcard id required');
  if (!userId) throw new Error('User ID is required');
  const flashcards = await getAllFlashcards();
  const idx = flashcards.findIndex(fc => fc.id === id);
  if (idx === -1) throw new Error('Flashcard not found');
  
  // Check if the flashcard belongs to the user
  if (flashcards[idx].userId !== userId) {
    throw new Error('You can only update your own flashcards');
  }
  
  flashcards[idx] = {
    ...flashcards[idx],
    question: question ?? flashcards[idx].question,
    answer: answer ?? flashcards[idx].answer,
    updatedAt: new Date().toISOString()
  };
  await fsPromises.writeFile(FLASHCARDS_PATH, JSON.stringify(flashcards, null, 2), 'utf-8');
  return flashcards[idx];
}

export async function deleteFlashcard(id, userId) {
  if (!id) throw new Error('Flashcard id required');
  if (!userId) throw new Error('User ID is required');
  const flashcards = await getAllFlashcards();
  const flashcard = flashcards.find(fc => fc.id === id);
  
  if (!flashcard) throw new Error('Flashcard not found');
  
  // Check if the flashcard belongs to the user
  if (flashcard.userId !== userId) {
    throw new Error('You can only delete your own flashcards');
  }
  
  const updated = flashcards.filter(fc => fc.id !== id);
  await fsPromises.writeFile(FLASHCARDS_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  return { deleted: true };
}

export async function getRandomFlashcards(count = 10, userId = null) {
  const flashcards = await getAllFlashcards(userId);
  const shuffled = flashcards.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, flashcards.length));
}

async function ensureDataFile() {
  await fsPromises.mkdir(DATA_DIR, { recursive: true });
  try {
    await fsPromises.access(FLASHCARDS_PATH, fs.constants.F_OK);
  } catch {
    await fsPromises.writeFile(FLASHCARDS_PATH, '[]', 'utf-8');
  }
}

