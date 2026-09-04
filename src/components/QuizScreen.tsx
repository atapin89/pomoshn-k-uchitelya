import { useState, useEffect } from 'react';
import { Brain, Check, X, Trophy, RotateCcw } from 'lucide-react';
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

export default function QuizScreen({ deckId, onBack }: { deckId: string; onBack: () => void }) {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const decks = loadDecks();
    const foundDeck = decks.find(d => d.id === deckId);
    if (foundDeck) {
      setDeck(foundDeck);
      generateOptions(foundDeck.cards[0], foundDeck.cards);
    }
  }, [deckId]);

  const generateOptions = (currentCard: Flashcard, allCards: Flashcard[]) => {
    const correctAnswer = currentCard.answer;
    const wrongAnswers = allCards
      .filter(card => card.answer !== correctAnswer)
      .map(card => card.answer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const allOptions = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
  };

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
  const progress = ((currentIndex + 1) / deck.cards.length) * 100;

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === currentCard.answer) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (currentIndex < deck.cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        generateOptions(deck.cards[currentIndex + 1], deck.cards);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    generateOptions(deck.cards[0], deck.cards);
  };

  if (showResult) {
    const percentage = Math.round((score / deck.cards.length) * 100);
    let message = '';
    let color = '';
    
    if (percentage >= 90) {
      message = 'Отлично! 🎉';
      color = 'text-green-600';
    } else if (percentage >= 70) {
      message = 'Хороший результат! 👍';
      color = 'text-blue-600';
    } else if (percentage >= 50) {
      message = 'Неплохо, но можно лучше 💪';
      color = 'text-amber-600';
    } else {
      message = 'Стоит повторить материал 📚';
      color = 'text-red-600';
    }

    return (
      <div className="min-h-[100dvh] notebook-bg flex flex-col">
        <header className="bg-purple-700 shadow-md sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
            <div className="shrink-0">
              <BackButton onClick={onBack} variant="light" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white truncate">Результат</h1>
            </div>
            <div className="shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 flex flex-col items-center justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-xl w-full text-center">
            <Trophy className={`w-20 h-20 mx-auto mb-4 ${color}`} />
            <h2 className={`text-2xl font-bold mb-2 ${color}`}>{message}</h2>
            <p className="text-gray-600 mb-6">
              Правильных ответов: <strong>{score} из {deck.cards.length}</strong>
            </p>
            <div className="text-5xl font-bold text-purple-600 mb-8">
              {percentage}%
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRestart}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-5 h-5" /> Пройти ещё раз
              </button>
              <button
                onClick={onBack}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl py-3 transition-colors"
              >
                Назад
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
              Вопрос {currentIndex + 1} из {deck.cards.length} · Счёт: {score}
            </p>
          </div>
          <div className="shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-5">
        {/* Прогресс-бар */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Вопрос */}
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl p-6 mb-6 shadow-xl">
          <p className="text-white/80 text-sm mb-2">Вопрос</p>
          <p className="text-xl font-bold text-white leading-relaxed">
            {currentCard.question}
          </p>
        </div>

        {/* Варианты ответов */}
        <div className="space-y-3">
          {options.map((option, idx) => {
            let buttonClass = 'bg-white hover:bg-gray-50 border-2 border-gray-200';
            
            if (selectedAnswer) {
              if (option === currentCard.answer) {
                buttonClass = 'bg-green-100 border-2 border-green-500';
              } else if (option === selectedAnswer) {
                buttonClass = 'bg-red-100 border-2 border-red-500';
              } else {
                buttonClass = 'bg-gray-100 border-2 border-gray-200 opacity-50';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => !selectedAnswer && handleAnswer(option)}
                disabled={!!selectedAnswer}
                className={`w-full p-4 rounded-xl text-left font-semibold transition-all ${buttonClass} ${
                  selectedAnswer ? 'cursor-default' : 'cursor-pointer active:scale-95'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-800">{option}</span>
                  {selectedAnswer && option === currentCard.answer && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                  {selectedAnswer && option === selectedAnswer && option !== currentCard.answer && (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
