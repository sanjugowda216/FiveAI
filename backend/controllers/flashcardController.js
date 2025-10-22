import {
  getAllFlashcards,
  addFlashcard,
  updateFlashcard,
  deleteFlashcard,
  getRandomFlashcards
} from '../services/flashcardStorage.js';

export async function listFlashcards(req, res) {
  try {
    const userId = req.user?.uid; // Get user ID from authenticated request
    if (!userId) {
      return res.status(401).json({ error: 'unauthorized', message: 'User authentication required' });
    }
    
    const cards = await getAllFlashcards(userId);
    res.json(cards);
  } catch (e) {
    console.error('List flashcards failed', e);
    res.status(500).json({ error: 'list_failed', message: e.message });
  }
}

export async function createFlashcard(req, res) {
  try {
    const userId = req.user?.uid; // Get user ID from authenticated request
    if (!userId) {
      return res.status(401).json({ error: 'unauthorized', message: 'User authentication required' });
    }
    
    const { question, answer } = req.body ?? {};
    const card = await addFlashcard({ question, answer, userId });
    res.status(201).json(card);
  } catch (e) {
    res.status(400).json({ error: 'create_failed', message: e.message });
  }
}

export async function editFlashcard(req, res) {
  try {
    const userId = req.user?.uid; // Get user ID from authenticated request
    if (!userId) {
      return res.status(401).json({ error: 'unauthorized', message: 'User authentication required' });
    }
    
    const { id } = req.params;
    const { question, answer } = req.body ?? {};
    const card = await updateFlashcard(id, { question, answer, userId });
    res.json(card);
  } catch (e) {
    res.status(400).json({ error: 'update_failed', message: e.message });
  }
}

export async function removeFlashcard(req, res) {
  try {
    const userId = req.user?.uid; // Get user ID from authenticated request
    if (!userId) {
      return res.status(401).json({ error: 'unauthorized', message: 'User authentication required' });
    }
    
    const { id } = req.params;
    const result = await deleteFlashcard(id, userId);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: 'delete_failed', message: e.message });
  }
}

export async function studyFlashcards(req, res) {
  try {
    const userId = req.user?.uid; // Get user ID from authenticated request
    if (!userId) {
      return res.status(401).json({ error: 'unauthorized', message: 'User authentication required' });
    }
    
    const { count = 10 } = req.query;
    const cards = await getRandomFlashcards(Number(count), userId);
    res.json(cards);
  } catch (e) {
    res.status(500).json({ error: 'study_failed', message: e.message });
  }
}

