import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Heart, Coins, Trophy } from 'lucide-react';
import LivesModal from './LivesModal';

const GameHeader: React.FC = () => {
  const { score, lives, coins } = useGameStore();
  const [showLivesModal, setShowLivesModal] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 rounded-full backdrop-blur-sm border border-yellow-400/30">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <span className="font-bold text-lg text-white">{score}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowLivesModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 rounded-full hover:bg-red-500/30 transition-all duration-200 backdrop-blur-sm border border-red-400/30"
          >
            <Heart className="w-4 h-4 text-red-300" />
            <span className="text-red-100 font-medium">{lives}</span>
          </button>
          
          <button
            onClick={() => setShowLivesModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 rounded-full hover:bg-yellow-500/30 transition-all duration-200 backdrop-blur-sm border border-yellow-400/30"
          >
            <Coins className="w-4 h-4 text-yellow-300" />
            <span className="text-yellow-100 font-medium">{coins}</span>
          </button>
        </div>
      </div>

      <LivesModal 
        isOpen={showLivesModal} 
        onClose={() => setShowLivesModal(false)} 
      />
    </>
  );
};

export default GameHeader;