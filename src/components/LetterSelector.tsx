import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useGameStore } from '../store/gameStore';

interface LetterSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLetter: (letter: string) => void;
}

const LetterSelector: React.FC<LetterSelectorProps> = ({ isOpen, onClose, onSelectLetter }) => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const { isJokerActive, cancelJoker } = useGameStore();

  // Russian alphabet organized by frequency and type
  const innerCircle = ['А', 'Е', 'И', 'О', 'У', 'Ы', 'Э', 'Ю', 'Я', 'Н', 'Т', 'С', 'Р'];
  const outerCircle = ['В', 'Л', 'К', 'М', 'Д', 'П', 'Г', 'З', 'Б', 'Ч', 'Й', 'Х', 'Ж', 'Ш', 'Ц', 'Щ', 'Ф', 'Ё', 'Ь', 'Ъ'];

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    // Telegram WebApp haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  };

  const handleConfirm = () => {
    if (selectedLetter) {
      onSelectLetter(selectedLetter.toLowerCase());
      setSelectedLetter(null);
    }
  };

  const handleClose = () => {
    // If closing without selecting a letter and joker is active, cancel it
    if (isJokerActive && !selectedLetter) {
      cancelJoker();
    }
    setSelectedLetter(null);
    onClose();
  };

  const getLetterPosition = (index: number, total: number, radius: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 bg-transparent border-none shadow-none">
        <VisuallyHidden>
          <DialogTitle>Выберите букву</DialogTitle>
        </VisuallyHidden>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="relative w-80 h-80 mx-auto"
        >
          {/* Background */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(148, 163, 184, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          />

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute -top-2 -right-2 z-20 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Center Title */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center z-10">
              <h3 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>
                Выберите букву
              </h3>
              {selectedLetter && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold mb-3"
                  style={{ color: '#06b6d4' }}
                >
                  {selectedLetter}
                </motion.div>
              )}
              {selectedLetter && (
                <Button
                  onClick={handleConfirm}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-2 rounded-xl font-medium"
                >
                  Подтвердить
                </Button>
              )}
            </div>
          </div>

          {/* Inner Circle Letters */}
          <div className="absolute inset-0">
            {innerCircle.map((letter, index) => {
              const position = getLetterPosition(index, innerCircle.length, 85);
              const isSelected = selectedLetter === letter;
              
              return (
                <motion.button
                  key={`inner-${letter}`}
                  className="absolute w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm touch-friendly"
                  style={{
                    left: `calc(50% + ${position.x}px - 22px)`,
                    top: `calc(50% + ${position.y}px - 22px)`,
                    background: isSelected 
                      ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                      : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    color: isSelected ? '#ffffff' : '#f1f5f9',
                    border: isSelected ? '2px solid #06b6d4' : '2px solid #475569',
                    boxShadow: isSelected ? '0 8px 32px rgba(6, 182, 212, 0.4)' : 'none',
                    minWidth: '44px',
                    minHeight: '44px'
                  }}
                  onClick={() => handleLetterClick(letter)}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                >
                  {letter}
                </motion.button>
              );
            })}
          </div>

          {/* Outer Circle Letters */}
          <div className="absolute inset-0">
            {outerCircle.map((letter, index) => {
              const position = getLetterPosition(index, outerCircle.length, 130);
              const isSelected = selectedLetter === letter;
              
              return (
                <motion.button
                  key={`outer-${letter}`}
                  className="absolute w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm touch-friendly"
                  style={{
                    left: `calc(50% + ${position.x}px - 22px)`,
                    top: `calc(50% + ${position.y}px - 22px)`,
                    background: isSelected 
                      ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                      : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    color: isSelected ? '#ffffff' : '#f1f5f9',
                    border: isSelected ? '2px solid #06b6d4' : '2px solid #475569',
                    boxShadow: isSelected ? '0 8px 32px rgba(6, 182, 212, 0.4)' : 'none',
                    minWidth: '44px',
                    minHeight: '44px'
                  }}
                  onClick={() => handleLetterClick(letter)}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                >
                  {letter}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default LetterSelector;
