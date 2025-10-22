import { useEffect, useState, useCallback } from 'react';
import { getRandomStudyFlashcards } from '../utils/api.js';
import './FlashcardGame.css';

function FlashcardGame() {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ load(); },[]);

  const load = async ()=>{
    setLoading(true);
    try{ const data = await getRandomStudyFlashcards(10); setCards(data); setIndex(0); setFlipped(false);}catch(e){alert(e.message);}finally{setLoading(false);} };

  const next = useCallback(()=>{ if(index<cards.length-1){ setIndex(i=>i+1); setFlipped(false);} },[index,cards.length]);
  const prev = useCallback(()=>{ if(index>0){ setIndex(i=>i-1); setFlipped(false);} },[index]);

  useEffect(()=>{
    const handleKey=e=>{
      if(e.code==='Space'){e.preventDefault();setFlipped(f=>!f);} else if(e.code==='ArrowRight'){next();} else if(e.code==='ArrowLeft'){prev();}
    };
    window.addEventListener('keydown',handleKey); return ()=>window.removeEventListener('keydown',handleKey);
  },[next,prev]);

  if(loading) return <p>Loading…</p>;
  if(!cards.length) return <p>No flashcards to study.</p>;
  const current=cards[index];

  return(
    <div className="space-y-4 text-center">
      <div className={`flashcard-container ${flipped?'flashcard is-flipped':''}`} onClick={()=>setFlipped(f=>!f)}>
        <div className="flashcard-inner">
          <div className="flashcard-face front">{current.question}</div>
          <div className="flashcard-face back">{current.answer}</div>
        </div>
      </div>
      <p>{index+1} / {cards.length}</p>
      <div className="flex justify-center gap-4">
        <button onClick={prev} disabled={index===0} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Prev (←)</button>
        <button onClick={()=>setFlipped(f=>!f)} className="px-4 py-2 bg-yellow-300 rounded">Flip (Space)</button>
        <button onClick={next} disabled={index===cards.length-1} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">Next (→)</button>
      </div>
    </div>
  );
}

export default FlashcardGame;
