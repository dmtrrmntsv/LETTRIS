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
        word.length <= 12 && 
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

// Basic Russian words for demo - in production, load from external source
const BASIC_WORDS = [
  'дом', 'кот', 'собака', 'мама', 'папа', 'вода', 'хлеб', 'молоко',
  'стол', 'стул', 'окно', 'дверь', 'книга', 'ручка', 'тетрадь',
  'школа', 'учитель', 'ученик', 'урок', 'задача', 'ответ',
  'время', 'день', 'ночь', 'утро', 'вечер', 'год', 'месяц',
  'работа', 'дело', 'человек', 'друг', 'семья', 'ребенок',
  'город', 'дорога', 'машина', 'поезд', 'самолет', 'корабль',
  'еда', 'мясо', 'рыба', 'овощи', 'фрукты', 'яблоко', 'банан',
  'красный', 'синий', 'зеленый', 'желтый', 'белый', 'черный',
  'большой', 'маленький', 'хороший', 'плохой', 'новый', 'старый',
  'идти', 'бежать', 'лететь', 'плыть', 'читать', 'писать',
  'говорить', 'слушать', 'смотреть', 'думать', 'знать', 'понимать'
];

export const dictionary = new Trie(BASIC_WORDS);

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

  // Horizontal scan
  for (let row = 0; row < 6; row++) {
    let word = '';
    let positions: Array<{ row: number; col: number }> = [];
    
    for (let col = 0; col < 6; col++) {
      if (grid[row][col]?.letter) {
        word += grid[row][col].letter;
        positions.push({ row, col });
      } else {
        if (word.length >= 3 && dictionary.contains(word)) {
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
    if (word.length >= 3 && dictionary.contains(word)) {
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
        if (word.length >= 3 && dictionary.contains(word)) {
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
    if (word.length >= 3 && dictionary.contains(word)) {
      wordsFound.push({
        word,
        positions,
        direction: 'vertical'
      });
    }
  }

  return wordsFound;
}

export function applyGravity(grid: any[][]): any[][] {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  
  for (let col = 0; col < 6; col++) {
    let writeRow = 5; // Start from bottom
    
    for (let row = 5; row >= 0; row--) {
      if (newGrid[row][col]?.letter) {
        if (writeRow !== row) {
          newGrid[writeRow][col] = { ...newGrid[row][col] };
          newGrid[row][col] = { letter: null, isFixed: false };
        }
        writeRow--;
      }
    }
  }
  
  return newGrid;
}