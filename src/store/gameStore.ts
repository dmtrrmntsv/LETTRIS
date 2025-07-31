import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface Cell {
  letter: string | null;
  isFixed: boolean;
}

interface Figure {
  shape: number[][];
  letters: string[];
  id: string;
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
  
  // Actions
  init: () => void;
  placeFigure: (figure: Figure, position: { row: number; col: number }, rotation: number) => boolean;
  checkIn: () => void;
  restoreLife: () => void;
  buyLife: () => boolean;
  resetGame: () => void;
  saveToCloud: () => void;
  loadFromCloud: () => void;
}

const LETTER_WEIGHTS = [
  'о','о','о','о','о','о','о','о','о','о','о',
  'а','а','а','а','а','а','а','а',
  'е','е','е','е','е','е','е',
  'и','и','и','и','и','и',
  'н','н','н','н','н',
  'т','т','т','т',
  'с','с','с','с',
  'р','р','р',
  'в','в','в',
  'л','л','л',
  'к','к',
  'м','м',
  'д','д',
  'п','п',
  'у','у',
  'я','я',
  'ы','ы',
  'ь','ь',
  'г','г',
  'з','з',
  'б','б',
  'ч','ч',
  'й','й',
  'х','х',
  'ж','ж',
  'ш','ш',
  'ю','ю',
  'ц','ц',
  'щ','щ',
  'э','э',
  'ф','ф',
  'ё','ё',
  'ъ','ъ'
];

const SHAPES = [
  [[0,0],[0,1],[0,2]], // I-shape
  [[0,0],[0,1],[1,0],[1,1]], // O-shape
  [[0,0],[0,1],[0,2],[1,1]], // T-shape
  [[0,0],[0,1],[0,2],[1,0]], // L-shape
  [[0,0],[0,1],[0,2],[1,2]], // J-shape
  [[0,0],[0,1],[1,1],[1,2]], // S-shape
  [[0,1],[0,2],[1,0],[1,1]], // Z-shape
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
  return Array(6).fill(null).map(() => 
    Array(6).fill(null).map(() => ({ letter: null, isFixed: false }))
  );
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

    init: () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        get().loadFromCloud();
      }
      set({ isInitialized: true });
    },

    placeFigure: (figure: Figure, position: { row: number; col: number }, rotation: number) => {
      const state = get();
      const newGrid = state.grid.map(row => row.map(cell => ({ ...cell })));
      
      // Check if placement is valid
      for (let i = 0; i < figure.shape.length; i++) {
        const [shapeRow, shapeCol] = figure.shape[i];
        const gridRow = position.row + shapeRow;
        const gridCol = position.col + shapeCol;
        
        if (gridRow < 0 || gridRow >= 6 || gridCol < 0 || gridCol >= 6) {
          return false; // Out of bounds
        }
        
        if (newGrid[gridRow][gridCol].letter !== null) {
          return false; // Cell occupied
        }
      }
      
      // Place the figure
      for (let i = 0; i < figure.shape.length; i++) {
        const [shapeRow, shapeCol] = figure.shape[i];
        const gridRow = position.row + shapeRow;
        const gridCol = position.col + shapeCol;
        
        newGrid[gridRow][gridCol] = {
          letter: figure.letters[i],
          isFixed: true
        };
      }
      
      // Remove figure from queue and add new one
      const newQueue = state.queue.filter(f => f.id !== figure.id);
      newQueue.push(generateFigure());
      
      set({ 
        grid: newGrid, 
        queue: newQueue,
        score: state.score + 10 
      });
      
      get().saveToCloud();
      return true;
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
        gameOver: false
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
          (error: any, values: any) => {
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