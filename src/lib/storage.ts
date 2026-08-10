import type { LessonTemplate, Deck } from '@/types';

const CUSTOM_KEY = 'lesson-timer-custom-templates';
const DECKS_KEY = 'flashcards-decks';

export function loadCustomTemplates(): LessonTemplate[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t) =>
        t &&
        typeof t.id === 'string' &&
        typeof t.name === 'string' &&
        Array.isArray(t.stages),
    );
  } catch {
    return [];
  }
}

export function saveCustomTemplates(templates: LessonTemplate[]): void {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(templates));
  } catch {
    // ignore quota errors
  }
}

export function loadDecks(): Deck[] {
  try {
    const raw = localStorage.getItem(DECKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (d) =>
        d &&
        typeof d.id === 'string' &&
        typeof d.title === 'string' &&
        Array.isArray(d.cards),
    );
  } catch {
    return [];
  }
}

export function saveDecks(decks: Deck[]): void {
  try {
    localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
  } catch {
    // ignore quota errors
  }
}

// === ФЛЭШ-КАРТОЧКИ ===
import type { Deck } from '../types';

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
