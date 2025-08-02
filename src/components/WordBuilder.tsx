import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Send, RotateCcw } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getDictionary } from '../utils/dictionary';

interface WordBuilderProps {
  onRecentWordsUpdate?: (words: string[]) => void;
}

const WordBuilder: React.FC<WordBuilderProps> = ({ onRecentWordsUpdate }) => {
  const { selectedLetters, currentWord, submitWord, clearSelection } = useGameStore();
  const [validationState, setValidationState] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [recentWords, setRecentWords] = useState<string[]>([]);

  const handleSubmitWord = useCallback(async () => {
    if (currentWord.length < 3) return;
    
    const dictionary = getDictionary();
    const isValid = dictionary.contains(currentWord);
    
    setValidationState(isValid ? 'valid' : 'invalid');
    
    if (isValid) {
      const newRecentWords = [currentWord, ...recentWords.slice(0, 4)];
      setRecentWords(newRecentWords);
      
      // Update parent component
      if (onRecentWordsUpdate) {
        onRecentWordsUpdate(newRecentWords);
      }
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50]);
      }
      
      // Telegram WebApp haptic feedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      setTimeout(() => {
        submitWord(currentWord);
        setValidationState('idle');
      }, 800);
    } else {
      // Error haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      }
      
      setTimeout(() => {
        setValidationState('idle');
      }, 1000);
    }
  }, [currentWord, submitWord, recentWords, onRecentWordsUpdate]);

  const handleClearSelection = useCallback(() => {
    clearSelection();
    setValidationState('idle');
  }, [clearSelection]);

  // Simplified event handling - only handle clicks outside to clear
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.word-builder-area') && 
          !target.closest('.game-grid') && 
          !target.closest('.ton-button') && 
          currentWord.length > 0) {
        handleClearSelection();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, [currentWord, handleClearSelection]);

  const getWordDisplayColor = () => {
    switch (validationState) {
      case 'valid': return 'var(--tg-theme-accent-text-color)';
      case 'invalid': return 'var(--tg-theme-destructive-text-color)';
      default: return 'var(--ton-main)';
    }
  };

  return (
    <div className="w-full space-y-3 word-builder-area">
      
      {/* Current Word Display */}
      <AnimatePresence mode="wait">
        {currentWord && (
          <motion.div
            key={currentWord}
            initial={{ opacity: 0, y: -10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: validationState === 'valid' ? [1, 1.1, 1] : validationState === 'invalid' ? [1, 0.95, 1] : 1
            }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ton-glass"
              style={{ color: getWordDisplayColor() }}
            >
              {validationState === 'valid' && <Check className="w-5 h-5" />}
              {validationState === 'invalid' && <X className="w-5 h-5" />}
              {currentWord.toUpperCase()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      {currentWord && currentWord.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-3"
        >
          <motion.button
            className="ton-button flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm"
            style={{
              background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
              color: '#ffffff'
            }}
            onClick={handleSubmitWord}
            whileTap={{ scale: 0.95 }}
            disabled={validationState !== 'idle'}
          >
            <Send className="w-4 h-4" />
            Отправить
          </motion.button>
          
          <motion.button
            className="ton-button flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm"
            style={{
              background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
              color: '#f1f5f9'
            }}
            onClick={handleClearSelection}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-4 h-4" />
            Сбросить
          </motion.button>
        </motion.div>
      )}

      
    </div>
  );
};

export default WordBuilder;
