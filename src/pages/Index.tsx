import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameHeader from '../components/GameHeader';
import GameGrid from '../components/GameGrid';
import WordBuilder from '../components/WordBuilder';
import FigureQueue from '../components/FigureQueue';
import ScoreDisplay from '../components/ScoreDisplay';
import LetterSelector from '../components/LetterSelector';
import { useGameStore } from '../store/gameStore';
import { useTouchOptimization } from '../hooks/use-touch-optimization';

interface Figure {
  shape: number[][];
  letters: string[];
  id: string;
  rotation?: number;
}

// Animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.95
  },
  in: {
    opacity: 1,
    scale: 1
  },
  out: {
    opacity: 0,
    scale: 1.05
  }
};

const pageTransition = {
  duration: 0.6
};

const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25
    }
  }
};

const Index: React.FC = () => {
  const { init, isInitialized, isJokerActive, replaceJoker, cancelJoker, fallingAnimations } = useGameStore();
  const [recentWords, setRecentWords] = useState<string[]>([]);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  useTouchOptimization();
  
  useEffect(() => {
    // Initialize Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.disableVerticalSwipes();
    }
    
    if (!isInitialized) {
      init();
    }

    // Trigger page loaded animation
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [init, isInitialized]);

  return (
    <motion.div 
      className="twa-viewport flex flex-col h-screen overflow-hidden"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {/* Background Animation */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 50%),radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
        }}
        animate={{
          background: [
            'radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 50%),radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.05) 0%, transparent 50%),radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.05) 0%, transparent 50%),radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 50%),radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)'
          ]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Fixed Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 30 }}
      >
        <GameHeader />
      </motion.div>
      
      {/* Main Game Area - Structured for mobile screen */}
      <motion.main 
        className="flex-1 flex flex-col px-4 py-2 gap-4 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate={isPageLoaded ? "visible" : "hidden"}
      >
        
        {/* Word Building Display - Above Grid */}
        <motion.div
          variants={itemVariants}
          className="w-full flex-shrink-0"
        >
          <WordBuilder onRecentWordsUpdate={setRecentWords} />
        </motion.div>
        
        {/* Game Grid - Center */}
        <motion.div
          variants={itemVariants}
          className="flex-shrink-0 flex justify-center relative"
        >
          <GameGrid />
          
          {/* Falling Animation Overlay */}
          <AnimatePresence>
            {fallingAnimations.map((animation, index) => (
              <motion.div
                key={`falling-${index}`}
                className="absolute pointer-events-none text-xl font-bold"
                style={{
                  left: `${animation.from.col * 68 + 34}px`,
                  top: `${animation.from.row * 68 + 34}px`,
                  color: '#06b6d4',
                  textShadow: '0 0 10px rgba(6, 182, 212, 0.5)'
                }}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 1
                }}
                animate={{
                  x: (animation.to.col - animation.from.col) * 68,
                  y: (animation.to.row - animation.from.row) * 68,
                  opacity: 0.7,
                  scale: 1.1
                }}
                exit={{
                  opacity: 0,
                  scale: 0.8
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                {animation.letter.toUpperCase()}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {/* Recent Words Carousel - Below Queue */}
        <motion.div
          variants={itemVariants}
          className="w-full flex-shrink-0 mt-2"
        >
          <motion.div 
            className="flex items-center gap-3 p-3 rounded-2xl min-h-[60px] backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
            whileHover={{
              boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.4)',
              scale: 1.02
            }}
            transition={{ duration: 0.2 }}
          >
            <ScoreDisplay />
            
            <AnimatePresence>
              {recentWords.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 flex-1"
                >
                  <motion.div 
                    className="w-px h-6 bg-white/20"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.2 }}
                  />
                  <motion.div 
                    className="flex gap-2 overflow-x-auto scrollbar-hide flex-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
                    {recentWords.map((word, index) => (
                      <motion.span
                        key={`${word}-${index}`}
                        className="px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0"
                        style={{
                          backgroundColor: 'rgba(6, 182, 212, 0.2)',
                          color: '#06b6d4',
                          border: '1px solid rgba(6, 182, 212, 0.3)'
                        }}
                        variants={{
                          hidden: { 
                            scale: 0, 
                            opacity: 0,
                            x: 20
                          },
                          visible: { 
                            scale: 1, 
                            opacity: 1,
                            x: 0,
                            transition: {
                              type: "spring",
                              stiffness: 500,
                              damping: 25
                            }
                          }
                        }}
                        whileHover={{ 
                          scale: 1.05,
                          backgroundColor: 'rgba(6, 182, 212, 0.3)',
                          boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)'
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {word.split('').map((letter, letterIndex) => (
                          <motion.span
                            key={letterIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              delay: letterIndex * 0.05,
                              type: "spring",
                              stiffness: 400
                            }}
                          >
                            {letter.toUpperCase()}
                          </motion.span>
                        ))}
                      </motion.span>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
        
      </motion.main>

      {/* Letter Selector Overlay - Appears when joker is active */}
      <AnimatePresence>
        {isJokerActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <LetterSelector
              isOpen={isJokerActive}
              onClose={cancelJoker}
              onSelectLetter={replaceJoker}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle Animation Overlay */}
      <motion.div 
        className="fixed inset-0 pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Index;
