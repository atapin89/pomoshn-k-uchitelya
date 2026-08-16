import { useState } from 'react';
import { Map } from 'lucide-react';
import BackButton from './BackButton';
import YandexAdBlock from './YandexAdBlock';

export default function QuestBuilderScreen({ onBack }: { onBack: () => void }) {
  const [showComingSoon, setShowComingSoon] = useState(true);

  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
      <header className="bg-purple-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <div className="shrink-0">
            <BackButton onClick={onBack} variant="light" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h1 className="text-lg font-bold text-white leading-tight truncate">Конструктор квестов</h1>
            <p className="text-xs text-purple-200 leading-tight">Скоро появится</p>
          </div>
          <div className="shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <Map className="w-5 h-5 text-white" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-10 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-6">
          <Map className="w-12 h-12 text-purple-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-purple-700 mb-3">
          Конструктор квестов
        </h2>
        
        <p className="text-gray-600 mb-6 max-w-xs">
          Раздел находится в разработке. Скоро здесь появится возможность создавать образовательные квесты для ваших уроков!
        </p>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 max-w-xs">
          <p className="text-sm text-amber-800 font-semibold mb-2">🚧 В разработке</p>
          <p className="text-xs text-amber-700">
            Функция будет доступна в ближайшем обновлении
          </p>
        </div>

        <YandexAdBlock />
      </main>
    </div>
  );
}
