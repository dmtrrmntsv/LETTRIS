import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import GameHeader from '../components/GameHeader';
import GameGrid from '../components/GameGrid';
import WordBuilder from '../components/WordBuilder';
import { useGameStore } from '../store/gameStore';
import { useTouchOptimization } from '../hooks/use-touch-optimization';

const Index: React.FC = () => {
  const { init, isInitialized } = useGameStore();
  
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
    <div className="twa-viewport flex flex-col">
      {/* Fixed Header */}
      <GameHeader />
      
      {/* Main Game Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col justify-center items-center p-4 gap-4 max-h-full">
          
          {/* Word Builder - Above Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-xs"
          >
            <WordBuilder />
          </motion.div>
          
          {/* Game Grid - Center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-shrink-0"
          >
            <GameGrid />
          </motion.div>
          
        </div>
      </main>
    </div>
  );
};

export default Index;