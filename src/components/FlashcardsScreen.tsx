import { useEffect, useState } from 'react';
import { Layers, Plus, Play, Pencil, Trash2, GraduationCap, FileQuestion } from 'lucide-react';
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

function deckProgress(deck: Deck): { learned: number; total: number } {
  const total = deck.cards.length;
  const learned = deck.cards.filter((c) => c.status === 'learned').length;
  return { learned, total };
}

export default function FlashcardsScreen({ onBack, onStudy, onQuiz }: FlashcardsScreenProps) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [editing, setEditing] = useState<Deck | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setDecks(loadDecks());
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

  return (
    <div className="min-h-[100dvh] bg-purple-50 flex flex-col">
      <header className="bg-purple-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-5 py-4">
          <BackButton onClick={onBack} variant="light" />
          <div className="flex items-center gap-3 mt-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">Флэш-карточки</h1>
              <p className="text-sm text-white/70">Управление колодами</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 flex flex-col gap-4">
        {decks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Layers className="w-16 h-16 text-purple-300 mb-4" />
            <p className="text-lg font-semibold text-purple-700">Пока нет колод</p>
            <p className="text-sm text-gray-500 mt-1">Создайте первую колоду карточек</p>
          </div>
        ) : (
          decks.map((deck) => {
            const { learned, total } = deckProgress(deck);
            const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
            return (
              <div
                key={deck.id}
                className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-purple-700 truncate">{deck.title}</h3>
                    <p className="text-sm text-gray-500">
                      {total} карточек · Изучено {learned}/{total}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        setEditing(deck);
                      }}
                      className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 active:scale-95 transition-transform touch-manipulation"
                      aria-label="Редактировать"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDeck(deck.id)}
                      className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 active:scale-95 transition-transform touch-manipulation"
                      aria-label="Удалить"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-purple-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex gap-2.5 mt-1">
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      onStudy(deck.id);
                    }}
                    disabled={total === 0}
                    className="flex-1 bg-purple-600 text-white font-semibold rounded-xl py-3 min-h-12 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform touch-manipuration disabled:opacity-40 disabled:active:scale-100"
                  >
                    <Play className="w-5 h-5" />
                    Изучать
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      onQuiz(deck.id);
                    }}
                    disabled={total < 2}
                    className="flex-1 bg-white border-2 border-purple-200 text-purple-700 font-semibold rounded-xl py-3 min-h-12 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform touch-manipulation disabled:opacity-40 disabled:active:scale-100"
                  >
                    <FileQuestion className="w-5 h-5" />
                    Тест
                  </button>
                </div>
              </div>
            );
          })
        )}

        <button
          onClick={() => {
            triggerHaptic('light');
            setCreating(true);
          }}
          className="w-full bg-white border-2 border-dashed border-purple-300 rounded-2xl py-4 flex items-center justify-center gap-2 text-purple-600 font-semibold active:scale-[0.98] transition-transform min-h-14 touch-manipulation"
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
