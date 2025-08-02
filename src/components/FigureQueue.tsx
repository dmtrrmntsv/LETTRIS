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
  onFigureDragStart: (figure: Figure, event: React.DragEvent | React.TouchEvent) => void;
  onFigureTouchStart: (figure: Figure) => (event: React.TouchEvent) => void;
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
    <div className="w-full" style={{ height: '80px' }}>
      <h3 
        className="text-sm font-semibold mb-3 text-center tracking-wide"
        style={{ color: '#94a3b8' }}
      >
        ФИГУРЫ
      </h3>
      <div 
        className="flex justify-center gap-4 overflow-hidden"
        style={{ height: '80px' }}
      >
        {queue.map((figure, index) => {
          const rotatedShape = getRotatedShape(figure);
          const isHovered = hoveredFigure === figure.id;
          
          return (
            <motion.div
              key={figure.id}
              className="relative cursor-move touch-friendly"
              style={{
                width: '80px',
                height: '80px',
                minWidth: '80px'
              }}
              onMouseEnter={() => setHoveredFigure(figure.id)}
              onMouseLeave={() => setHoveredFigure(null)}
              whileHover={{ scale: 1.05 }}
              whileDrag={{ scale: 1.1, zIndex: 1000 }}
              layout
            >
              {/* Rotation Controls */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                className="absolute -top-1 -left-1 z-10"
              >
                <button
                  onClick={(e) => handleRotateLeft(figure.id, e)}
                  className="w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
                  style={{ color: '#ffffff' }}
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                className="absolute -top-1 -right-1 z-10"
              >
                <button
                  onClick={(e) => handleRotateRight(figure.id, e)}
                  className="w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
                  style={{ color: '#ffffff' }}
                >
                  <RotateCw className="w-3 h-3" />
                </button>
              </motion.div>

              {/* Figure Card */}
              <div
                className="w-full h-full p-3 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                }}
                draggable
                onDragStart={(e) => onFigureDragStart(figure, e)}
                onTouchStart={onFigureTouchStart(figure)}
              >
                <div 
                  className="grid gap-1"
                  style={{ 
                    gridTemplateColumns: `repeat(${Math.max(...rotatedShape.map(([_, col]) => col)) + 1}, 1fr)`,
                    gridTemplateRows: `repeat(${Math.max(...rotatedShape.map(([row, _]) => row)) + 1}, 1fr)`
                  }}
                >
                  {rotatedShape.map(([row, col], i) => (
                    <div
                      key={i}
                      className="w-6 h-6 border border-white/30 flex items-center justify-center text-xs font-bold rounded-lg shadow-sm"
                      style={{
                        gridColumn: col + 1,
                        gridRow: row + 1,
                        background: figure.letters[i] === '*' 
                          ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                          : 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
                        color: '#ffffff'
                      }}
                    >
                      {figure.letters[i] === '*' ? '★' : figure.letters[i].toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FigureQueue;
