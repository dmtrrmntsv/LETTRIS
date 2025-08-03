import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Coins, Trophy, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import LivesModal from './LivesModal';

const GameHeader: React.FC = () => {
  const { lives, coins, score } = useGameStore();
  const [isLivesModalOpen, setIsLivesModalOpen] = useState(false);

  return (
    <>
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.6
      }}
      className="flex items-center justify-between px-4 py-3 backdrop-blur-md border-b relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
        borderColor: 'rgba(148, 163, 184, 0.2)'
      }}
    >
      {/* Animated Background Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.1) 50%, transparent 100%)'
        }}
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Left: Logo & Title */}
      <motion.div 
        className="flex items-center gap-3"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
      >
        <motion.div 
          className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            boxShadow: '0 8px 20px rgba(6, 182, 212, 0.3)'
          }}
          whileHover={{ 
            scale: 1.1, 
            rotate: 10,
            boxShadow: '0 12px 30px rgba(6, 182, 212, 0.4)'
          }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            <Trophy className="w-5 h-5 text-white" />
          </motion.div>
          
          {/* Sparkle effect */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            <Sparkles className="w-3 h-3 text-white/50 absolute top-1 right-1" />
          </motion.div>
        </motion.div>
        
        <motion.h1 
          className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
          whileHover={{ scale: 1.05 }}
        >
          Словотетрис
        </motion.h1>
      </motion.div>

      {/* Right: Lives & Balance Combined */}
      <motion.div 
        className="flex items-center gap-3 px-4 py-2 rounded-2xl backdrop-blur-sm cursor-pointer touch-friendly relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(30, 30, 30, 0.5) 100%)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)'
        }}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
        whileHover={{ 
          scale: 1.05,
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)'
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if ('vibrate' in navigator) navigator.vibrate(10);
          setIsLivesModalOpen(true);
        }}
      >
        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(8, 145, 178, 0.2) 100%)'
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Lives */}
        <motion.div 
          className="flex items-center gap-2 relative z-10"
          whileHover={{ scale: 1.1 }}
        >
          <motion.div
            animate={{ 
              scale: lives <= 2 ? [1, 1.2, 1] : 1,
              rotate: lives <= 1 ? [0, -10, 10, 0] : 0
            }}
            transition={{ 
              duration: 1, 
              repeat: lives <= 2 ? Infinity : 0 
            }}
          >
            <Heart 
              className="w-5 h-5"
              style={{ 
                color: lives <= 2 ? '#ef4444' : '#f87171',
                filter: lives <= 1 ? 'drop-shadow(0 0 8px #ef4444)' : 'none'
              }}
            />
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.span 
              key={lives}
              className="text-sm font-bold text-slate-100"
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {lives}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Separator */}
        <motion.div 
          className="w-px h-5 bg-slate-400/30"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.5 }}
        />

        {/* Coins */}
        <motion.div 
          className="flex items-center gap-2 relative z-10"
          whileHover={{ scale: 1.1 }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            <Coins className="w-5 h-5 text-yellow-400" />
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.span 
              key={coins}
              className="text-sm font-bold text-slate-100"
              initial={{ scale: 1.5, opacity: 0, color: '#fbbf24' }}
              animate={{ scale: 1, opacity: 1, color: '#f1f5f9' }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {coins}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.header>

    <LivesModal 
      isOpen={isLivesModalOpen}
      onClose={() => setIsLivesModalOpen(false)}
    />
    </>
  );
};

export default GameHeader;
