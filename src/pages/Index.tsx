import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
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

const Index: React.FC = () => {
  const { init, isInitialized, isJokerActive, replaceJoker, cancelJoker } = useGameStore();
  const [recentWords, setRecentWords] = useState<string[]>([]);
  
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
  }, [init, isInitialized]);

  return (
    <div className="twa-viewport flex flex-col h-screen">
      {/* Fixed Header */}
      <GameHeader />
      
      {/* Main Game Area - Structured for mobile screen */}
      <main className="flex-1 flex flex-col px-4 py-2 gap-4 overflow-hidden">
        
        {/* Word Building Display - Above Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full flex-shrink-0"
        >
          <WordBuilder onRecentWordsUpdate={setRecentWords} />
        </motion.div>
        
        {/* Game Grid - Center */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-shrink-0 flex justify-center"
        >
          <GameGrid />
        </motion.div>
        
        
        {/* Recent Words Carousel - Below Queue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full flex-shrink-0 mt-2"
        >
          <div className="flex items-center gap-3 p-3 rounded-2xl min-h-[60px]"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
          >
            <ScoreDisplay />
            
            {recentWords.length > 0 && (
              <>
                <div className="w-px h-6 bg-white/20" />
                <div 
                  className="flex gap-2 overflow-x-auto scrollbar-hide flex-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {recentWords.map((word, index) => (
                    <motion.span
                      key={`${word}-${index}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0"
                      style={{
                        backgroundColor: 'rgba(6, 182, 212, 0.2)',
                        color: '#06b6d4',
                        border: '1px solid rgba(6, 182, 212, 0.3)'
                      }}
                    >
                      {word.toUpperCase()}
                    </motion.span>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
        
      </main>

      {/* Letter Selector Overlay - Appears when joker is active */}
      <LetterSelector
        isOpen={isJokerActive}
        onClose={cancelJoker}
        onSelectLetter={replaceJoker}
      />
    </div>
  );
};

export default Index;
