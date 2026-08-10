import { useState } from 'react';
import { Download, RefreshCw, Check, AlertTriangle, Grid3x3 } from 'lucide-react';
import { generateBatch } from '@/lib/wordSearchGenerator';
import type { WordSearchResult, WordSearchConfig } from '@/types';
import { triggerHaptic } from '@/lib/haptic';
import BackButton from './BackButton';
import YandexAdBlock from './YandexAdBlock';
import html2canvas from 'html2canvas';

export default function WordSearchScreen({ onBack }: { onBack: () => void }) {
  const [wordsInput, setWordsInput] = useState('МАТЕМАТИКА\nУЧИТЕЛЬ\nШКОЛА\nУРОК\nЗНАНИЯ');
  const [config, setConfig] = useState<WordSearchConfig>({ gridSize: 10, difficulty: 'medium' });
  const [results, setResults] = useState<WordSearchResult[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchCount, setBatchCount] = useState(1);

  const handleGenerate = async (count: number) => {
    if (!wordsInput.trim()) return;
    setIsGenerating(true);
    triggerHaptic('medium');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newResults = generateBatch(wordsInput, config, count);
    setResults(newResults);
    setShowAnswers(false);
    setIsGenerating(false);
  };

  const downloadAsImage = async (resultId: string, index: number) => {
    const element = document.getElementById(`wordsearch-${result.id}`);
    if (!element) return;
    
    triggerHaptic('light');
    
    // Временно добавляем класс для фиксации размеров при экспорте
    element.classList.add('exporting');
    
    const canvas = await html2canvas(element, { 
      backgroundColor: '#ffffff', 
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    // Убираем класс после экспорта
    element.classList.remove('exporting');
    
    const link = document.createElement('a');
    link.download = `филворд_вариант_${index + 1}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Функция для определения оптимальной ширины сетки и размера шрифта
  const getGridStyles = (size: number) => {
    if (size >= 20) return { width: 'min(100%, 400px)', fontSize: 'text-[10px] sm:text-xs', cellSize: '20px' };
    if (size === 15) return { width: 'min(100%, 360px)', fontSize: 'text-xs sm:text-sm', cellSize: '24px' };
    return { width: 'min(100%, 320px)', fontSize: 'text-sm sm:text-base', cellSize: '32px' };
  };

  return (
    <div className="min-h-[100dvh] bg-purple-50 flex flex-col">
      <header className="bg-purple-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-5 py-4">
          <BackButton onClick={onBack} variant="light" />
          <div className="flex items-center gap-3 mt-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
              <Grid3x3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">Генератор филвордов</h1>
              <p className="text-sm text-white/70">Поиск слов с ответами</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 flex flex-col gap-5 overflow-y-auto">
        {/* Настройки */}
        <section className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div>
            <label className="text-sm font-semibold text-purple-700 block mb-2">Слова (каждое с новой строки)</label>
            <textarea
              value={wordsInput}
              onChange={(e) => setWordsInput(e.target.value)}
              className="w-full h-32 rounded-xl border border-purple-200 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-y"
              placeholder="Введите слова..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-purple-700 block mb-2">Размер сетки</label>
              <select
                value={config.gridSize}
                onChange={(e) => setConfig({ ...config, gridSize: Number(e.target.value) })}
                className="w-full rounded-xl border border-purple-200 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value={10}>10 x 10 (Легко)</option>
                <option value={15}>15 x 15 (Средне)</option>
                <option value={20}>20 x 20 (Сложно)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-purple-700 block mb-2">Сложность</label>
              <select
                value={config.difficulty}
                onChange={(e) => setConfig({ ...config, difficulty: e.target.value as any })}
                className="w-full rounded-xl border border-purple-200 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="easy">Простая (→, ↓)</option>
                <option value="medium">Средняя (+ диагонали)</option>
                <option value="hard">Сложная (+ задом наперед)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleGenerate(1)}
              disabled={isGenerating}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Генерация...' : 'Создать 1 вариант'}
            </button>
          </div>
          
          <div className="flex items-center gap-3 pt-2 border-t border-purple-100">
             <span className="text-sm text-gray-600 shrink-0">Пакетно:</span>
             <input 
                type="range" min="1" max="30" value={batchCount} 
                onChange={(e) => setBatchCount(Number(e.target.value))}
                className="flex-1 accent-purple-600"
             />
             <span className="text-sm font-bold text-purple-700 w-8 text-right">{batchCount} шт.</span>
             <button
              onClick={() => handleGenerate(batchCount)}
              disabled={isGenerating || batchCount === 1}
              className="bg-violet-100 hover:bg-violet-200 text-violet-700 font-semibold rounded-xl px-4 py-2 text-sm active:scale-95 transition-transform disabled:opacity-50"
            >
              Создать
            </button>
          </div>
        </section>

        {/* Переключатель ответов */}
        {results.length > 0 && (
          <button
            onClick={() => { setShowAnswers(!showAnswers); triggerHaptic('light'); }}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
              showAnswers ? 'bg-green-100 text-green-700 border-2 border-green-300' : 'bg-white text-gray-600 border-2 border-gray-200'
            }`}
          >
            <Check className="w-5 h-5" />
            {showAnswers ? 'Скрыть ответы' : 'Показать ответы (ключ)'}
          </button>
        )}

        {/* Результаты */}
        <div className="space-y-6 pb-8">
          {results.map((result, index) => {
            const { width, fontSize, cellSize } = getGridStyles(result.gridSize);
            
            return (
              <div key={result.id} className="bg-white rounded-2xl shadow-md p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-purple-700">Вариант #{index + 1}</h3>
                  <button
                    onClick={() => downloadAsImage(result.id, index)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" /> Скачать PNG
                  </button>
                </div>

                {result.failedWords.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-700">
                      Не поместились: {result.failedWords.join(', ')}. Попробуйте увеличить размер сетки или уменьшить количество слов.
                    </p>
                  </div>
                )}

                {/* Область для скриншота (белый фон для чистой печати) */}
                <div id={`wordsearch-${result.id}`} className="p-4 bg-white rounded-xl border border-gray-100">
                  <h4 className="text-center font-bold text-lg mb-4 text-gray-800">Найди слова:</h4>
                  
                  {/* Сетка с адаптивным размером и горизонтальным скроллом при необходимости */}
                  <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div 
                      className="grid gap-0.5 sm:gap-1 mx-auto select-none"
                      style={{ 
                        gridTemplateColumns: `repeat(${result.gridSize}, 1fr)`,
                        width: width
                      }}
                    >
                      {result.grid.map((row, r) =>
                        row.map((letter, c) => {
                          const isAnswer = showAnswers && result.placedWords.some(pw => 
                            pw.cells.some(cell => cell.row === r && cell.col === c)
                          );
                          
                          return (
                            <div
                              key={`${r}-${c}`}
                              className={`flex items-center justify-center font-bold rounded border ${fontSize} cell-square ${
                                isAnswer 
                                  ? 'bg-yellow-200 border-yellow-400 text-yellow-900' 
                                  : 'bg-gray-50 border-gray-200 text-gray-800'
                              }`}
                              style={{ 
                                width: cellSize, 
                                height: cellSize,
                                textAlign: 'center',
                                lineHeight: cellSize
                              }}
                            >
                              {letter}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Список слов */}
                  <div className="border-t-2 border-dashed border-gray-300 pt-4">
                    <p className="text-center font-semibold text-gray-700 mb-3">Список слов:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {result.placedWords.map((pw, i) => (
                        <span key={i} className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-md text-sm font-medium">
                          {pw.word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <YandexAdBlock />
      </main>
    </div>
  );
}
