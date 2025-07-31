import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Trophy, RotateCcw, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ isOpen, onClose }) => {
  const { score, lives, resetGame, highScores } = useGameStore();

  if (!isOpen) return null;

  const handleRestart = () => {
    if (lives > 0) {
      useGameStore.setState({ lives: lives - 1 });
      resetGame();
      onClose();
      
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    }
  };

  const handleShare = () => {
    if (window.Telegram?.WebApp) {
      const shareText = `Я набрал ${score} очков в игре "Словотетрис"! 🎮`;
      window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`);
    }
  };

  const bestScore = Math.max(...highScores, score);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-red-600">Игра окончена!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          {/* Score Display */}
          <div className="p-6 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-lg font-medium">Ваш результат</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{score}</div>
            {score === bestScore && score > 0 && (
              <div className="text-sm text-green-600 mt-1">🎉 Новый рекорд!</div>
            )}
          </div>

          {/* Best Score */}
          {bestScore > 0 && (
            <div className="text-center">
              <div className="text-sm text-gray-600">Лучший результат</div>
              <div className="text-xl font-bold text-gray-800">{bestScore}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleRestart}
              disabled={lives === 0}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Играть снова {lives > 0 && (
                <span className="ml-2 flex items-center">
                  (<Heart className="w-3 h-3 mr-1" />{lives})
                </span>
              )}
            </Button>

            {lives === 0 && (
              <div className="text-sm text-red-600">
                У вас закончились жизни! Купите новые в магазине.
              </div>
            )}

            <Button
              onClick={handleShare}
              variant="outline"
              className="w-full"
            >
              Поделиться результатом
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full"
            >
              Закр