import { Deck } from '../types/flashcards';

const STORAGE_KEY = 'teacher_helper_decks_v1';

export const loadDecks = (): Deck[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveDecks = (decks: Deck[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  } catch (e) {
    console.error('Failed to save decks', e);
  }
};

export const generateId = () => Math.random().toString(36).substring(2, 9);
