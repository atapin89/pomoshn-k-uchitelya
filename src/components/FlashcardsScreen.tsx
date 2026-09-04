import { useState } from 'react';
import { Layers, Plus, Trash2, Edit3, BookOpen, Brain, Trophy, Target, Clock, ArrowLeft, Globe } from 'lucide-react';
import BackButton from './BackButton';
import YandexAdBlock from './YandexAdBlock';

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

type Screen = 'list' | 'create' | 'study' | 'quiz' | 'demo';

// Демо-колода: Мировые столицы
const DEMO_CAPITALS: Flashcard[] = [
  { question: 'Столица Франции', answer: 'Париж' },
  { question: 'Столица Германии', answer: 'Берлин' },
  { question: 'Столица Италии', answer: 'Рим' },
  { question: 'Столица Испании', answer: 'Мадрид' },
  { question: 'Столица Великобритании', answer: 'Лондон' },
  { question: 'Столица США', answer: 'Вашингтон' },
  { question: 'Столица Японии', answer: 'Токио' },
  { question: 'Столица Китая', answer: 'Пекин' },
  { question: 'Столица России', answer: 'Москва' },
  { question: 'Столица Канады', answer: 'Оттава' },
  { question: 'Столица Австралии', answer: 'Канберра' },
  { question: 'Столица Бразилии', answer: 'Бразилиа' },
  { question: 'Столица Индии', answer: 'Нью-Дели' },
  { question: 'Столица Египта', answer: 'Каир' },
  { question: 'Столица Турции', answer: 'Анкара' },
];

const STORAGE_KEY = 'flashcards_decks';

const loadDecks = (): Deck[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveDecks = (decks: Deck[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function FlashcardsScreen({ 
  onBack, 
  onStudy, 
  onQuiz 
}: { 
  onBack: () => void;
  onStudy: (deckId: string) => void;
  onQuiz: (deckId: string) => void;
}) {
  const [screen, setScreen] = useState<Screen>('list');
  const [decks, setDecks] = useState<Deck[]>(loadDecks());
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  
  // Состояния для создания колоды
  const [deckTitle, setDeckTitle] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');

  const persistDecks = (newDecks: Deck[]) => {
    setDecks(newDecks);
    saveDecks(newDecks);
  };

  const handleCreateDeck = () => {
    if (!deckTitle.trim() || cards.length === 0) return;
    
    const newDeck: Deck = {
      id: generateId(),
      title: deckTitle,
      description: deckDescription,
      cards,
      createdAt: Date.now(),
    };
    
    persistDecks([newDeck, ...decks]);
    setDeckTitle('');
    setDeckDescription('');
    setCards([]);
    setScreen('list');
  };

  const handleAddCard = () => {
    if (!currentQuestion.trim() || !currentAnswer.trim()) return;
    
    setCards([...cards, { question: currentQuestion, answer: currentAnswer }]);
    setCurrentQuestion('');
    setCurrentAnswer('');
  };

  const handleDeleteDeck = (id: string) => {
    persistDecks(decks.filter(d => d.id !== id));
  };

  const handleDeleteCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const loadDemoDeck = () => {
    const demoDeck: Deck = {
      id: generateId(),
      title: ' Мировые столицы',
      description: 'Столицы стран мира',
      cards: DEMO_CAPITALS,
      createdAt: Date.now(),
    };
    
    persistDecks([demoDeck, ...decks]);
    setScreen('list');
  };

  // ЭКРАН СПИСКА КОЛОД
  if (screen === 'list') {
    return (
      <div className="min-h-[100dvh] notebook-bg flex flex-col">
        <header className="bg-purple-700 shadow-md sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
            <div className="shrink-0">
              <BackButton onClick={onBack} variant="light" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h1 className="text-lg font-bold text-white leading-tight truncate">Флэш-карточки</h1>
              <p className="text-xs text-purple-200 leading-tight">Колоды и изучение</p>
            </div>
            <div className="shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 space-y-4 overflow-y-auto">
          <button
            onClick={() => setScreen('create')}
            className="w-full bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-2xl p-5 flex items-center gap-4 shadow-lg active:scale-[0.98] transition-transform"
          >
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Plus className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold">Создать колоду</h2>
              <p className="text-white/80 text-xs mt-1">Добавьте свои вопросы и ответы</p>
            </div>
          </button>

          <button
            onClick={loadDemoDeck}
            className="w-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-2xl p-5 flex items-center gap-4 shadow-lg active:scale-[0.98] transition-transform"
          >
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Globe className="w-7 h-7" />
            </div>
            <div className="text-left flex-1">
              <h2 className="text-lg font-bold">🌍 Мировые столицы</h2>
              <p className="text-white/80 text-xs mt-1">15 карточек со столицами стран</p>
            </div>
          </button>

          {decks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Мои колоды</h3>
              {decks.map(deck => (
                <div key={deck.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-purple-700 truncate">{deck.title}</h4>
                      {deck.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{deck.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{deck.cards.length} карточек</p>
                    </div>
                    <button
                      onClick={() => handleDeleteDeck(deck.id)}
                      className="text-red-500 hover:bg-red-50 rounded-lg p-1.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onStudy(deck.id)}
                      className="bg-purple-600 text-white font-semibold rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-sm active:scale-95 transition-transform"
                    >
                      <BookOpen className="w-4 h-4" /> Изучать
                    </button>
                    <button
                      onClick={() => onQuiz(deck.id)}
                      className="bg-amber-500 text-white font-semibold rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-sm active:scale-95 transition-transform"
                    >
                      <Brain className="w-4 h-4" /> Тест
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Сценарии использования */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-amber-200">
            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Сценарии использования
            </h3>
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-3">
                <div className="flex items-start gap-2 mb-1">
                  <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <h4 className="text-sm font-semibold text-amber-900">Пятиминутная разминка</h4>
                </div>
                <p className="text-xs text-gray-600">
                  Запустите режим Quiz на 5-7 минут в начале урока. 5-10 вопросов по прошлой теме мгновенно настроят мозг класса на рабочий лад.
                </p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <div className="flex items-start gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <h4 className="text-sm font-semibold text-amber-900">Подготовка к экзаменам</h4>
                </div>
                <p className="text-xs text-gray-600">
                  Соберите колоды с ключевыми формулами, датами или терминами. Отправьте ссылку ученикам для повторения в дороге или дома.
                </p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <div className="flex items-start gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <h4 className="text-sm font-semibold text-amber-900">Изучение иностранных слов</h4>
                </div>
                <p className="text-xs text-gray-600">
                  Классика, которая работает безотказно. Ученик видит слово, пытается вспомнить перевод и получает мгновенную обратную связь.
                </p>
              </div>
            </div>
          </div>

          {/* Как это работает */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Как это работает
            </h3>
            <div className="space-y-2 text-xs text-gray-700">
              <p><strong>Режим изучения (Study)</strong> — листайте карточки в удобном темпе, пытайтесь вспомнить ответ и проверяйте себя переворотом карточки.</p>
              <p><strong>Режим тестирования (Quiz)</strong> — система сама задаёт вопросы, вы выбираете ответ из вариантов. Идеально для быстрой проверки знаний!</p>
            </div>
          </div>

          <YandexAdBlock />
        </main>
      </div>
    );
  }

  // ЭКРАН СОЗДАНИЯ КОЛОДЫ
  if (screen === 'create') {
    return (
      <div className="min-h-[100dvh] notebook-bg flex flex-col">
        <header className="bg-purple-700 shadow-md sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
            <div className="shrink-0">
              <BackButton onClick={() => setScreen('list')} variant="light" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white truncate">Создать колоду</h1>
              <p className="text-xs text-purple-200">{cards.length} карточек</p>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 space-y-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <div>
              <label className="block text-sm font-semibold text-purple-700 mb-1">Название колоды</label>
              <input
                type="text"
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
                placeholder="Например: Столицы Европы"
                className="w-full px-3 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-purple-700 mb-1">Описание</label>
              <input
                type="text"
                value={deckDescription}
                onChange={(e) => setDeckDescription(e.target.value)}
                placeholder="Краткое описание колоды"
                className="w-full px-3 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-purple-700">Добавить карточку</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Вопрос</label>
              <input
                type="text"
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                placeholder="Например: Столица Франции"
                className="w-full px-3 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ответ</label>
              <input
                type="text"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Например: Париж"
                className="w-full px-3 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddCard}
              disabled={!currentQuestion.trim() || !currentAnswer.trim()}
              className="w-full bg-purple-600 text-white font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
            >
              <Plus className="w-5 h-5" /> Добавить карточку
            </button>
          </div>

          {cards.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-600">Карточки в колоде ({cards.length})</h3>
              {cards.map((card, index) => (
                <div key={index} className="bg-white rounded-xl p-3 shadow-sm flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-purple-700">{card.question}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{card.answer}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCard(index)}
                    className="text-red-500 hover:bg-red-50 rounded-lg p-1.5 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {cards.length > 0 && (
            <button
              onClick={handleCreateDeck}
              disabled={!deckTitle.trim()}
              className="w-full bg-gradient-to-br from-green-500 to-emerald-600 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
            >
              <Layers className="w-5 h-5" /> Сохранить колоду
            </button>
          )}
        </main>
      </div>
    );
  }

  return null;
}
