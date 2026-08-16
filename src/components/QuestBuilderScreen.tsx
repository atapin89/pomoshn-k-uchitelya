import { useState, useEffect, useRef } from 'react';
import {
  Map, Plus, Trash2, Edit3, Play, Download, QrCode, Camera,
  CheckCircle2, Trophy, Users, BookOpen, Sparkles, ArrowLeft,
  ArrowRight, Save, FolderOpen, Eye, HelpCircle, X, ChevronRight,
  Target, Puzzle, Lightbulb, MapPin, Award
} from 'lucide-react';
import QRCode from 'qrcode';
import BackButton from './BackButton';
import YandexAdBlock from './YandexAdBlock';
import { triggerHaptic } from '@/lib/haptic';

// ===== ТИПЫ =====
interface Stage {
  id: string;
  type: string;
  title: string;
  content: string;
  answer: string;
  location: string;
  hints: string[];
  points: number;
}

interface Team {
  id: string;
  name: string;
  currentStage: number;
  completedStages: number[];
  hintsUsed: number;
  score: number;
  finished: boolean;
}

interface Quest {
  id: string;
  title: string;
  subject: string;
  ageGroup: string;
  theme: string;
  stages: Stage[];
  teams: Team[];
  finalMessage: string;
  finalLocation: string;
  createdAt: number;
}

type Screen = 'list' | 'wizard' | 'editor' | 'preview' | 'conduct' | 'scanner';

// ===== БИБЛИОТЕКА ЗАДАНИЙ =====
const TASK_TYPES = [
  { id: 'cipher', name: 'Шифр', icon: '', desc: 'Дешифровка текста' },
  { id: 'rebus', name: 'Ребус', icon: '🎨', desc: 'Визуальная загадка' },
  { id: 'riddle', name: 'Загадка', icon: '❓', desc: 'Загадка в стихах' },
  { id: 'math', name: 'Задача', icon: '🔢', desc: 'Математическая задача' },
  { id: 'wordsearch', name: 'Филворд', icon: '🔍', desc: 'Поиск слов' },
  { id: 'find_diff', name: 'Найди отличия', icon: '👀', desc: 'Визуальный поиск' },
  { id: 'odd_one', name: 'Что лишнее', icon: '', desc: 'Логический выбор' },
  { id: 'match', name: 'Соответствие', icon: '', desc: 'Соедини пары' },
  { id: 'action', name: 'Действие', icon: '', desc: 'Изобрази/спой' },
  { id: 'location', name: 'Поиск в классе', icon: '📍', desc: 'Найди предмет' },
  { id: 'puzzle', name: 'Пазл', icon: '🧩', desc: 'Собери картинку' },
  { id: 'custom', name: 'Своё задание', icon: '✏️', desc: 'Авторское' },
];

const THEMES = [
  { id: 'detective', name: 'Детектив', color: 'from-gray-700 to-gray-900' },
  { id: 'pirate', name: 'Пираты', color: 'from-amber-600 to-amber-800' },
  { id: 'space', name: 'Космос', color: 'from-indigo-600 to-purple-900' },
  { id: 'school', name: 'Школа', color: 'from-blue-600 to-blue-800' },
  { id: 'nature', name: 'Природа', color: 'from-green-600 to-green-800' },
  { id: 'universal', name: 'Универсальный', color: 'from-purple-600 to-violet-800' },
];

const SUBJECTS = ['Математика', 'Русский язык', 'Литература', 'История', 'Биология', 'География', 'Физика', 'Химия', 'Английский', 'Информатика', 'Смешанный'];
const AGE_GROUPS = ['1-4 класс', '5-8 класс', '9-11 класс', 'Взрослые'];

const STORAGE_KEY = 'quest_builder_quests';

// ===== УТИЛИТЫ =====
const generateId = () => Math.random().toString(36).substr(2, 9);

const loadQuests = (): Quest[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveQuests = (quests: Quest[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quests));
};

// ===== ГЛАВНЫЙ КОМПОНЕНТ =====
export default function QuestBuilderScreen({ onBack }: { onBack: () => void }) {
  const [screen, setScreen] = useState<Screen>('list');
  const [quests, setQuests] = useState<Quest[]>(loadQuests());
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [wizardStep, setWizardStep] = useState(0);

  // Состояния мастера
  const [questTitle, setQuestTitle] = useState('');
  const [questSubject, setQuestSubject] = useState('Математика');
  const [questAge, setQuestAge] = useState('5-8 класс');
  const [questTheme, setQuestTheme] = useState('universal');
  const [stagesCount, setStagesCount] = useState(5);
  const [teamsCount, setTeamsCount] = useState(3);
  const [stages, setStages] = useState<Stage[]>([]);
  const [finalMessage, setFinalMessage] = useState('Поздравляем! Вы прошли квест!');
  const [finalLocation, setFinalLocation] = useState('Учительский стол');

  const persistQuests = (newQuests: Quest[]) => {
    setQuests(newQuests);
    saveQuests(newQuests);
  };

  const resetWizard = () => {
    setQuestTitle('');
    setStages([]);
    setWizardStep(0);
    setFinalMessage('Поздравляем! Вы прошли квест!');
    setFinalLocation('Учительский стол');
  };

  const handleCreateQuest = () => {
    const newQuest: Quest = {
      id: generateId(),
      title: questTitle || 'Новый квест',
      subject: questSubject,
      ageGroup: questAge,
      theme: questTheme,
      stages: stages,
      teams: Array.from({ length: teamsCount }, (_, i) => ({
        id: `team-${i + 1}`,
        name: `Команда ${i + 1}`,
        currentStage: 0,
        completedStages: [],
        hintsUsed: 0,
        score: 0,
        finished: false,
      })),
      finalMessage,
      finalLocation,
      createdAt: Date.now(),
    };
    persistQuests([newQuest, ...quests]);
    setCurrentQuest(newQuest);
    setScreen('list');
    resetWizard();
    triggerHaptic('success');
  };

  const handleDeleteQuest = (id: string) => {
    triggerHaptic('medium');
    persistQuests(quests.filter(q => q.id !== id));
  };

  const handleStartConduct = (quest: Quest) => {
    setCurrentQuest(quest);
    setScreen('conduct');
    triggerHaptic('light');
  };

  // ===== ЭКРАН СПИСКА КВЕСТОВ =====
  if (screen === 'list') {
    return (
      <div className="min-h-[100dvh] notebook-bg flex flex-col">
        <header className="bg-purple-700 shadow-md sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
            <div className="shrink-0">
              <BackButton onClick={onBack} variant="light" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h1 className="text-lg font-bold text-white leading-tight truncate">Конструктор квестов</h1>
              <p className="text-xs text-purple-200 leading-tight">Создавайте и проводите квесты</p>
            </div>
            <div className="shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <Map className="w-5 h-5 text-white" />
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 space-y-4 overflow-y-auto">
          <button
            onClick={() => { resetWizard(); setScreen('wizard'); triggerHaptic('light'); }}
            className="w-full bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-2xl p-5 flex items-center gap-4 shadow-lg active:scale-[0.98] transition-transform"
          >
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Plus className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold">Создать новый квест</h2>
              <p className="text-white/80 text-xs mt-1">Мастер создания за 5 шагов</p>
            </div>
          </button>

          {quests.length === 0 ? (
            <div className="text-center py-12">
              <Map className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-purple-700">Пока нет квестов</p>
              <p className="text-sm text-gray-500 mt-1">Создайте первый квест!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Мои квесты</h3>
              {quests.map(quest => (
                <div key={quest.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-purple-700 truncate">{quest.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {quest.subject} · {quest.ageGroup} · {quest.stages.length} этапов · {quest.teams.length} команд
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleStartConduct(quest)}
                      className="flex-1 bg-purple-600 text-white font-semibold rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-sm active:scale-95 transition-transform"
                    >
                      <Play className="w-4 h-4" /> Провести
                    </button>
                    <button
                      onClick={() => { setCurrentQuest(quest); setScreen('preview'); triggerHaptic('light'); }}
                      className="bg-purple-100 text-purple-700 font-semibold rounded-xl px-3 py-2.5 flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuest(quest.id)}
                      className="bg-red-50 text-red-500 font-semibold rounded-xl px-3 py-2.5 flex items-center justify-center active:scale-95 transition-transform"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <YandexAdBlock />
        </main>
      </div>
    );
  }

  // ===== МАСТЕР СОЗДАНИЯ =====
  if (screen === 'wizard') {
    return (
      <WizardScreen
        step={wizardStep}
        setStep={setWizardStep}
        title={questTitle} setTitle={setQuestTitle}
        subject={questSubject} setSubject={setQuestSubject}
        age={questAge} setAge={setQuestAge}
        theme={questTheme} setTheme={setQuestTheme}
        stagesCount={stagesCount} setStagesCount={setStagesCount}
        teamsCount={teamsCount} setTeamsCount={setTeamsCount}
        stages={stages} setStages={setStages}
        finalMessage={finalMessage} setFinalMessage={setFinalMessage}
        finalLocation={finalLocation} setFinalLocation={setFinalLocation}
        onBack={() => setScreen('list')}
        onFinish={handleCreateQuest}
      />
    );
  }

  // ===== ПРОВЕДЕНИЕ КВЕСТА =====
  if (screen === 'conduct' && currentQuest) {
    return (
      <ConductScreen
        quest={currentQuest}
        setQuest={(q) => {
          setCurrentQuest(q);
          const updated = quests.map(x => x.id === q.id ? q : x);
          persistQuests(updated);
        }}
        onBack={() => setScreen('list')}
        onScan={() => setScreen('scanner')}
      />
    );
  }

  // ===== СКАНЕР QR =====
  if (screen === 'scanner' && currentQuest) {
    return (
      <ScannerScreen
        quest={currentQuest}
        setQuest={(q) => {
          setCurrentQuest(q);
          const updated = quests.map(x => x.id === q.id ? q : x);
          persistQuests(updated);
        }}
        onBack={() => setScreen('conduct')}
      />
    );
  }

  // ===== ПРОСМОТР КВЕСТА =====
  if (screen === 'preview' && currentQuest) {
    return (
      <PreviewScreen
        quest={currentQuest}
        onBack={() => setScreen('list')}
      />
    );
  }

  return null;
}

// ===== ЭКРАН МАСТЕРА =====
function WizardScreen(props: any) {
  const { step, setStep, title, setTitle, subject, setSubject, age, setAge,
    theme, setTheme, stagesCount, setStagesCount, teamsCount, setTeamsCount,
    stages, setStages, finalMessage, setFinalMessage, finalLocation, setFinalLocation,
    onBack, onFinish } = props;

  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps - 1) { setStep(step + 1); triggerHaptic('light'); }
  };
  const prevStep = () => {
    if (step > 0) { setStep(step - 1); triggerHaptic('light'); }
  };

  const addStage = () => {
    const newStage: Stage = {
      id: generateId(),
      type: 'riddle',
      title: `Этап ${stages.length + 1}`,
      content: 'Текст задания...',
      answer: '',
      location: '',
      hints: ['Подсказка 1'],
      points: 10,
    };
    setStages([...stages, newStage]);
    triggerHaptic('light');
  };

  const updateStage = (id: string, field: keyof Stage, value: any) => {
    setStages(stages.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeStage = (id: string) => {
    setStages(stages.filter(s => s.id !== id));
    triggerHaptic('medium');
  };

  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
      <header className="bg-purple-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <div className="shrink-0"><BackButton onClick={onBack} variant="light" /></div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate">Создание квеста</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
              </div>
              <span className="text-xs text-white/80">{step + 1}/{totalSteps}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 overflow-y-auto">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-purple-700">Основные параметры</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Название квеста</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Тайны пирамид"
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Предмет</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 border border-purple-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-400">
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Возраст</label>
              <select value={age} onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 border border-purple-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-400">
                {AGE_GROUPS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Тема оформления</label>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => setTheme(t.id)}
                    className={`p-3 rounded-xl text-sm font-semibold transition-all ${theme === t.id ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border-2 border-purple-100'}`}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-purple-700">Этапы квеста</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Кол-во этапов</label>
                <input type="number" min="1" max="15" value={stagesCount}
                  onChange={(e) => setStagesCount(Math.max(1, Math.min(15, Number(e.target.value))))}
                  className="w-full px-3 py-2 border border-purple-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Кол-во команд</label>
                <input type="number" min="1" max="10" value={teamsCount}
                  onChange={(e) => setTeamsCount(Math.max(1, Math.min(10, Number(e.target.value))))}
                  className="w-full px-3 py-2 border border-purple-200 rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              {stages.map((stage: Stage, idx: number) => (
                <div key={stage.id} className="bg-white border-2 border-purple-100 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-purple-700">Этап {idx + 1}</span>
                    <button onClick={() => removeStage(stage.id)} className="text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <select value={stage.type} onChange={(e) => updateStage(stage.id, 'type', e.target.value)}
                    className="w-full px-2 py-1.5 border border-purple-200 rounded-lg text-sm mb-2">
                    {TASK_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                  </select>
                  <input type="text" value={stage.title} onChange={(e) => updateStage(stage.id, 'title', e.target.value)}
                    placeholder="Название этапа"
                    className="w-full px-2 py-1.5 border border-purple-200 rounded-lg text-sm mb-2" />
                  <textarea value={stage.content} onChange={(e) => updateStage(stage.id, 'content', e.target.value)}
                    placeholder="Текст задания"
                    className="w-full px-2 py-1.5 border border-purple-200 rounded-lg text-sm mb-2 min-h-[60px]" />
                  <input type="text" value={stage.answer} onChange={(e) => updateStage(stage.id, 'answer', e.target.value)}
                    placeholder="Ответ-ключ (куда спрятать следующую карточку)"
                    className="w-full px-2 py-1.5 border border-purple-200 rounded-lg text-sm mb-2" />
                  <input type="text" value={stage.location} onChange={(e) => updateStage(stage.id, 'location', e.target.value)}
                    placeholder="Место тайника (например: под партой 3 ряда)"
                    className="w-full px-2 py-1.5 border border-purple-200 rounded-lg text-sm" />
                </div>
              ))}
            </div>

            <button onClick={addStage}
              className="w-full py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-xl font-semibold flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /> Добавить этап
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-purple-700">Финал квеста</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Поздравительный текст</label>
              <textarea value={finalMessage} onChange={(e) => setFinalMessage(e.target.value)}
                className="w-full px-4 py-3 border border-purple-200 rounded-xl min-h-[100px] focus:ring-2 focus:ring-purple-400 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Место "клада" (подарка)</label>
              <input type="text" value={finalLocation} onChange={(e) => setFinalLocation(e.target.value)}
                placeholder="Например: учительский стол"
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none" />
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <h4 className="font-semibold text-purple-700 mb-2">Итого:</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Название: {title || 'Не задано'}</li>
                <li>• Предмет: {subject}</li>
                <li>• Возраст: {age}</li>
                <li>• Этапов: {stages.length}</li>
                <li>• Команд: {teamsCount}</li>
              </ul>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-purple-700">Всё готово!</h2>
            <p className="text-gray-600">Квест "{title}" будет сохранён и готов к проведению.</p>
            <div className="bg-purple-50 rounded-xl p-4 text-left">
              <p className="text-sm text-purple-800"><strong>Что дальше:</strong></p>
              <ol className="text-sm text-purple-800 list-decimal list-inside mt-2 space-y-1">
                <li>Распечатайте карточки заданий</li>
                <li>Разложите их по указанным местам</li>
                <li>Выдайте стартовые карточки командам</li>
                <li>Сканируйте QR-коды для учёта прогресса</li>
              </ol>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-md mx-auto w-full px-5 py-4 flex gap-3 bg-white border-t border-purple-100">
        {step > 0 && (
          <button onClick={prevStep} className="flex-1 bg-gray-100 text-gray-700 font-semibold rounded-xl py-3 flex items-center justify-center gap-2">
            <ArrowLeft className="w-5 h-5" /> Назад
          </button>
        )}
        {step < totalSteps - 1 ? (
          <button onClick={nextStep} className="flex-1 bg-purple-600 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2">
            Далее <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={onFinish} className="flex-1 bg-green-600 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" /> Сохранить квест
          </button>
        )}
      </footer>
    </div>
  );
}

// ===== ЭКРАН ПРОВЕДЕНИЯ =====
function ConductScreen({ quest, setQuest, onBack, onScan }: any) {
  const totalStages = quest.stages.length;

  const getTeamProgress = (team: Team) => {
    return Math.round((team.completedStages.length / totalStages) * 100);
  };

  const getLeader = () => {
    return [...quest.teams].sort((a: Team, b: Team) => b.score - a.score)[0];
  };

  const leader = getLeader();

  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
      <header className="bg-purple-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <div className="shrink-0"><BackButton onClick={onBack} variant="light" /></div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{quest.title}</h1>
            <p className="text-xs text-purple-200">Проведение квеста</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 space-y-4 overflow-y-auto">
        <button onClick={onScan}
          className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg active:scale-[0.98] transition-transform">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-bold">Сканировать QR команды</h3>
            <p className="text-white/80 text-xs">Отметить прогресс или выдать подсказку</p>
          </div>
          <ArrowRight className="w-5 h-5" />
        </button>

        {leader && (
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl p-4 flex items-center gap-3">
            <Trophy className="w-10 h-10" />
            <div>
              <p className="text-xs text-amber-100">Лидер</p>
              <p className="text-lg font-bold">{leader.name}</p>
              <p className="text-sm">{leader.score} баллов · {getTeamProgress(leader)}%</p>
            </div>
          </div>
        )}

        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Прогресс команд</h3>
        <div className="space-y-3">
          {quest.teams.map((team: Team) => (
            <div key={team.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-purple-700">{team.name}</h4>
                <span className="text-sm font-semibold text-purple-600">{team.score} б.</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all"
                  style={{ width: `${getTeamProgress(team)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Этап {team.currentStage + 1} из {totalStages}</span>
                <span>{team.hintsUsed} подсказок</span>
              </div>
              {team.finished && (
                <div className="mt-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-lg text-center">
                  ✓ Квест завершён!
                </div>
              )}
            </div>
          ))}
        </div>

        <YandexAdBlock />
      </main>
    </div>
  );
}

// ===== СКАНЕР QR =====
function ScannerScreen({ quest, setQuest, onBack }: any) {
  const [manualCode, setManualCode] = useState('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleScanResult = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.questId !== quest.id) {
        setScanStatus('error');
        setMessage('QR-код от другого квеста!');
        return;
      }

      const team = quest.teams.find((t: Team) => t.id === parsed.teamId);
      if (!team) {
        setScanStatus('error');
        setMessage('Команда не найдена!');
        return;
      }

      // Обновляем прогресс
      const updatedTeams = quest.teams.map((t: Team) => {
        if (t.id === team.id) {
          const newStage = t.currentStage + 1;
          const isFinished = newStage >= quest.stages.length;
          return {
            ...t,
            currentStage: Math.min(newStage, quest.stages.length - 1),
            completedStages: [...t.completedStages, t.currentStage],
            score: t.score + (quest.stages[t.currentStage]?.points || 10),
            finished: isFinished,
          };
        }
        return t;
      });

      setQuest({ ...quest, teams: updatedTeams });
      setScanStatus('success');
      setMessage(`${team.name}: этап ${team.currentStage + 1} пройден! +${quest.stages[team.currentStage]?.points || 10} баллов`);
      triggerHaptic('success');
    } catch {
      setScanStatus('error');
      setMessage('Неверный формат QR-кода');
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      handleScanResult(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
      <header className="bg-purple-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <div className="shrink-0"><BackButton onClick={onBack} variant="light" /></div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate">Сканер QR</h1>
            <p className="text-xs text-purple-200">Отметьте прогресс команды</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 space-y-4">
        {scanStatus === 'idle' && (
          <>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <QrCode className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-purple-700 mb-2">Сканирование QR-кода</h2>
              <p className="text-sm text-gray-600 mb-4">Наведите камеру на QR-код команды для отметки прогресса</p>
              <button onClick={() => { setScanStatus('scanning'); triggerHaptic('light'); }}
                className="w-full bg-purple-600 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2">
                <Camera className="w-5 h-5" /> Открыть камеру
              </button>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-purple-700 mb-3">Ручной ввод кода</h3>
              <div className="flex gap-2">
                <input type="text" value={manualCode} onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Введите код команды (TEAM-1)"
                  className="flex-1 px-3 py-2 border border-purple-200 rounded-xl" />
                <button onClick={handleManualSubmit}
                  className="bg-purple-600 text-white font-semibold rounded-xl px-4">
                  OK
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Коды команд: {quest.teams.map((t: Team) => t.id.toUpperCase()).join(', ')}
              </p>
            </div>
          </>
        )}

        {scanStatus === 'success' && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-green-700 mb-2">Успешно!</h2>
            <p className="text-sm text-green-800 mb-4">{message}</p>
            <button onClick={() => setScanStatus('idle')}
              className="bg-green-600 text-white font-semibold rounded-xl px-6 py-2">
              Сканировать ещё
            </button>
          </div>
        )}

        {scanStatus === 'error' && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Ошибка</h2>
            <p className="text-sm text-red-800 mb-4">{message}</p>
            <button onClick={() => setScanStatus('idle')}
              className="bg-red-600 text-white font-semibold rounded-xl px-6 py-2">
              Попробовать снова
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// ===== ПРОСМОТР КВЕСТА =====
function PreviewScreen({ quest, onBack }: any) {
  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
      <header className="bg-purple-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <div className="shrink-0"><BackButton onClick={onBack} variant="light" /></div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{quest.title}</h1>
            <p className="text-xs text-purple-200">Просмотр квеста</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 space-y-4 overflow-y-auto">
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-2xl p-5">
          <h2 className="text-2xl font-bold mb-2">{quest.title}</h2>
          <p className="text-white/80 text-sm">{quest.subject} · {quest.ageGroup}</p>
          <div className="flex gap-4 mt-4 text-sm">
            <div><span className="text-white/60">Этапов:</span> <strong>{quest.stages.length}</strong></div>
            <div><span className="text-white/60">Команд:</span> <strong>{quest.teams.length}</strong></div>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Этапы квеста</h3>
        <div className="space-y-3">
          {quest.stages.map((stage: Stage, idx: number) => (
            <div key={stage.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-purple-700">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-purple-700">{stage.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {TASK_TYPES.find(t => t.id === stage.type)?.icon} {TASK_TYPES.find(t => t.id === stage.type)?.name} · {stage.points} баллов
                  </p>
                  <p className="text-sm text-gray-700 mt-2">{stage.content}</p>
                  {stage.answer && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
                      <p className="text-xs font-semibold text-amber-800">Ответ-ключ: <span className="font-mono">{stage.answer}</span></p>
                    </div>
                  )}
                  {stage.location && (
                    <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <p className="text-xs text-blue-800">{stage.location}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl p-5">
          <h3 className="font-bold mb-2 flex items-center gap-2"><Trophy className="w-5 h-5" /> Финал</h3>
          <p className="text-sm">{quest.finalMessage}</p>
          <p className="text-xs mt-2 text-white/80">Место клада: {quest.finalLocation}</p>
        </div>

        <YandexAdBlock />
      </main>
    </div>
  );
}
