import { FlaskConical } from 'lucide-react';
import BackButton from './BackButton';
import YandexAdBlock from './YandexAdBlock';

interface ExperimentalScreenProps {
  onBack: () => void;
}

export default function ExperimentalScreen({ onBack }: ExperimentalScreenProps) {
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
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <div className="text-2xl">🧪</div>
          <div>
            <p className="text-sm text-amber-800 font-semibold mb-1">Раздел в разработке</p>
            <p className="text-xs text-amber-700">
              Здесь скоро появятся новые экспериментальные функции. Следите за обновлениями!
            </p>
          </div>
        </div>

        <div className="bg-gray-100 rounded-2xl p-8 border-2 border-dashed border-gray-300 text-center">
          <FlaskConical className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">Пока пусто</p>
          <p className="text-xs text-gray-500">
            Новые инструменты появятся здесь в ближайшее время
          </p>
        </div>

        <YandexAdBlock />
      </main>
    </div>
  );
}
