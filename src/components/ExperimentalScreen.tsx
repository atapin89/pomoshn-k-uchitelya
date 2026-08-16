import { FlaskConical, ArrowLeft, Tv, Map, Rocket } from 'lucide-react';
import BackButton from './BackButton';
import YandexAdBlock from './YandexAdBlock';

interface ExperimentalScreenProps {
  onBack: () => void;
  onNavigate: (route: 'svoia_igra' | 'quests') => void;
}

export default function ExperimentalScreen({ onBack, onNavigate }: ExperimentalScreenProps) {
  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
      <header className="bg-gradient-to-br from-gray-600 to-gray-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <div className="shrink-0">
            <BackButton onClick={onBack} variant="light" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h1 className="text-lg font-bold text-white leading-tight truncate">Экспериментальные функции</h1>
            <p className="text-xs text-gray-300 leading-tight">Новые инструменты в разработке</p>
          </div>
          <div className="shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
          <div className="text-xl">🧪</div>
          <div>
            <p className="text-sm text-amber-800 font-semibold mb-1">Бета-версии</p>
            <p className="text-xs text-amber-700">
              Эти функции находятся в тестировании. Возможны изменения в интерфейсе.
            </p>
          </div>
        </div>

        {/* Кнопка Своя игра */}
        <button
          onClick={() => onNavigate('svoia_igra')}
          className="w-full bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl p-4 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-all touch-manipulation"
        >
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <div className="text-left flex-1">
            <h3 className="text-sm font-bold leading-tight">Своя игра</h3>
            <p className="text-white/70 text-xs mt-0.5">Интерактивная игра для класса</p>
          </div>
          <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">NEW</span>
        </button>

        {/* Кнопка Конструктор квестов (если нужен) */}
        <button
          onClick={() => onNavigate('quests')}
          className="w-full bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl p-4 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-all touch-manipulation"
        >
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <Map className="w-5 h-5 text-white" />
          </div>
          <div className="text-left flex-1">
            <h3 className="text-sm font-bold leading-tight">Конструктор квестов</h3>
            <p className="text-white/70 text-xs mt-0.5">Образовательные квесты с QR-кодами</p>
          </div>
          <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded-full">BETA</span>
        </button>

        <div className="bg-gray-100 rounded-xl p-4 border-2 border-dashed border-gray-300">
          <div className="flex items-center gap-3">
            <Rocket className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Скоро появятся</p>
              <p className="text-xs text-gray-500 mt-1">
                Следите за обновлениями в нашем сообществе
              </p>
            </div>
          </div>
        </div>

        <YandexAdBlock />
      </main>
    </div>
  );
}
