import { useState, useEffect } from 'react';
import {
  Map, Plus, Trash2, Play, Save, Eye, Edit3, Download,
  CheckCircle2, Trophy, Camera, X, ArrowLeft, ArrowRight,
  HelpCircle, FileText, Copy, Check, Info, Lightbulb, AlertCircle
} from 'lucide-react';
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

type Screen = 'list' | 'wizard' | 'editor' | 'preview' | 'conduct' | 'faq';

// ===== КОНСТАНТЫ =====
const TASK_TYPES = [
  { id: 'cipher', name: 'Шифр', icon: '🔐', desc: 'Дешифровка текста' },
  { id: 'rebus', name: 'Ребус', icon: '🎨', desc: 'Визуальная загадка' },
  { id: 'riddle', name: 'Загадка', icon: '', desc: 'Загадка в стихах' },
  { id: 'math', name: 'Задача', icon: '🔢', desc: 'Математическая задача' },
  { id: 'wordsearch', name: 'Филворд', icon: '🔍', desc: 'Поиск слов' },
  { id: 'find_diff', name: 'Найди отличия', icon: '👀', desc: 'Визуальный поиск' },
  { id: 'odd_one', name: 'Что лишнее', icon: '⚖️', desc: 'Логический выбор' },
  { id: 'match', name: 'Соответствие', icon: '', desc: 'Соедини пары' },
  { id: 'action', name: 'Действие', icon: '🎭', desc: 'Изобрази/спой' },
  { id: 'location', name: 'Поиск в классе', icon: '📍', desc: 'Найди предмет' },
  { id: 'puzzle', name: 'Пазл', icon: '', desc: 'Собери картинку' },
  { id: 'custom', name: 'Своё задание', icon: '✏️', desc: 'Авторское' },
];

const THEMES = [
  { id: 'detective', name: '🕵️ Детектив' },
  { id: 'pirate', name: '🏴‍☠️ Пираты' },
  { id: 'space', name: '🚀 Космос' },
  { id: 'school', name: ' Школа' },
  { id: 'nature', name: '🌿 Природа' },
  { id: 'universal', name: '⭐ Универсальный' },
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

const createEmptyStage = (index: number): Stage => ({
  id: generateId(),
  type: 'riddle',
  title: `Этап ${index}`,
  content: '',
  answer: '',
  location: '',
  hints: [''],
  points: 10,
});

// ===== FAQ ДАННЫЕ =====
const FAQ_ITEMS = [
  {
    q: 'Как создать квест с нуля?',
    a: 'Нажмите "Создать новый квест" и следуйте шагам мастера: укажите название, предмет, возраст, выберите тему оформления, добавьте этапы с заданиями и настройте финал. Все поля имеют подсказки.'
  },
  {
    q: 'Что такое "ответ-ключ" и зачем он нужен?',
    a: 'Ответ-ключ — это слово или фраза, которая указывает, где спрятана следующая карточка. Например, если ответ "СТУЛ", следующую карточку нужно спрятать под стулом.'
  },
  {
    q: 'Как работает система QR-кодов?',
    a: 'Каждой команде выдаётся уникальный стартовый QR-код. После выполнения этапа учитель сканирует код команды (или вводит его вручную), чтобы отметить прогресс и выдать следующую карточку.'
  },
  {
    q: 'Можно ли редактировать уже созданный квест?',
    a: 'Да! В списке квестов нажмите кнопку "Редактировать" (карандаш) рядом с нужным квестом. Вы сможете изменить любое поле, добавить или удалить этапы.'
  },
  {
    q: 'Как сохранить квест для печати?',
    a: 'Откройте квест через кнопку "Просмотр" и нажмите "Сохранить и скачать". Будет сгенерирован текстовый файл с полным описанием квеста, карточками, QR-кодами команд и инструкцией для учителя.'
  },
  {
    q: 'Сколько команд можно создать?',
    a: 'До 10 команд одновременно. Для каждой команды генерируется уникальный код для отслеживания прогресса.'
  },
  {
    q: 'Что делать, если команда зашла в тупик?',
    a: 'На каждом этапе можно добавить до 3 подсказок. Учитель может выдать подсказку команде, но это уменьшит количество баллов за этап.'
  },
  {
    q: 'Как провести квест в классе?',
    a: '1) Создайте квест и скачайте инструкции. 2) Распечатайте карточки и разложите по указанным местам. 3) Выдайте стартовые карточки командам. 4) Сканируйте QR-коды после каждого этапа для учёта прогресса.'
  },
];

// ===== ГЛАВНЫЙ КОМПОНЕНТ =====
export default function QuestBuilderScreen({ onBack }: { onBack: () => void }) {
  const [screen, setScreen] = useState<Screen>('list');
  const [quests, setQuests] = useState<Quest[]>(loadQuests());
  const [currentQuest, setCurrentQuest] = useState<Quest | null>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);

  // Состояния мастера/редактора
  const [questTitle, setQuestTitle] = useState('');
  const [questSubject, setQuestSubject] = useState('Математика');
  const [questAge, setQuestAge] = useState('5-8 класс');
  const [questTheme, setQuestTheme] = useState('universal');
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
    setQuestSubject('Математика');
    setQuestAge('5-8 класс');
    setQuestTheme('universal');
    setTeamsCount(3);
    setStages([]);
    setFinalMessage('Поздравляем! Вы прошли квест!');
    setFinalLocation('Учительский стол');
    setWizardStep(0);
    setEditingQuestId(null);
  };

  const loadQuestToEditor = (quest: Quest) => {
    setQuestTitle(quest.title);
    setQuestSubject(quest.subject);
    setQuestAge(quest.ageGroup);
    setQuestTheme(quest.theme);
    setTeamsCount(quest.teams.length);
    setStages(quest.stages);
    setFinalMessage(quest.finalMessage);
    setFinalLocation(quest.finalLocation);
    setEditingQuestId(quest.id);
    setWizardStep(0);
  };

  const handleSaveQuest = () => {
    const teams: Team[] = Array.from({ length: teamsCount }, (_, i) => ({
      id: `team-${i + 1}`,
      name: `Команда ${i + 1}`,
      currentStage: 0,
      completedStages: [],
      hintsUsed: 0,
      score: 0,
      finished: false,
    }));

    const questData: Quest = {
      id: editingQuestId || generateId(),
      title: questTitle || 'Новый квест',
      subject: questSubject,
      ageGroup: questAge,
      theme: questTheme,
      stages,
      teams,
      finalMessage,
      finalLocation,
      createdAt: editingQuestId 
        ? (quests.find(q => q.id === editingQuestId)?.createdAt || Date.now())
        : Date.now(),
    };

    let updated: Quest[];
    if (editingQuestId) {
      updated = quests.map(q => q.id === editingQuestId ? questData : q);
    } else {
      updated = [questData, ...quests];
    }
    persistQuests(updated);
    setCurrentQuest(questData);
    setScreen('preview');
    resetWizard();
    triggerHaptic('success');
  };

  const handleDeleteQuest = (id: string) => {
    if (confirm('Удалить этот квест?')) {
      triggerHaptic('medium');
      persistQuests(quests.filter(q => q.id !== id));
    }
  };

  const handleStartConduct = (quest: Quest) => {
    setCurrentQuest(quest);
    setScreen('conduct');
    triggerHaptic('light');
  };

  const handleEditQuest = (quest: Quest) => {
    loadQuestToEditor(quest);
    setScreen('wizard');
    triggerHaptic('light');
  };

  const handlePreviewQuest = (quest: Quest) => {
    setCurrentQuest(quest);
    setScreen('preview');
    triggerHaptic('light');
  };

  // ===== ЭКРАН СПИСКА КВЕСТОВ =====
  if (screen === 'list') {
    return (
      <div className="min-h-[100dvh] notebook-bg flex flex-col">
        <header className="bg-gradient-to-br from-gray-600 to-gray-700 shadow-md sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
            <div className="shrink-0">
              <BackButton onClick={onBack} variant="light" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h1 className="text-lg font-bold text-white leading-tight truncate">Конструктор квестов</h1>
              <p className="text-xs text-gray-300 leading-tight">Создавайте и проводите квесты</p>
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
              <p className="text-white/80 text-xs mt-1">Мастер создания за 4 шага</p>
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
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Мои квесты ({quests.length})</h3>
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
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <button
                      onClick={() => handleStartConduct(quest)}
                      className="bg-purple-600 text-white font-semibold rounded-xl py-2 flex items-center justify-center gap-1 text-xs active:scale-95 transition-transform"
                    >
                      <Play className="w-3.5 h-3.5" /> Провести
                    </button>
                    <button
                      onClick={() => handlePreviewQuest(quest)}
                      className="bg-blue-100 text-blue-700 font-semibold rounded-xl py-2 flex items-center justify-center gap-1 text-xs active:scale-95 transition-transform"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleEditQuest(quest)}
                      className="bg-amber-100 text-amber-700 font-semibold rounded-xl py-2 flex items-center justify-center gap-1 text-xs active:scale-95 transition-transform"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuest(quest.id)}
                      className="bg-red-50 text-red-500 font-semibold rounded-xl py-2 flex items-center justify-center gap-1 text-xs active:scale-95 transition-transform"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FAQ кнопка */}
          <button
            onClick={() => setScreen('faq')}
            className="w-full bg-white border-2 border-purple-100 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-bold text-purple-700 text-sm">Частые вопросы</h3>
              <p className="text-xs text-gray-500">Подсказки по использованию</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </button>

          <YandexAdBlock />
        </main>
      </div>
    );
  }

  // ===== ЭКРАН FAQ =====
  if (screen === 'faq') {
    return <FAQScreen onBack={() => setScreen('list')} />;
  }

  // ===== МАСТЕР СОЗДАНИЯ / РЕДАКТИРОВАНИЯ =====
  if (screen === 'wizard') {
    return (
      <WizardScreen
        step={wizardStep}
        setStep={setWizardStep}
        title={questTitle} setTitle={setQuestTitle}
        subject={questSubject} setSubject={setQuestSubject}
        age={questAge} setAge={setQuestAge}
        theme={questTheme} setTheme={setQuestTheme}
        teamsCount={teamsCount} setTeamsCount={setTeamsCount}
        stages={stages} setStages={setStages}
        finalMessage={finalMessage} setFinalMessage={setFinalMessage}
        finalLocation={finalLocation} setFinalLocation={setFinalLocation}
        isEditing={!!editingQuestId}
        onBack={() => setScreen('list')}
        onFinish={handleSaveQuest}
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
      />
    );
  }

  // ===== ПРОСМОТР КВЕСТА =====
  if (screen === 'preview' && currentQuest) {
    return (
      <PreviewScreen
        quest={currentQuest}
        onBack={() => setScreen('list')}
        onEdit={() => {
          handleEditQuest(currentQuest);
        }}
      />
    );
  }

  return null;
}

// ===== ЭКРАН FAQ =====
function FAQScreen({ onBack }: { onBack: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
      <header className="bg-gradient-to-br from-gray-600 to-gray-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <div className="shrink-0"><BackButton onClick={onBack} variant="light" /></div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate">Частые вопросы</h1>
            <p className="text-xs text-gray-300">Подсказки по использованию</p>
          </div>
          <div className="shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 space-y-2 overflow-y-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            Здесь собраны ответы на самые частые вопросы о создании и проведении квестов
          </p>
        </div>

        {FAQ_ITEMS.map((faq, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => {
                setOpenIndex(openIndex === index ? null : index);
                triggerHaptic('light');
              }}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-800 pr-2">{faq.q}</span>
              <span className={`transform transition-transform text-purple-600 shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {openIndex === index && (
              <div className="px-4 py-3 bg-purple-50 border-t border-purple-100">
                <p className="text-sm text-gray-700">{faq.a}</p>
              </div>
            )}
          </div>
        ))}

        <YandexAdBlock />
      </main>
    </div>
  );
}

// ===== ЭКРАН МАСТЕРА СОЗДАНИЯ/РЕДАКТИРОВАНИЯ =====
function WizardScreen(props: {
  step: number;
  setStep: (s: number) => void;
  title: string; setTitle: (v: string) => void;
  subject: string; setSubject: (v: string) => void;
  age: string; setAge: (v: string) => void;
  theme: string; setTheme: (v: string) => void;
  teamsCount: number; setTeamsCount: (v: number) => void;
  stages: Stage[]; setStages: (s: Stage[]) => void;
  finalMessage: string; setFinalMessage: (v: string) => void;
  finalLocation: string; setFinalLocation: (v: string) => void;
  isEditing: boolean;
  onBack: () => void;
  onFinish: () => void;
}) {
  const { step, setStep, title, setTitle, subject, setSubject, age, setAge,
    theme, setTheme, teamsCount, setTeamsCount, stages, setStages,
    finalMessage, setFinalMessage, finalLocation, setFinalLocation,
    isEditing, onBack, onFinish } = props;

  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps - 1) { setStep(step + 1); triggerHaptic('light'); }
  };
  const prevStep = () => {
    if (step > 0) { setStep(step - 1); triggerHaptic('light'); }
  };

  const addStage = () => {
    setStages([...stages, createEmptyStage(stages.length + 1)]);
    triggerHaptic('light');
  };

  const updateStage = (id: string, field: keyof Stage, value: any) => {
    setStages(stages.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const updateHint = (stageId: string, hintIndex: number, value: string) => {
    setStages(stages.map(s => {
      if (s.id !== stageId) return s;
      const newHints = [...s.hints];
      newHints[hintIndex] = value;
      return { ...s, hints: newHints };
    }));
  };

  const addHint = (stageId: string) => {
    setStages(stages.map(s => {
      if (s.id !== stageId) return s;
      if (s.hints.length >= 3) return s;
      return { ...s, hints: [...s.hints, ''] };
    }));
    triggerHaptic('light');
  };

  const removeStage = (id: string) => {
    setStages(stages.filter(s => s.id !== id));
    triggerHaptic('medium');
  };

  const getTaskInfo = (typeId: string) => TASK_TYPES.find(t => t.id === typeId) || TASK_TYPES[0];

  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
      <header className="bg-gradient-to-br from-gray-600 to-gray-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <div className="shrink-0"><BackButton onClick={onBack} variant="light" /></div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate">
              {isEditing ? 'Редактирование квеста' : 'Создание квеста'}
            </h1>
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
        {/* ШАГ 1: Основные параметры */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                Задайте основные параметры квеста. Все поля можно будет изменить позже при редактировании.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Название квеста <span className="text-red-500">*</span>
              </label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Тайны пирамид"
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none" />
              <p className="text-xs text-gray-500 mt-1">💡 Краткое и запоминающееся название</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Предмет</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 border border-purple-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-400">
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">💡 Для смешанных квестов выберите "Смешанный"</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Возраст игроков</label>
              <select value={age} onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 border border-purple-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-400">
                {AGE_GROUPS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">💡 Влияет на рекомендуемую сложность заданий</p>
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
              <p className="text-xs text-gray-500 mt-2">💡 Определяет стиль карточек и атмосферу квеста</p>
            </div>
          </div>
        )}

        {/* ШАГ 2: Этапы квеста */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">Добавьте этапы квеста:</p>
                <p>• <strong>Название этапа</strong> — краткое имя (например, "Шифр фараона")</p>
                <p>• <strong>Текст задания</strong> — что нужно сделать игрокам</p>
                <p>• <strong>Ответ-ключ</strong> — слово, указывающее место следующей карточки</p>
                <p>• <strong>Место тайника</strong> — где физически спрятать карточку</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Количество команд</label>
              <input type="number" min="1" max="10" value={teamsCount}
                onChange={(e) => setTeamsCount(Math.max(1, Math.min(10, Number(e.target.value))))}
                className="w-full px-3 py-2 border border-purple-200 rounded-xl" />
              <p className="text-xs text-gray-500 mt-1">💡 От 1 до 10 команд. Для каждой будет создан уникальный QR-код</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Этапы ({stages.length})</h3>
                <button onClick={addStage}
                  className="text-xs bg-purple-600 text-white font-semibold rounded-lg px-3 py-1.5 flex items-center gap-1 active:scale-95 transition-transform">
                  <Plus className="w-3.5 h-3.5" /> Добавить
                </button>
              </div>

              {stages.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Добавьте хотя бы один этап</p>
                </div>
              )}

              {stages.map((stage, idx) => (
                <div key={stage.id} className="bg-white border-2 border-purple-100 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-purple-700">Этап {idx + 1}</span>
                    <button onClick={() => removeStage(stage.id)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Тип задания</label>
                    <select value={stage.type} onChange={(e) => updateStage(stage.id, 'type', e.target.value)}
                      className="w-full px-2 py-1.5 border border-purple-200 rounded-lg text-sm bg-white">
                      {TASK_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Название этапа</label>
                    <input type="text" value={stage.title} onChange={(e) => updateStage(stage.id, 'title', e.target.value)}
                      placeholder="Например: Шифр фараона"
                      className="w-full px-2 py-1.5 border border-purple-200 rounded-lg text-sm" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Текст задания</label>
                    <textarea value={stage.content} onChange={(e) => updateStage(stage.id, 'content', e.target.value)}
                      placeholder="Опишите, что нужно сделать игрокам..."
                      className="w-full px-2 py-1.5 border border-purple-200 rounded-lg text-sm min-h-[60px]" />
                    <p className="text-xs text-gray-400 mt-0.5">💡 Можно использовать эмодзи и форматирование</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ответ-ключ</label>
                    <input type="text" value={stage.answer} onChange={(e) => updateStage(stage.id, 'answer', e.target.value)}
                      placeholder="Слово, указывающее место следующей карточки"
                      className="w-full px-2 py-1.5 border border-purple-200 rounded-lg text-sm" />
                    <p className="text-xs text-gray-400 mt-0.5">💡 Например: "СТУЛ" → следующая карточка под стулом</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Место тайника</label>
                    <input type="text" value={stage.location} onChange={(e) => updateStage(stage.id, 'location', e.target.value)}
                      placeholder="Где физически спрятать карточку"
                      className="w-full px-2 py-1.5 border border-purple-200 rounded-lg text-sm" />
                    <p className="text-xs text-gray-400 mt-0.5"> Например: "под партой 3-го ряда, у окна"</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Баллы за этап</label>
                    <input type="number" min="1" max="100" value={stage.points} onChange={(e) => updateStage(stage.id, 'points', Math.max(1, Number(e.target.value)))}
                      className="w-full px-2 py-1.5 border border-purple-200 rounded-lg text-sm" />
                  </div>

                  {/* Подсказки */}
                  <div className="bg-amber-50 rounded-lg p-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-amber-800">Подсказки ({stage.hints.length}/3)</label>
                      {stage.hints.length < 3 && (
                        <button onClick={() => addHint(stage.id)}
                          className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Добавить
                        </button>
                      )}
                    </div>
                    {stage.hints.map((hint, hi) => (
                      <input key={hi} type="text" value={hint}
                        onChange={(e) => updateHint(stage.id, hi, e.target.value)}
                        placeholder={`Подсказка ${hi + 1}`}
                        className="w-full px-2 py-1 border border-amber-200 rounded text-xs bg-white" />
                    ))}
                    <p className="text-xs text-amber-700">💡 До 3 подсказок на этап. Использование подсказки снижает баллы</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ШАГ 3: Финал квеста */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                Настройте финальное поздравление и место, где спрятан главный приз ("клад").
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Поздравительный текст</label>
              <textarea value={finalMessage} onChange={(e) => setFinalMessage(e.target.value)}
                placeholder="Поздравляем! Вы прошли квест! Вы настоящие детективы!"
                className="w-full px-4 py-3 border border-purple-200 rounded-xl min-h-[100px] focus:ring-2 focus:ring-purple-400 focus:outline-none" />
              <p className="text-xs text-gray-500 mt-1">💡 Текст, который увидят игроки после прохождения всех этапов</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Место "клада" (подарка)</label>
              <input type="text" value={finalLocation} onChange={(e) => setFinalLocation(e.target.value)}
                placeholder="Например: учительский стол, шкаф в углу"
                className="w-full px-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none" />
              <p className="text-xs text-gray-500 mt-1">💡 Где физически находится главный приз квеста</p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <h4 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Итого:
              </h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Название: <strong>{title || 'Не задано'}</strong></li>
                <li>• Предмет: {subject}</li>
                <li>• Возраст: {age}</li>
                <li>• Тема: {THEMES.find(t => t.id === theme)?.name}</li>
                <li>• Этапов: <strong>{stages.length}</strong></li>
                <li>• Команд: <strong>{teamsCount}</strong></li>
                <li>• Всего баллов: <strong>{stages.reduce((sum, s) => sum + s.points, 0)}</strong></li>
              </ul>
            </div>
          </div>
        )}

        {/* ШАГ 4: Готово */}
        {step === 3 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-purple-700">
              {isEditing ? 'Квест обновлён!' : 'Всё готово!'}
            </h2>
            <p className="text-gray-600">
              {isEditing 
                ? `Квест "${title}" успешно обновлён.`
                : `Квест "${title}" будет сохранён и готов к проведению.`}
            </p>

            <div className="bg-purple-50 rounded-xl p-4 text-left border border-purple-100">
              <p className="text-sm text-purple-800 font-semibold mb-2">📋 Что дальше:</p>
              <ol className="text-sm text-purple-800 list-decimal list-inside space-y-1.5">
                <li>Откройте квест через кнопку "Просмотр"</li>
                <li>Нажмите "Сохранить и скачать" для получения всех материалов</li>
                <li>Распечатайте карточки и разложите по местам</li>
                <li>Выдайте стартовые коды командам</li>
                <li>Проведите квест, сканируя QR-коды</li>
              </ol>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 text-left border border-amber-200">
              <p className="text-sm text-amber-800 font-semibold mb-2">💡 Совет:</p>
              <p className="text-xs text-amber-700">
                Перед проведением проверьте все места тайников и убедитесь, что карточки правильно разложены. 
                Проведите тестовый проход сами, чтобы убедиться в логике квеста.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-md mx-auto w-full px-5 py-4 flex gap-3 bg-white border-t border-gray-200">
        {step > 0 && (
          <button onClick={prevStep} className="flex-1 bg-gray-100 text-gray-700 font-semibold rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" /> Назад
          </button>
        )}
        {step < totalSteps - 1 ? (
          <button onClick={nextStep} 
            disabled={step === 1 && stages.length === 0}
            className="flex-1 bg-purple-600 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
            Далее <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={onFinish} className="flex-1 bg-green-600 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Save className="w-5 h-5" /> {isEditing ? 'Сохранить изменения' : 'Сохранить квест'}
          </button>
        )}
      </footer>
    </div>
  );
}

// ===== ЭКРАН ПРОВЕДЕНИЯ =====
function ConductScreen({ quest, setQuest, onBack }: any) {
  const totalStages = quest.stages.length;

  const getTeamProgress = (team: Team) => {
    return Math.round((team.completedStages.length / totalStages) * 100);
  };

  const getLeader = () => {
    return [...quest.teams].sort((a: Team, b: Team) => b.score - a.score)[0];
  };

  const advanceTeam = (teamId: string) => {
    const updatedTeams = quest.teams.map((t: Team) => {
      if (t.id !== teamId) return t;
      if (t.finished) return t;
      const newStage = t.currentStage + 1;
      const isFinished = newStage >= totalStages;
      return {
        ...t,
        currentStage: Math.min(newStage, totalStages - 1),
        completedStages: [...t.completedStages, t.currentStage],
        score: t.score + (quest.stages[t.currentStage]?.points || 10),
        finished: isFinished,
      };
    });
    setQuest({ ...quest, teams: updatedTeams });
    triggerHaptic('success');
  };

  const useHint = (teamId: string) => {
    const updatedTeams = quest.teams.map((t: Team) => {
      if (t.id !== teamId) return t;
      return { ...t, hintsUsed: t.hintsUsed + 1, score: Math.max(0, t.score - 5) };
    });
    setQuest({ ...quest, teams: updatedTeams });
    triggerHaptic('light');
  };

  const leader = getLeader();

  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
      <header className="bg-gradient-to-br from-gray-600 to-gray-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <div className="shrink-0"><BackButton onClick={onBack} variant="light" /></div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{quest.title}</h1>
            <p className="text-xs text-gray-300">Проведение квеста</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 space-y-4 overflow-y-auto">
        {leader && !leader.finished && (
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl p-4 flex items-center gap-3">
            <Trophy className="w-10 h-10" />
            <div>
              <p className="text-xs text-amber-100">Лидер</p>
              <p className="text-lg font-bold">{leader.name}</p>
              <p className="text-sm">{leader.score} баллов · {getTeamProgress(leader)}%</p>
            </div>
          </div>
        )}

        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Управление командами</h3>
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
              <div className="flex justify-between text-xs text-gray-500 mb-3">
                <span>Этап {team.currentStage + 1} из {totalStages}</span>
                <span>{team.hintsUsed} подсказок</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => advanceTeam(team.id)}
                  disabled={team.finished}
                  className="bg-purple-600 text-white font-semibold rounded-lg py-2 text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" /> Этап пройден
                </button>
                <button
                  onClick={() => useHint(team.id)}
                  disabled={team.finished}
                  className="bg-amber-100 text-amber-700 font-semibold rounded-lg py-2 text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform disabled:opacity-50"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Подсказка (-5б)
                </button>
              </div>
              {team.finished && (
                <div className="mt-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-lg text-center flex items-center justify-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> Квест завершён!
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

// ===== ЭКРАН ПРОСМОТРА С КНОПКОЙ СОХРАНЕНИЯ =====
function PreviewScreen({ quest, onBack, onEdit }: { quest: Quest; onBack: () => void; onEdit: () => void }) {
  const [copied, setCopied] = useState(false);

  const generateQuestFile = () => {
    let content = `═══════════════════════════════════════════\n`;
    content += `КВЕСТ: ${quest.title.toUpperCase()}\n`;
    content += `═══════════════════════════════════════════\n\n`;
    content += `Предмет: ${quest.subject}\n`;
    content += `Возраст: ${quest.ageGroup}\n`;
    content += `Тема: ${quest.theme}\n`;
    content += `Этапов: ${quest.stages.length}\n`;
    content += `Команд: ${quest.teams.length}\n`;
    content += `Создан: ${new Date(quest.createdAt).toLocaleDateString('ru-RU')}\n\n`;

    content += `═══════════════════════════════════════════\n`;
    content += `ИНСТРУКЦИЯ ДЛЯ УЧИТЕЛЯ\n`;
    content += `═══════════════════════════════════════════\n\n`;
    content += `1. Распечатайте карточки заданий (по одной на этап)\n`;
    content += `2. Разложите карточки по указанным местам тайников\n`;
    content += `3. Выдайте каждой команде стартовый код\n`;
    content += `4. После выполнения этапа отмечайте прогресс команды\n`;
    content += `5. Первая команда, прошедшая все этапы — победитель!\n\n`;

    content += `═══════════════════════════════════════════\n`;
    content += `КОДЫ КОМАНД (для ручного ввода)\n`;
    content += `═══════════════════════════════════════════\n\n`;
    quest.teams.forEach((team, idx) => {
      const qrData = JSON.stringify({ questId: quest.id, teamId: team.id, stage: 0 });
      content += `Команда ${idx + 1}: ${team.name.toUpperCase()}\n`;
      content += `  Код: ${team.id.toUpperCase()}\n`;
      content += `  QR-данные: ${qrData}\n\n`;
    });

    content += `═══════════════════════════════════════════\n`;
    content += `КАРТОЧКИ ЗАДАНИЙ\n`;
    content += `═══════════════════════════════════════════\n\n`;
    quest.stages.forEach((stage, idx) => {
      const taskInfo = TASK_TYPES.find(t => t.id === stage.type) || TASK_TYPES[0];
      content += `───────────────────────────────────────────\n`;
      content += `ЭТАП ${idx + 1}: ${stage.title.toUpperCase()}\n`;
      content += `───────────────────────────────────────────\n`;
      content += `Тип: ${taskInfo.icon} ${taskInfo.name}\n`;
      content += `Баллы: ${stage.points}\n\n`;
      content += `ЗАДАНИЕ:\n${stage.content || '(не указано)'}\n\n`;
      content += `ОТВЕТ-КЛЮЧ: ${stage.answer || '(не указан)'}\n`;
      content += `МЕСТО ТАЙНИКА: ${stage.location || '(не указано)'}\n\n`;
      if (stage.hints.some(h => h)) {
        content += `ПОДСКАЗКИ:\n`;
        stage.hints.forEach((h, hi) => {
          if (h) content += `  ${hi + 1}. ${h}\n`;
        });
        content += `\n`;
      }
    });

    content += `═══════════════════════════════════════════\n`;
    content += `ФИНАЛ\n`;
    content += `═══════════════════════════════════════════\n\n`;
    content += `МЕСТО КЛАДА: ${quest.finalLocation}\n\n`;
    content += `ПОЗДРАВЛЕНИЕ:\n${quest.finalMessage}\n\n`;
    content += `═══════════════════════════════════════════\n`;
    content += `Создано в приложении "Помощник учителя"\n`;
    content += `Проект Алексея Атапина\n`;
    content += `═══════════════════════════════════════════\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `квест_${quest.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerHaptic('success');
  };

  const copyQuestData = () => {
    const data = JSON.stringify(quest, null, 2);
    navigator.clipboard.writeText(data).then(() => {
      setCopied(true);
      triggerHaptic('light');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-[100dvh] notebook-bg flex flex-col">
      <header className="bg-gradient-to-br from-gray-600 to-gray-700 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <div className="shrink-0"><BackButton onClick={onBack} variant="light" /></div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{quest.title}</h1>
            <p className="text-xs text-gray-300">Просмотр квеста</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-5 space-y-4 overflow-y-auto">
        {/* Шапка квеста */}
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-2xl p-5">
          <h2 className="text-2xl font-bold mb-2">{quest.title}</h2>
          <p className="text-white/80 text-sm">{quest.subject} · {quest.ageGroup}</p>
          <div className="flex gap-4 mt-4 text-sm flex-wrap">
            <div><span className="text-white/60">Этапов:</span> <strong>{quest.stages.length}</strong></div>
            <div><span className="text-white/60">Команд:</span> <strong>{quest.teams.length}</strong></div>
            <div><span className="text-white/60">Баллов:</span> <strong>{quest.stages.reduce((s, st) => s + st.points, 0)}</strong></div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={generateQuestFile}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md"
          >
            <Download className="w-5 h-5" />
            <span className="text-sm">Сохранить</span>
          </button>
          <button
            onClick={copyQuestData}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            <span className="text-sm">{copied ? 'Скопировано' : 'Копировать'}</span>
          </button>
        </div>

        <button
          onClick={onEdit}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Edit3 className="w-5 h-5" /> Редактировать квест
        </button>

        {/* Коды команд */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" /> Коды команд
          </h3>
          <div className="space-y-2">
            {quest.teams.map((team, idx) => (
              <div key={team.id} className="bg-purple-50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-800">{team.name}</p>
                  <p className="text-xs text-purple-600 font-mono">{team.id.toUpperCase()}</p>
                </div>
                <div className="text-xs text-gray-500">Команда {idx + 1}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">💡 Используйте эти коды для ручного ввода при проведении квеста</p>
        </div>

        {/* Этапы */}
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Этапы квеста</h3>
        <div className="space-y-3">
          {quest.stages.map((stage, idx) => {
            const taskInfo = TASK_TYPES.find(t => t.id === stage.type) || TASK_TYPES[0];
            return (
              <div key={stage.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-purple-700">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-purple-700">{stage.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {taskInfo.icon} {taskInfo.name} · {stage.points} баллов
                    </p>
                    {stage.content && (
                      <p className="text-sm text-gray-700 mt-2 bg-gray-50 rounded-lg p-2">{stage.content}</p>
                    )}
                    {stage.answer && (
                      <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
                        <p className="text-xs font-semibold text-amber-800">🔑 Ответ-ключ: <span className="font-mono">{stage.answer}</span></p>
                      </div>
                    )}
                    {stage.location && (
                      <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center gap-2">
                        <Map className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-blue-800">📍 {stage.location}</p>
                      </div>
                    )}
                    {stage.hints.some(h => h) && (
                      <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
                        <p className="text-xs font-semibold text-green-800 mb-1">💡 Подсказки:</p>
                        {stage.hints.map((h, hi) => h && (
                          <p key={hi} className="text-xs text-green-700 ml-2">• {h}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Финал */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl p-5">
          <h3 className="font-bold mb-2 flex items-center gap-2"><Trophy className="w-5 h-5" /> Финал</h3>
          <p className="text-sm mb-2">{quest.finalMessage}</p>
          <p className="text-xs text-white/90 bg-white/20 rounded-lg p-2">
            📍 Место клада: <strong>{quest.finalLocation}</strong>
          </p>
        </div>

        <YandexAdBlock />
      </main>
    </div>
  );
}
