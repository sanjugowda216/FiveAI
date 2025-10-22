import React, { useState, useEffect } from 'react';

const TextToSpeechButton = ({ text, className = '', style = {} }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [bestVoice, setBestVoice] = useState(null);

  useEffect(() => {
    // Load the best available voice
    const loadBestVoice = () => {
      if (window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        
        // Priority order for the smoothest voices
        const voicePriority = [
          'Microsoft David Desktop',      // Windows - Very smooth male
          'Microsoft Zira Desktop',      // Windows - Very smooth female  
          'Microsoft Mark Desktop',      // Windows - Deep male
          'Alex',                        // Mac - High quality male
          'Samantha',                    // Mac - Premium female
          'Daniel',                      // Mac - British male
          'Karen',                       // Mac - Australian female
          'Moira',                       // Mac - Irish female
          'Google US English',           // Chrome - Very smooth
          'Microsoft Speech Platform',   // Windows alternative
          'Microsoft Hazel Desktop',     // Windows - British female
          'Microsoft Susan Desktop',     // Windows - Clear female
        ];
        
        // Find the best available voice
        let selectedVoice = null;
        for (const voiceName of voicePriority) {
          selectedVoice = voices.find(voice => 
            voice.name.includes(voiceName) || 
            voice.name === voiceName
          );
          if (selectedVoice) break;
        }
        
        // Fallback to first available voice
        if (!selectedVoice && voices.length > 0) {
          selectedVoice = voices[0];
        }
        
        setBestVoice(selectedVoice);
      }
    };

    loadBestVoice();
    
    // Some browsers load voices asynchronously
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadBestVoice;
    }

    // Clean up speech synthesis when component unmounts
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = () => {
    if (!window.speechSynthesis) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (isPlaying && !isPaused) {
      // Currently playing - pause it
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPaused) {
      // Currently paused - resume it
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      // Not playing - start it
      window.speechSynthesis.cancel(); // Cancel any existing speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Use the best available voice
      if (bestVoice) {
        utterance.voice = bestVoice;
      }
      
      // Optimized settings for smoothest speech
      utterance.rate = 0.8;   // Slower for smoother delivery
      utterance.pitch = 1.0;  // Natural pitch
      utterance.volume = 0.9; // High volume
      
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const getButtonIcon = () => {
    if (isPlaying && !isPaused) {
      return '⏸️'; // Pause icon
    } else if (isPaused) {
      return '▶️'; // Play icon
    } else {
      return '🔊'; // Speaker icon
    }
  };

  const getButtonTitle = () => {
    if (isPlaying && !isPaused) {
      return 'Pause reading';
    } else if (isPaused) {
      return 'Resume reading';
    } else {
      return 'Read aloud';
    }
  };

  return (
    <button
      onClick={handleToggleSpeech}
      title={getButtonTitle()}
      className={className}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        padding: '4px',
        borderRadius: '4px',
        transition: 'background-color 0.2s ease',
        ...style
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      {getButtonIcon()}
    </button>
  );
};

export default TextToSpeechButton;
