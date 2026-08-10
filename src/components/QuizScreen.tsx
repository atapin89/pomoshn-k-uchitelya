import { useState, useEffect } from 'react';
import { Check, X, ArrowRight } from 'lucide-react';
import type { Deck } from '@/types';
import { loadDecks } from '@/lib/storage';
import { triggerHaptic } from '@/lib/haptic';
import BackButton from './BackButton';

interface QuizScreenProps {
  deckId: string;
  onBack: () => void;
}

type QuizType = 'choice' | 'text';

export default function QuizScreen({ deckId, onBack }: QuizScreenProps) {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [quizType, setQuizType] = useState<QuizType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Array<{ question: string; correct: string; options: string[] }>>([]);

  useEffect(() => {
    const allDecks = loadDecks();
    const foundDeck = allDecks.find((d) => d.id === deckId);
    if (foundDeck && foundDeck.cards.length >= 2) {
      setDeck(foundDeck);
    }
  }, [deckId]);

  const generateQuiz = (type: QuizType) => {
    if (!deck) return;
    setQuizType(type);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setTextAnswer('');
    setShowResult(false);

    const questions = deck.cards.slice(0, 10).map((card) => {
      const correct = card.sides[1] || '';
      const wrongOptions = deck.cards
        .filter((c) => c.id !== card.id)
        .map((c) => c.sides[1] || '')
        .filter((s) => s.trim() !== '')
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [...wrongOptions, correct].sort(() => Math.random() - 0.5);
      return { question: card.sides[0] || '', correct, options };
    });

    setQuizQuestions(questions);
  };

  const handleChoiceAnswer = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    const isCorrect = answer === quizQuestions[currentQuestion].correct;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      triggerHaptic('heavy');
    } else {
      triggerHaptic('medium');
    }
    setShowResult(true);
  };

  const handleTextSubmit = () => {
    if (!textAnswer.trim()) return;
    const isCorrect = textAnswer.toLowerCase().trim().includes(quizQuestions[currentQuestion].correct.toLowerCase().trim());
    if (isCorrect) {
      setScore((prev) => prev + 1);
      triggerHaptic('heavy');
    } else {
      triggerHaptic('medium');
    }
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setTextAnswer('');
      setShowResult(false);
    } else {
      // Тест завершен
      onBack();
    }
  };

  if (!deck) {
    return (
      <div className="min-h-[100dvh] bg-purple-50 flex flex-col items-center justify-center p-6">
        <p className="text-purple-700 text-lg font-semibold mb-4">Колода не найдена</p>
        <button onClick={onBack} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold">
          Назад
        </button>
      </div>
    );
  }

  // Выбор типа теста
  if (!quizType) {
    return (
      <div className="min-h-[100dvh] bg-purple-50 flex flex-col">
        <header className="bg-purple-700 shadow-md sticky top-0 z-10">
          <div className="max-w-md mx-auto px-5 py-4">
            <BackButton onClick={onBack} variant="light" />
            <h1 className="text-xl font-bold text-white mt-3">Выбери тип теста</h1>
          </div>
        </header>
        <main className="flex-1 max-w-md mx-auto w-full px-5 py-6 flex flex-col gap-4">
          <button
            onClick={() => generateQuiz('choice')}
            className="w-full bg-white border-2 border-purple-200 rounded-2xl p-6 text-left active:scale-95 transition-transform"
          >
            <h3 className="text-lg font-bold text-purple-700 mb-2">Выбор ответа</h3>
            <p className="text-sm text-gray-600">Классический тест с 4 вариантами ответа</p>
          </button>
          <button
            onClick={() => generateQuiz('text')}
            className="w-full bg-white border-2 border-purple-200 rounded-2xl p-6 text-left active:scale-95 transition-transform"
          >
            <h3 className="text-lg font-bold text-purple-700 mb-2">Ввод текста</h3>
            <p className="text-sm text-gray-600">Введите ответ с клавиатуры</p>
          </button>
        </main>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];

  return (
    <div className="min-h-[100dvh] bg-purple-50 flex flex-col">
      <header className="bg-purple-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-5 py-4">
          <BackButton onClick={onBack} variant="light" />
          <div className="flex items-center justify-between mt-3">
            <h1 className="text-xl font-bold text-white">{deck.title}</h1>
            <span className="text-white/80 text-sm">
              {currentQuestion + 1} / {quizQuestions.length}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-6 flex flex-col gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Вопрос:</p>
          <p className="text-xl font-bold text-purple-900">{question.question}</p>
        </div>

        {quizType === 'choice' && (
          <div className="space-y-3">
            {question.options.map((option, idx) => {
              let bgClass = 'bg-white border-2 border-purple-200';
              if (showResult) {
                if (option === question.correct) {
                  bgClass = 'bg-green-100 border-2 border-green-500';
                } else if (option === selectedAnswer && option !== question.correct) {
                  bgClass = 'bg-red-100 border-2 border-red-500';
                }
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleChoiceAnswer(option)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl text-left font-semibold transition-all ${bgClass} ${!showResult ? 'active:scale-95' : ''}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        )}

        {quizType === 'text' && (
          <div className="space-y-4">
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !showResult && handleTextSubmit()}
              placeholder="Введите ответ..."
              disabled={showResult}
              className="w-full p-4 rounded-xl border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
            />
            {!showResult && (
              <button
                onClick={handleTextSubmit}
                className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg"
              >
                Проверить
              </button>
            )}
            {showResult && (
              <div className={`p-4 rounded-xl ${textAnswer.toLowerCase().trim().includes(question.correct.toLowerCase().trim()) ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'}`}>
                <p className="font-bold mb-1">
                  {textAnswer.toLowerCase().trim().includes(question.correct.toLowerCase().trim()) ? '✓ Правильно!' : ' Неправильно'}
                </p>
                <p className="text-sm">Правильный ответ: {question.correct}</p>
              </div>
            )}
          </div>
        )}

        {showResult && (
          <button
            onClick={nextQuestion}
            className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            Далее <ArrowRight size={20} />
          </button>
        )}
      </main>
    </div>
  );
}
