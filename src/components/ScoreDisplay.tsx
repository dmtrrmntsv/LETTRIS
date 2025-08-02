import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const ScoreDisplay: React.FC = () => {
  const { score } = useGameStore();

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-2 rounded-xl ton-glass"
      whileTap={{ scale: 0.95 }}
      layout
    >
      <Trophy className="w-4 h-4" style={{ color: 'var(--ton-main)' }} />
      <motion.span
        key={score}
        initial={{ scale: 1.2, color: 'var(--ton-main)' }}
        animate={{ scale: 1, color: 'var(--tg-theme-text-color)' }}
        transition={{ duration: 0.3 }}
        className="text-sm font-bold"
        style={{ color: 'var(--tg-theme-text-color)' }}
      >
        {score.toLocaleString()}
      </motion.span>
    </motion.div>
  );
};

export default ScoreDisplay;
