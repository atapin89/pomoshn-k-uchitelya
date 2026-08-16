import { useEffect, useState } from 'react';
import type { LessonTemplate } from '@/types';
import { presetTemplates } from '@/data/templates';
import { loadCustomTemplates, saveCustomTemplates } from '@/lib/storage';
import TemplateList from '@/components/TemplateList';
import ActiveTimer from '@/components/ActiveTimer';
import CreateTemplateModal from '@/components/CreateTemplateModal';
import EditTemplateModal from '@/components/EditTemplateModal';
import HomeScreen from '@/components/HomeScreen';
import GeneratorScreen from '@/components/GeneratorScreen';
import NoiseMonitorScreen from '@/components/NoiseMonitorScreen';
import FlashcardsScreen from '@/components/FlashcardsScreen';
import StudyScreen from '@/components/StudyScreen';
import QuizScreen from '@/components/QuizScreen';
import WordSearchScreen from '@/components/WordSearchScreen';
import ManualScreen from '@/components/ManualScreen';
import CalculatorsScreen from '@/components/CalculatorsScreen';
import QuestBuilderScreen from '@/components/QuestBuilderScreen'; // <-- 1. ДОБАВЛЕН ИМПОРТ КОНСТРУКТОРА КВЕСТОВ

// <-- 2. ДОБАВЛЕН 'quests' в типы маршрутов
type Route = 'home' | 'timer' | 'generator' | 'noise' | 'flashcards' | 'study' | 'quiz' | 'wordsearch' | 'manual' | 'calculators' | 'quests';

export default function App() {
  const [route, setRoute] = useState<Route>('home');
  const [customTemplates, setCustomTemplates] = useState<LessonTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<LessonTemplate | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LessonTemplate | null>(null);
  
  // Состояния для флэш-карточек
  const [studyDeckId, setStudyDeckId] = useState<string | null>(null);
  const [quizDeckId, setQuizDeckId] = useState<string | null>(null);

  useEffect(() => {
    setCustomTemplates(loadCustomTemplates());
  }, []);

  const handleSaveCustom = (template: LessonTemplate) => {
    setCustomTemplates((prev) => {
      const next = [...prev, template];
      saveCustomTemplates(next);
      return next;
    });
    setShowCreate(false);
  };

  const handleDeleteCustom = (id: string) => {
    setCustomTemplates((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveCustomTemplates(next);
      return next;
    });
  };

  const handleEditSave = (edited: LessonTemplate) => {
    const isPreset = edited.id.startsWith('preset-');
    if (isPreset) {
      const newTemplate: LessonTemplate = {
        ...edited,
        id: `custom-${Date.now()}`,
        custom: true,
      };
      setCustomTemplates((prev) => {
        const next = [...prev, newTemplate];
        saveCustomTemplates(next);
        return next;
      });
    } else {
      setCustomTemplates((prev) => {
        const next = prev.map((t) => (t.id === edited.id ? { ...edited, custom: true } : t));
        saveCustomTemplates(next);
        return next;
      });
    }
    setEditingTemplate(null);
  };

  const allTemplates = [...presetTemplates, ...customTemplates];

  // 1. Главная страница
  if (route === 'home') {
    return <HomeScreen onNavigate={setRoute} />;
  }

  // 2. Генератор случайностей (Жеребьёвка)
  if (route === 'generator') {
    return <GeneratorScreen onBack={() => setRoute('home')} />;
  }

  // 3. Контроль шума
  if (route === 'noise') {
    return <NoiseMonitorScreen onBack={() => setRoute('home')} />;
  }

  // 4. Флэш-карточки (Дашборд)
  if (route === 'flashcards') {
    return (
      <FlashcardsScreen
        onBack={() => setRoute('home')}
        onStudy={(deckId: string) => {
          setStudyDeckId(deckId);
          setRoute('study');
        }}
        onQuiz={(deckId: string) => {
          setQuizDeckId(deckId);
          setRoute('quiz');
        }}
      />
    );
  }

  // 5. Режим изучения (Swiper)
  if (route === 'study' && studyDeckId) {
    return (
      <StudyScreen
        deckId={studyDeckId}
        onBack={() => setRoute('flashcards')}
      />
    );
  }

  // 6. Режим тестирования (Quiz)
  if (route === 'quiz' && quizDeckId) {
    return (
      <QuizScreen
        deckId={quizDeckId}
        onBack={() => setRoute('flashcards')}
      />
    );
  }

  // 7. Генератор филвордов
  if (route === 'wordsearch') {
    return <WordSearchScreen onBack={() => setRoute('home')} />;
  }

  // 8. Руководство по использованию
  if (route === 'manual') {
    return <ManualScreen onBack={() => setRoute('home')} />;
  }

  // 9. Раздел с калькуляторами
  if (route === 'calculators') {
    return <CalculatorsScreen onBack={() => setRoute('home')} />;
  }

  // 10. Конструктор квестов <-- 3. ДОБАВЛЕН НОВЫЙ МАРШРУТ
  if (route === 'quests') {
    return <QuestBuilderScreen onBack={() => setRoute('home')} />;
  }

  // 11. Активный таймер урока
  if (activeTemplate) {
    return (
      <ActiveTimer
        key={activeTemplate.id}
        template={activeTemplate}
        onReset={() => setActiveTemplate(null)}
      />
    );
  }

  // 12. Список шаблонов таймера (по умолчанию)
  return (
    <>
      <TemplateList
        templates={allTemplates}
        onSelect={setActiveTemplate}
        onCreate={() => setShowCreate(true)}
        onDelete={handleDeleteCustom}
        onEdit={setEditingTemplate}
        onBack={() => setRoute('home')}
      />
      {showCreate && (
        <CreateTemplateModal onClose={() => setShowCreate(false)} onSave={handleSaveCustom} />
      )}
      {editingTemplate && (
        <EditTemplateModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSave={handleEditSave}
        />
      )}
    </>
  );
}
