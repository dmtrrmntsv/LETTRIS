import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import GameHeader from '../components/GameHeader';
import GameGrid from '../components/GameGrid';
import GameOverModal from '../components/GameOverModal';
import { toast } from 'sonner';

const Index = () => {
  const { init, isInitialized, gameOver, lives } = useGameStore();
  const [showGameOver, setShowGameOver] = useState(false);
  const [foundWords, setFoundWords] = useState<string[]>([]);

  useEffect(() => {
    // Initialize the game and Telegram WebApp
    init();
    
    // Set up life restoration timer
    const lifeTimer = setInterval(() => {
      const state = useGameStore.getState();
      if (state.lives < 5) {
        state.restoreLife();
      }
    }, 3600000); // Every hour

    return () => clearInterval(lifeTimer);
  }, [init]);

  useEffect(() => {
    // Check for game over conditions
    if (lives === 0 && !gameOver) {
      setShowGameOver(true);
      useGameStore.setState({ gameOver: true });
    }
  }, [lives, gameOver]);

  const handleWordFound = (words: string[]) => {
    setFoundWords(words);
    words.forEach(word => {
      toast.success(`Найдено слово: ${word.toUpperCase()}!`, {
        duration: 2000,
      });
    });
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Загрузка игры...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <GameHeader />
      
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Словотетрис</h1>
          <p className="text-gray-600">Размещайте фигуры и составляйте слова!</p>
        </div>

        <GameGrid onWordFound={handleWordFound} />

        {/* Instructions */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2">Как играть:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Перетаскивайте фигуры с буквами на игровое поле</li>
            <li>• Составляйте слова по горизонтали или вертикали (минимум 3 буквы)</li>
            <li>• Найденные слова исчезают, а буквы падают вниз</li>
            <li>• Игра заканчивается, когда нельзя разместить ни одну фигуру</li>
          </ul>
        </div>

        {/* Recent Words */}
        {foundWords.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Последние найденные слова:</h4>
            <div className="flex flex-wrap gap-2">
              {foundWords.map((word, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm font-medium"
                >
                  {word.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <GameOverModal 
        isOpen={showGameOver} 
        onClose={() => setShowGameOver(false)} 
      />
    </div>
  );
};

export default Index;