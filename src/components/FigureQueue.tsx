import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, RotateCcw } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface Figure {
  shape: number[][];
  letters: string[];
  id: string;
  rotation?: number;
}

interface FigureQueueProps {
  onFigureDragStart?: (figure: Figure, event: React.DragEvent | React.TouchEvent) => void;
  onFigureTouchStart?: (figure: Figure) => (event: React.TouchEvent) => void;
}

const FigureQueue: React.FC<FigureQueueProps> = ({ onFigureDragStart, onFigureTouchStart }) => {
  const { queue, rotateFigure } = useGameStore();
  const [hoveredFigure, setHoveredFigure] = useState<string | null>(null);

  const handleRotateLeft = useCallback((figureId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    rotateFigure(figureId, -90);
  }, [rotateFigure]);

  const handleRotateRight = useCallback((figureId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    rotateFigure(figureId, 90);
  }, [rotateFigure]);

  const getRotatedShape = (figure: Figure) => {
    const rotation = figure.rotation || 0;
    if (rotation === 0) return figure.shape;
    
    // Apply rotation transformation
    const centerX = Math.max(...figure.shape.map(([_, col]) => col)) / 2;
    const centerY = Math.max(...figure.shape.map(([row, _]) => row)) / 2;
    
    return figure.shape.map(([row, col]) => {
      const x = col - centerX;
      const y = row - centerY;
      
      switch (rotation) {
        case 90:
          return [Math.round(x + centerY), Math.round(-y + centerX)];
        case 180:
          return [Math.round(-x + centerY), Math.round(-y + centerX)];
        case 270:
          return [Math.round(-x + centerY), Math.round(y + centerX)];
        default:
          return [row, col];
      }
    });
  };

  return (
    <motion.div 
      className="w-full" 
      style={{ height: '120px' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3 
        className="text-sm font-semibold mb-4 text-center tracking-wide"
        style={{ color: '#94a3b8' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        ФИГУРЫ
      </motion.h3>
      <motion.div 
        className="flex justify-center gap-4 overflow-hidden"
        style={{ height: '90px' }}
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="hidden"
        animate="visible"
      >
        {queue.map((figure, index) => {
          const rotatedShape = getRotatedShape(figure);
          const isHovered = hoveredFigure === figure.id;
          
          return (
            <motion.div
              key={figure.id}
              className="relative cursor-move touch-friendly"
              style={{
                width: '90px',
                height: '90px',
                minWidth: '90px'
              }}
              onMouseEnter={() => setHoveredFigure(figure.id)}
              onMouseLeave={() => setHoveredFigure(null)}
              variants={{
                hidden: { opacity: 0, scale: 0.8, y: 20 },
                visible: { opacity: 1, scale: 1, y: 0 }
              }}
              whileHover={{ 
                scale: 1.08,
                y: -5,
                boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.4)'
              }}
              whileDrag={{ 
                scale: 1.15, 
                zIndex: 1000,
                rotate: 5,
                boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.5)'
              }}
              layout
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
            >
              {/* Rotation Controls */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ 
                  opacity: isHovered ? 1 : 0,
                  scale: isHovered ? 1 : 0.8,
                  x: isHovered ? 0 : -10
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute -top-2 -left-2 z-10"
              >
                <motion.button
                  onClick={(e) => handleRotateLeft(figure.id, e)}
                  className="w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(30, 30, 30, 0.8) 100%)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.9) 0%, rgba(50, 50, 50, 0.9) 100%)'
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    whileHover={{ rotate: -180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.div>
                </motion.button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ 
                  opacity: isHovered ? 1 : 0,
                  scale: isHovered ? 1 : 0.8,
                  x: isHovered ? 0 : 10
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute -top-2 -right-2 z-10"
              >
                <motion.button
                  onClick={(e) => handleRotateRight(figure.id, e)}
                  className="w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(30, 30, 30, 0.8) 100%)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.9) 0%, rgba(50, 50, 50, 0.9) 100%)'
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RotateCw className="w-4 h-4" />
                  </motion.div>
                </motion.button>
              </motion.div>

              {/* Figure Card */}
              <div
                className="w-full h-full p-4 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                style={{
                  background: isHovered 
                    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
                    : 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
                  border: `1px solid ${isHovered ? 'rgba(148, 163, 184, 0.4)' : 'rgba(148, 163, 184, 0.2)'}`,
                  boxShadow: isHovered 
                    ? '0 15px 35px -5px rgba(0, 0, 0, 0.4)'
                    : '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                draggable
                onDragStart={(e) => onFigureDragStart?.(figure, e)}
                onTouchStart={onFigureTouchStart?.(figure)}
              >
                <motion.div 
                  className="grid gap-1"
                  style={{ 
                    gridTemplateColumns: `repeat(${Math.max(...rotatedShape.map(([_, col]) => col)) + 1}, 1fr)`,
                    gridTemplateRows: `repeat(${Math.max(...rotatedShape.map(([row, _]) => row)) + 1}, 1fr)`
                  }}
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  }}
                  initial="hidden"
                  animate="visible"
                >
                  {rotatedShape.map(([row, col], i) => (
                    <motion.div
                      key={i}
                      className="w-7 h-7 border border-white/30 flex items-center justify-center text-xs font-bold rounded-xl shadow-sm"
                      style={{
                        gridColumn: col + 1,
                        gridRow: row + 1,
                        background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                        color: '#ffffff',
                        border: '1px solid rgba(8, 145, 178, 0.5)'
                      }}
                      variants={{
                        hidden: { opacity: 0, scale: 0.5, rotate: -180 },
                        visible: { opacity: 1, scale: 1, rotate: 0 }
                      }}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 5,
                        boxShadow: '0 5px 15px -3px rgba(0, 0, 0, 0.3)'
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 25
                      }}
                    >
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 + 0.2 }}
                      >
                        {figure.letters[i].toUpperCase()}
                      </motion.span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Drag Indicator */}
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: isHovered ? 0.1 : 0,
                  background: isHovered 
                    ? 'linear-gradient(45deg, transparent 30%, rgba(6, 182, 212, 0.3) 50%, transparent 70%)'
                    : 'transparent'
                }}
              >
                <motion.div
                  className="w-full h-full rounded-2xl"
                  animate={{
                    background: isHovered 
                      ? [
                          'linear-gradient(45deg, transparent 30%, rgba(6, 182, 212, 0.1) 50%, transparent 70%)',
                          'linear-gradient(225deg, transparent 30%, rgba(6, 182, 212, 0.1) 50%, transparent 70%)'
                        ]
                      : 'transparent'
                  }}
                  transition={{
                    duration: 2,
                    repeat: isHovered ? Infinity : 0,
                    ease: "linear"
                  }}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default FigureQueue;
