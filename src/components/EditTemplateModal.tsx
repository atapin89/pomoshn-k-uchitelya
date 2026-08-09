import { useState } from 'react';
import { X } from 'lucide-react';
import type { LessonTemplate } from '@/types';
import { formatTime } from '@/lib/format';
import YandexAdBlock from './YandexAdBlock';

interface EditTemplateModalProps {
  template: LessonTemplate;
  onClose: () => void;
  onSave: (template: LessonTemplate) => void;
}

const MIN_TOTAL = 5;
const MAX_TOTAL = 120;
const MAX_STAGE = 60;

export default function EditTemplateModal({
  template,
  onClose,
  onSave,
}: EditTemplateModalProps) {
  const [name, setName] = useState(template.name);
  const [durations, setDurations] = useState(() =>
    template.stages.map((s) => s.duration),
  );

  const totalMin = durations.reduce((a, b) => a + b, 0);

  const handleTotalChange = (newTotal: number) => {
    setDurations((prev) => {
      const oldTotal = prev.reduce((a, b) => a + b, 0);
      if (oldTotal === 0) return prev.map(() => Math.floor(newTotal / prev.length));
      const scaled = prev.map((d) =>
        Math.max(1, Math.round((d / oldTotal) * newTotal)),
      );
      const diff = newTotal - scaled.reduce((a, b) => a + b, 0);
      if (diff !== 0) {
        const maxIdx = scaled.indexOf(Math.max(...scaled));
        scaled[maxIdx] = Math.max(1, scaled[maxIdx] + diff);
      }
      return scaled;
    });
  };

  const handleStageChange = (idx: number, value: number) => {
    setDurations((prev) => {
      const total = prev.reduce((a, b) => a + b, 0);
      const delta = value - prev[idx];
      if (delta === 0) return prev;
      const others = prev.map((d, i) => (i === idx ? 0 : d));
      const othersTotal = others.reduce((a, b) => a + b, 0);
      const next = [...prev];
      next[idx] = value;
      if (othersTotal === 0) return next;
      let remaining = delta;
      for (let i = 0; i < next.length && remaining !== 0; i++) {
        if (i === idx) continue;
        const share = Math.round((others[i] / othersTotal) * delta);
        const newVal = Math.max(1, next[i] - share);
        const actual = next[i] - newVal;
        remaining -= actual;
        next[i] = newVal;
      }
      if (remaining !== 0) {
        const maxIdx = next.reduce(
          (max, v, i) => (i !== idx && v > next[max] ? i : max),
          next.findIndex((_, i) => i !== idx),
        );
        if (maxIdx >= 0) next[maxIdx] = Math.max(1, next[maxIdx] - remaining);
      }
      const newTotal = next.reduce((a, b) => a + b, 0);
      if (newTotal !== total) {
        const maxIdx = next.indexOf(Math.max(...next));
        next[maxIdx] = Math.max(1, next[maxIdx] + (total - newTotal));
      }
      return next;
    });
  };

  const handleSave = () => {
    onSave({
      ...template,
      name: name.trim() || template.name,
      stages: template.stages.map((s, i) => ({ ...s, duration: durations[i] })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50">
      <div className="mt-auto bg-gray-50 rounded-t-3xl max-h-[92vh] flex flex-col animate-[slideUp_0.25s_ease-out]">
        <div className="flex items-center justify-between px-5 py-4 bg-white rounded-t-3xl shadow-sm">
          <h2 className="text-xl font-bold text-purple-700">Редактировать шаблон</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 min-h-14 min-w-14 flex items-center justify-center touch-manipulation"
            aria-label="Закрыть"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Название урока
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                Общее время урока
              </label>
              <span className="text-lg font-bold text-purple-600 tabular-nums">
                {formatTime(totalMin * 60)}
              </span>
            </div>
            <input
              type="range"
              min={MIN_TOTAL}
              max={MAX_TOTAL}
              value={totalMin}
              onChange={(e) => handleTotalChange(Number(e.target.value))}
              className="w-full accent-purple-600 h-2 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{MIN_TOTAL} мин</span>
              <span>{MAX_TOTAL} мин</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2 px-1">
              Этапы ({template.stages.length})
            </h3>
            <div className="space-y-3">
              {template.stages.map((stage, i) => {
                const pct = totalMin > 0 ? Math.round((durations[i] / totalMin) * 100) : 0;
                return (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        {stage.name}
                      </span>
                      <span className="text-sm font-bold text-gray-700 tabular-nums">
                        {durations[i]} мин
                        <span className="text-gray-400 font-normal ml-1.5">({pct}%)</span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={MAX_STAGE}
                      value={durations[i]}
                      onChange={(e) => handleStageChange(i, Number(e.target.value))}
                      className="w-full accent-purple-600 h-2 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <YandexAdBlock />
        </div>

        <div className="px-5 py-4 bg-white border-t border-gray-100 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            onClick={handleSave}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-2xl py-4 min-h-14 active:scale-[0.98] transition-transform shadow-md touch-manipulation"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
