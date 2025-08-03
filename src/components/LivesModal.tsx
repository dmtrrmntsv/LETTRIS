import React from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Coins, Clock, Gift, Zap } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface LivesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LivesModal: React.FC<LivesModalProps> = ({ isOpen, onClose }) => {
  const { lives, coins, buyLife, restoreLife, checkIn, lastCheckIn } = useGameStore();

  const canCheckIn = () => {
    if (!lastCheckIn) return true;
    const now = Date.now();
    return now - lastCheckIn > 86400000; // 24 hours
  };

  const getTimeUntilNextCheckIn = () => {
    if (!lastCheckIn) return '0ч 0м';
    const now = Date.now();
    const timeLeft = 86400000 - (now - lastCheckIn);
    if (timeLeft <= 0) return '0ч 0м';
    
    const hours = Math.floor(timeLeft / 3600000);
    const minutes = Math.floor((timeLeft % 3600000) / 60000);
    return `${hours}ч ${minutes}м`;
  };

  const handleBuyLife = () => {
    if (buyLife()) {
      // Success feedback
      if ('vibrate' in navigator) navigator.vibrate([50, 50, 50]);
    } else {
      // Error feedback
      if ('vibrate' in navigator) navigator.vibrate(200);
    }
  };

  const handleCheckIn = () => {
    const success = checkIn();
    if (success) {
      // Success feedback
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="md"
      backdrop="blur"
      placement="center"
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        }
      }}
    >
      <ModalContent className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-white">
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, -10, 10, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Heart className="w-6 h-6 text-red-400" />
                </motion.div>
                <h2 className="text-xl font-bold">Жизни</h2>
              </motion.div>
            </ModalHeader>

            <ModalBody className="gap-4">
              {/* Current Lives Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-r from-red-900/30 to-pink-900/30 border border-red-500/30">
                  <CardBody className="flex flex-row items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                          >
                            <Heart 
                              className={`w-6 h-6 ${
                                i < lives 
                                  ? 'text-red-400 fill-red-400' 
                                  : 'text-gray-600'
                              }`}
                            />
                          </motion.div>
                        ))}
                      </div>
                      <span className="text-white font-semibold">
                        {lives}/5
                      </span>
                    </div>
                    <Chip 
                      color={lives > 2 ? "success" : lives > 0 ? "warning" : "danger"}
                      variant="flat"
                    >
                      {lives > 2 ? "Отлично" : lives > 0 ? "Осторожно" : "Критично"}
                    </Chip>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Daily Check-in */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-gradient-to-r from-emerald-900/30 to-green-900/30 border border-emerald-500/30">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Gift className="w-5 h-5 text-emerald-400" />
                        <span className="text-white font-medium">Ежедневная награда</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-bold">+100</span>
                      </div>
                    </div>
                    
                    {canCheckIn() ? (
                      <Button
                        color="success"
                        variant="solid"
                        onClick={handleCheckIn}
                        className="w-full"
                        startContent={<Gift className="w-4 h-4" />}
                      >
                        Получить награду
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">
                          Следующая награда через {getTimeUntilNextCheckIn()}
                        </span>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </motion.div>

              {/* Buy Life */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-blue-400" />
                        <span className="text-white font-medium">Купить жизнь</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-bold">50</span>
                      </div>
                    </div>
                    
                    <Button
                      color="primary"
                      variant="solid"
                      onClick={handleBuyLife}
                      isDisabled={coins < 50 || lives >= 5}
                      className="w-full"
                      startContent={<Heart className="w-4 h-4" />}
                    >
                      {lives >= 5 
                        ? "Максимум жизней" 
                        : coins < 50 
                          ? "Недостаточно монет" 
                          : "Купить жизнь"}
                    </Button>
                    
                    <div className="flex items-center justify-center mt-2">
                      <span className="text-gray-400 text-xs">
                        У вас: {coins} монет
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>

              {/* Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/30">
                  <p className="text-gray-300 text-sm">
                    💡 <strong>Совет:</strong> Жизни автоматически восстанавливаются каждые 30 минут!
                  </p>
                </div>
              </motion.div>
            </ModalBody>

            <ModalFooter>
              <Button 
                color="default" 
                variant="light" 
                onPress={onClose}
                className="text-white"
              >
                Закрыть
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default LivesModal;
