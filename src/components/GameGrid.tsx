import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { scanWords, applyGravity } from '../utils/dictionary';

interface GameGridProps {
  onWordFound?: (words: string[]) => void;
}

const GameGrid: React.FC<GameGridProps> = ({ onWordFound }) => {
  const { grid, queue, placeFigure, setHoveredCells, clearHoveredCells } = useGameStore();
  const [draggedFigure, setDraggedFigure] = useState<any>(null);

  const handleDragStart = (figure: any, event: React.DragEvent) => {
    setDraggedFigure(figure);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (row: number, col: number, event: React.DragEvent) => {
    event.preventDefault();
    
    if (draggedFigure) {
      // Calculate which cells would be covered
      const hoveredCells: Array<{ row: number; col: number }> = [];
      let canPlace = true;
      
      for (let i = 0; i < draggedFigure.shape.length; i++) {
        const [shapeRow, shapeCol] = draggedFigure.shape[i];
        const gridRow = row + shapeRow;
        const gridCol = col + shapeCol;
        
        if (gridRow < 0 || gridRow >= 6 || gridCol < 0 || gridCol >= 6) {
          canPlace = false;
          break;
        }
        
        if (grid[gridRow][gridCol].letter !== null) {
          canPlace = false;
          break;
        }
        
        hoveredCells.push({ row: gridRow, col: gridCol });
      }
      
      if (canPlace) {
        setHoveredCells(hoveredCells);
      } else {
        clearHoveredCells();
      }
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    // Only clear if we're leaving the grid entirely
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      clearHoveredCells();
    }
  };

  const handleDrop = (row: number, col: number, event: React.DragEvent) => {
    event.preventDefault();
    clearHoveredCells();
    
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
                newGrid[row][col] = { letter: null, isFixed: false, isHovered: false };
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
    let baseClass = "w-12 h-12 border border-white/20 flex items-center justify-center text-lg font-bold rounded-lg transition-all duration-200";
    
    if (cell?.letter) {
      baseClass += " bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg";
    } else if (cell?.isHovered) {
      baseClass += " bg-gradient-to-br from-green-300 to-green-500 shadow-lg scale-105";
    } else {
      baseClass += " bg-white/10 backdrop-blur-sm hover:bg-white/20";
    }
    
    return baseClass;
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Game Grid */}
      <div 
        className="grid grid-cols-6 gap-2 p-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20"
        onDragLeave={handleDragLeave}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClass(cell)}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(rowIndex, colIndex, e)}
              onDrop={(e) => handleDrop(rowIndex, colIndex, e)}
            >
              {cell?.letter?.toUpperCase() || ''}
            </div>
          ))
        )}
      </div>

      {/* Figure Queue */}
      <div className="flex space-x-4">
        {queue.map((figure, index) => (
          <div
            key={figure.id}
            className="p-4 bg-white/15 backdrop-blur-md rounded-xl cursor-move hover:bg-white/25 transition-all duration-200 shadow-lg border border-white/20 hover:scale-105"
            draggable
            onDragStart={(e) => handleDragStart(figure, e)}
          >
            <div className="grid gap-1" style={{ 
              gridTemplateColumns: `repeat(${Math.max(...figure.shape.map(([_, col]) => col)) + 1}, 1fr)`,
              gridTemplateRows: `repeat(${Math.max(...figure.shape.map(([row, _]) => row)) + 1}, 1fr)`
            }}>
              {figure.shape.map(([row, col], i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 border border-white/30 flex items-center justify-center text-sm font-bold rounded-lg text-white shadow-md"
                  style={{
                    gridColumn: col + 1,
                    gridRow: row + 1
                  }}
                >
                  {figure.letters[i].toUpperCase()}
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