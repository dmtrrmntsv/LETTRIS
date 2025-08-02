import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, BookOpen } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface ScoreDisplayProps {
  recentWords?: string[];
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ recentWords = [] }) => {
  const { score } = useGameStore();

  return (
    <div className="flex items-center justify-between w-full gap-4">
      {/* Score Section */}
      <motion.div
        className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.2)'
        }}
        whileTap={{ scale: 0.95 }}
        layout
      >
        <Trophy className="w-5 h-5 text-cyan-400" />
        <motion.span
          key={score}
          initial={{ scale: 1.2, color: '#06b6d4' }}
          animate={{ scale: 1, color: '#f1f5f9' }}
          transition={{ duration: 0.3 }}
          className="text-lg font-bold text-slate-100"
        >
          {score.toLocaleString()}
        </motion.span>
      </motion.div>

      {/* Recent Words Section */}
      <motion.div
        className="flex-1 flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm min-h-[44px]"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}
        layout
      >
        <BookOpen className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {recentWords.length > 0 ? (
              <motion.div 
                className="flex items-center gap-2 overflow-x-auto scrollbar-hide"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {recentWords.slice(0, 3).map((word, index) => (
                  <motion.span
                    key={`${word}-${index}`}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{ 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }}
                    className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-400/30 whitespace-nowrap"
                  >
                    {word.toUpperCase()}
                  </motion.span>
                ))}
              </motion.div>
            ) : (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-slate-400"
              >
                Последние слова появятся здесь
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ScoreDisplay;
