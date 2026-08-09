import { useState } from 'react';
import { X, Plus, Trash2, Clock } from 'lucide-react';
import type { LessonTemplate, Stage } from '@/types';
import YandexAdBlock from './YandexAdBlock';

interface CreateTemplateModalProps {
  onClose: () => void;
  onSave: (template: LessonTemplate) => void;
}

const emptyStage = (): Stage => ({ name: '', duration: 5 });

export default function CreateTemplateModal({ onClose, onSave }: CreateTemplateModalProps) {
  const [name, setName] = useState('');
  const [stages, setStages] = useState<Stage[]>([emptyStage()]);
  const [error, setError] = useState('');

  const addStage = () => setStages((s) => [...s, emptyStage()]);

  const removeStage = (idx: number) =>
    setStages((s) => s.filter((_, i) => i !== idx));

  const updateStage = (idx: number, field: keyof Stage, value: string) => {
    setStages((s) =>
      s.map((st, i) =>
        i === idx
          ? { ...st, [field]: field === 'duration' ? Math.max(1, Number(value) || 1) : value }
          : st,
      ),
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError('Введите название урока');
      return;
    }
    const valid = stages.filter((s) => s.name.trim() && s.duration > 0);
    if (valid.length === 0) {
      setError('Добавьте хотя бы один этап');
      return;
    }
    onSave({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      stages: valid.map((s) => ({ name: s.name.trim(), duration: s.duration })),
      custom: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50">
      <div className="mt-auto bg-gray-50 rounded-t-3xl max-h-[92vh] flex flex-col animate-[slideUp_0.25s_ease-out]">
        <div className="flex items-center justify-between px-5 py-4 bg-white rounded-t-3xl shadow-sm">
          <h2 className="text-xl font-bold text-purple-700">Новый шаблон</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 min-h-14 min-w-14 flex items-center justify-center touch-manipulation"
            aria-label="Закрыть"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Название урока
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Урок литературы (40 мин)"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Этапы урока
            </label>
            <div className="space-y-2.5">
              {stages.map((stage, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => updateStage(idx, 'name', e.target.value)}
                    placeholder={`Этап ${idx + 1}`}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-3 text-base text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <div className="relative w-24 shrink-0">
                    <input
                      type="number"
                      min={1}
                      value={stage.duration}
                      onChange={(e) => updateStage(idx, 'duration', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl pl-3 pr-9 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <Clock className="w-4 h-4 text-gray-300 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <button
                    onClick={() => removeStage(idx)}
                    className="p-2.5 text-gray-300 hover:text-red-500 shrink-0 min-h-14 min-w-14 flex items-center justify-center touch-manipulation"
                    aria-label="Удалить этап"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addStage}
              className="mt-3 w-full bg-white border-2 border-dashed border-purple-300 rounded-xl py-3 flex items-center justify-center gap-2 text-purple-600 font-medium active:scale-[0.98] transition-transform min-h-14 touch-manipulation"
            >
              <Plus className="w-5 h-5" />
              Добавить этап
            </button>
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <YandexAdBlock />
        </div>

        <div className="px-5 py-4 bg-white border-t border-gray-100 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            onClick={handleSave}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-2xl py-4 min-h-14 active:scale-[0.98] transition-transform shadow-md touch-manipulation"
          >
            Сохранить шаблон
          </button>
        </div>
      </div>
    </div>
  );
}
