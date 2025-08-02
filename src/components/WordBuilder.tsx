import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getDictionary } from '../utils/dictionary';

interface WordBuilderProps {
  onRecentWordsUpdate?: (words: string[]) => void;
}

const WordBuilder: React.FC<WordBuilderProps> = ({ onRecentWordsUpdate }) => {
  const { selectedLetters, currentWord, submitWord, clearSelection } = useGameStore();
  const [validationState, setValidationState] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [recentWords, setRecentWords] = useState<string[]>([]);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const wordBuilderRef = useRef<HTMLDivElement>(null);

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

  // Gesture-based submission logic
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (currentWord.length < 3) return;
    
    const touch = event.touches[0];
    setTouchStartTime(Date.now());
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
  }, [currentWord]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (currentWord.length < 3) return;
    
    const touch = event.changedTouches[0];
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    
    const deltaX = touch.clientX - touchStartPos.x;
    const deltaY = touch.clientY - touchStartPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Short tap (< 300ms) and minimal movement = submit word
    if (touchDuration < 300 && distance < 30) {
      handleSubmitWord();
    }
    // Drag back gesture: significant leftward movement or upward movement
    else if (deltaX < -50 || deltaY < -50) {
      handleClearSelection();
    }
  }, [currentWord, touchStartTime, touchStartPos, handleSubmitWord, handleClearSelection]);

  // Simplified event handling - only handle clicks outside to clear
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.word-builder-area') && 
          !target.closest('.game-grid') && 
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
      case 'valid': return '#10b981';
      case 'invalid': return '#ef4444';
      default: return '#06b6d4';
    }
  };

  const getBgColor = () => {
    switch (validationState) {
      case 'valid': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'invalid': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      default: return 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)';
    }
  };

  return (
    <div className="w-full word-builder-area">
      
      {/* Current Word Display - Fixed Height Container */}
      <div className="text-center h-20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {currentWord && (
            <motion.div
              key={currentWord}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                rotate: validationState === 'invalid' ? [-2, 2] : 0
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ 
                duration: 0.4,
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
            >
              <motion.div 
                ref={wordBuilderRef}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xl backdrop-blur-sm border cursor-pointer"
                style={{ 
                  background: getBgColor(),
                  color: '#ffffff',
                  border: `2px solid ${getWordDisplayColor()}`,
                  boxShadow: `0 10px 30px -5px ${getWordDisplayColor()}30`
                }}
                animate={{
                  boxShadow: validationState === 'valid' 
                    ? `0 10px 30px -5px ${getWordDisplayColor()}60`
                    : validationState === 'invalid'
                    ? `0 10px 30px -5px ${getWordDisplayColor()}60`
                    : `0 10px 30px -5px ${getWordDisplayColor()}30`
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => {
                  if (currentWord.length >= 3) {
                    handleSubmitWord();
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {validationState === 'valid' && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <Check className="w-6 h-6" />
                    </motion.div>
                  )}
                  {validationState === 'invalid' && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <X className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <motion.span
                  key={currentWord}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {currentWord.split('').map((letter, index) => (
                    <motion.span
                      key={`${currentWord}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 400
                      }}
                    >
                      {letter.toUpperCase()}
                    </motion.span>
                  ))}
                </motion.span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gesture Instructions - Fixed Height Container */}
      <div className="text-center h-8 flex items-center justify-center">
        <AnimatePresence>
          {currentWord && currentWord.length >= 3 && (
            <motion.p 
              className="text-xs text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              Коснитесь слова для отправки • Проведите влево/вверх для сброса
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WordBuilder;
