import { useEffect, useState } from 'react';
import { getAllFlashcards, deleteFlashcard } from '../utils/api.js';
import './FlashcardGame.css';

function FlashcardList({ refreshKey }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flippedIds, setFlippedIds] = useState({});

  useEffect(()=>{ refresh(); },[refreshKey]);

  async function refresh() {
    setLoading(true);
    try { setCards(await getAllFlashcards()); } catch(e){ alert(e.message);} finally{ setLoading(false);} }

  const toggle = id => setFlippedIds(f=>({...f,[id]:!f[id]}));

  async function handleDelete(id){ if(!window.confirm('Delete this flashcard?')) return; await deleteFlashcard(id); setCards(c=>c.filter(card=>card.id!==id)); }

  if(loading) return <p>Loading…</p>;
  if(!cards.length) return <p>No flashcards yet.</p>;

  return (
    <div className="flashcard-row">
      {cards.map(card=>{
        const isFlipped=flippedIds[card.id];
        return (
          <div key={card.id} className="relative" style={{width:220}}>
            <div className={`flashcard-container ${isFlipped?'flashcard is-flipped':''}`} onClick={()=>toggle(card.id)}>
              <div className="flashcard-inner">
                <div className="flashcard-face front">{card.question}</div>
                <div className="flashcard-face back">{card.answer}</div>
              </div>
            </div>
            <button onClick={()=>handleDelete(card.id)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-[10px] flex items-center justify-center shadow-lg opacity-0 hover:opacity-100 transition-transform duration-150 hover:scale-110" title="Delete">✕</button>
          </div>
        );
      })}
    </div>
  );
}

export default FlashcardList;
