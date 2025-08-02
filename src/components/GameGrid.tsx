import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import LetterSelector from './LetterSelector';

interface Figure {
  shape: number[][];
  letters: string[];
  id: string;
  rotation?: number;
}

interface Cell {
  letter: string | null;
  isFixed: boolean;
  isHovered: boolean;
}

interface GameGridProps {}

const GameGrid: React.FC<GameGridProps> = () => {
  const { 
    grid, 
    queue, 
    placeFigure, 
    selectedLetters, 
    addSelectedLetter, 
    removeSelectedLetter,
    currentWord,
    setHoveredCells,
    clearHoveredCells
  } = useGameStore();
  
  const [draggedFigure, setDraggedFigure] = useState<Figure | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [isSelectingWord, setIsSelectingWord] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Check if two cells are adjacent (includes diagonals for 8-directional word building)
  const areAdjacent = (cell1: { row: number; col: number }, cell2: { row: number; col: number }) => {
    const rowDiff = Math.abs(cell1.row - cell2.row);
    const colDiff = Math.abs(cell1.col - cell2.col);
    return (rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0);
  };

  // Check if a cell can be selected (snake rule)
  const canSelectCell = (row: number, col: number) => {
    if (selectedLetters.length === 0) return true;
    const lastSelected = selectedLetters[selectedLetters.length - 1];
    return areAdjacent(lastSelected, { row, col });
  };

  // Find the best anchor position for a figure that would include the target position
  const findBestAnchorPosition = useCallback((targetRow: number, targetCol: number, figure: Figure) => {
    // Try all possible anchor positions that would result in the figure covering the target position
    for (let i = 0; i < figure.shape.length; i++) {
      const [shapeRow, shapeCol] = figure.shape[i];
      const anchorRow = targetRow - shapeRow;
      const anchorCol = targetCol - shapeCol;
      
      // Check if this anchor position would be valid
      let canPlace = true;
      const hoveredCells: Array<{ row: number; col: number }> = [];
      
      for (let j = 0; j < figure.shape.length; j++) {
        const [checkShapeRow, checkShapeCol] = figure.shape[j];
        const gridRow = anchorRow + checkShapeRow;
        const gridCol = anchorCol + checkShapeCol;
        
        if (gridRow < 0 || gridRow >= 5 || gridCol < 0 || gridCol >= 5) {
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
        return { anchorRow, anchorCol, hoveredCells };
      }
    }
    
    return null;
  }, [grid]);

  // Handle letter selection for word building
  const handleLetterClick = useCallback((row: number, col: number) => {
    const cell = grid[row][col];
    if (!cell.letter) return;
    
    // Check if already selected
    const isAlreadySelected = selectedLetters.some(pos => pos.row === row && pos.col === col);
    if (isAlreadySelected) return;
    
    // Check snake rule
    if (!canSelectCell(row, col)) return;
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    addSelectedLetter({ row, col, letter: cell.letter });
  }, [grid, addSelectedLetter, selectedLetters, canSelectCell]);

  // Word selection drag handlers
  const handleWordSelectionStart = useCallback((row: number, col: number) => {
    const cell = grid[row][col];
    if (!cell?.letter || isDragging) return;
    
    setIsSelectingWord(true);
    handleLetterClick(row, col);
  }, [grid, isDragging, handleLetterClick]);

  const handleMouseDownSelection = useCallback((row: number, col: number, event: React.MouseEvent) => {
    event.preventDefault();
    handleWordSelectionStart(row, col);
  }, [handleWordSelectionStart]);

  const handleTouchStartSelection = useCallback((row: number, col: number, event: React.TouchEvent) => {
    event.preventDefault();
    handleWordSelectionStart(row, col);
  }, [handleWordSelectionStart]);

  const handleWordSelectionMove = useCallback((row: number, col: number) => {
    if (!isSelectingWord) return;
    
    const cell = grid[row][col];
    if (!cell?.letter) return;
    
    // Check if already selected - allow backtracking
    const selectedIndex = selectedLetters.findIndex(pos => pos.row === row && pos.col === col);
    if (selectedIndex !== -1) {
      // If dragging back to a previously selected letter, remove all letters after it
      if (selectedIndex < selectedLetters.length - 1) {
        const lettersToRemove = selectedLetters.slice(selectedIndex + 1);
        lettersToRemove.forEach(letter => {
          removeSelectedLetter(letter.row, letter.col);
        });
        
        // Haptic feedback for backtrack
        if ('vibrate' in navigator) {
          navigator.vibrate(8);
        }
      }
      return;
    }
    
    // Check snake rule for new letters
    if (!canSelectCell(row, col)) return;
    
    // Haptic feedback for new selection
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
    
    addSelectedLetter({ row, col, letter: cell.letter });
  }, [isSelectingWord, grid, selectedLetters, canSelectCell, addSelectedLetter, removeSelectedLetter]);

  const handleWordSelectionEnd = useCallback(() => {
    setIsSelectingWord(false);
  }, []);

  // Handle drag start for figures
  const handleDragStart = useCallback((figure: Figure, event: React.DragEvent | React.TouchEvent) => {
    setDraggedFigure(figure);
    setIsDragging(true);
    
    if ('touches' in event) {
      // Touch event
      const touch = event.touches[0];
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: touch.clientX - rect.left - rect.width / 2,
        y: touch.clientY - rect.top - rect.height / 2
      });
      setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    } else {
      // Mouse event
      event.dataTransfer.effectAllowed = 'move';
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setDragOffset({
        x: event.clientX - rect.left - rect.width / 2,
        y: event.clientY - rect.top - rect.height / 2
      });
    }
  }, []);

  // Handle touch move for mobile drag
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isDragging || !draggedFigure || !gridRef.current) return;
    
    event.preventDefault();
    const touch = event.touches[0];
    const gridRect = gridRef.current.getBoundingClientRect();
    
    // Calculate grid position accounting for drag offset
    const x = touch.clientX - dragOffset.x - gridRect.left;
    const y = touch.clientY - dragOffset.y - gridRect.top;
    
    const cellSize = gridRect.width / 5; // 5x5 grid
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    
    if (row >= 0 && row < 5 && col >= 0 && col < 5) {
      const result = findBestAnchorPosition(row, col, draggedFigure);
      
      if (result) {
        setHoveredCells(result.hoveredCells);
      } else {
        clearHoveredCells();
      }
    } else {
      clearHoveredCells();
    }
  }, [isDragging, draggedFigure, dragOffset, findBestAnchorPosition, setHoveredCells, clearHoveredCells]);

  // Handle touch end for mobile drop
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!isDragging || !draggedFigure || !gridRef.current) return;
    
    const touch = event.changedTouches[0];
    const gridRect = gridRef.current.getBoundingClientRect();
    
    const x = touch.clientX - dragOffset.x - gridRect.left;
    const y = touch.clientY - dragOffset.y - gridRect.top;
    
    const cellSize = gridRect.width / 5;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    
    if (row >= 0 && row < 5 && col >= 0 && col < 5) {
      const result = findBestAnchorPosition(row, col, draggedFigure);
      if (result) {
        placeFigure(draggedFigure, { row: result.anchorRow, col: result.anchorCol }, 0);
      }
    }
    
    setDraggedFigure(null);
    setIsDragging(false);
    clearHoveredCells();
  }, [isDragging, draggedFigure, dragOffset, findBestAnchorPosition, placeFigure, clearHoveredCells]);

  // Set up touch event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  // Set up word selection event listeners
  useEffect(() => {
    if (isSelectingWord) {
      const handleMouseUp = () => handleWordSelectionEnd();
      const handleTouchEndWord = () => handleWordSelectionEnd();
      
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleTouchEndWord);
      
      return () => {
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchend', handleTouchEndWord);
      };
    }
  }, [isSelectingWord, handleWordSelectionEnd]);

  // Handle drag over
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drag enter
  const handleDragEnter = useCallback((row: number, col: number, event: React.DragEvent) => {
    event.preventDefault();
    
    if (draggedFigure) {
      const result = findBestAnchorPosition(row, col, draggedFigure);
      
      if (result) {
        setHoveredCells(result.hoveredCells);
      } else {
        clearHoveredCells();
      }
    }
  }, [draggedFigure, findBestAnchorPosition, setHoveredCells, clearHoveredCells]);

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
      const result = findBestAnchorPosition(row, col, draggedFigure);
      if (result) {
        placeFigure(draggedFigure, { row: result.anchorRow, col: result.anchorCol }, 0);
      }
      setDraggedFigure(null);
      setIsDragging(false);
    }
  }, [draggedFigure, findBestAnchorPosition, placeFigure, clearHoveredCells]);

  const getCellClass = (cell: Cell, row: number, col: number) => {
    const isSelected = selectedLetters.some(pos => pos.row === row && pos.col === col);
    const canSelect = cell?.letter && canSelectCell(row, col);
    
    const classes = [
      "w-16 h-16 border-2 border-white/20 flex items-center justify-center",
      "text-xl font-bold rounded-2xl transition-all duration-200 touch-friendly",
      "select-none relative overflow-hidden"
    ];
    
    if (cell?.letter) {
      if (isSelected) {
        classes.push("ring-3 ring-cyan-400 ring-offset-2 ring-offset-transparent scale-105");
      } else if (canSelect) {
        classes.push("cursor-pointer hover:scale-110 active:scale-95 hover:ring-2 hover:ring-cyan-300/50");
      } else if (selectedLetters.length > 0) {
        classes.push("opacity-40");
      } else {
        classes.push("cursor-pointer hover:scale-110 active:scale-95");
      }
    } else if (cell?.isHovered) {
      classes.push("scale-110 shadow-lg shadow-cyan-500/30");
    } else {
      classes.push("hover:scale-105");
    }
    
    return classes.join(" ");
  };

  const getCellStyle = (cell: Cell, isSelected: boolean, row: number, col: number) => {
    const canSelect = cell?.letter && canSelectCell(row, col);
    
    if (cell?.letter) {
      if (isSelected) {
        return {
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          color: '#ffffff',
          boxShadow: '0 8px 32px rgba(6, 182, 212, 0.4)'
        };
      } else if (canSelect) {
        return {
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: '#f1f5f9',
          border: '2px solid #475569'
        };
      } else if (selectedLetters.length > 0) {
        return {
          background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
          color: '#9ca3af',
          border: '2px solid #6b7280'
        };
      } else {
        return {
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: '#f1f5f9',
          border: '2px solid #475569'
        };
      }
    } else if (cell?.isHovered) {
      return {
        background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
        color: '#ffffff',
        border: '2px solid #06b6d4',
        boxShadow: '0 8px 32px rgba(8, 145, 178, 0.4)'
      };
    } else {
      return {
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#64748b',
        border: '2px solid #334155'
      };
    }
  };

  const handleFigureTouchStart = (figure: Figure) => (event: React.TouchEvent) => {
    handleDragStart(figure, event);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      
      {/* Game Grid */}
      <div 
        ref={gridRef}
        className="game-grid grid grid-cols-5 gap-2 p-6 rounded-3xl relative"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        onDragLeave={handleDragLeave}
      >
        {grid.slice(0, 5).map((row, rowIndex) =>
          row.slice(0, 5).map((cell, colIndex) => {
            const isSelected = selectedLetters.some(pos => pos.row === rowIndex && pos.col === colIndex);
            
            return (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                className={getCellClass(cell, rowIndex, colIndex)}
                style={getCellStyle(cell, isSelected, rowIndex, colIndex)}
                onClick={() => handleLetterClick(rowIndex, colIndex)}
                onMouseDown={(e) => handleMouseDownSelection(rowIndex, colIndex, e)}
                onMouseEnter={() => handleWordSelectionMove(rowIndex, colIndex)}
                onTouchStart={(e) => handleTouchStartSelection(rowIndex, colIndex, e)}
                onTouchMove={(e) => {
                  if (e.touches[0] && gridRef.current) {
                    const touch = e.touches[0];
                    const gridRect = gridRef.current.getBoundingClientRect();
                    const cellSize = gridRect.width / 5;
                    const x = touch.clientX - gridRect.left;
                    const y = touch.clientY - gridRect.top;
                    const col = Math.floor(x / cellSize);
                    const row = Math.floor(y / cellSize);
                    if (row >= 0 && row < 5 && col >= 0 && col < 5) {
                      handleWordSelectionMove(row, col);
                    }
                  }
                }}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(rowIndex, colIndex, e)}
                onDrop={(e) => handleDrop(rowIndex, colIndex, e)}
                whileTap={cell?.letter ? { scale: 0.9 } : {}}
                layout
              >
                {cell?.letter?.toUpperCase() || ''}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)'
                    }}
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Figure Queue */}
      <div className="w-full max-w-sm">
        <h3 
          className="text-sm font-semibold mb-3 text-center tracking-wide"
          style={{ color: '#94a3b8' }}
        >
          ФИГУРЫ
        </h3>
        <div className="flex justify-center gap-4">
          {queue.map((figure, index) => (
            <motion.div
              key={figure.id}
              className="p-4 rounded-2xl cursor-move touch-friendly relative"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
              }}
              whileHover={{ scale: 1.05 }}
              layout
            >
              <div
                draggable
                onDragStart={(e: React.DragEvent) => handleDragStart(figure, e)}
                onTouchStart={handleFigureTouchStart(figure)}
                className="w-full h-full"
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
                      className="w-8 h-8 border border-white/30 flex items-center justify-center text-sm font-bold rounded-xl shadow-sm"
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
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default GameGrid;
