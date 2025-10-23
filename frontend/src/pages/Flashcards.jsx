import { useState } from 'react';
import FlashcardForm from '../components/FlashcardForm.jsx';
import FlashcardList from '../components/FlashcardList.jsx';
import FlashcardGame from '../components/FlashcardGame.jsx';

function Flashcards({ userProfile }) {
  const [activeTab, setActiveTab] = useState('manage');
  const [refresh, setRefresh] = useState(0);
  const [folders, setFolders] = useState([]);
  const handleCreated = () => setRefresh(r=>r+1);

  // Check if user is authenticated
  if (!userProfile?.uid) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.authContainer}>
          <div style={styles.authIcon}>🔐</div>
          <h1 style={styles.authTitle}>Authentication Required</h1>
          <p style={styles.authText}>Please log in to access your flashcards and start studying!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.header}>
        <h1 style={styles.title}>Flashcards</h1>
        <p style={styles.subtitle}>Create, manage, and study your personal flashcard collection</p>
      </div>

      <div style={styles.tabContainer}>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'manage' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('manage')}
        >
          <span style={styles.tabIcon}>📝</span>
          Manage Cards
        </button>
        <button 
          style={{
            ...styles.tabButton,
            ...(activeTab === 'study' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('study')}
        >
          <span style={styles.tabIcon}>🎯</span>
          Study Mode
        </button>
      </div>

      <div style={styles.contentContainer}>
        {activeTab === 'manage' ? (
          <div style={styles.manageContainer}>
            <FlashcardForm onCreated={handleCreated} userId={userProfile.uid} folders={folders} />
            <FlashcardList refreshKey={refresh} userId={userProfile.uid} onFoldersChange={setFolders} />
          </div>
        ) : (
          <FlashcardGame userId={userProfile.uid} />
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: '0 0 0.5rem 0',
    background: 'linear-gradient(135deg, #0078C8 0%, #005fa3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: 'var(--text-secondary)',
    margin: '0',
    fontWeight: '500',
    maxWidth: '600px',
    margin: '0 auto',
  },
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 2rem',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '2px solid var(--border-color)',
    borderRadius: '1rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  activeTab: {
    background: 'linear-gradient(135deg, #0078C8 0%, #005fa3 100%)',
    color: 'white',
    borderColor: 'transparent',
    boxShadow: '0 6px 20px rgba(0, 120, 200, 0.3)',
  },
  tabIcon: {
    fontSize: '1.3rem',
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  manageContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem',
    alignItems: 'center',
  },
  authContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    gap: '1.5rem',
    padding: '2rem',
  },
  authIcon: {
    fontSize: '4rem',
    opacity: '0.7',
  },
  authTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    margin: '0',
  },
  authText: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    margin: '0',
    maxWidth: '400px',
  },
};

export default Flashcards;
