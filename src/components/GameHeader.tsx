import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Heart, Coins, Trophy } from 'lucide-react';
import LivesModal from './LivesModal';

const GameHeader: React.FC = () => {
  const { score, lives, coins } = useGameStore();
  const [showLivesModal, setShowLivesModal] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center p-4 bg-white shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="font-bold text-lg">{score}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowLivesModal(true)}
            className="flex items-center space-x-1 px-3 py-1 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
          >
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-red-700 font-medium">{lives}</span>
          </button>
          
          <button
            onClick={() => setShowLivesModal(true)}
            className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 rounded-full hover:bg-yellow-200 transition-colors"
          >
            <Coins className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-700 font-medium">{coins}</span>
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