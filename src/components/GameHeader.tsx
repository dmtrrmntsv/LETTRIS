import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Coins, Trophy } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const GameHeader: React.FC = () => {
  const { lives, coins, score } = useGameStore();

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between px-4 py-3 bg-[var(--tg-theme-section-bg-color)] border-b border-white/10"
      style={{ backgroundColor: 'var(--tg-theme-section-bg-color)' }}
    >
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--ton-gradient-start)] to-[var(--ton-gradient-end)] flex items-center justify-center">
          <Trophy className="w-4 h-4 text-white" />
        </div>
        <h1 
          className="text-lg font-bold"
          style={{ color: 'var(--tg-theme-text-color)' }}
        >
          Словотетрис
        </h1>
      </div>

      {/* Right: Lives & Balance Combined */}
      <motion.div 
        className="flex items-center gap-3 px-3 py-2 rounded-xl ton-glass cursor-pointer touch-friendly"
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          // Open lives modal
          if ('vibrate' in navigator) navigator.vibrate(10);
        }}
      >
        <div className="flex items-center gap-1">
          <Heart className="w-4 h-4 text-red-400" />
          <span 
            className="text-sm font-semibold"
            style={{ color: 'var(--tg-theme-text-color)' }}
          >
            {lives}
          </span>
        </div>
        <div className="w-px h-4 bg-white/20" />
        <div className="flex items-center gap-1">
          <Coins className="w-4 h-4" style={{ color: 'var(--ton-main)' }} />
          <span 
            className="text-sm font-semibold"
            style={{ color: 'var(--tg-theme-text-color)' }}
          >
            {coins}
          </span>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default GameHeader;