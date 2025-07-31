import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

const GameGrid: React.FC = () => {
  const { 
    grid, 
    queue, 
    placeFigure, 
    selectedLetters, 
    addSelectedLetter, 
    currentWord,
    setHoveredCells,
    clearHoveredCells
  } = useGameStore();
  
  const [draggedFigure, setDraggedFigure] = useState<any>(null);

  // Handle drag start for figures
  const handleDragStart = useCallback((figure: any, event: React.DragEvent) => {
    setDraggedFigure(figure);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drag enter
  const handleDragEnter = useCallback((row: number, col: number, event: React.DragEvent) => {
    event.preventDefault();
    
    if (draggedFigure) {
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
  }, [draggedFigure, grid, setHoveredCells, clearHoveredCells]);

  // Handle drag leave
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      clearHoveredCells();
    }
  }, [clearHoveredCells]);

  // Handle drop
  const handleDrop = useCallback((row: number, col: number, event: React.DragEvent) => {
    event.preventDefault();
    clearHoveredCells();
    
    if (draggedFigure) {
      const success = placeFigure(draggedFigure, { row, col }, 0);
      setDraggedFigure(null);
    }
  }, [draggedFigure, placeFigure, clearHoveredCells]);

  // Handle letter selection for word building
  const handleLetterClick = useCallback((row: number, col: number) => {
    const cell = grid[row][col];
    if (!cell.letter) return;
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    addSelectedLetter({ row, col, letter: cell.letter });
  }, [grid, addSelectedLetter]);

  const getCellClass = (cell: any, row: number, col: number) => {
    const isSelected = selectedLetters.some(pos => pos.row === row && pos.col === col);
    
    let classes = [
      "w-12 h-12 border border-white/20 flex items-center justify-center",
      "text-lg font-bold rounded-xl transition-all duration-200 touch-friendly",
      "select-none"
    ];
    
    if (cell?.letter) {
      if (isSelected) {
        classes.push("ring-2 ring-[var(--ton-gradient-end)] ring-offset-2 ring-offset-transparent");
      }
      classes.push("cursor-pointer hover:scale-105 active:scale-95");
    } else if (cell?.isHovered) {
      classes.push("scale-105 ton-shadow");
    } else {
      classes.push("hover:scale-105");
    }
    
    return classes.join(" ");
  };

  const getCellStyle = (cell: any, isSelected: boolean) => {
    if (cell?.letter) {
      return {
        backgroundColor: isSelected 
          ? 'var(--ton-gradient-end)' 
          : 'var(--tg-theme-button-color)',
        color: 'var(--tg-theme-button-text-color)'
      };
    } else if (cell?.isHovered) {
      return {
        backgroundColor: 'var(--tg-theme-accent-text-color)',
        color: 'var(--tg-theme-button-text-color)'
      };
    } else {
      return {
        backgroundColor: 'var(--tg-theme-secondary-bg-color)',
        color: 'var(--tg-theme-hint-color)'
      };
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      
      {/* Game Grid */}
      <div 
        className="mobile-grid grid-cols-6 p-4 ton-glass rounded-2xl ton-shadow"
        onDragLeave={handleDragLeave}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isSelected = selectedLetters.some(pos => pos.row === rowIndex && pos.col === colIndex);
            
            return (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                className={getCellClass(cell, rowIndex, colIndex)}
                style={getCellStyle(cell, isSelected)}
                onClick={() => handleLetterClick(rowIndex, colIndex)}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(rowIndex, colIndex, e)}
                onDrop={(e) => handleDrop(rowIndex, colIndex, e)}
                whileTap={cell?.letter ? { scale: 0.9 } : {}}
                layout
              >
                {cell?.letter?.toUpperCase() || ''}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Consolidated Figure Queue */}
      <div className="w-full">
        <h3 
          className="text-sm font-medium mb-2 text-center"
          style={{ color: 'var(--tg-theme-section-header-text-color)' }}
        >
          Фигуры
        </h3>
        <div className="flex justify-center gap-3">
          {queue.map((figure, index) => (
            <motion.div
              key={figure.id}
              className="p-3 ton-glass rounded-xl cursor-move touch-friendly"
              draggable
              onDragStart={(e) => handleDragStart(figure, e)}
              whileHover={{ scale: 1.05 }}
              whileDrag={{ scale: 1.1, zIndex: 1000 }}
              layout
            >
              <div 
                className="grid gap-1"
                style={{ 
                  gridTemplateColumns: `repeat(${Math.max(...figure.shape.map(([_, col]) => col)) + 1}, 1fr)`,
                  gridTemplateRows: `repeat(${Math.max(...figure.shape.map(([row, _]) => row)) + 1}, 1fr)`
                }}
              >
                {figure.shape.map(([row, col], i) => (
                  <div
                    key={i}
                    className="w-6 h-6 border border-white/30 flex items-center justify-center text-xs font-bold rounded-lg shadow-sm"
                    style={{
                      gridColumn: col + 1,
                      gridRow: row + 1,
                      backgroundColor: 'var(--ton-gradient-start)',
                      color: 'var(--tg-theme-button-text-color)'
                    }}
                  >
                    {figure.letters[i].toUpperCase()}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default GameGrid;