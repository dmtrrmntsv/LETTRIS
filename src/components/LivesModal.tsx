import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Heart, Coins, Gift, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LivesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LivesModal: React.FC<LivesModalProps> = ({ isOpen, onClose }) => {
  const { lives, coins, checkIn, buyLife, lastCheckIn } = useGameStore();

  if (!isOpen) return null;

  const canCheckIn = () => {
    if (!lastCheckIn) return true;
    return Date.now() - lastCheckIn > 86400000; // 24 hours
  };

  const getNextCheckInTime = () => {
    if (!lastCheckIn) return 'Доступно сейчас';
    const nextCheckIn = lastCheckIn + 86400000;
    const timeLeft = nextCheckIn - Date.now();
    
    if (timeLeft <= 0) return 'Доступно сейчас';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}ч ${minutes}м`;
  };

  const handleCheckIn = () => {
    const success = checkIn();
    if (success && window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  const handleBuyLife = () => {
    const success = buyLife();
    if (success && window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Баланс</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Lives Section */}
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Heart className="w-6 h-6 text-red-500" />
              <div>
                <div className="font-medium">Жизни</div>
                <div className="text-sm text-gray-600">{lives}/5</div>
              </div>
            </div>
            
            {lives < 5 && (
              <Button
                onClick={handleBuyLife}
                disabled={coins < 50}
                size="sm"
                className="bg-red-500 hover:bg-red-600"
              >
                Купить за 50 <Coins className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {/* Coins Section */}
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Coins className="w-6 h-6 text-yellow-600" />
              <div>
                <div className="font-medium">Монеты</div>
                <div className="text-sm text-gray-600">{coins}</div>
              </div>
            </div>
          </div>

          {/* Daily Check-in */}
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Gift className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-medium">Ежедневный бонус</div>
                <div className="text-sm text-gray-600">100 монет</div>
              </div>
            </div>
            
            <Button
              onClick={handleCheckIn}
              disabled={!canCheckIn()}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              {canCheckIn() ? 'Получить бонус' : `Следующий: ${getNextCheckInTime()}`}
            </Button>
          </div>

          {/* Life Restoration Info */}
          <div className="text-center text-sm text-gray-600">
            <p>Жизни восстанавливаются автоматически каждый час</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LivesModal;