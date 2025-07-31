import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { scanWords, applyGravity } from '../utils/dictionary';

interface GameGridProps {
  onWordFound?: (words: string[]) => void;
}

const GameGrid: React.FC<GameGridProps> = ({ onWordFound }) => {
  const { grid, queue, placeFigure } = useGameStore();
  const [draggedFigure, setDraggedFigure] = useState<any>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  const handleDragStart = (figure: any, event: React.DragEvent) => {
    setDraggedFigure(figure);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (row: number, col: number, event: React.DragEvent) => {
    event.preventDefault();
    
    if (draggedFigure) {
      const success = placeFigure(draggedFigure, { row, col }, 0);
      
      if (success) {
        // Check for words after placement
        setTimeout(() => {
          const words = scanWords(useGameStore.getState().grid);
          if (words.length > 0) {
            // Remove found words and apply gravity
            const newGrid = useGameStore.getState().grid.map(row => row.map(cell => ({ ...cell })));
            
            words.forEach(({ positions }) => {
              positions.forEach(({ row, col }) => {
                newGrid[row][col] = { letter: null, isFixed: false };
              });
            });
            
            const finalGrid = applyGravity(newGrid);
            useGameStore.setState({ 
              grid: finalGrid,
              score: useGameStore.getState().score + words.reduce((sum, w) => sum + w.word.length * 10, 0)
            });
            
            if (onWordFound) {
              onWordFound(words.map(w => w.word));
            }
          }
        }, 100);
      }
      
      setDraggedFigure(null);
    }
  };

  const getCellClass = (cell: any) => {
    let baseClass = "w-12 h-12 border border-gray-300 flex items-center justify-center text-lg font-bold rounded";
    
    if (cell?.letter) {
      baseClass += " bg-blue-100 text-blue-800";
    } else {
      baseClass += " bg-gray-50 hover:bg-gray-100";
    }
    
    return baseClass;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Game Grid */}
      <div className="grid grid-cols-6 gap-1 p-4 bg-white rounded-lg shadow-lg">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClass(cell)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(rowIndex, colIndex, e)}
            >
              {cell?.letter || ''}
            </div>
          ))
        )}
      </div>

      {/* Figure Queue */}
      <div className="flex space-x-4">
        {queue.map((figure, index) => (
          <div
            key={figure.id}
            className="p-2 bg-gray-100 rounded-lg cursor-move hover:bg-gray-200 transition-colors"
            draggable
            onDragStart={(e) => handleDragStart(figure, e)}
          >
            <div className="text-xs text-gray-600 mb-1">Фигура {index + 1}</div>
            <div className="grid gap-1" style={{ 
              gridTemplateColumns: `repeat(${Math.max(...figure.shape.map(([_, col]) => col)) + 1}, 1fr)`,
              gridTemplateRows: `repeat(${Math.max(...figure.shape.map(([row, _]) => row)) + 1}, 1fr)`
            }}>
              {figure.shape.map(([row, col], i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-blue-200 border border-blue-300 flex items-center justify-center text-sm font-bold rounded"
                  style={{
                    gridColumn: col + 1,
                    gridRow: row + 1
                  }}
                >
                  {figure.letters[i]}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameGrid;