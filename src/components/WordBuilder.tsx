import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getDictionary } from '../utils/dictionary';

const WordBuilder: React.FC = () => {
  const { selectedLetters, currentWord, submitWord, clearSelection } = useGameStore();
  const [validationState, setValidationState] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [recentWords, setRecentWords] = useState<string[]>([]);

  const handleSubmitWord = useCallback(async () => {
    if (currentWord.length < 3) return;
    
    const dictionary = getDictionary();
    const isValid = dictionary.contains(currentWord);
    
    setValidationState(isValid ? 'valid' : 'invalid');
    
    if (isValid) {
      setRecentWords(prev => [currentWord, ...prev.slice(0, 4)]);
      
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
  }, [currentWord, submitWord]);

  const getWordDisplayColor = () => {
    switch (validationState) {
      case 'valid': return 'var(--tg-theme-accent-text-color)';
      case 'invalid': return 'var(--tg-theme-destructive-text-color)';
      default: return 'var(--ton-main)';
    }
  };

  return (
    <div className="w-full space-y-3">
      
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
      {currentWord && (
        <div className="flex justify-center gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={clearSelection}
            className="flex items-center gap-1 px-3 py-2 rounded-lg ton-glass touch-friendly"
            style={{ color: 'var(--tg-theme-hint-color)' }}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Сброс</span>
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmitWord}
            disabled={currentWord.length < 3 || validationState !== 'idle'}
            className="px-4 py-2 rounded-lg font-medium text-sm touch-friendly disabled:opacity-50"
            style={{
              backgroundColor: 'var(--tg-theme-button-color)',
              color: 'var(--tg-theme-button-text-color)'
            }}
          >
            Слово!
          </motion.button>
        </div>
      )}

      {/* Recent Words */}
      <AnimatePresence>
        {recentWords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ton-glass rounded-2xl p-3"
          >
            <h3 
              className="text-xs font-medium mb-2"
              style={{ color: 'var(--tg-theme-section-header-text-color)' }}
            >
              Найденные слова
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentWords.map((word, index) => (
                <motion.span
                  key={`${word}-${index}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-2 py-1 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                    color: 'var(--tg-theme-text-color)'
                  }}
                >
                  {word.toUpperCase()}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default WordBuilder;