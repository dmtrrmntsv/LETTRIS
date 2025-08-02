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
    <div className="w-full space-y-4 word-builder-area">
      
      {/* Current Word Display */}
      <AnimatePresence mode="wait">
        {currentWord && (
          <motion.div
            key={currentWord}
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: 1,
              rotate: validationState === 'invalid' ? [0, -2, 2, -2, 2, 0] : 0
            }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ 
              duration: 0.4,
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="text-center"
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xl backdrop-blur-sm border"
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

      {/* Action Buttons */}
      <AnimatePresence>
        {currentWord && currentWord.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ 
              delay: 0.2,
              type: "spring",
              stiffness: 300
            }}
            className="flex justify-center gap-4"
          >
            <motion.button
              className="ton-button flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm backdrop-blur-sm border border-white/10"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                boxShadow: '0 8px 25px -5px rgba(16, 185, 129, 0.3)'
              }}
              onClick={handleSubmitWord}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 12px 35px -5px rgba(16, 185, 129, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              disabled={validationState !== 'idle'}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                animate={{ rotate: validationState === 'idle' ? 0 : 360 }}
                transition={{ duration: 0.5 }}
              >
                <Send className="w-4 h-4" />
              </motion.div>
              Отправить
            </motion.button>
            
            <motion.button
              className="ton-button flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm backdrop-blur-sm border border-white/10"
              style={{
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                color: '#ffffff',
                boxShadow: '0 8px 25px -5px rgba(107, 114, 128, 0.3)'
              }}
              onClick={handleClearSelection}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 12px 35px -5px rgba(107, 114, 128, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                whileHover={{ rotate: -180 }}
                transition={{ duration: 0.3 }}
              >
                <RotateCcw className="w-4 h-4" />
              </motion.div>
              Сбросить
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Words Display */}
      <AnimatePresence>
        {recentWords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="text-center"
          >
            <motion.p 
              className="text-xs text-slate-400 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Последние слова:
            </motion.p>
            <motion.div 
              className="flex justify-center gap-2 flex-wrap"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate="visible"
            >
              {recentWords.slice(0, 3).map((word, index) => (
                <motion.span
                  key={`${word}-${index}`}
                  className="px-3 py-1 rounded-lg text-xs font-medium"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%)',
                    color: '#94a3b8',
                    border: '1px solid rgba(148, 163, 184, 0.2)'
                  }}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8, y: 10 },
                    visible: { opacity: 1, scale: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  {word.toUpperCase()}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WordBuilder;
