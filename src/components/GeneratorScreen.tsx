import { useEffect, useRef, useState } from 'react';
import { UserPlus, Users, LayoutGrid, Shuffle } from 'lucide-react';
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
  const [rouletteName, setRouletteName] = useState('');
  const [rouletteSpinning, setRouletteSpinning] = useState(false);
  const [rouletteResult, setRouletteResult] = useState('');
  const rafRef = useRef<number | null>(null);

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
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const stopRoulette = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setRouletteSpinning(false);
    const winner = students[Math.floor(Math.random() * students.length)];
    setRouletteResult(winner);
    setRouletteName(winner);
    triggerHaptic('heavy');
  };

  const handlePickOne = () => {
    if (students.length === 0 || rouletteSpinning) return;
    setRouletteResult('');
    setRouletteSpinning(true);
    const start = Date.now();
    const duration = 1500;
    const loop = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= duration) {
        stopRoulette();
        return;
      }
      const idx = Math.floor(Math.random() * students.length);
      setRouletteName(students[idx]);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleSplitGroups = () => {
    if (students.length === 0) return;
    const n = Math.max(1, Math.min(groupCount, students.length));
    const shuffled = shuffle(students);
    const result: string[][] = Array.from({ length: n }, () => []);
    shuffled.forEach((s, i) => result[i % n].push(s));
    setGroups(result);
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
    triggerHaptic('medium');
  };

  const modeButtons: { id: Mode; label: string; icon: typeof UserPlus }[] = [
    { id: 'one', label: 'Выбрать одного', icon: UserPlus },
    { id: 'groups', label: 'Разделить на группы', icon: Users },
    { id: 'seating', label: 'Случайная рассадка', icon: LayoutGrid },
  ];

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
                  onClick={() => setMode(m.id)}
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

        {/* Mode: pick one */}
        {mode === 'one' && (
          <section className="bg-white rounded-2xl shadow-md p-5">
            <button
              onClick={handlePickOne}
              disabled={students.length === 0 || rouletteSpinning}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-xl py-4 min-h-14 transition-colors touch-manipulation disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Shuffle className="w-5 h-5" />
              {rouletteSpinning ? 'Крутим...' : 'Выбрать одного'}
            </button>
            {(rouletteSpinning || rouletteResult) && (
              <div className="mt-6">
                {rouletteResult && !rouletteSpinning ? (
                  <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-2xl p-6 shadow-xl text-center">
                    <p className="text-sm text-white/80 mb-1">Выбран:</p>
                    <p className="text-3xl font-bold">{rouletteResult}</p>
                  </div>
                ) : (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 text-center">
                    <p className="text-2xl font-bold text-purple-700 tabular-nums">
                      {rouletteName}
                    </p>
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
              <div className="space-y-3 mt-2">
                {groups.map((g, i) => (
                  <div key={i} className="border-2 border-purple-400 rounded-2xl overflow-hidden">
                    <div className="bg-purple-100 text-purple-800 font-semibold px-4 py-2">
                      Группа {i + 1} · {g.length} чел.
                    </div>
                    <ul className="p-3 space-y-1">
                      {g.map((name, j) => (
                        <li key={j} className="text-gray-700 text-sm">
                          {j + 1}. {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
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
              <div
                className="grid gap-2 mt-2"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              >
                {seating.map((name, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-2 text-center text-xs font-medium min-h-14 flex items-center justify-center ${
                      name
                        ? 'bg-purple-50 border border-purple-200 text-purple-900'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}
                  >
                    {name || 'Свободно'}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <YandexAdBlock />
      </main>
    </div>
  );
}
