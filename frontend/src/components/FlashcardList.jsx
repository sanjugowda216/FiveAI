import { useEffect, useState } from 'react';
import { getAllFlashcards, deleteFlashcard } from '../utils/api.js';
import './FlashcardGame.css';

function FlashcardList({ refreshKey, userId }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flippedIds, setFlippedIds] = useState({});

  useEffect(()=>{ refresh(); },[refreshKey]);

  async function refresh() {
    setLoading(true);
    try { 
      setCards(await getAllFlashcards(userId)); 
    } catch(e){ 
      alert(e.message);
    } finally{ 
      setLoading(false);
    } 
  }

  const toggle = id => setFlippedIds(f=>({...f,[id]:!f[id]}));

  async function handleDelete(id){ 
    if(!window.confirm('Delete this flashcard?')) return; 
    await deleteFlashcard(id, userId); 
    setCards(c=>c.filter(card=>card.id!==id)); 
  }

  if(loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
      <p style={styles.loadingText}>Loading flashcards...</p>
    </div>
  );
  
  if(!cards.length) return (
    <div style={styles.emptyContainer}>
      <div style={styles.emptyIcon}>📚</div>
      <h3 style={styles.emptyTitle}>No flashcards yet</h3>
      <p style={styles.emptyText}>Create your first flashcard to get started!</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Your Flashcards</h2>
        <p style={styles.subtitle}>{cards.length} card{cards.length !== 1 ? 's' : ''} • Click to flip</p>
      </div>
      
      <div className="flashcard-row">
        {cards.map(card=>{
          const isFlipped=flippedIds[card.id];
          return (
            <div key={card.id} style={styles.cardWrapper}>
              <div className={`flashcard-container ${isFlipped?'flashcard is-flipped':''}`} onClick={()=>toggle(card.id)}>
                <div className="flashcard-inner">
                  <div className="flashcard-face front">{card.question}</div>
                  <div className="flashcard-face back">{card.answer}</div>
                </div>
              </div>
              <button 
                onClick={()=>handleDelete(card.id)} 
                style={styles.deleteButton}
                title="Delete flashcard"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0 0 0.5rem 0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    margin: '0',
    fontWeight: '500',
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
    borderTop: '4px solid #667eea',
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
  cardWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: '0',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
    zIndex: '10',
  },
};

export default FlashcardList;
