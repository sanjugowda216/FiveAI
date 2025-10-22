import {
  getAllFlashcards,
  addFlashcard,
  updateFlashcard,
  deleteFlashcard,
  getRandomFlashcards
} from '../services/flashcardStorage.js';

export async function listFlashcards(req, res) {
  try {
    const cards = await getAllFlashcards();
    res.json(cards);
  } catch (e) {
    console.error('List flashcards failed', e);
    res.status(500).json({ error: 'list_failed', message: e.message });
  }
}

export async function createFlashcard(req, res) {
  try {
    const { question, answer } = req.body ?? {};
    const card = await addFlashcard({ question, answer });
    res.status(201).json(card);
  } catch (e) {
    res.status(400).json({ error: 'create_failed', message: e.message });
  }
}

export async function editFlashcard(req, res) {
  try {
    const { id } = req.params;
    const { question, answer } = req.body ?? {};
    const card = await updateFlashcard(id, { question, answer });
    res.json(card);
  } catch (e) {
    res.status(400).json({ error: 'update_failed', message: e.message });
  }
}

export async function removeFlashcard(req, res) {
  try {
    const { id } = req.params;
    const result = await deleteFlashcard(id);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: 'delete_failed', message: e.message });
  }
}

export async function studyFlashcards(req, res) {
  try {
    const { count = 10 } = req.query;
    const cards = await getRandomFlashcards(Number(count));
    res.json(cards);
  } catch (e) {
    res.status(500).json({ error: 'study_failed', message: e.message });
  }
}

