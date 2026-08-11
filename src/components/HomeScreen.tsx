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
      title: 'Генератор',
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
  ];

  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
      <header className="max-w-md mx-auto w-full px-5 pt-12 pb-6 text-center">
        {/* Подпись автора НАД заголовком с минимальным отступом */}
        <p className="text-right text-sm text-gray-500 mb-1">
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
        
        <h1 className="text-4xl font-extrabold text-purple-700">Помощник учителя</h1>
        <p className="text-gray-500 mt-2">Простые инструменты на каждый день</p>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 pb-5">
        {/* Сетка 2×3 */}
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
          
          {/* Пустая ячейка для будущего раздела */}
          <div className="rounded-2xl border-2 border-dashed border-purple-200 min-h-[140px] flex items-center justify-center bg-purple-50/50">
            <p className="text-purple-400 text-sm text-center px-2 font-medium">Новый раздел скоро</p>
          </div>
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
