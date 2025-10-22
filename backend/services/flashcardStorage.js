import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const { promises: fsPromises } = fs;

const DATA_DIR = path.join(process.cwd(), 'data');
const FLASHCARDS_PATH = path.join(DATA_DIR, 'flashcards.json');

export async function getAllFlashcards() {
  await ensureDataFile();
  const raw = await fsPromises.readFile(FLASHCARDS_PATH, 'utf-8');
  return JSON.parse(raw);
}

export async function addFlashcard({ question, answer }) {
  if (!question || !answer) {
    throw new Error('Both question and answer are required');
  }
  const flashcards = await getAllFlashcards();
  const newCard = {
    id: randomUUID(),
    question,
    answer,
    createdAt: new Date().toISOString(),
    updatedAt: null
  };
  flashcards.push(newCard);
  await fsPromises.writeFile(FLASHCARDS_PATH, JSON.stringify(flashcards, null, 2), 'utf-8');
  return newCard;
}

export async function updateFlashcard(id, { question, answer }) {
  if (!id) throw new Error('Flashcard id required');
  const flashcards = await getAllFlashcards();
  const idx = flashcards.findIndex(fc => fc.id === id);
  if (idx === -1) throw new Error('Flashcard not found');
  flashcards[idx] = {
    ...flashcards[idx],
    question: question ?? flashcards[idx].question,
    answer: answer ?? flashcards[idx].answer,
    updatedAt: new Date().toISOString()
  };
  await fsPromises.writeFile(FLASHCARDS_PATH, JSON.stringify(flashcards, null, 2), 'utf-8');
  return flashcards[idx];
}

export async function deleteFlashcard(id) {
  if (!id) throw new Error('Flashcard id required');
  const flashcards = await getAllFlashcards();
  const updated = flashcards.filter(fc => fc.id !== id);
  if (updated.length === flashcards.length) throw new Error('Flashcard not found');
  await fsPromises.writeFile(FLASHCARDS_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  return { deleted: true };
}

export async function getRandomFlashcards(count = 10) {
  const flashcards = await getAllFlashcards();
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

