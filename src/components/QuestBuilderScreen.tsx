import { Map, ArrowLeft, FlaskConical } from 'lucide-react';
import BackButton from './BackButton';
import YandexAdBlock from './YandexAdBlock';

export default function QuestBuilderScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
      <header className="bg-gradient-to-br from-gray-600 to-gray-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <div className="shrink-0">
            <BackButton onClick={onBack} variant="light" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h1 className="text-lg font-bold text-white leading-tight truncate">Конструктор квестов</h1>
            <p className="text-xs text-gray-300 leading-tight">Экспериментальная функция</p>
          </div>
          <div className="shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <Map className="w-5 h-5 text-white" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-10 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center mb-6 shadow-lg">
          <FlaskConical className="w-12 h-12 text-white" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-700 mb-3">
          Конструктор квестов
        </h2>
        
        <p className="text-gray-600 mb-6 max-w-xs">
          Раздел находится в активной разработке. Скоро здесь появится возможность создавать образовательные квесты с QR-кодами для ваших уроков!
        </p>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 max-w-xs w-full mb-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🚧</div>
            <div className="text-left">
              <p className="text-sm text-amber-800 font-semibold mb-1">В разработке</p>
              <p className="text-xs text-amber-700">
                Функция будет доступна в ближайшем обновлении. Следите за новостями в нашем сообществе!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-2xl p-5 max-w-xs w-full">
          <p className="text-xs text-gray-600 mb-2">Что будет доступно:</p>
          <ul className="text-xs text-gray-700 text-left space-y-1.5">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Создание квестов по предметам</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Генерация QR-кодов для команд</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Отслеживание прогресса</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Библиотека готовых заданий</span>
            </li>
          </ul>
        </div>
      </main>

      <YandexAdBlock />
    </div>
  );
}
