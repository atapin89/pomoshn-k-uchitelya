import { useState, useEffect } from 'react';
import { X, RotateCw, Check } from 'lucide-react';
import type { Deck, FlashCard } from '@/types';
import { loadDecks, saveDecks } from '@/lib/storage';
import { triggerHaptic } from '@/lib/haptic';
import BackButton from './BackButton';

interface StudyScreenProps {
  deckId: string;
  onBack: () => void;
}

export default function StudyScreen({ deckId, onBack }: StudyScreenProps) {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCards, setSessionCards] = useState<FlashCard[]>([]);

  useEffect(() => {
    const allDecks = loadDecks();
    const foundDeck = allDecks.find((d) => d.id === deckId);
    if (foundDeck) {
      setDeck(foundDeck);
      // Берем только карточки, которые еще не выучены
      const cardsToStudy = foundDeck.cards.filter((c) => c.status !== 'learned');
      setSessionCards(cardsToStudy.length > 0 ? cardsToStudy : foundDeck.cards);
    }
  }, [deckId]);

  const handleEvaluate = (knows: boolean) => {
    if (!deck) return;

    const updatedDecks = loadDecks().map((d) => {
      if (d.id !== deckId) return d;
      return {
        ...d,
        cards: d.cards.map((card, idx) => {
          if (card.id === sessionCards[currentIndex].id) {
            return { ...card, status: knows ? 'learned' as const : 'mistake' as const, lastReviewed: Date.now() };
          }
          return card;
        }),
      };
    });

    saveDecks(updatedDecks);
    setDeck(updatedDecks.find((d) => d.id === deckId) || null);

    triggerHaptic(knows ? 'heavy' : 'medium');

    if (currentIndex < sessionCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      // Сессия завершена
      onBack();
    }
  };

  if (!deck || sessionCards.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-purple-50 flex flex-col items-center justify-center p-6">
        <p className="text-purple-700 text-lg font-semibold mb-4">Нет карточек для изучения</p>
        <button onClick={onBack} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold">
          Назад
        </button>
      </div>
    );
  }

  const currentCard = sessionCards[currentIndex];
  const progress = ((currentIndex + 1) / sessionCards.length) * 100;

  return (
    <div className="min-h-[100dvh] bg-purple-50 flex flex-col">
      <header className="bg-purple-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-5 py-4">
          <BackButton onClick={onBack} variant="light" />
          <div className="flex items-center justify-between mt-3">
            <h1 className="text-xl font-bold text-white">{deck.title}</h1>
            <span className="text-white/80 text-sm">
              {currentIndex + 1} / {sessionCards.length}
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/20 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-6 flex flex-col items-center justify-center gap-6">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full aspect-[4/5] bg-white rounded-3xl shadow-xl border-2 border-purple-200 flex flex-col items-center justify-center p-8 text-center cursor-pointer active:scale-95 transition-transform"
        >
          <span className="text-sm text-gray-400 uppercase tracking-wider mb-4">
            {isFlipped ? 'Ответ' : 'Вопрос'}
          </span>
          <p className="text-2xl font-bold text-purple-900 leading-relaxed">
            {isFlipped ? (currentCard.sides[1] || '...') : (currentCard.sides[0] || '...')}
          </p>
          {currentCard.sides.length > 2 && isFlipped && (
            <div className="mt-6 space-y-2 w-full">
              {currentCard.sides.slice(2).map((side, idx) => (
                <p key={idx} className="text-sm text-purple-600 bg-purple-50 p-3 rounded-lg">
                  {side}
                </p>
              ))}
            </div>
          )}
          <p className="mt-8 text-purple-400 text-sm">Нажми, чтобы перевернуть</p>
        </div>

        {!isFlipped ? (
          <button
            onClick={() => setIsFlipped(true)}
            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <RotateCw size={20} /> Показать ответ
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-4 w-full">
            <button
              onClick={() => handleEvaluate(false)}
              className="bg-orange-100 text-orange-700 py-4 rounded-2xl font-bold text-lg flex flex-col items-center gap-1 border-2 border-orange-200 active:scale-95 transition-transform"
            >
              <X size={24} /> Повторить
            </button>
            <button
              onClick={() => handleEvaluate(true)}
              className="bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg flex flex-col items-center gap-1 shadow-lg active:scale-95 transition-transform"
            >
              <Check size={24} /> Знаю
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
