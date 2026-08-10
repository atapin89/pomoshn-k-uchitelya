import { useState } from 'react';
import { Download, RefreshCw, Check, AlertTriangle, Grid3x3, FileText } from 'lucide-react';
import { generateBatch } from '@/lib/wordSearchGenerator';
import type { WordSearchResult, WordSearchConfig } from '@/types';
import { triggerHaptic } from '@/lib/haptic';
import BackButton from './BackButton';
import YandexAdBlock from './YandexAdBlock';
import { jsPDF } from 'jspdf';

// Универсальная функция для рисования филворда на Canvas (для PNG и PDF)
const generateCanvas = (
  result: WordSearchResult,
  showAnswers: boolean,
  showWords: boolean,
  variantNum: number,
  isMiniature: boolean = false
) => {
  const gridSize = result.gridSize;
  const cellSize = isMiniature ? (gridSize >= 20 ? 18 : gridSize === 15 ? 22 : 26) : (gridSize >= 20 ? 28 : gridSize === 15 ? 32 : 36);
  const fontSize = isMiniature ? (gridSize >= 20 ? 10 : gridSize === 15 ? 12 : 14) : (gridSize >= 20 ? 14 : gridSize === 15 ? 16 : 18);
  const gap = isMiniature ? 1 : 2;
  const padding = isMiniature ? 20 : 40;
  
  const gridWidth = gridSize * cellSize + (gridSize - 1) * gap;
  const gridHeight = gridWidth;
  const wordListHeight = showWords ? (isMiniature ? 50 : 80) : 0;
  
  const totalWidth = Math.max(gridWidth + padding * 2, isMiniature ? 400 : 600);
  const totalHeight = padding * 2 + (isMiniature ? 30 : 40) + gridHeight + (showWords ? 40 + wordListHeight : 20);
  
  const canvas = document.createElement('canvas');
  const scale = 2; // Для высокого разрешения (Retina)
  canvas.width = totalWidth * scale;
  canvas.height = totalHeight * scale;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  
  ctx.scale(scale, scale);
  
  // 1. Белый фон
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, totalWidth, totalHeight);
  
  // 2. Заголовок
  ctx.fillStyle = '#1f2937';
  ctx.font = `bold ${isMiniature ? 16 : 24}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Вариант ${variantNum}`, totalWidth / 2, padding + (isMiniature ? 10 : 12));
  
  const startX = (totalWidth - gridWidth) / 2;
  const startY = padding + (isMiniature ? 30 : 40);
  
  // 3. Сетка
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const x = startX + c * (cellSize + gap);
      const y = startY + r * (cellSize + gap);
      const letter = result.grid[r][c];
      const isAnswer = showAnswers && result.placedWords.some(pw => 
        pw.cells.some(cell => cell.row === r && cell.col === c)
      );
      
      ctx.fillStyle = isAnswer ? '#fde047' : '#f9fafb';
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(x, y, cellSize, cellSize, isMiniature ? 3 : 6);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
      
      ctx.fillStyle = isAnswer ? '#854d0e' : '#1f2937';
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, x + cellSize / 2, y + cellSize / 2 + 1);
    }
  }
  
  // 4. Список слов (если включен)
  if (showWords) {
    const dividerY = startY + gridHeight + (isMiniature ? 20 : 30);
    ctx.beginPath();
    ctx.moveTo(padding, dividerY);
    ctx.lineTo(totalWidth - padding, dividerY);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = isMiniature ? 1 : 2;
    ctx.setLineDash([isMiniature ? 4 : 6, isMiniature ? 3 : 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#4b5563';
    ctx.font = `bold ${isMiniature ? 12 : 16}px Arial, sans-serif`;
    ctx.fillText('Список слов:', totalWidth / 2, dividerY + (isMiniature ? 12 : 20));
    
    ctx.font = `${isMiniature ? 10 : 14}px Arial, sans-serif`;
    let currentX = padding;
    let currentY = dividerY + (isMiniature ? 35 : 50);
    const rowHeight = isMiniature ? 20 : 32;
    
    result.placedWords.forEach((pw) => {
      const textWidth = ctx.measureText(pw.word).width + (isMiniature ? 16 : 24);
      if (currentX + textWidth > totalWidth - padding && currentX > padding) {
        currentX = padding;
        currentY += rowHeight;
      }
      ctx.fillStyle = '#f3e8ff';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(currentX, currentY - (isMiniature ? 10 : 14), textWidth, isMiniature ? 20 : 28, isMiniature ? 4 : 6);
        ctx.fill();
      } else {
        ctx.fillRect(currentX, currentY - (isMiniature ? 10 : 14), textWidth, isMiniature ? 20 : 28);
      }
      ctx.fillStyle = '#6b21a8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pw.word, currentX + textWidth / 2, currentY);
      currentX += textWidth + (isMiniature ? 6 : 8);
    });
  }
  
  return canvas;
};

export default function WordSearchScreen({ onBack }: { onBack: () => void }) {
  const [wordsInput, setWordsInput] = useState('МАТЕМАТИКА\nУЧИТЕЛЬ\nШКОЛА\nУРОК\nЗНАНИЯ');
  const [config, setConfig] = useState<WordSearchConfig>({ gridSize: 10, difficulty: 'medium' });
  const [results, setResults] = useState<WordSearchResult[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showWordList, setShowWordList] = useState(true); // Новая настройка
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchCount, setBatchCount] = useState(1);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

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

  const downloadAsImage = (result: WordSearchResult, index: number) => {
    triggerHaptic('light');
    const canvas = generateCanvas(result, showAnswers, showWordList, index + 1, false);
    const link = document.createElement('a');
    link.download = `филворд_вариант_${index + 1}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadAsPDF = async () => {
    if (results.length === 0) return;
    setIsExportingPDF(true);
    triggerHaptic('medium');
    
    // Небольшая задержка для обновления UI
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm (A4)
    const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm (A4)
    
    // 1. Генерируем основные варианты для учеников
    for (let i = 0; i < results.length; i++) {
      if (i > 0) doc.addPage();
      
      const canvas = generateCanvas(results[i], false, showWordList, i + 1, false);
      const imgData = canvas.toDataURL('image/png');
      
      // Масштабируем под ширину A4 с отступами 10 мм
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    }
    
    // 2. Добавляем страницу с ответами для педагога
    doc.addPage();
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 50, 150); // Фиолетовый оттенок
    doc.text("ОТВЕТЫ ДЛЯ ПЕДАГОГА", pageWidth / 2, 15, { align: "center" });
    
    let yPos = 25;
    
    for (let i = 0; i < results.length; i++) {
      // Генерируем миниатюру с подсвеченными ответами (без списка слов для экономии места)
      const miniCanvas = generateCanvas(results[i], true, false, i + 1, true);
      const miniImgData = miniCanvas.toDataURL('image/png');
      
      const miniWidth = pageWidth - 20;
      const miniHeight = (miniCanvas.height * miniWidth) / miniCanvas.width;
      
      // Проверяем, помещается ли миниатюра на текущую страницу
      if (yPos + miniHeight > pageHeight - 15) {
        doc.addPage();
        yPos = 15;
      }
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 41, 55);
      doc.text(`Вариант ${i + 1}`, 10, yPos);
      yPos += 6;
      
      doc.addImage(miniImgData, 'PNG', 10, yPos, miniWidth, miniHeight);
      yPos += miniHeight + 15;
    }
    
    doc.save('филворды_с_ответами.pdf');
    setIsExportingPDF(false);
    triggerHaptic('heavy');
  };

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

        {results.length > 0 && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setShowAnswers(!showAnswers); triggerHaptic('light'); }}
              className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
                showAnswers ? 'bg-green-100 text-green-700 border-2 border-green-300' : 'bg-white text-gray-600 border-2 border-gray-200'
              }`}
            >
              <Check className="w-5 h-5" />
              {showAnswers ? 'Скрыть ответы на сетке' : 'Показать ответы на сетке (ключ)'}
            </button>
            
            <button
              onClick={() => { setShowWordList(!showWordList); triggerHaptic('light'); }}
              className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
                showWordList ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' : 'bg-white text-gray-600 border-2 border-gray-200'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
              {showWordList ? 'Скрыть список слов' : 'Показать список слов'}
            </button>

            <button
              onClick={downloadAsPDF}
              disabled={isExportingPDF}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 shadow-md"
            >
              <FileText className="w-5 h-5" />
              {isExportingPDF ? 'Создание PDF...' : `Скачать все (${results.length} шт.) в PDF`}
            </button>
          </div>
        )}

        <div className="space-y-6 pb-8">
          {results.map((result, index) => {
            const { width, fontSize, cellSize } = getGridStyles(result.gridSize);
            
            return (
              <div key={result.id} className="bg-white rounded-2xl shadow-md p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-purple-700">Вариант #{index + 1}</h3>
                  <button
                    onClick={() => downloadAsImage(result, index)}
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

                <div className="p-4 bg-white rounded-xl border border-gray-100">
                  <h4 className="text-center font-bold text-lg mb-4 text-gray-800">Найди слова:</h4>
                  
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
                              className={`flex items-center justify-center font-bold rounded border ${fontSize} ${
                                isAnswer 
                                  ? 'bg-yellow-200 border-yellow-400 text-yellow-900' 
                                  : 'bg-gray-50 border-gray-200 text-gray-800'
                              }`}
                              style={{ 
                                width: cellSize, 
                                height: cellSize,
                              }}
                            >
                              {letter}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {showWordList && (
                    <div className="border-t-2 border-dashed border-gray-300 pt-4 mt-4">
                      <p className="text-center font-semibold text-gray-700 mb-3">Список слов:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {result.placedWords.map((pw, i) => (
                          <span key={i} className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-md text-sm font-medium">
                            {pw.word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
