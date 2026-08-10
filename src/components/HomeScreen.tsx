import { useState } from 'react';
import { Clock, Dices, Volume2, Layers, HelpCircle, Grid3x3 } from 'lucide-react';
import YandexAdBlock from './YandexAdBlock';
import { HelpModal } from './HelpModal';
import { helpTexts } from '@/data/helpTexts';

interface HomeScreenProps {
  onNavigate: (route: 'timer' | 'generator' | 'noise' | 'flashcards' | 'wordsearch') => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [activeHelpModal, setActiveHelpModal] = useState<string | null>(null);

  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
      <header className="max-w-md mx-auto w-full px-5 pt-12 pb-6 text-center">
        <h1 className="text-4xl font-extrabold text-purple-700">Помощник учителя</h1>
        <p className="text-gray-500 mt-2">Выберите инструмент для урока</p>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 flex flex-col gap-5">
        {/* Таймер урока */}
        <div className="relative">
          <button
            onClick={() => onNavigate('timer')}
            className="w-full bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-3xl p-6 min-h-[120px] flex items-center gap-5 shadow-lg active:scale-[0.98] transition-transform touch-manipulation"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold">Таймер урока</h2>
              <p className="text-white/80 text-sm mt-1">Шаблоны и этапы занятия</p>
            </div>
          </button>
          <button
            onClick={() => setActiveHelpModal('timer')}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-all duration-200"
            aria-label="Помощь"
          >
            <HelpCircle className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Генератор случайностей */}
        <div className="relative">
          <button
            onClick={() => onNavigate('generator')}
            className="w-full bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-3xl p-6 min-h-[120px] flex items-center gap-5 shadow-lg active:scale-[0.98] transition-transform touch-manipulation"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Dices className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold">Генератор случайностей</h2>
              <p className="text-white/80 text-sm mt-1">Ученики, группы, рассадка</p>
            </div>
          </button>
          <button
            onClick={() => setActiveHelpModal('generator')}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-all duration-200"
            aria-label="Помощь"
          >
            <HelpCircle className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Контроль шума */}
        <div className="relative">
          <button
            onClick={() => onNavigate('noise')}
            className="w-full bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-3xl p-6 min-h-[120px] flex items-center gap-5 shadow-lg active:scale-[0.98] transition-transform touch-manipulation"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Volume2 className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold">Контроль шума</h2>
              <p className="text-white/80 text-sm mt-1">Шумометр для класса</p>
            </div>
          </button>
          <button
            onClick={() => setActiveHelpModal('noise')}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-all duration-200"
            aria-label="Помощь"
          >
            <HelpCircle className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Флэш-карточки */}
        <div className="relative">
          <button
            onClick={() => onNavigate('flashcards')}
            className="w-full bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-3xl p-6 min-h-[120px] flex items-center gap-5 shadow-lg active:scale-[0.98] transition-transform touch-manipulation"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold">Флэш-карточки</h2>
              <p className="text-white/80 text-sm mt-1">Колоды и изучение карточек</p>
            </div>
          </button>
          <button
            onClick={() => setActiveHelpModal('flashcards')}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-all duration-200"
            aria-label="Помощь"
          >
            <HelpCircle className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Генератор филвордов */}
        <div className="relative">
          <button
            onClick={() => onNavigate('wordsearch')}
            className="w-full bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-3xl p-6 min-h-[120px] flex items-center gap-5 shadow-lg active:scale-[0.98] transition-transform touch-manipulation"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Grid3x3 className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold">Генератор филвордов</h2>
              <p className="text-white/80 text-sm mt-1">Поиск слов с ответами</p>
            </div>
          </button>
          <button
            onClick={() => setActiveHelpModal('wordsearch')}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-all duration-200"
            aria-label="Помощь"
          >
            <HelpCircle className="w-5 h-5 text-white" />
          </button>
        </div>
      </main>

      <YandexAdBlock />

      <HelpModal
        isOpen={activeHelpModal !== null}
        onClose={() => setActiveHelpModal(null)}
        title={activeHelpModal ? helpTexts[activeHelpModal as keyof typeof helpTexts]?.title || 'Помощь' : ''}
        content={activeHelpModal ? helpTexts[activeHelpModal as keyof typeof helpTexts]?.content || 'Описание скоро появится' : ''}
      />
    </div>
  );
}
