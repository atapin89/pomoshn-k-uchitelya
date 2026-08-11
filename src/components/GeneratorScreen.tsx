import { useEffect, useRef, useState } from 'react';
import { UserPlus, Users, LayoutGrid, Shuffle, Copy, Share2, Check } from 'lucide-react';
import BackButton from './BackButton';
import YandexAdBlock from './YandexAdBlock';
import { triggerHaptic } from '@/lib/haptic';

const STORAGE_KEY = 'generator-class-list';

type Mode = 'one' | 'groups' | 'seating';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadList(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s) => typeof s === 'string' && s.trim() !== '');
  } catch {
    return [];
  }
}

export default function GeneratorScreen({ onBack }: { onBack: () => void }) {
  const [text, setText] = useState('');
  const [students, setStudents] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode>('one');

  // roulette
  const [rouletteName, setRouletteName] = useState('???');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState('');
  
  // actions feedback
  const [copied, setCopied] = useState(false);

  // groups
  const [groupCount, setGroupCount] = useState(2);
  const [groups, setGroups] = useState<string[][]>([]);

  // seating
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [seating, setSeating] = useState<string[]>([]);

  useEffect(() => {
    const list = loadList();
    setStudents(list);
    setText(list.join('\n'));
  }, []);

  const handleSaveList = () => {
    const list = text
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s !== '');
    setStudents(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
    triggerHaptic('medium');
  };

  const handleClearList = () => {
    setText('');
    setStudents([]);
    setGroups([]);
    setSeating([]);
    setWinner('');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // --- SHARE & COPY LOGIC ---
  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      triggerHaptic('light');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = async (textToShare: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Результат генератора',
          text: textToShare,
        });
        triggerHaptic('light');
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      handleCopy(textToShare);
    }
  };

  // --- WHEEL OF FORTUNE LOGIC ---
  const handlePickOne = () => {
    if (students.length === 0 || isSpinning) return;
    
    setIsSpinning(true);
    setWinner('');
    triggerHaptic('medium');

    const winnerIndex = Math.floor(Math.random() * students.length);
    const finalWinner = students[winnerIndex];

    // Минимум 5 полных оборотов (1800 град) + случайное смещение
    const extraSpins = 5 * 360;
    const randomOffset = Math.floor(Math.random() * 360);
    setRotation((prev) => prev + extraSpins + randomOffset);

    // Быстрая смена имен во время вращения
    let spinInterval: ReturnType<typeof setInterval>;
    spinInterval = setInterval(() => {
      setRouletteName(students[Math.floor(Math.random() * students.length)]);
    }, 50);

    // Остановка через 1.5 секунды (время CSS анимации)
    setTimeout(() => {
      clearInterval(spinInterval);
      setRouletteName(finalWinner);
      setWinner(finalWinner);
      setIsSpinning(false);
      triggerHaptic('heavy');
    }, 1500);
  };

  const handleSplitGroups = () => {
    if (students.length === 0) return;
    const n = Math.max(1, Math.min(groupCount, students.length));
    const shuffled = shuffle(students);
    const result: string[][] = Array.from({ length: n }, () => []);
    shuffled.forEach((s, i) => result[i % n].push(s));
    setGroups(result);
    setWinner(''); // сброс предыдущего результата
    triggerHaptic('medium');
  };

  const handleSeating = () => {
    if (students.length === 0) return;
    const total = Math.max(1, rows * cols);
    const shuffled = shuffle(students);
    const grid: string[] = [];
    for (let i = 0; i < total; i++) {
      grid.push(i < shuffled.length ? shuffled[i] : '');
    }
    setSeating(grid);
    setWinner(''); // сброс предыдущего результата
    triggerHaptic('medium');
  };

  const modeButtons: { id: Mode; label: string; icon: typeof UserPlus }[] = [
    { id: 'one', label: 'Выбрать одного', icon: UserPlus },
    { id: 'groups', label: 'Разделить на группы', icon: Users },
    { id: 'seating', label: 'Случайная рассадка', icon: LayoutGrid },
  ];

  // Форматирование текста для копирования/шеринга
  const getGroupsText = () => {
    return groups.map((g, i) => `Группа ${i + 1}:\n${g.map((name, j) => `  ${j + 1}. ${name}`).join('\n')}`).join('\n\n');
  };

  const getSeatingText = () => {
    let result = 'Схема рассадки:\n';
    for (let r = 0; r < rows; r++) {
      const rowNames = seating.slice(r * cols, (r + 1) * cols);
      result += `Ряд ${r + 1}: ${rowNames.map(n => n || 'Свободно').join(' | ')}\n`;
    }
    return result;
  };

  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
      <header className="bg-purple-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-5 py-4">
          <BackButton onClick={onBack} variant="light" />
          <h1 className="text-2xl font-bold text-white mt-3">Генератор случайностей</h1>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-6 space-y-6 pb-8">
        {/* Class list */}
        <section className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="text-lg font-semibold text-purple-700 mb-3">Список класса</h2>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите имена учеников, каждое с новой строки..."
            className="w-full min-h-[140px] rounded-xl border border-gray-200 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-y"
          />
          <p className="text-sm font-semibold text-purple-700 mt-2">
            В списке: {students.length} учеников
          </p>
          <div className="flex gap-3 mt-3">
            <button
              onClick={handleSaveList}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl py-3 min-h-14 transition-colors touch-manipulation"
            >
              Сохранить список
            </button>
            <button
              onClick={handleClearList}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl px-5 py-3 min-h-14 transition-colors touch-manipulation"
            >
              Очистить
            </button>
          </div>
        </section>

        {/* Mode tabs */}
        <section>
          <div className="grid grid-cols-3 gap-2">
            {modeButtons.map((m) => {
              const Icon = m.icon;
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id);
                    setWinner('');
                    setGroups([]);
                    setSeating([]);
                  }}
                  className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl min-h-14 transition-all touch-manipulation text-xs font-semibold ${
                    active
                      ? 'bg-purple-100 text-purple-800 border-2 border-purple-500'
                      : 'bg-white text-gray-500 border-2 border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-center leading-tight">{m.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Mode: pick one (WHEEL OF FORTUNE) */}
        {mode === 'one' && (
          <section className="bg-white rounded-2xl shadow-md p-5">
            <button
              onClick={handlePickOne}
              disabled={students.length === 0 || isSpinning}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-xl py-4 min-h-14 transition-colors touch-manipulation disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Shuffle className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              {isSpinning ? 'Крутим...' : 'Выбрать одного'}
            </button>
            
            {(isSpinning || winner) && (
              <div className="mt-6 flex flex-col items-center">
                {/* Wheel Container */}
                <div className="relative w-56 h-56 mx-auto mb-4">
                  {/* Pointer */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-red-500 drop-shadow-md" />
                  
                  {/* Spinning Wheel */}
                  <div 
                    className="w-full h-full rounded-full border-4 border-purple-600 bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-purple-400 via-violet-500 to-purple-400 shadow-xl transition-transform duration-[1500ms] ease-[cubic-bezier(0.15,0,0.15,1)]"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    {/* Decorative inner circle */}
                    <div className="absolute inset-4 rounded-full border-2 border-white/30 border-dashed" />
                  </div>
                  
                  {/* Center Name Display */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center shadow-lg border-4 border-purple-100 p-2">
                      <p className="text-center text-sm font-bold text-purple-800 leading-tight break-words">
                        {rouletteName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Result Actions */}
                {winner && !isSpinning && (
                  <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-2xl p-5 shadow-xl text-center">
                      <p className="text-sm text-white/80 mb-1">🎉 Выбран:</p>
                      <p className="text-3xl font-extrabold tracking-wide">{winner}</p>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCopy(`🎉 Выбран: ${winner}`)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Скопировано' : 'Копировать'}
                      </button>
                      <button
                        onClick={() => handleShare(`🎉 Выбран: ${winner}`)}
                        className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        Поделиться
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Mode: groups */}
        {mode === 'groups' && (
          <section className="bg-white rounded-2xl shadow-md p-5 space-y-4">
            <div>
              <label className="text-sm font-semibold text-purple-700 block mb-2">
                Количество групп
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={groupCount}
                onChange={(e) => setGroupCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-full rounded-xl border border-gray-200 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <button
              onClick={handleSplitGroups}
              disabled={students.length === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-xl py-4 min-h-14 transition-colors touch-manipulation disabled:opacity-40"
            >
              Распределить
            </button>
            
            {groups.length > 0 && (
              <div className="space-y-3 mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCopy(getGroupsText())}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Скопировано' : 'Копировать'}
                  </button>
                  <button
                    onClick={() => handleShare(getGroupsText())}
                    className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Поделиться
                  </button>
                </div>

                <div className="space-y-3">
                  {groups.map((g, i) => (
                    <div key={i} className="border-2 border-purple-400 rounded-2xl overflow-hidden">
                      <div className="bg-purple-100 text-purple-800 font-semibold px-4 py-2 flex justify-between">
                        <span>Группа {i + 1}</span>
                        <span className="text-purple-600">{g.length} чел.</span>
                      </div>
                      <ul className="p-3 space-y-1">
                        {g.map((name, j) => (
                          <li key={j} className="text-gray-700 text-sm flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs font-bold">
                              {j + 1}
                            </span>
                            {name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Mode: seating */}
        {mode === 'seating' && (
          <section className="bg-white rounded-2xl shadow-md p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-purple-700 block mb-2">Рядов</label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={rows}
                  onChange={(e) => setRows(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-xl border border-gray-200 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-purple-700 block mb-2">Колонок</label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={cols}
                  onChange={(e) => setCols(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-xl border border-gray-200 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
            <button
              onClick={handleSeating}
              disabled={students.length === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-xl py-4 min-h-14 transition-colors touch-manipulation disabled:opacity-40"
            >
              Сгенерировать схему
            </button>
            
            {seating.length > 0 && (
              <div className="space-y-3 mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCopy(getSeatingText())}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Скопировано' : 'Копировать'}
                  </button>
                  <button
                    onClick={() => handleShare(getSeatingText())}
                    className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Поделиться
                  </button>
                </div>

                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                  {seating.map((name, i) => (
                    <div
                      key={i}
                      className={`rounded-xl p-2 text-center text-xs font-medium min-h-14 flex flex-col items-center justify-center transition-all ${
                        name
                          ? 'bg-purple-50 border-2 border-purple-200 text-purple-900 shadow-sm'
                          : 'bg-gray-100 text-gray-400 border border-gray-200 border-dashed'
                      }`}
                    >
                      {name ? (
                        <>
                          <span className="text-[10px] text-purple-400 mb-0.5">Место {i + 1}</span>
                          <span className="leading-tight break-words w-full">{name}</span>
                        </>
                      ) : (
                        <span>Свободно</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <YandexAdBlock />
      </main>
    </div>
  );
}
