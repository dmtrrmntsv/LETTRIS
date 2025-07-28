Техническое Задание (ТЗ) на Разработку Мини-Игры для Telegram Mini Apps
Дата составления: 2025-07-28
Автор ТЗ: AI-Ассистент (на основе запроса пользователя и лучших практик)
Версия: 1.0

Это ТЗ составлено в соответствии с рекомендациями по структуре технических заданий из sky.pro, где подчеркивается важность ясности, спецификаций и критериев успеха. Задание ориентировано на ИИ-разработчика (например, для генерации кода в инструментах типа GitHub Copilot или Claude), с учетом лучших практик: модульность, использование готовых библиотек, оффлайн-доступность, интеграция с Telegram Mini Apps SDK (из docs.ton.org). Максимум готового кода включено в виде сниппетов (на JavaScript/React, с Zustand для состояния — популярный стек для TMA).

Примечание: Игра — одностраничное приложение (SPA). Используйте React для UI, Canvas/SVG для поля (чтобы избежать DOM-лаг на мобильных). Для TMA: интегрируйте @twa-dev/sdk для UI-элементов, haptic feedback, CloudStorage (для хранения локальных данных без сервера). Если нужен сервер (для глобального лидерборда), укажите в коде заглушки; иначе — только локальный.

1. Введение
Описание проекта: Мини-игра в стиле "Тетрис с словами" для Telegram Mini Apps. Игровое поле 6x6, где игрок размещает рандомные фигуры (блоки с буквами) из очереди внизу. После размещения сканируются слова (горизонтально/вертикально), которые исчезают, начисляя очки. Буквы "падают" вниз при исчезновении (гравитация). Новые фигуры генерируются после размещения. Игра заканчивается, если ни одну фигуру из очереди нельзя разместить. Язык: русский. Добавлены жизни, монеты, чек-ин, монетизация.

Цели:

Создать engaging игру с элементами пазла и словесных игр.
Обеспечить оффлайн-доступность (локальный словарь, состояние в CloudStorage).
Интегрировать монетизацию via Telegram Stars/TON.
Минимизировать зависимость от сервера (лидерборд — локальный, если без сервера).
Критерии успеха: Игра запускается в TMA, проходит тесты (размещение, слова, гравитация), монетизация работает. Тестировать на Telegram WebView.

@telegram-apps/create-mini-app


@telegram-apps/create-mini-app is a CLI tool designed to scaffold your new mini application on the Telegram Mini Apps platform. It generates a project with pre-configured libraries and template files, allowing you to customize the content based on your specific requirements.

Usage
To run the tool, use one of the following scripts depending on your package manager.


pnpm

npm

yarn

pnpm dlx @telegram-apps/create-mini-app@latest
Creating a New Application
The above command executes a script that guides you through the creation of your application by sequentially prompting for the following information:

1. Project Directory Name
Prompt: Enter the name of the folder where the project files will be located.

Default: mini-app The script will create a subfolder with the specified name in the current directory.

2. Preferred Technologies
Option	Details
Language	Choose between TypeScript or JavaScript.
SDK	• tma.js @telegram-apps/sdk
A TypeScript library for seamless communication with Telegram Mini Apps functionality.
• Telegram SDK @twa-dev/sdk
This package allows you to work with the SDK as an npm package.
Frameworks	• React.js template
• Next.js template
• Solid.js template
• Vue.js template
3. Git Remote Repository URL (Optional)
Enter the Git remote repository URL. This value will be used to connect the created project with your remote Git repository. It should be either an HTTPS link or an SSH connection string.

Build Configuration
Projects created with create-mini-app are configured to use the Vite bundler. The project includes a vite.config.js file, which you can customize to adjust the build settings according to your needs.

2. Требования к Функционалу
2.1. Основной Геймплей
Поле: 6x6 грид (2D-массив, каждая ячейка: {letter: string | null, isFixed: boolean}).
Фигуры: Очередь из 3 фигур внизу (каждая — массив координат + букв, формы как тетромино: I, O, T, J, L, S, Z; 2-5 клеток). Ротация дозволена.
Размещение: Drag'n'drop фигуры на поле. Проверка: не выходит за границы, не пересекает занятые клетки.
Словообразование: Автоматическое сканирование после размещения. Слова (мин. 3 буквы) из смежных букв (горизонтально/вертикально). Использовать все доступные фигуры на поле + из очереди (игрок может размещать несколько для комбо). Нормализация: toLowerCase, ё→е.
Исчезновение и Гравитация: Если слово валидно (по словарю), клетки удаляются, очки += длина * множитель. Буквы сверху "падают" вниз (перестроить столбцы снизу вверх).
Генерация: После размещения — новые фигуры в очередь. Буквы: weighted random (частые — о, а, е чаще; см. сниппет).
Конец игры: Если ни одну фигуру из очереди нельзя разместить (проверить все позиции/ротации) — game over, показать score, модалку с restart/монетизацией.
Доработки: Комбо для каскадных исчезновений. Бонусы за длинные слова/редкие буквы.
2.2. Жизни и Монеты
Жизни: 5 максимум. Тратятся при game over (1 жизнь на игру). Восстановление: +1 ежечасно (таймер via setInterval, хранить timestamp в CloudStorage). Модальное окно: Открывается по клику на иконку сверху; показывает жизни, таймер, кнопку "Пополнить за монеты" (1 жизнь = 50 монет).
Монеты: Внутриигровая валюта. Заработок: ежедневный чек-ин (100 монет за логин, +bonus за streak via CloudStorage). Траты: на жизни, смену фигур (50 монет за смену очереди).
Модальное окно: React-компонент с балансом (монеты, жизни), кнопками для покупки/чек-ина.
2.3. Монетизация
Покупка монет: За Telegram Stars (in-app purchases) или TON-крипту (via SDK payments). Пример: 100 монет = 10 Stars. Интегрировать Telegram Payments API.
Реклама: Нет нативной, но заглушка для rewarded ads via бот (показать модалку "Смотреть ad за 50 монет").
Баланс: Хранить в CloudStorage (обезличено, по user ID из initData).
2.4. Лидерборд
Тип: Обезличенный (без имен, только scores). Без сервера — только локальный high-score (top-10 в CloudStorage для пользователя). Глобальный лидерборд требует сервера (API для submit/ fetch scores) — не добавляем, если сервер не нужен. Альтернатива: Агрегировать статистику локально (суммарные очки по всем играм пользователя), показывать в модалке.
2.5. UI/UX и TMA-Интеграция
Экраны: Главный (поле + очередь), модалки (жизни, game over, лидерборд).
TMA-нюансы: Использовать Telegram.WebApp для: theme (light/dark), haptic, share score. Хранение: CloudStorage для состояния (lives, coins, high-scores). Инициализация: Telegram.WebApp.ready().
3. Архитектура и Технологии
Стек: React (CRA или Vite), Zustand (для глобального состояния), @twa-dev/sdk (TMA), Canvas для грида (для производительности).
Состояние: Zustand store: {grid, queue, score, lives, coins, lastCheckIn, highScores}.
Модули:
GameLogic: размещение, сканирование слов, гравитация.
Dictionary: Trie для словаря.
Monetization: handlers для payments.
Лучшие практики: Тестирование (Jest), ESLint, responsive дизайн (mobile-first), error handling (e.g., offline mode).
4. Технические Детали: Словарь и Нюансы
Словарь: Используйте github.com/danakt или opencorpora.org. Отфильтруйте по длине 3-12, базовым формам (см. скрипт выше). Размер после: ~100k слов. Скачайте russian_words.js/txt, импортируйте как массив. Фильтр: words.filter(w => w.length >= 3 && w.length <= 12). Храните в Trie для O(1) поиска. Размер: ~50k слов после фильтра (gzip ~200KB, приемлемо для bundle).
Нюансы в TMA: WebView ограничивает storage (используйте CloudStorage для персистентности). Для payments: следуйте docs.ton.org. Обезличенность: Не храните личные данные, только user_id из initData.
5. Готовые Код-Сниппеты
Вот максимум готового кода для ключевых частей. Интегрируйте в React-app.

5.1. Zustand Store (src/store.js)

import { create } from 'zustand';
import TelegramWebApp from '@twa-dev/sdk';

export const useStore = create((set, get) => ({
  grid: Array(6).fill().map(() => Array(6).fill(null)),
  queue: [], // [{shape: [[0,0],[0,1]], letters: ['а','б']}, ...]
  score: 0,
  lives: 5,
  coins: 0,
  lastCheckIn: null,
  highScores: [],

  init: () => {
    TelegramWebApp.ready();
    // Load from CloudStorage
    TelegramWebApp.CloudStorage.getItems(['lives', 'coins', 'lastCheckIn', 'highScores'], (err, values) => {
      if (!err) set({ lives: values.lives || 5, coins: values.coins || 0, /* etc */ });
    });
  },

  placeFigure: (figure, position) => {
    // Logic to place on grid, then scanWords(), applyGravity(), generateQueue()
    set({ score: get().score + 10 }); // Example
  },

  checkIn: () => {
    const now = Date.now();
    if (now - get().lastCheckIn > 86400000) { // 24h
      set({ coins: get().coins + 100, lastCheckIn: now });
      TelegramWebApp.CloudStorage.setItem('coins', get().coins);
    }
  },

  restoreLife: () => {
    const interval = setInterval(() => {
      if (get().lives < 5) set({ lives: get().lives + 1 });
    }, 3600000); // Hourly
    return () => clearInterval(interval);
  },
}));
5.2. Словарь и Trie (src/dictionary.js)
Скачайте словарь из github.com и импортируйте как import words from './russian_words.js'; (массив строк).


class TrieNode {
  constructor() { this.children = {}; this.isEnd = false; }
}

class Trie {
  constructor(words) {
    this.root = new TrieNode();
    words.filter(w => w.length >= 3 && w.length <= 12 && /^[а-яё]+$/.test(w)) // Filter
      .forEach(word => {
        let node = this.root;
        for (let char of word.toLowerCase().replace('ё', 'е')) {
          if (!node.children[char]) node.children[char] = new TrieNode();
          node = node.children[char];
        }
        node.isEnd = true;
      });
  }

  contains(word) {
    let node = this.root;
    for (let char of word.toLowerCase().replace('ё', 'е')) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return node.isEnd;
  }
}

export const dictionary = new Trie(words); // words from GitHub
5.3. Генерация Фигур и Букв (src/gameLogic.js)

const letterWeights = ['о','о','о','о','о','о','о','о','о','о','о', 'а','а','а','а','а','а','а','а', /* etc, based on frequency */]; // From [github.com](https://github.com/zaborshikov/reallyrandomruwords)

const shapes = [ // Tetromino-like
  [[0,0],[0,1],[0,2]], // I
  [[0,0],[0,1],[1,0],[1,1]], // O
  // Add more
];

export function generateFigure() {
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  const letters = shape.map(() => letterWeights[Math.floor(Math.random() * letterWeights.length)]);
  return { shape, letters };
}

export function generateQueue() {
  return Array(3).fill().map(generateFigure);
}
5.4. Гравитация (Падающие Буквы) (src/gameLogic.js)

export function applyGravity(grid) {
  for (let col = 0; col < 6; col++) {
    let writeRow = 5; // Bottom-up
    for (let row = 5; row >= 0; row--) {
      if (grid[row][col]) {
        grid[writeRow][col] = grid[row][col];
        if (writeRow !== row) grid[row][col] = null;
        writeRow--;
      }
    }
    while (writeRow >= 0) {
      grid[writeRow][col] = null;
      writeRow--;
    }
  }
  return grid;
}
5.5. Сканирование Слов (src/gameLogic.js)

import { dictionary } from './dictionary';

export function scanWords(grid) {
  const wordsFound = [];
  // Horizontal scan
  for (let row = 0; row < 6; row++) {
    let word = '';
    for (let col = 0; col < 6; col++) {
      if (grid[row][col]) word += grid[row][col].letter;
      else {
        if (word.length >= 3 && dictionary.contains(word)) wordsFound.push({ type: 'h', row, startCol: col - word.length, word });
        word = '';
      }
    }
    // Check last
    if (word.length >= 3 && dictionary.contains(word)) wordsFound.push({ /* similar */ });
  }
  // Vertical scan similarly

  // Remove words
  wordsFound.forEach(({ type, row, startCol, word }) => {
    for (let i = 0; i < word.length; i++) {
      if (type === 'h') grid[row][startCol + i] = null;
      // else vertical
    }
  });

  return wordsFound; // For scoring
}
5.6. Монетизация (src/monetization.js)

import TelegramWebApp from '@twa-dev/sdk';

export function buyCoins(amount) {
  TelegramWebApp.showPopup({ message: 'Buy with Stars?' }, () => {
    // Integrate Payments API: https://docs.ton.org/develop/dapps/telegram-apps
    // Simulate: useStore.getState().set({ coins: useStore.getState().coins + amount });
  });
}
5.7. Модальное Окно для Жизней/Монет (src/components/LivesModal.jsx)

import { useStore } from '../store';

const LivesModal = ({ isOpen, onClose }) => {
  const { lives, coins, checkIn, restoreLife } = useStore();
  if (!isOpen) return null;
  return (
    <div className="modal">
      <h2>Баланс</h2>
      <p>Жизни: {lives}/5</p>
      <p>Монеты: {coins}</p>
      <button onClick={checkIn}>Чек-ин (100 монет)</button>
      <button onClick={() => { if (coins >= 50) useStore.setState({ coins: coins - 50, lives: lives + 1 }); }}>Пополнить жизнь (50 монет)</button>
      <button onClick={onClose}>Закрыть</button>
    </div>
  );
};
6. Рекомендации по Разработке
Тестирование: Unit-тесты для Trie, гравитации. E2E в Telegram emulator.
Оптимизация: Bundle < 5MB (сжатие словаря).
Дальнейшие доработки: Если добавить сервер (e.g., Firebase), реализуйте глобальный лидерборд.
Источники для кода: Опирался на github.com для идей словарей, github.com для wordgame-логики.

