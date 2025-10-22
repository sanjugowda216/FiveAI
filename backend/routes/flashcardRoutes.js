import express from 'express';
import {
  listFlashcards,
  createFlashcard,
  editFlashcard,
  removeFlashcard,
  studyFlashcards
} from '../controllers/flashcardController.js';

const router = express.Router();

router.get('/study/random', studyFlashcards);
router.get('/', listFlashcards);
router.post('/', createFlashcard);
router.put('/:id', editFlashcard);
router.delete('/:id', removeFlashcard);

export default router;
