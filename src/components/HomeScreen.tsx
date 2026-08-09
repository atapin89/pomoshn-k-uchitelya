import { Clock, Dices, Volume2, Layers } from 'lucide-react';
import YandexAdBlock from './YandexAdBlock';

interface HomeScreenProps {
  onNavigate: (route: 'timer' | 'generator' | 'noise' | 'flashcards') => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
      <header className="max-w-md mx-auto w-full px-5 pt-12 pb-6 text-center">
        <h1 className="text-4xl font-extrabold text-purple-700">Помощник учителя</h1>
        <p className="text-gray-500 mt-2">Выберите инструмент для урока</p>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 flex flex-col gap-5">
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
      </main>

      <YandexAdBlock />
    </div>
  );
}
