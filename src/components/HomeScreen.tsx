import { useState } from 'react';
import { Clock, Dices, Volume2, Layers, HelpCircle, Grid3x3, BookOpen, Calculator, FlaskConical, ArrowRight, Ticket } from 'lucide-react';
import YandexAdBlock from './YandexAdBlock';
import { HelpModal } from './HelpModal';
import { helpTexts } from '@/data/helpTexts';

interface HomeScreenProps {
  onNavigate: (route: 'timer' | 'generator' | 'noise' | 'flashcards' | 'wordsearch' | 'manual' | 'calculators' | 'bingo') => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [activeHelpModal, setActiveHelpModal] = useState<string | null>(null);
  const [showExperimental, setShowExperimental] = useState(false);

  // Данные для сетки разделов
  const sections = [
    {
      id: 'timer',
      title: 'Таймер урока',
      description: 'Шаблоны и этапы',
      icon: Clock,
    },
    {
      id: 'generator',
      title: 'Жеребьёвка',
      description: 'Случайный выбор',
      icon: Dices,
    },
    {
      id: 'noise',
      title: 'Контроль шума',
      description: 'Шумометр',
      icon: Volume2,
    },
    {
      id: 'flashcards',
      title: 'Флэш-карточки',
      description: 'Колоды и изучение',
      icon: Layers,
    },
    {
      id: 'wordsearch',
      title: 'Филворды',
      description: 'Поиск слов',
      icon: Grid3x3,
    },
    {
      id: 'calculators',
      title: 'Калькуляторы',
      description: 'Баллы, СОУ, тесты',
      icon: Calculator,
    },
  ];

  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
      {/* Минимальный отступ сверху */}
      <header className="max-w-md mx-auto w-full px-5 pt-3 pb-4">
        {/* Верхняя строка: иконка руководства слева, подпись автора справа */}
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => onNavigate('manual')}
            className="text-gray-400 hover:text-purple-600 transition-colors p-1"
            aria-label="Руководство по использованию"
          >
            <BookOpen className="w-5 h-5" />
          </button>
          
          <p className="text-sm text-gray-500">
            Проект{' '}
            <a 
              href="https://vk.ru/aaatapin" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-purple-600 hover:text-purple-800 font-semibold underline transition-colors"
            >
              Алексея Атапина
            </a>
          </p>
        </div>
        
        {/* Заголовок в одну строку */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-700 text-center whitespace-nowrap">
          Помощник учителя
        </h1>
        
        {/* Подзаголовок в одну строку */}
        <p className="text-sm sm:text-base text-gray-500 text-center whitespace-nowrap my-1">
          Простые инструменты для сложных задач
        </p>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 pb-5">
        {/* Сетка разделов (2×3) */}
        <div className="grid grid-cols-2 gap-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.id} className="relative">
                <button
                  onClick={() => onNavigate(section.id as any)}
                  className="w-full bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-2xl p-4 min-h-[140px] flex flex-col items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-transform touch-manipulation"
                >
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-base font-bold leading-tight">{section.title}</h2>
                    <p className="text-white/80 text-xs mt-1">{section.description}</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveHelpModal(section.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-all duration-200"
                  aria-label="Помощь"
                >
                  <HelpCircle className="w-4 h-4 text-white" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Раздел "Экспериментальные функции" с приглушенными цветами */}
        <div className="mt-4">
          <button
            onClick={() => setShowExperimental(!showExperimental)}
            className="w-full bg-gradient-to-br from-gray-400 to-gray-500 text-white rounded-2xl p-4 flex items-center justify-between shadow-md active:scale-[0.98] transition-all touch-manipulation"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-base font-bold leading-tight">Экспериментальные функции</h2>
                <p className="text-white/70 text-xs mt-0.5">Новые инструменты в разработке</p>
              </div>
            </div>
            <div className={`transform transition-transform ${showExperimental ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* Скрытый блок с экспериментальными функциями */}
          {showExperimental && (
            <div className="mt-3 bg-gray-100 rounded-2xl p-4 border-2 border-dashed border-gray-300 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-xs text-gray-600 mb-3 font-medium">🧪 Тестируем новые возможности:</p>
              
              {/* Генератор Бинго */}
              <button
                onClick={() => onNavigate('bingo')}
                className="w-full bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl p-4 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-all touch-manipulation"
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Ticket className="w-5 h-5 text-white" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-sm font-bold leading-tight">Генератор Бинго</h3>
                  <p className="text-white/70 text-xs mt-0.5">Карточки для игры с PDF</p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/60" />
              </button>

              <div className="mt-3 flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <p className="text-xs text-gray-600">
                  Функция находится в бета-тестировании. Возможны небольшие изменения в интерфейсе.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Ссылка на сообщество */}
        <div className="mt-4 mb-1 text-left">
          <a
            href="https://max.ru/channel_topteach"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-purple-600 font-medium transition-colors underline decoration-dotted underline-offset-4"
          >
            Наше сообщество: вопросы и новости здесь
          </a>
        </div>

        <YandexAdBlock />
      </main>

      <HelpModal
        isOpen={activeHelpModal !== null}
        onClose={() => setActiveHelpModal(null)}
        title={activeHelpModal ? helpTexts[activeHelpModal as keyof typeof helpTexts]?.title || 'Помощь' : ''}
        content={activeHelpModal ? helpTexts[activeHelpModal as keyof typeof helpTexts]?.content || 'Описание скоро появится' : ''}
      />
    </div>
  );
}
