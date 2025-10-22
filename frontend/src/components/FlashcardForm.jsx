import { useState } from 'react';
import { createFlashcard } from '../utils/api.js';

function FlashcardForm({ onCreated }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    setLoading(true);
    try {
      const newCard = await createFlashcard(question.trim(), answer.trim());
      setQuestion('');
      setAnswer('');
      onCreated?.(newCard);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div>
        <label className="block font-semibold mb-1">Word</label>
        <input value={question} onChange={(e)=>setQuestion(e.target.value)} className="w-full p-2 border rounded" placeholder="Enter word"/>
      </div>
      <div>
        <label className="block font-semibold mb-1">Definition</label>
        <textarea value={answer} onChange={(e)=>setAnswer(e.target.value)} className="w-full p-2 border rounded" rows="3" placeholder="Enter definition"/>
      </div>
      <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
        {loading ? 'Saving…' : 'Add Flashcard'}
      </button>
    </form>
  );
}

export default FlashcardForm;
