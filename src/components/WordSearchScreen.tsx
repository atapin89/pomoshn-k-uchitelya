import { useState } from 'react';
import { Download, RefreshCw, Check, AlertTriangle, Grid3x3, FileText, Share2 } from 'lucide-react';
import { generateBatch } from '@/lib/wordSearchGenerator';
import type { WordSearchResult, WordSearchConfig } from '@/types';
import { triggerHaptic } from '@/lib/haptic';
import BackButton from './BackButton';
import YandexAdBlock from './YandexAdBlock';
import { jsPDF } from 'jspdf';

// Универсальная функция для рисования филворда на Canvas
const generateCanvas = (
  result: WordSearchResult,
  showAnswers: boolean,
  showWords: boolean,
  variantNum: number,
  isMiniature: boolean = false
) => {
  const gridSize = result.gridSize;
  const cellSize = isMiniature ? (gridSize >= 20 ? 16 : gridSize === 15 ? 20 : 24) : (gridSize >= 20 ? 28 : gridSize === 15 ? 32 : 36);
  const fontSize = isMiniature ? (gridSize >= 20 ? 9 : gridSize === 15 ? 11 : 13) : (gridSize >= 20 ? 14 : gridSize === 15 ? 16 : 18);
  const gap = isMiniature ? 1 : 2;
  const padding = isMiniature ? 15 : 40;
  
  const gridWidth = gridSize * cellSize + (gridSize - 1) * gap;
  const gridHeight = gridWidth;
  const wordListHeight = showWords ? (isMiniature ? 40 : 80) : 0;
  
  const totalWidth = Math.max(gridWidth + padding * 2, isMiniature ? 300 : 600);
  const totalHeight = padding * 2 + (isMiniature ? 25 : 40) + gridHeight + (showWords ? 30 + wordListHeight : 20);
  
  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = totalWidth * scale;
  canvas.height = totalHeight * scale;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  
  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, totalWidth, totalHeight);
  
  ctx.fillStyle = '#1f2937';
  ctx.font = `bold ${isMiniature ? 14 : 24}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Вариант ${variantNum}`, totalWidth / 2, padding + (isMiniature ? 8 : 12));
  
  const startX = (totalWidth - gridWidth) / 2;
  const startY = padding + (isMiniature ? 25 : 40);
  
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
  
  if (showAnswers) {
    result.placedWords.forEach(pw => {
      if (pw.cells.length > 1) {
        const first = pw.cells[0];
        const last = pw.cells[pw.cells.length - 1];
        const dr = last.row - first.row;
        const dc = last.col - first.col;
        
        let arrow = '';
        if (dr === 0 && dc === 1) arrow = '→';
        else if (dr === 0 && dc === -1) arrow = '←';
        else if (dr === 1 && dc === 0) arrow = '↓';
        else if (dr === -1 && dc === 0) arrow = '↑';
        else if (dr === 1 && dc === 1) arrow = '↘';
        else if (dr === 1 && dc === -1) arrow = '↙';
        else if (dr === -1 && dc === 1) arrow = '↗';
        else if (dr === -1 && dc === -1) arrow = '↖';

        if (arrow) {
          const x = startX + last.col * (cellSize + gap);
          const y = startY + last.row * (cellSize + gap);
          ctx.fillStyle = '#dc2626';
          const arrowSize = isMiniature ? 14 : 18;
          ctx.font = `900 ${arrowSize}px Arial, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(arrow, x + cellSize * 0.75, y + cellSize * 0.35);
        }
      }
    });
  }
  
  if (showWords) {
    const dividerY = startY + gridHeight + (isMiniature ? 15 : 30);
    ctx.beginPath();
    ctx.moveTo(padding, dividerY);
    ctx.lineTo(totalWidth - padding, dividerY);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = isMiniature ? 1 : 2;
    ctx.setLineDash([isMiniature ? 3 : 6, isMiniature ? 2 : 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#4b5563';
    ctx.font = `bold ${isMiniature ? 11 : 16}px Arial, sans-serif`;
    ctx.fillText('Список слов:', totalWidth / 2, dividerY + (isMiniature ? 10 : 20));
    
    ctx.font = `${isMiniature ? 9 : 14}px Arial, sans-serif`;
    let currentX = padding;
    let currentY = dividerY + (isMiniature ? 28 : 50);
    const rowHeight = isMiniature ? 18 : 32;
    
    result.placedWords.forEach((pw) => {
      const textWidth = ctx.measureText(pw.word).width + (isMiniature ? 12 : 24);
      if (currentX + textWidth > totalWidth - padding && currentX > padding) {
        currentX = padding;
        currentY += rowHeight;
      }
      ctx.fillStyle = '#f3e8ff';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(currentX, currentY - (isMiniature ? 9 : 14), textWidth, isMiniature ? 18 : 28, isMiniature ? 3 : 6);
        ctx.fill();
      } else {
        ctx.fillRect(currentX, currentY - (isMiniature ? 9 : 14), textWidth, isMiniature ? 18 : 28);
      }
      ctx.fillStyle = '#6b21a8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pw.word, currentX + textWidth / 2, currentY);
      currentX += textWidth + (isMiniature ? 5 : 8);
    });
  }
  
  return canvas;
};

// Функция для скачивания файла через MAX Bridge
const downloadFileViaMax = async (blob: Blob, filename: string): Promise<boolean> => {
  // Проверяем наличие MAX Bridge
  if (typeof window !== 'undefined' && (window as any).WebApp?.downloadFile) {
    try {
      const url = URL.createObjectURL(blob);
      await (window as any).WebApp.downloadFile(url, filename);
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('MAX downloadFile failed:', err);
      return false;
    }
  }
  return false;
};

// Функция для скачивания/шаринга PNG
const shareOrDownloadPNG = async (blob: Blob, filename: string): Promise<boolean> => {
  // 1. Попытка использовать MAX Bridge
  const maxSuccess = await downloadFileViaMax(blob, filename);
  if (maxSuccess) return true;

  // 2. Попытка использовать нативный "Поделиться"
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Филворд',
        });
        return true;
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    }
  }

  // 3. Фоллбэк на стандартный download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};

export default function WordSearchScreen({ onBack }: { onBack: () => void }) {
  const [wordsInput, setWordsInput] = useState('МАТЕМАТИКА\nУЧИТЕЛЬ\nШКОЛА\nУРОК\nЗНАНИЯ');
  const [config, setConfig] = useState<WordSearchConfig>({ gridSize: 10, difficulty: 'medium' });
  const [results, setResults] = useState<WordSearchResult[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showWordList, setShowWordList] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchCount, setBatchCount] = useState(1);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportSuccess, setExportSuccess] = useState('');

  const handleGenerate = async (count: number) => {
    if (!wordsInput.trim()) return;
    setIsGenerating(true);
    setExportError('');
    setExportSuccess('');
    triggerHaptic('medium');
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newResults = generateBatch(wordsInput, config, count);
    setResults(newResults);
    setShowAnswers(false);
    setIsGenerating(false);
  };

  const downloadAsImage = async (result: WordSearchResult, index: number) => {
    triggerHaptic('light');
    setExportError('');
    setExportSuccess('');
    const canvas = generateCanvas(result, showAnswers, showWordList, index + 1, false);
    
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setExportError('Не удалось создать изображение');
        return;
      }
      const success = await shareOrDownloadPNG(blob, `филворд_вариант_${index + 1}.png`);
      if (success) {
        setExportSuccess('Изображение сохранено');
      } else {
        setExportError('Не удалось сохранить изображение');
      }
    }, 'image/png');
  };

  const downloadAsPDF = async () => {
    if (results.length === 0) return;
    setIsExportingPDF(true);
    setExportError('');
    setExportSuccess('');
    triggerHaptic('medium');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      
      for (let i = 0; i < results.length; i++) {
        if (i > 0) doc.addPage();
        const canvas = generateCanvas(results[i], false, showWordList, i + 1, false);
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = usableWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      }
      
      // Получаем PDF как Blob
      const pdfBlob = doc.output('blob');
      const filename = `филворды_${results.length}шт.pdf`;
      
      // Используем MAX Bridge для скачивания
      const success = await downloadFileViaMax(pdfBlob, filename);
      
      if (success) {
        setExportSuccess('PDF скачан через MAX');
      } else {
        setExportError('Не удалось скачать PDF. Убедитесь, что приложение открыто в MAX.');
      }
      
    } catch (err) {
      console.error('PDF generation error:', err);
      setExportError('Ошибка при создании PDF. Попробуйте еще раз.');
    } finally {
      setIsExportingPDF(false);
      triggerHaptic('heavy');
    }
  };

  const getGridStyles = (size: number) => {
    if (size >= 20) return { width: 'min(100%, 400px)', fontSize: 'text-[10px] sm:text-xs', cellSize: '20px' };
    if (size === 15) return { width: 'min(100%, 360px)', fontSize: 'text-xs sm:text-sm', cellSize: '24px' };
    return { width: 'min(100%, 320px)', fontSize: 'text-sm sm:text-base', cellSize: '32px' };
  };

  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
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

          <button
            onClick={() => handleGenerate(1)}
            disabled={isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Генерация...' : 'Создать 1 вариант'}
          </button>
          
          <div className="space-y-3 pt-2 border-t border-purple-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-purple-700">Пакетная генерация</span>
              <span className="text-sm font-bold text-purple-700">{batchCount} шт.</span>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="range" 
                min="1" 
                max="30" 
                value={batchCount} 
                onChange={(e) => setBatchCount(Number(e.target.value))}
                className="flex-1 accent-purple-600"
              />
              <button
                onClick={() => handleGenerate(batchCount)}
                disabled={isGenerating || batchCount === 1}
                className="bg-violet-100 hover:bg-violet-200 text-violet-700 font-semibold rounded-xl px-3 py-2 text-sm active:scale-95 transition-transform disabled:opacity-50 shrink-0"
              >
                Создать
              </button>
              <button
                onClick={downloadAsPDF}
                disabled={isExportingPDF || results.length === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl px-3 py-2 text-sm flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50 shrink-0"
              >
                <FileText className="w-4 h-4" />
                <span>{isExportingPDF ? '...' : 'PDF'}</span>
              </button>
            </div>
          </div>
        </section>

        {exportError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{exportError}</p>
          </div>
        )}

        {exportSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
            <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <p className="text-xs text-green-700">{exportSuccess}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => { setShowAnswers(!showAnswers); triggerHaptic('light'); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                showAnswers ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              <Check className="w-4 h-4" />
              {showAnswers ? 'Скрыть ответы' : 'Показать ответы'}
            </button>
            
            <button
              onClick={() => { setShowWordList(!showWordList); triggerHaptic('light'); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                showWordList ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              {showWordList ? 'Скрыть слова' : 'Показать слова'}
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
                    <Share2 className="w-4 h-4" /> Сохранить PNG
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
                              style={{ width: cellSize, height: cellSize }}
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

        <div className="mb-4">
          <YandexAdBlock />
        </div>
      </main>
    </div>
  );
}
