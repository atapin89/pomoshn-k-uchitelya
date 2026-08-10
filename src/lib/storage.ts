import type { LessonTemplate, Deck } from '../types';

// === ШАБЛОНЫ ТАЙМЕРА ===
const TEMPLATES_KEY = 'teacher_helper_templates_v1';

export const loadCustomTemplates = (): LessonTemplate[] => {
  try {
    const data = localStorage.getItem(TEMPLATES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveCustomTemplates = (templates: LessonTemplate[]): void => {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates', e);
  }
};

// === ФЛЭШ-КАРТОЧКИ ===
const DECKS_KEY = 'teacher_helper_decks_v2';

export const loadDecks = (): Deck[] => {
  try {
    const data = localStorage.getItem(DECKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveDecks = (decks: Deck[]): void => {
  try {
    localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
  } catch (e) {
    console.error('Failed to save decks', e);
  }
};

export const generateCardId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};
