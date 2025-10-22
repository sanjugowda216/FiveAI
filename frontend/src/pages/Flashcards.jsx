import { useState } from 'react';
import FlashcardForm from '../components/FlashcardForm.jsx';
import FlashcardList from '../components/FlashcardList.jsx';
import FlashcardGame from '../components/FlashcardGame.jsx';

function Flashcards() {
  const [activeTab, setActiveTab] = useState('manage');
  const [refresh, setRefresh] = useState(0);
  const handleCreated = () => setRefresh(r=>r+1);

  return (
    <div className="px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Flashcards</h1>
        <div className="flex space-x-4 justify-center mb-6">
          <button className={`px-4 py-2 rounded ${activeTab==='manage'?'bg-blue-500 text-white':'bg-gray-200'}`} onClick={()=>setActiveTab('manage')}>Manage</button>
          <button className={`px-4 py-2 rounded ${activeTab==='study'?'bg-blue-500 text-white':'bg-gray-200'}`} onClick={()=>setActiveTab('study')}>Study</button>
        </div>
        {activeTab==='manage' ? (
          <div className="space-y-8">
            <FlashcardForm onCreated={handleCreated} />
            <FlashcardList refreshKey={refresh} />
          </div>
        ) : (
          <FlashcardGame />
        )}
      </div>
    </div>
  );
}

export default Flashcards;
