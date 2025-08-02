import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { applyGravity } from '../utils/dictionary'; // Import applyGravity

interface Cell {
  letter: string | null;
  isFixed: boolean;
  isHovered: boolean;
}

interface Figure {
  shape: number[][];
  letters: string[];
  id: string;
  rotation?: number;
}

interface SelectedLetter {
  row: number;
  col: number;
  letter: string;
}

interface GameState {
  grid: Cell[][];
  queue: Figure[];
  score: number;
  lives: number;
  coins: number;
  lastCheckIn: number | null;
  highScores: number[];
  gameOver: boolean;
  isInitialized: boolean;
  hoveredCells: Array<{ row: number; col: number }>;
  selectedLetters: SelectedLetter[];
  currentWord: string;
  fallingAnimations: Array<{ from: {row: number, col: number}, to: {row: number, col: number}, letter: string }>;
  draggedFigure: Figure | null;
  isDragging: boolean;
  
  // Actions
  init: () => void;
  placeFigure: (figure: Figure, position: { row: number; col: number }, rotation: number) => boolean;
  rotateFigure: (figureId: string, rotation: number) => void;
  checkIn: () => void;
  restoreLife: () => void;
  buyLife: () => boolean;
  resetGame: () => void;
  saveToCloud: () => void;
  loadFromCloud: () => void;
  setHoveredCells: (cells: Array<{ row: number; col: number }>) => void;
  clearHoveredCells: () => void;
  addSelectedLetter: (letter: SelectedLetter) => void;
  removeSelectedLetter: (row: number, col: number) => void;
  clearSelection: () => void;
  submitWord: (word: string) => void;
  clearFallingAnimations: () => void;
}

// Improved letter frequency based on Russian language analysis
const LETTER_WEIGHTS = [
  // Самые частые буквы (встречаются очень часто)
  'о','о','о','о','о','о','о','о','о','о','о','о','о','о','о',
  'а','а','а','а','а','а','а','а','а','а','а','а',
  'е','е','е','е','е','е','е','е','е','е','е',
  'и','и','и','и','и','и','и','и','и','и',
  'н','н','н','н','н','н','н','н','н',
  'т','т','т','т','т','т','т','т',
  'с','с','с','с','с','с','с','с',
  'р','р','р','р','р','р','р',
  'в','в','в','в','в','в',
  'л','л','л','л','л','л',
  'к','к','к','к','к',
  'м','м','м','м','м',
  'д','д','д','д','д',
  'п','п','п','п',
  'у','у','у','у',
  'я','я','я','я',
  'ы','ы','ы',
  'ь','ь','ь',
  'г','г','г',
  'з','з','з',
  'б','б','б',
  'ч','ч',
  'й','й',
  'х','х',
  'ж','ж',
  'ш','ш',
  'ю','ю',
  // Редкие буквы (встречаются редко)
  'ц',
  'щ',
  'э',
  'ф',
  'ё',
  'ъ'
];

// Более разнообразные формы фигур
const SHAPES = [
  [[0,0]], // Одиночный блок
  [[0,0],[0,1]], // Два горизонтально
  [[0,0],[1,0]], // Два вертикально
  [[0,0],[0,1],[0,2]], // Три горизонтально
  [[0,0],[1,0],[2,0]], // Три вертикально
  [[0,0],[0,1],[1,0]], // L-форма маленькая
  [[0,0],[0,1],[1,1]], // L-форма отраженная
  [[0,0],[1,0],[1,1]], // L-форма повернутая
  [[0,1],[1,0],[1,1]], // L-форма повернутая 2
  [[0,0],[0,1],[0,2],[1,0]], // L-форма большая
  [[0,0],[0,1],[0,2],[1,2]], // J-форма
  [[0,0],[0,1],[1,0],[1,1]], // Квадрат
  [[0,0],[0,1],[1,1],[1,2]], // S-форма
  [[0,1],[0,2],[1,0],[1,1]], // Z-форма
  [[0,0],[0,1],[0,2],[1,1]], // T-форма
  [[0,0],[0,1],[1,0],[2,0]], // Угол
  [[0,0],[1,0],[1,1],[2,1]], // Ступенька
];

function generateFigure(): Figure {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const letters = shape.map(() => 
    LETTER_WEIGHTS[Math.floor(Math.random() * LETTER_WEIGHTS.length)]
  );
  return {
    shape,
    letters,
    id: Math.random().toString(36).substr(2, 9)
  };
}

function generateQueue(): Figure[] {
  return Array(3).fill(null).map(() => generateFigure());
}

function createEmptyGrid(): Cell[][] {
  return Array(5).fill(null).map(() => 
    Array(5).fill(null).map(() => ({ letter: null, isFixed: false, isHovered: false }))
  );
}

function getRotatedShape(figure: Figure, rotation: number = 0): number[][] {
  const actualRotation = rotation || figure.rotation || 0;
  if (actualRotation === 0) return figure.shape;
  
  // Apply rotation transformation
  const centerX = Math.max(...figure.shape.map(([_, col]) => col)) / 2;
  const centerY = Math.max(...figure.shape.map(([row, _]) => row)) / 2;
  
  return figure.shape.map(([row, col]) => {
    const x = col - centerX;
    const y = row - centerY;
    
    switch (actualRotation) {
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
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    grid: createEmptyGrid(),
    queue: generateQueue(),
    score: 0,
    lives: 5,
    coins: 0,
    lastCheckIn: null,
    highScores: [],
    gameOver: false,
    isInitialized: false,
    hoveredCells: [],
    selectedLetters: [],
    currentWord: '',
    fallingAnimations: [],
    draggedFigure: null,
    isDragging: false,

    addSelectedLetter: (letter: SelectedLetter) => {
      const state = get();
      const isAlreadySelected = state.selectedLetters.some(
        sel => sel.row === letter.row && sel.col === letter.col
      );
      
      if (isAlreadySelected) return;
      
      const newSelectedLetters = [...state.selectedLetters, letter];
      const newWord = newSelectedLetters.map(sel => sel.letter).join('').toLowerCase();
      
      set({ 
        selectedLetters: newSelectedLetters,
        currentWord: newWord
      });
    },

    removeSelectedLetter: (row: number, col: number) => {
      const state = get();
      const newSelectedLetters = state.selectedLetters.filter(
        sel => !(sel.row === row && sel.col === col)
      );
      const newWord = newSelectedLetters.map(sel => sel.letter).join('').toLowerCase();
      
      set({ 
        selectedLetters: newSelectedLetters,
        currentWord: newWord
      });
    },

    clearSelection: () => {
      set({ 
        selectedLetters: [],
        currentWord: ''
      });
    },

    submitWord: (word: string) => {
      const state = get();
      
      // Progressive scoring formula
      const progressiveScores: { [key: number]: number } = {
        3: 3, 4: 5, 5: 6, 6: 8, 7: 10, 8: 13, 9: 16, 10: 20, 
        11: 24, 12: 28, 13: 32, 14: 30
      };
      
      // Hard letter bonuses: Ъ, Х, Э, Щ, Ю, Ф = +2 points each
      const hardLetters = new Set(['ъ', 'х', 'э', 'щ', 'ю', 'ф']);
      
      let score = progressiveScores[word.length] || 0;
      
      // Add hard letter bonuses
      for (const letter of word.toLowerCase()) {
        if (hardLetters.has(letter)) {
          score += 2;
        }
      }
      
      // Remove selected letters from grid
      const newGrid = state.grid.map(row => row.map(cell => ({ ...cell })));
      
      state.selectedLetters.forEach(({ row, col }) => {
        newGrid[row][col] = { letter: null, isFixed: false, isHovered: false };
      });
      
      // Apply gravity with animations
      const { newGrid: finalGrid, animations } = applyGravity(newGrid);
      
      set({
        grid: finalGrid,
        selectedLetters: [],
        currentWord: '',
        score: state.score + score,
        fallingAnimations: animations
      });
      
      // Clear animations after they complete
      setTimeout(() => {
        get().clearFallingAnimations();
      }, 600);
      
      get().saveToCloud();
    },

    clearFallingAnimations: () => {
      set({ fallingAnimations: [] });
    },

    init: () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        get().loadFromCloud();
      }
      set({ isInitialized: true });
    },

    setHoveredCells: (cells: Array<{ row: number; col: number }>) => {
      const state = get();
      const newGrid = state.grid.map(row => row.map(cell => ({ ...cell, isHovered: false })));
      
      cells.forEach(({ row, col }) => {
        if (row >= 0 && row < 5 && col >= 0 && col < 5) {
          newGrid[row][col].isHovered = true;
        }
      });
      
      set({ grid: newGrid, hoveredCells: cells });
    },

    clearHoveredCells: () => {
      const state = get();
      const newGrid = state.grid.map(row => row.map(cell => ({ ...cell, isHovered: false })));
      set({ grid: newGrid, hoveredCells: [] });
    },

    placeFigure: (figure: Figure, position: { row: number; col: number }, rotation: number) => {
      const state = get();
      const newGrid = state.grid.map(row => row.map(cell => ({ ...cell, isHovered: false })));
      
      // Get rotated shape
      const rotatedShape = getRotatedShape(figure, rotation);
      
      // Check if placement is valid
      for (let i = 0; i < rotatedShape.length; i++) {
        const [shapeRow, shapeCol] = rotatedShape[i];
        const gridRow = position.row + shapeRow;
        const gridCol = position.col + shapeCol;
        
        if (gridRow < 0 || gridRow >= 5 || gridCol < 0 || gridCol >= 5) {
          return false; // Out of bounds
        }
        
        if (newGrid[gridRow][gridCol].letter !== null) {
          return false; // Cell occupied
        }
      }
      
      // Place the figure
      for (let i = 0; i < rotatedShape.length; i++) {
        const [shapeRow, shapeCol] = rotatedShape[i];
        const gridRow = position.row + shapeRow;
        const gridCol = position.col + shapeCol;
        
        newGrid[gridRow][gridCol] = {
          letter: figure.letters[i],
          isFixed: true,
          isHovered: false
        };
      }
      
      // Remove figure from queue and add new one
      const newQueue = state.queue.filter(f => f.id !== figure.id);
      newQueue.push(generateFigure());
      
      set({ 
        grid: newGrid, 
        queue: newQueue,
        score: state.score + 10,
        hoveredCells: []
      });
      
      get().saveToCloud();
      return true;
    },

    rotateFigure: (figureId: string, rotationDelta: number) => {
      const state = get();
      const newQueue = state.queue.map(figure => {
        if (figure.id === figureId) {
          const currentRotation = figure.rotation || 0;
          const newRotation = (currentRotation + rotationDelta + 360) % 360;
          return { ...figure, rotation: newRotation };
        }
        return figure;
      });
      
      set({ queue: newQueue });
    },

    checkIn: () => {
      const state = get();
      const now = Date.now();
      const lastCheckIn = state.lastCheckIn || 0;
      
      if (now - lastCheckIn > 86400000) { // 24 hours
        set({ 
          coins: state.coins + 100, 
          lastCheckIn: now 
        });
        get().saveToCloud();
        return true;
      }
      return false;
    },

    restoreLife: () => {
      const state = get();
      if (state.lives < 5) {
        set({ lives: state.lives + 1 });
        get().saveToCloud();
      }
    },

    buyLife: () => {
      const state = get();
      if (state.coins >= 50 && state.lives < 5) {
        set({ 
          coins: state.coins - 50, 
          lives: state.lives + 1 
        });
        get().saveToCloud();
        return true;
      }
      return false;
    },

    resetGame: () => {
      set({
        grid: createEmptyGrid(),
        queue: generateQueue(),
        score: 0,
        gameOver: false,
        hoveredCells: []
      });
    },

    saveToCloud: () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.CloudStorage) {
        const state = get();
        const data = {
          lives: state.lives.toString(),
          coins: state.coins.toString(),
          lastCheckIn: state.lastCheckIn?.toString() || '',
          highScores: JSON.stringify(state.highScores)
        };
        
        window.Telegram.WebApp.CloudStorage.setItems(data);
      }
    },

    loadFromCloud: () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.CloudStorage) {
        window.Telegram.WebApp.CloudStorage.getItems(
          ['lives', 'coins', 'lastCheckIn', 'highScores'],
          (error: string | null, values: Record<string, string> | null) => {
            if (!error && values) {
              set({
                lives: parseInt(values.lives) || 5,
                coins: parseInt(values.coins) || 0,
                lastCheckIn: values.lastCheckIn ? parseInt(values.lastCheckIn) : null,
                highScores: values.highScores ? JSON.parse(values.highScores) : []
              });
            }
          }
        );
      }
    }
  }))
);
