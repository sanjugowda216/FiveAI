import { useEffect, useState, useCallback } from 'react';
import { getRandomStudyFlashcards } from '../utils/api.js';
import './FlashcardGame.css';

function FlashcardGame({ userId }) {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ load(); },[]);

  const load = async ()=>{
    setLoading(true);
    try{ 
      const data = await getRandomStudyFlashcards(10, userId); 
      setCards(data); 
      setIndex(0); 
      setFlipped(false);
    }catch(e){
      alert(e.message);
    }finally{
      setLoading(false);
    } 
  };

  const next = useCallback(()=>{ 
    if(index<cards.length-1){ 
      setIndex(i=>i+1); 
      setFlipped(false);
    } 
  },[index,cards.length]);
  
  const prev = useCallback(()=>{ 
    if(index>0){ 
      setIndex(i=>i-1); 
      setFlipped(false);
    } 
  },[index]);

  useEffect(()=>{
    const handleKey=e=>{
      if(e.code==='Space'){e.preventDefault();setFlipped(f=>!f);} 
      else if(e.code==='ArrowRight'){next();} 
      else if(e.code==='ArrowLeft'){prev();}
    };
    window.addEventListener('keydown',handleKey); 
    return ()=>window.removeEventListener('keydown',handleKey);
  },[next,prev]);

  if(loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading study cards...</p>
    </div>
  );
  
  if(!cards.length) return (
    <div style={styles.emptyContainer}>
      <div style={styles.emptyIcon}>🎯</div>
      <h3 style={styles.emptyTitle}>No flashcards to study</h3>
      <p style={styles.emptyText}>Create some flashcards first to start studying!</p>
    </div>
  );
  
  const current=cards[index];

  return(
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Study Mode</h2>
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${((index + 1) / cards.length) * 100}%`
            }}></div>
          </div>
          <p style={styles.progressText}>{index + 1} / {cards.length}</p>
        </div>
      </div>

      <div style={styles.cardContainer}>
        <div className={`flashcard-container ${flipped?'flashcard is-flipped':''}`} onClick={()=>setFlipped(f=>!f)}>
          <div className="flashcard-inner">
            <div className="flashcard-face front">{current.question}</div>
            <div className="flashcard-face back">{current.answer}</div>
          </div>
        </div>
        
        <div style={styles.cardActions}>
          <button 
            onClick={()=>setFlipped(f=>!f)} 
            style={styles.flipButton}
          >
            <span style={styles.buttonIcon}>🔄</span>
            Flip Card
            <span style={styles.keyHint}>(Space)</span>
          </button>
        </div>
      </div>

      <div style={styles.navigation}>
        <button 
          onClick={prev} 
          disabled={index===0} 
          style={{
            ...styles.navButton,
            ...styles.prevButton,
            ...(index===0 ? styles.disabledButton : {})
          }}
        >
          <span style={styles.buttonIcon}>←</span>
          Previous
          <span style={styles.keyHint}>(←)</span>
        </button>
        
        <button 
          onClick={next} 
          disabled={index===cards.length-1} 
          style={{
            ...styles.navButton,
            ...styles.nextButton,
            ...(index===cards.length-1 ? styles.disabledButton : {})
          }}
        >
          Next
          <span style={styles.buttonIcon}>→</span>
          <span style={styles.keyHint}>(→)</span>
        </button>
      </div>

      <div style={styles.footer}>
        <button onClick={load} style={styles.refreshButton}>
          <span style={styles.buttonIcon}>🔄</span>
          New Study Session
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  header: {
    textAlign: 'center',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 1rem 0',
    background: 'linear-gradient(135deg, #0078C8 0%, #005fa3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  progressBar: {
    width: '100%',
    maxWidth: '300px',
    height: '8px',
    backgroundColor: 'var(--border-color)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(135deg, #0078C8 0%, #005fa3 100%)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    margin: '0',
    fontWeight: '500',
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'center',
  },
  flipButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '2px solid var(--border-color)',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  prevButton: {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '2px solid var(--border-color)',
  },
  nextButton: {
    background: 'linear-gradient(135deg, #0078C8 0%, #005fa3 100%)',
    color: 'white',
  },
  disabledButton: {
    opacity: '0.5',
    cursor: 'not-allowed',
  },
  buttonIcon: {
    fontSize: '1.1rem',
  },
  keyHint: {
    fontSize: '0.8rem',
    opacity: '0.7',
    fontWeight: '400',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: '2px solid var(--border-color)',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid var(--border-color)',
    borderTop: '4px solid #0078C8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    margin: '0',
    fontWeight: '500',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center',
    gap: '1rem',
  },
  emptyIcon: {
    fontSize: '4rem',
    opacity: '0.6',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: '0',
  },
  emptyText: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    margin: '0',
    maxWidth: '300px',
  },
};

export default FlashcardGame;
