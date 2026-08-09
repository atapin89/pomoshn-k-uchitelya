import type { LessonTemplate } from '@/types';

export const presetTemplates: LessonTemplate[] = [
  {
    id: 'preset-standard',
    name: 'Стандартный урок (45 мин)',
    stages: [
      { name: 'Орг. момент', duration: 3 },
      { name: 'Проверка ДЗ', duration: 7 },
      { name: 'Новая тема', duration: 15 },
      { name: 'Закрепление', duration: 12 },
      { name: 'Итоги', duration: 5 },
      { name: 'ДЗ', duration: 3 },
    ],
  },
  {
    id: 'preset-control',
    name: 'Контрольная работа (45 мин)',
    stages: [
      { name: 'Инструктаж', duration: 5 },
      { name: 'Выполнение', duration: 35 },
      { name: 'Сбор работ', duration: 5 },
    ],
  },
  {
    id: 'preset-short',
    name: 'Короткий урок (30 мин)',
    stages: [
      { name: 'Орг. момент', duration: 2 },
      { name: 'Опрос', duration: 8 },
      { name: 'Новая тема', duration: 12 },
      { name: 'Закрепление', duration: 6 },
      { name: 'ДЗ', duration: 2 },
    ],
  },
];
