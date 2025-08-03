class TrieNode {
  children: { [key: string]: TrieNode } = {};
  isEnd: boolean = false;
}

class Trie {
  private root: TrieNode;

  constructor(words: string[]) {
    this.root = new TrieNode();
    
    words
      .filter(word => 
        word.length >= 3 && 
        word.length <= 14 && 
        /^[а-яё]+$/i.test(word)
      )
      .forEach(word => {
        let node = this.root;
        const normalizedWord = word.toLowerCase().replace(/ё/g, 'е');
        
        for (const char of normalizedWord) {
          if (!node.children[char]) {
            node.children[char] = new TrieNode();
          }
          node = node.children[char];
        }
        node.isEnd = true;
      });
  }

  contains(word: string): boolean {
    let node = this.root;
    const normalizedWord = word.toLowerCase().replace(/ё/g, 'е');
    
    for (const char of normalizedWord) {
      if (!node.children[char]) {
        return false;
      }
      node = node.children[char];
    }
    
    return node.isEnd;
  }
}

// Load words from the provided dictionary file
const loadDictionary = async (): Promise<string[]> => {
  try {
    const response = await fetch('/russian_lemmas_3_14.txt');
    const text = await response.text();
    return text.split('\n').map(word => word.trim()).filter(word => word.length > 0);
  } catch (error) {
    console.error('Failed to load dictionary:', error);
    // Fallback to basic words if file loading fails
    return [
      'дом', 'кот', 'собака', 'мама', 'папа', 'вода', 'хлеб', 'молоко',
      'стол', 'стул', 'окно', 'дверь', 'книга', 'ручка', 'тетрадь',
      'школа', 'учитель', 'ученик', 'урок', 'задача', 'ответ',
      'время', 'день', 'ночь', 'утро', 'вечер', 'год', 'месяц',
      'работа', 'дело', 'человек', 'друг', 'семья', 'ребенок',
      'город', 'дорога', 'машина', 'поезд', 'самолет', 'корабль',
      'еда', 'мясо', 'рыба', 'овощи', 'фрукты', 'яблоко', 'банан'
    ];
  }
};

// Initialize dictionary
let dictionary: Trie;
loadDictionary().then(words => {
  dictionary = new Trie(words);
});

// Export a function that checks if dictionary is loaded
export const isDictionaryLoaded = () => !!dictionary;

// Export dictionary with fallback
export const getDictionary = () => {
  if (!dictionary) {
    // Create a basic dictionary as fallback
    const basicWords = [
      'дом', 'кот', 'собака', 'мама', 'папа', 'вода', 'хлеб', 'молоко',
      'стол', 'стул', 'окно', 'дверь', 'книга', 'ручка', 'тетрадь'
    ];
    return new Trie(basicWords);
  }
  return dictionary;
};

export function scanWords(grid: any[][]): Array<{
  word: string;
  positions: Array<{ row: number; col: number }>;
  direction: 'horizontal' | 'vertical';
}> {
  const wordsFound: Array<{
    word: string;
    positions: Array<{ row: number; col: number }>;
    direction: 'horizontal' | 'vertical';
  }> = [];

  const dict = getDictionary();

  // Horizontal scan
  for (let row = 0; row < 6; row++) {
    let word = '';
    let positions: Array<{ row: number; col: number }> = [];
    
    for (let col = 0; col < 6; col++) {
      if (grid[row][col]?.letter) {
        word += grid[row][col].letter;
        positions.push({ row, col });
      } else {
        if (word.length >= 3 && dict.contains(word)) {
          wordsFound.push({
            word,
            positions: [...positions],
            direction: 'horizontal'
          });
        }
        word = '';
        positions = [];
      }
    }
    
    // Check word at end of row
    if (word.length >= 3 && dict.contains(word)) {
      wordsFound.push({
        word,
        positions,
        direction: 'horizontal'
      });
    }
  }

  // Vertical scan
  for (let col = 0; col < 6; col++) {
    let word = '';
    let positions: Array<{ row: number; col: number }> = [];
    
    for (let row = 0; row < 6; row++) {
      if (grid[row][col]?.letter) {
        word += grid[row][col].letter;
        positions.push({ row, col });
      } else {
        if (word.length >= 3 && dict.contains(word)) {
          wordsFound.push({
            word,
            positions: [...positions],
            direction: 'vertical'
          });
        }
        word = '';
        positions = [];
      }
    }
    
    // Check word at end of column
    if (word.length >= 3 && dict.contains(word)) {
      wordsFound.push({
        word,
        positions,
        direction: 'vertical'
      });
    }
  }

  return wordsFound;
}

// Check if a letter has any neighbors (adjacent cells with letters)
function hasNeighbors(grid: any[][], row: number, col: number): boolean {
  const directions = [
    [-1, -1], [-1, 0], [-1, 1], // top row
    [0, -1],           [0, 1],  // same row
    [1, -1],  [1, 0],  [1, 1]   // bottom row
  ];
  
  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    
    if (newRow >= 0 && newRow < grid.length && 
        newCol >= 0 && newCol < grid[0].length &&
        grid[newRow][newCol]?.letter) {
      return true;
    }
  }
  
  return false;
}

export function applyGravity(grid: any[][]): { 
  newGrid: any[][], 
  animations: Array<{ from: {row: number, col: number}, to: {row: number, col: number}, letter: string }> 
} {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  const gridSize = newGrid.length;
  const colSize = newGrid[0]?.length || 0;
  const animations: Array<{ from: {row: number, col: number}, to: {row: number, col: number}, letter: string }> = [];
  
  // First, identify isolated letters (letters without neighbors)
  const isolatedLetters: Array<{row: number, col: number, letter: string}> = [];
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < colSize; col++) {
      if (newGrid[row][col]?.letter && !hasNeighbors(newGrid, row, col)) {
        isolatedLetters.push({
          row,
          col, 
          letter: newGrid[row][col].letter
        });
        // Remove the isolated letter from its current position
        newGrid[row][col] = { letter: null, isFixed: false, isHovered: false };
      }
    }
  }
  
  // Apply gravity only to isolated letters, column by column
  for (const isolated of isolatedLetters) {
    const col = isolated.col;
    
    // Find the lowest available position in this column
    let targetRow = gridSize - 1;
    while (targetRow >= 0 && newGrid[targetRow][col]?.letter) {
      targetRow--;
    }
    
    if (targetRow >= 0) {
      // Place the isolated letter at the lowest available position
      newGrid[targetRow][col] = { 
        letter: isolated.letter, 
        isFixed: true, 
        isHovered: false 
      };
      
      // Record animation only if the letter actually moved
      if (targetRow !== isolated.row) {
        animations.push({
          from: { row: isolated.row, col: isolated.col },
          to: { row: targetRow, col: isolated.col },
          letter: isolated.letter
        });
      }
    }
  }
  
  return { newGrid, animations };
}
