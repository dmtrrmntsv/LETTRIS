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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg text-white/80">Загрузка игры...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%)
        `
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-3/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <GameHeader />
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
            Словотетрис
          </h1>
          <p className="text-white/80 text-lg">Размещайте фигуры и составляйте слова!</p>
        </div>

        <GameGrid onWordFound={handleWordFound} />

        {/* Instructions */}
        <div className="mt-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
          <h3 className="font-semibold text-white mb-4 text-lg">Как играть:</h3>
          <ul className="text-white/80 space-y-2">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
              Перетаскивайте фигуры с буквами на игровое поле
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
              Составляйте слова по горизонтали или вертикали (минимум 3 буквы)
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
              Найденные слова исчезают, а буквы падают вниз
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
              Игра заканчивается, когда нельзя разместить ни одну фигуру
            </li>
          </ul>
        </div>

        {/* Recent Words */}
        {foundWords.length > 0 && (
          <div className="mt-6 p-6 bg-green-500/20 backdrop-blur-md rounded-2xl border border-green-400/30">
            <h4 className="font-semibold text-green-100 mb-4 text-lg">Последние найденные слова:</h4>
            <div className="flex flex-wrap gap-3">
              {foundWords.map((word, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-green-400/30 text-green-100 rounded-full text-sm font-medium backdrop-blur-sm border border-green-400/40"
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