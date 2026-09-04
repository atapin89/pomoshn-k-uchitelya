import { useState, useEffect } from 'react';
import { BookOpen, ArrowLeft, RotateCcw } from 'lucide-react';
import BackButton from './BackButton';

interface Flashcard {
  question: string;
  answer: string;
}

interface Deck {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  createdAt: number;
}

const STORAGE_KEY = 'flashcards_decks';

const loadDecks = (): Deck[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export default function StudyScreen({ deckId, onBack }: { deckId: string; onBack: () => void }) {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const decks = loadDecks();
    const foundDeck = decks.find(d => d.id === deckId);
    if (foundDeck) {
      setDeck(foundDeck);
    }
  }, [deckId]);

  if (!deck) {
    return (
      <div className="min-h-[100dvh] notebook-bg flex flex-col items-center justify-center p-5">
        <p className="text-gray-600 mb-4">Колода не найдена</p>
        <button
          onClick={onBack}
          className="bg-purple-600 text-white font-semibold rounded-xl px-6 py-3"
        >
          Вернуться назад
        </button>
      </div>
    );
  }

  const currentCard = deck.cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % deck.cards.length);
    }, 200);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + deck.cards.length) % deck.cards.length);
    }, 200);
  };

  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
      <header className="bg-purple-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <div className="shrink-0">
            <BackButton onClick={onBack} variant="light" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{deck.title}</h1>
            <p className="text-xs text-purple-200">
              Карточка {currentIndex + 1} из {deck.cards.length}
            </p>
          </div>
          <div className="shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 flex flex-col">
        {/* Прогресс-бар */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / deck.cards.length) * 100}%` }}
          />
        </div>

        {/* Карточка */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex-1 cursor-pointer"
        >
          <div
            className="relative w-full h-full transition-transform duration-500"
            style={{
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Лицевая сторона */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <p className="text-white/80 text-sm mb-4">Вопрос</p>
              <p className="text-2xl font-bold text-white text-center leading-relaxed">
                {currentCard.question}
              </p>
              <p className="text-white/60 text-xs mt-6">Нажмите, чтобы перевернуть</p>
            </div>

            {/* Обратная сторона */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <p className="text-white/80 text-sm mb-4">Ответ</p>
              <p className="text-2xl font-bold text-white text-center leading-relaxed">
                {currentCard.answer}
              </p>
              <p className="text-white/60 text-xs mt-6">Нажмите, чтобы перевернуть</p>
            </div>
          </div>
        </div>

        {/* Навигация */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handlePrev}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Назад
          </button>
          <button
            onClick={handleNext}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
          >
            Далее <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>

        {/* Индикаторы карточек */}
        <div className="flex justify-center gap-1 mt-4 flex-wrap">
          {deck.cards.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? 'bg-purple-600 w-4' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
