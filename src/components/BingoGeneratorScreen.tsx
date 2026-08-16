import { useState, useRef } from 'react';
import {
  Grid3x3, Plus, Trash2, Download, Eye, Shuffle, Check,
  ArrowLeft, Printer, Monitor, X, RotateCcw, FileText
} from 'lucide-react';
import BackButton from './BackButton';
import YandexAdBlock from './YandexAdBlock';
import { triggerHaptic } from '@/lib/haptic';
import { jsPDF } from 'jspdf';

// ===== ТИПЫ =====
interface BingoCard {
  id: string;
  cells: (string | null)[]; // 25 ячеек, null = FREE
  markedCells: boolean[]; // какие ячейки отмечены
}

type Screen = 'editor' | 'preview' | 'projector';

const STORAGE_KEY = 'bingo_cards';

// ===== УТИЛИТЫ =====
const generateId = () => Math.random().toString(36).substr(2, 9);

const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const loadCards = (): BingoCard[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveCards = (cards: BingoCard[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
};

// ===== ГЛАВНЫЙ КОМПОНЕНТ =====
export default function BingoGeneratorScreen({ onBack }: { onBack: () => void }) {
  const [screen, setScreen] = useState<Screen>('editor');
  const [words, setWords] = useState('');
  const [cards, setCards] = useState<BingoCard[]>(loadCards());
  const [cardCount, setCardCount] = useState(5);
  const [isProjectorMode, setIsProjectorMode] = useState(false);

  const generateCards = () => {
    const wordList = words
      .split('\n')
      .map(w => w.trim())
      .filter(w => w !== '');

    if (wordList.length < 24) {
      alert('Нужно минимум 24 слова для заполнения карточки Бинго (5x5 минус центр)');
      return;
    }

    const newCards: BingoCard[] = [];
    for (let i = 0; i < cardCount; i++) {
      const shuffled = shuffleArray(wordList);
      const cells: (string | null)[] = [];
      for (let j = 0; j < 25; j++) {
        if (j === 12) {
          cells.push(null); // FREE в центре
        } else {
          cells.push(shuffled[j % shuffled.length]);
        }
      }
      newCards.push({
        id: generateId(),
        cells,
        markedCells: Array(25).fill(false),
      });
    }

    setCards(newCards);
    saveCards(newCards);
    triggerHaptic('success');
  };

  const clearCards = () => {
    setCards([]);
    saveCards([]);
    triggerHaptic('medium');
  };

  const toggleCell = (cardId: string, cellIndex: number) => {
    setCards(cards.map(card => {
      if (card.id !== cardId) return card;
      const newMarked = [...card.markedCells];
      newMarked[cellIndex] = !newMarked[cellIndex];
      return { ...card, markedCells: newMarked };
    }));
    triggerHaptic('light');
  };

  const resetCard = (cardId: string) => {
    setCards(cards.map(card => {
      if (card.id !== cardId) return card;
      return { ...card, markedCells: Array(25).fill(false) };
    }));
    triggerHaptic('light');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const cardSize = 90;
    const gap = 5;

    cards.forEach((card, idx) => {
      if (idx > 0 && idx % 2 === 0) doc.addPage();

      const xPos = margin + (idx % 2) * (cardSize + gap);
      const yPos = margin + Math.floor(idx / 2) * (cardSize + gap + 20);

      doc.setFontSize(10);
      doc.text(`Карточка ${idx + 1}`, xPos, yPos - 2);

      const cellSize = cardSize / 5;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const cellIndex = row * 5 + col;
          const x = xPos + col * cellSize;
          const y = yPos + row * cellSize;

          doc.rect(x, y, cellSize, cellSize);
          
          const text = card.cells[cellIndex] || 'FREE';
          doc.setFontSize(8);
          doc.text(text, x + cellSize / 2, y + cellSize / 2, { align: 'center', baseline: 'middle' });

          if (card.markedCells[cellIndex]) {
            doc.setFillColor(200, 200, 200);
            doc.rect(x, y, cellSize, cellSize, 'F');
          }
        }
      }
    });

    doc.save(`бинго_${cards.length}карточек.pdf`);
    triggerHaptic('success');
  };

  // ===== ЭКРАН РЕДАКТОРА =====
  if (screen === 'editor') {
    return (
      <div className="min-h-[100dvh] notebook-bg flex flex-col">
        <header className="bg-purple-700 shadow-md sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
            <div className="shrink-0">
              <BackButton onClick={onBack} variant="light" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h1 className="text-lg font-bold text-white leading-tight truncate">Генератор Бинго</h1>
              <p className="text-xs text-purple-200 leading-tight">Карточки для игры</p>
            </div>
            <div className="shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <Grid3x3 className="w-5 h-5 text-white" />
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 space-y-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <div>
              <label className="text-sm font-semibold text-purple-700 block mb-2">
                Слова для Бинго (каждое с новой строки)
              </label>
              <textarea
                value={words}
                onChange={(e) => setWords(e.target.value)}
                placeholder="Введите минимум 24 слова..."
                className="w-full h-40 rounded-xl border border-purple-200 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-y"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Нужно минимум 24 слова. Чем больше слов, тем разнообразнее карточки.
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-purple-700 block mb-2">
                Количество карточек
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={cardCount}
                onChange={(e) => setCardCount(Math.max(1, Math.min(30, Number(e.target.value))))}
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 От 1 до 30 карточек. Каждая карточка уникальна.
              </p>
            </div>

            <button
              onClick={generateCards}
              disabled={!words.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
            >
              <Shuffle className="w-5 h-5" />
              Сгенерировать карточки
            </button>
          </div>

          {cards.length > 0 && (
            <>
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-purple-700">Сгенерировано карточек: {cards.length}</h3>
                  <button
                    onClick={clearCards}
                    className="text-red-500 hover:bg-red-50 rounded-lg p-2 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setScreen('preview')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Eye className="w-5 h-5" />
                    Просмотр и печать
                  </button>

                  <button
                    onClick={exportToPDF}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Download className="w-5 h-5" />
                    Скачать PDF
                  </button>

                  <button
                    onClick={() => {
                      setIsProjectorMode(true);
                      setScreen('projector');
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Monitor className="w-5 h-5" />
                    Режим проектора
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Как использовать:
                </h4>
                <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
                  <li>Введите список слов (минимум 24)</li>
                  <li>Укажите количество карточек</li>
                  <li>Нажмите "Сгенерировать"</li>
                  <li>Скачайте PDF для печати или используйте режим проектора</li>
                </ol>
              </div>
            </>
          )}

          <YandexAdBlock />
        </main>
      </div>
    );
  }

  // ===== ЭКРАН ПРОСМОТРА =====
  if (screen === 'preview') {
    return (
      <div className="min-h-[100dvh] notebook-bg flex flex-col">
        <header className="bg-purple-700 shadow-md sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
            <div className="shrink-0">
              <BackButton onClick={() => setScreen('editor')} variant="light" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white truncate">Просмотр карточек</h1>
              <p className="text-xs text-purple-200">{cards.length} карточек</p>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 space-y-4 overflow-y-auto">
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              className="flex-1 bg-green-600 text-white font-semibold rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-sm active:scale-95 transition-transform"
            >
              <Download className="w-4 h-4" /> PDF
            </button>
            <button
              onClick={() => {
                setIsProjectorMode(true);
                setScreen('projector');
              }}
              className="flex-1 bg-purple-600 text-white font-semibold rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-sm active:scale-95 transition-transform"
            >
              <Monitor className="w-4 h-4" /> Проектор
            </button>
          </div>

          <div className="space-y-4">
            {cards.map((card, idx) => (
              <div key={card.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-purple-700">Карточка {idx + 1}</h3>
                  <button
                    onClick={() => resetCard(card.id)}
                    className="text-gray-500 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-1">
                  {card.cells.map((cell, cellIdx) => (
                    <button
                      key={cellIdx}
                      onClick={() => toggleCell(card.id, cellIdx)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
                        card.markedCells[cellIdx]
                          ? 'bg-purple-600 text-white'
                          : cell === null
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cell === null ? 'FREE' : cell.substring(0, 8)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <YandexAdBlock />
        </main>
      </div>
    );
  }

  // ===== РЕЖИМ ПРОЕКТОРА =====
  if (screen === 'projector') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <header className="bg-gray-800 shadow-lg sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setScreen('preview')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-white">Бинго - Режим проектора</h1>
            </div>
            <button
              onClick={() => setIsProjectorMode(false)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl px-4 py-2 flex items-center gap-2 transition-colors"
            >
              <X className="w-5 h-5" />
              Выйти
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
          <div className="grid grid-cols-2 gap-8">
            {cards.slice(0, 2).map((card, idx) => (
              <div key={card.id} className="bg-white rounded-3xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">
                  Карточка {idx + 1}
                </h2>
                <div className="grid grid-cols-5 gap-2">
                  {card.cells.map((cell, cellIdx) => (
                    <button
                      key={cellIdx}
                      onClick={() => toggleCell(card.id, cellIdx)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                        card.markedCells[cellIdx]
                          ? 'bg-purple-600 text-white scale-95'
                          : cell === null
                          ? 'bg-amber-200 text-amber-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {cell === null ? 'FREE' : cell}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Нажимайте на ячейки, чтобы отмечать их. Используйте для демонстрации на проекторе.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
