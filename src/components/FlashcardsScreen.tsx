import { useEffect, useState } from 'react';
import { Layers, Plus, Pencil, Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import type { Deck } from '@/types';
import { loadDecks, saveDecks } from '@/lib/storage';
import { triggerHaptic } from '@/lib/haptic';
import BackButton from './BackButton';
import YandexAdBlock from './YandexAdBlock';
import DeckEditorModal from './DeckEditorModal';

interface FlashcardsScreenProps {
  onBack: () => void;
  onStudy: (deckId: string) => void;
  onQuiz: (deckId: string) => void;
}

export default function FlashcardsScreen({ onBack, onStudy, onQuiz }: FlashcardsScreenProps) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [editing, setEditing] = useState<Deck | null>(null);
  const [creating, setCreating] = useState(false);
  const [mistakeCards, setMistakeCards] = useState<{ card: any; deckTitle: string; deckId: string }[]>([]);

  useEffect(() => {
    const loaded = loadDecks();
    setDecks(loaded);
    
    // Собираем все карточки со статусом 'mistake' для секции "Повторить ошибки"
    const mistakes: { card: any; deckTitle: string; deckId: string }[] = [];
    loaded.forEach(deck => {
      deck.cards
        .filter(c => c.status === 'mistake')
        .forEach(card => {
          mistakes.push({ card, deckTitle: deck.title, deckId: deck.id });
        });
    });
    setMistakeCards(mistakes);
  }, []);

  const persist = (next: Deck[]) => {
    setDecks(next);
    saveDecks(next);
  };

  const handleSaveDeck = (deck: Deck) => {
    const exists = decks.some((d) => d.id === deck.id);
    const next = exists
      ? decks.map((d) => (d.id === deck.id ? deck : d))
      : [...decks, deck];
    persist(next);
    setEditing(null);
    setCreating(false);
  };

  const handleDeleteDeck = (id: string) => {
    triggerHaptic('medium');
    persist(decks.filter((d) => d.id !== id));
  };

  const getDeckProgress = (deck: Deck) => {
    const total = deck.cards.length;
    const learned = deck.cards.filter((c) => c.status === 'learned').length;
    const mistakes = deck.cards.filter((c) => c.status === 'mistake').length;
    const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
    return { total, learned, mistakes, pct };
  };

  return (
    <div className="min-h-[100dvh] bg-purple-50 flex flex-col">
      {/* НОВАЯ КОМПАКТНАЯ ШАПКА */}
      <header className="bg-purple-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          {/* Кнопка назад (не сжимается) */}
          <div className="shrink-0">
            <BackButton onClick={onBack} variant="light" />
          </div>
          
          {/* Заголовок и описание (занимают все свободное место, текст обрезается если не влезает) */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h1 className="text-lg font-bold text-white leading-tight truncate">Флэш-карточки</h1>
            <p className="text-xs text-purple-200 leading-tight">Интервальное повторение</p>
          </div>
          
          {/* Иконка раздела справа (не сжимается) */}
          <div className="shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 flex flex-col gap-4 overflow-y-auto">
        {/* СЕКЦИЯ: ПОВТОРИТЬ ОШИБКИ */}
        {mistakeCards.length > 0 && (
          <div className="bg-gradient-to-br from-orange-100 to-red-50 border-2 border-orange-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-orange-800">Повторить ошибки</h3>
              <span className="ml-auto bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {mistakeCards.length}
              </span>
            </div>
            <p className="text-sm text-orange-700 mb-3">
              У вас {mistakeCards.length} карточек, которые нужно повторить
            </p>
            <button
              onClick={() => {
                triggerHaptic('heavy');
                // Создаем временную колоду из ошибок и запускаем изучение
                const tempDeck: Deck = {
                  id: 'mistakes-temp',
                  title: 'Повторение ошибок',
                  cards: mistakeCards.map(m => m.card),
                  createdAt: Date.now(),
                };
                // Сохраняем во временное хранилище
                localStorage.setItem('temp_study_deck', JSON.stringify(tempDeck));
                // Переходим на изучение через специальный маршрут
                onStudy('mistakes-temp');
              }}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <RotateCcw className="w-5 h-5" />
              Начать повторение
            </button>
          </div>
        )}

        {/* СПИСОК КОЛОД */}
        {decks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Layers className="w-16 h-16 text-purple-300 mb-4" />
            <p className="text-lg font-semibold text-purple-700">Пока нет колод</p>
            <p className="text-sm text-gray-500 mt-1">Создайте первую колоду карточек</p>
          </div>
        ) : (
          decks.map((deck) => {
            const { total, learned, mistakes, pct } = getDeckProgress(deck);
            return (
              <div
                key={deck.id}
                className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-purple-700 truncate">{deck.title}</h3>
                    <p className="text-sm text-gray-500">
                      {total} карточек · Изучено {learned}
                      {mistakes > 0 && <span className="text-orange-600"> · Ошибок {mistakes}</span>}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        setEditing(deck);
                      }}
                      className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 active:scale-95 transition-transform"
                      aria-label="Редактировать"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDeck(deck.id)}
                      className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 active:scale-95 transition-transform"
                      aria-label="Удалить"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Прогресс-бар */}
                <div className="w-full h-2.5 bg-purple-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Кнопки действий */}
                <div className="grid grid-cols-2 gap-2.5 mt-1">
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      onStudy(deck.id);
                    }}
                    disabled={total === 0}
                    className="bg-purple-600 text-white font-semibold rounded-xl py-3 min-h-12 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
                  >
                    <Layers className="w-5 h-5" />
                    Изучать
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      onQuiz(deck.id);
                    }}
                    disabled={total < 2}
                    className="bg-white border-2 border-purple-200 text-purple-700 font-semibold rounded-xl py-3 min-h-12 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
                  >
                    Тест
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Кнопка создания */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setCreating(true);
          }}
          className="w-full bg-white border-2 border-dashed border-purple-300 rounded-2xl py-4 flex items-center justify-center gap-2 text-purple-600 font-semibold active:scale-95 transition-transform min-h-14"
        >
          <Plus className="w-5 h-5" />
          Создать новую колоду
        </button>

        <YandexAdBlock />
      </main>

      {(creating || editing) && (
        <DeckEditorModal
          deck={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={handleSaveDeck}
        />
      )}
    </div>
  );
}
